import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import axiosInstance from "@/utils/axios"

export interface User {
  id: string
  email: string
  displayName: string
  roles?: any[] // Using any[] to handle the complex nested structure from API
  roleIds?: string[] // For form submission
  createdAt?: string
  updatedAt?: string
}

export interface InviteResponse {
  userId: string
  inviteUrl: string
}

export interface BulkUsersResponse {
  message?: string
  createdCount?: number
  failedCount?: number
  [key: string]: any
}

interface UsersState {
  items: User[]
  currentUser: User | null
  loading: boolean
  error: string | null
  lastInvite: InviteResponse | null
}

const initialState: UsersState = {
  items: [],
  currentUser: null,
  loading: false,
  error: null,
  lastInvite: null,
}

export const fetchUsers = createAsyncThunk<User[], void, { rejectValue: string }>(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/users")
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Failed to fetch users")
    }
  }
)

export const fetchUserById = createAsyncThunk<User, string, { rejectValue: string }>(
  "users/fetchUserById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/users/${id}`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Failed to fetch user")
    }
  }
)

export const createUser = createAsyncThunk<InviteResponse, { email: string; displayName: string; roleIds: string[] }, { rejectValue: string }>(
  "users/createUser",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/users", data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Failed to create user")
    }
  }
)

export const updateUser = createAsyncThunk<User, { id: string; data: Partial<User> }, { rejectValue: string }>(
  "users/updateUser",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/users/${id}`, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Failed to update user")
    }
  }
)

export const deleteUser = createAsyncThunk<string, string, { rejectValue: string }>(
  "users/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/users/${id}`)
      return id
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Failed to delete user")
    }
  }
)

export const uploadUsersCsv = createAsyncThunk<BulkUsersResponse, File, { rejectValue: string }>(
  "users/uploadUsersCsv",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await axiosInstance.post("/users/bulk", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Failed to upload CSV")
    }
  }
)

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearLastInvite: (state) => {
      state.lastInvite = null
    },
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserById.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false
        state.currentUser = action.payload
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createUser.fulfilled, (state, action: PayloadAction<InviteResponse>) => {
        state.lastInvite = action.payload
        // Note: We might not get the full user object back to add to the list immediately, 
        // so we might need to refetch or just rely on the invite modal.
        // If the API returned the created user, we would push it. 
        // Since it returns invite info, we'll just set lastInvite.
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
      .addCase(uploadUsersCsv.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(uploadUsersCsv.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(uploadUsersCsv.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, clearLastInvite, setCurrentUser } = usersSlice.actions
export default usersSlice.reducer
