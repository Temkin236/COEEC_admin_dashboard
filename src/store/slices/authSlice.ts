import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import axiosInstance from "@/utils/axios"

type Role = string
export interface AuthUser { id: string; email: string; role: Role; name?: string }

const DEMO_USERS: AuthUser[] & Array<{ password?: string }> = [
  { id: "1", email: "superAdmin@gmail.com", password: "superAdmin@gmail.com", role: "admin", name: "Admin User" },
  { id: "2", email: "editor@astu.edu.et", password: "Editor@2025", role: "editor", name: "Editor User" },
] as any

const DEMO_TOKEN = "demo-token"
const DEMO_REFRESH = "demo-refresh"

interface LoginCredentials { email: string; password: string }
interface LoginResponse { accessToken: string; refreshToken: string; user: AuthUser }

export const login = createAsyncThunk<LoginResponse, LoginCredentials, { rejectValue: string }>(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/login", credentials)
      let { accessToken, refreshToken, user } = response.data as LoginResponse
      localStorage.setItem("token", accessToken)
      localStorage.setItem("refreshToken", refreshToken)

      // Decode the JWT payload and store it in localStorage as `auth_user`.
      if (accessToken) {
        try {
          const base64Url = accessToken.split('.')[1]
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
          }).join(''))
          const payload = JSON.parse(jsonPayload)
          // store the full token payload so it contains id, roles, permissions, iat, exp, etc.
          localStorage.setItem("auth_user", JSON.stringify(payload))
          // prefer server-provided `user` when present, otherwise use decoded payload
          if (!user) user = payload as any
        } catch (e) {
          // ignore parsing errors
        }
      } else if (user) {
        // no token but server returned user
        localStorage.setItem("auth_user", JSON.stringify(user))
      }

      return { accessToken, refreshToken, user }
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Login failed")
    }
  },
)

export const validateToken = createAsyncThunk<AuthUser, void, { rejectValue: string }>(
  "auth/validateToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/auth/me")
      const user = response.data as AuthUser
      localStorage.setItem("auth_user", JSON.stringify(user))
      return user
    } catch (error: any) {
      // Don't remove tokens here - let axios interceptor handle token refresh
      // Only reject to update Redux state
      return rejectWithValue(error?.response?.data?.message || "Invalid token") as any
    }
  },
)

interface AuthState {
  user: AuthUser | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const getUserFromStorage = () => {
  try {
    const stored = localStorage.getItem("auth_user")
    if (!stored || stored === "undefined") return null
    return JSON.parse(stored)
  } catch {
    return null
  }
}

const initialState: AuthState = {
  user: getUserFromStorage(),
  token: localStorage.getItem("token"),
  refreshToken: localStorage.getItem("refreshToken"),
  isAuthenticated: !!localStorage.getItem("token"),
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.refreshToken = null
      state.isAuthenticated = false
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("auth_user")
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.accessToken
        state.refreshToken = action.payload.refreshToken
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) ?? "Login failed"
      })
      .addCase(validateToken.pending, (state) => {
        state.loading = true
      })
      .addCase(validateToken.fulfilled, (state, action: PayloadAction<AuthUser>) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload
      })
      .addCase(validateToken.rejected, (state) => {
        state.loading = false
        state.isAuthenticated = false
        state.user = null
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
