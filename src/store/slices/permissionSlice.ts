import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import axiosInstance from "@/utils/axios"

export interface Permission {
  id: string
  action: string
  resource: string
  description?: string | null
  createdAt: string
  updatedAt: string
}

interface PermissionState {
  items: Permission[]
  loading: boolean
  error: string | null
}

const initialState: PermissionState = {
  items: [],
  loading: false,
  error: null,
}

// Async thunks
export const fetchPermissions = createAsyncThunk<Permission[], void>(
  "permission/fetchPermissions",
  async () => {
    try {
      const response = await axiosInstance.get("/permissions")
      return response.data
    } catch (error) {
      throw error
    }
  }
)

export const fetchPermissionById = createAsyncThunk<Permission, string>(
  "permission/fetchPermissionById",
  async (id) => {
    try {
      const response = await axiosInstance.get(`/permissions/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  }
)

// Slice
const permissionSlice = createSlice({
  name: "permission",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch permissions
    builder
      .addCase(fetchPermissions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        fetchPermissions.fulfilled,
        (state, action: PayloadAction<Permission[]>) => {
          state.loading = false
          state.items = action.payload
        }
      )
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch permissions"
      })

    // Fetch permission by ID
    builder
      .addCase(fetchPermissionById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        fetchPermissionById.fulfilled,
        (state, action: PayloadAction<Permission>) => {
          state.loading = false
          // Update the item in the array if it exists
          const index = state.items.findIndex((p) => p.id === action.payload.id)
          if (index !== -1) {
            state.items[index] = action.payload
          } else {
            state.items.push(action.payload)
          }
        }
      )
      .addCase(fetchPermissionById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch permission"
      })
  },
})

export default permissionSlice.reducer