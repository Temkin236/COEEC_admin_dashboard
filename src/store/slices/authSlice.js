import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "@/utils/axios"

// Demo accounts to allow login without backend
const DEMO_USERS = [
  {
    email: "admin@astu.edu.et",
    password: "Admin@2025",
    role: "admin",
    name: "Admin User",
  },
  {
    email: "editor@astu.edu.et",
    password: "Editor@2025",
    role: "editor",
    name: "Editor User",
  },
]

const DEMO_TOKEN = "demo-token"
const DEMO_REFRESH = "demo-refresh"

export const login = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
  // 1) Try demo users first
  const match = DEMO_USERS.find(
    (u) => u.email.toLowerCase() === String(credentials.email).toLowerCase() && u.password === credentials.password,
  )
  if (match) {
    const user = { email: match.email, role: match.role, name: match.name }
    localStorage.setItem("token", DEMO_TOKEN)
    localStorage.setItem("refreshToken", DEMO_REFRESH)
    localStorage.setItem("auth_user", JSON.stringify(user))
    return { token: DEMO_TOKEN, refreshToken: DEMO_REFRESH, user }
  }

  // 2) Otherwise call backend
  try {
    const response = await axiosInstance.post("/auth/login", credentials)
    const { token, refreshToken, user } = response.data

    localStorage.setItem("token", token)
    localStorage.setItem("refreshToken", refreshToken)
    localStorage.setItem("auth_user", JSON.stringify(user))

    return { token, refreshToken, user }
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Login failed")
  }
})

export const validateToken = createAsyncThunk("auth/validateToken", async (_, { rejectWithValue }) => {
  const token = localStorage.getItem("token")
  if (token === DEMO_TOKEN) {
    const demoUserRaw = localStorage.getItem("auth_user")
    if (demoUserRaw) {
      try {
        return JSON.parse(demoUserRaw)
      } catch (_) {
        // fallthrough to backend validation
      }
    }
  }
  try {
    const response = await axiosInstance.get("/auth/me")
    return response.data
  } catch (error) {
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("auth_user")
    return rejectWithValue("Invalid token")
  }
})

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: localStorage.getItem("token"),
    refreshToken: localStorage.getItem("refreshToken"),
    isAuthenticated: false,
    loading: false,
    error: null,
  },
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
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.refreshToken = action.payload.refreshToken
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(validateToken.pending, (state) => {
        state.loading = true
      })
      .addCase(validateToken.fulfilled, (state, action) => {
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
