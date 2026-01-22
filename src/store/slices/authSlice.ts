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
  roles?: string[] // Array of roles from JWT
  name?: string
  permissions?: Permission[]
  staffId?: string // Staff ID from token for profile management
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
      
      // Only store tokens, not user data
      localStorage.setItem("token", accessToken)
      localStorage.setItem("refreshToken", refreshToken)
      
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
      // Try to get user from API
      const response = await axiosInstance.get("/auth/me")
      const user = response.data as AuthUser
      return user
    } catch (error: any) {
      // Fallback: decode token to get user info
      const token = localStorage.getItem("token")
      if (token) {
        const userFromToken = getUserFromToken(token)
        console.log("Decoded user from token (fallback):", userFromToken)
        if (userFromToken) {
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
  // No longer store user in localStorage
  // User will be fetched via validateToken on app load
  return null
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
