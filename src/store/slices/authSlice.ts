import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import axiosInstance from "@/utils/axios"
import { getUserFromToken, decodeToken } from "@/utils/jwt"

type Role = string

export interface Permission {
  id: string
  action: string
  resource: string
  description?: string | null
}

export interface AuthUser { 
  id: string
  email: string
  role: Role
  name?: string
  permissions?: Permission[]
}

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
      const { accessToken, refreshToken } = response.data
      
      // Decode token to get user info
      const userFromToken = getUserFromToken(accessToken)
      console.log("Decoded user from token:", userFromToken)
      
      // Use user from response if available, otherwise use decoded token
      const user = response.data.user || userFromToken
      
      localStorage.setItem("token", accessToken)
      localStorage.setItem("refreshToken", refreshToken)
      
      if (user) {
        localStorage.setItem("auth_user", JSON.stringify(user))
        // Store permissions separately for easy access
        if (user.permissions) {
          localStorage.setItem("user_permissions", JSON.stringify(user.permissions))
        }
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
      // First try to get user from API
      const response = await axiosInstance.get("/auth/me")
      const user = response.data as AuthUser
      localStorage.setItem("auth_user", JSON.stringify(user))
      if (user.permissions) {
        localStorage.setItem("user_permissions", JSON.stringify(user.permissions))
      }
      return user
    } catch (error: any) {
      // Fallback: decode token to get user info
      const token = localStorage.getItem("token")
      if (token) {
        const userFromToken = getUserFromToken(token)
        console.log("Decoded user from token (fallback):", userFromToken)
        if (userFromToken) {
          localStorage.setItem("auth_user", JSON.stringify(userFromToken))
          if (userFromToken.permissions) {
            localStorage.setItem("user_permissions", JSON.stringify(userFromToken.permissions))
          }
          return userFromToken
        }
      }
      // If both fail, reject
      return rejectWithValue(error?.response?.data?.message || "Invalid token") as any
    }
  },
)

export const activateAccount = createAsyncThunk<void, { token: string; password: string; confirmPassword: string }, { rejectValue: string }>(
  "auth/activateAccount",
  async ({ token, password, confirmPassword }, { rejectWithValue }) => {
    try {
      await axiosInstance.post("/auth/activate", { token, password, confirmPassword })
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Activation failed")
    }
  }
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
    // First try to get from localStorage
    const stored = localStorage.getItem("auth_user")
    if (stored && stored !== "undefined" && stored !== "null") {
      const user = JSON.parse(stored)
      if (user && user.role) return user
    }
    
    // Fallback: decode token if available
    const token = localStorage.getItem("token")
    if (token) {
      const userFromToken = getUserFromToken(token)
      if (userFromToken && userFromToken.role) {
        console.log("User from token on init:", userFromToken)
        localStorage.setItem("auth_user", JSON.stringify(userFromToken))
        return userFromToken
      }
    }
    
    return null
  } catch (error) {
    console.error("Error getting user from storage:", error)
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
