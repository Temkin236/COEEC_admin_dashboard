import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import axiosInstance from "@/utils/axios"

export interface Role {
  id: string
  name: string
  description?: string
  system?: boolean
  permissionIds?: string[]
  permissions?: any[]
  createdAt?: string
  updatedAt?: string
}

// Helper functions for filtering and pagination
const filterItems = (items: Role[], searchTerm: string): Role[] => {
  if (!searchTerm) return items
  const term = searchTerm.toLowerCase()
  return items.filter((role) =>
    role.name?.toLowerCase().includes(term) ||
    role.description?.toLowerCase().includes(term)
  )
}

const paginateItems = (items: Role[], page: number, limit: number): Role[] => {
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  return items.slice(startIndex, endIndex)
}

const getPaginatedAndFilteredItems = (
  allItems: Role[],
  searchTerm: string,
  page: number,
  limit: number
): Role[] => {
  const filtered = filterItems(allItems, searchTerm)
  return paginateItems(filtered, page, limit)
}

interface RoleState {
  allItems: Role[]           // All roles from server
  items: Role[]              // Filtered/paginated items for display
  currentRole: Role | null
  total: number
  page: number
  limit: number
  searchTerm: string
  loading: boolean
  error: string | null
}

const initialState: RoleState = {
  allItems: [],
  items: [],
  currentRole: null,
  total: 0,
  page: 1,
  limit: 10,
  searchTerm: "",
  loading: false,
  error: null,
}

// Async thunks
export const fetchRoles = createAsyncThunk<Role[], void>(
  "role/fetchRoles",
  async () => {
    try {
      const response = await axiosInstance.get("/roles")
      return response.data
    } catch (error) {
      throw error
    }
  }
)

export const fetchRoleById = createAsyncThunk<Role, string>(
  "role/fetchRoleById",
  async (id) => {
    try {
      const response = await axiosInstance.get(`/roles/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  }
)

export const createRole = createAsyncThunk<
  Role,
  { name: string; description?: string; permissionIds: string[] }
>(
  "role/createRole",
  async (data) => {
    try {
      const response = await axiosInstance.post("/roles", data)
      return response.data
    } catch (error) {
      throw error
    }
  }
)

export const updateRole = createAsyncThunk<
  Role,
  { id: string; name: string; description?: string; permissionIds: string[] }
>(
  "role/updateRole",
  async ({ id, name, description, permissionIds }) => {
    try {
      const response = await axiosInstance.put(`/roles/${id}`, {
        name,
        description,
        permissionIds,
      })
      return response.data
    } catch (error) {
      throw error
    }
  }
)

export const deleteRole = createAsyncThunk<string, string>(
  "role/deleteRole",
  async (id) => {
    try {
      await axiosInstance.delete(`/roles/${id}`)
      return id
    } catch (error) {
      throw error
    }
  }
)

// Slice
const roleSlice = createSlice({
  name: "role",
  initialState,
  reducers: {
    setCurrentRole: (state, action: PayloadAction<Role | null>) => {
      state.currentRole = action.payload
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload
      // Apply pagination and filtering when page changes
      const filtered = filterItems(state.allItems, state.searchTerm)
      state.total = filtered.length
      state.items = paginateItems(filtered, state.page, state.limit)
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
      state.page = 1 // Reset to first page when searching
      // Apply pagination and filtering when search changes
      const filtered = filterItems(state.allItems, state.searchTerm)
      state.total = filtered.length
      state.items = paginateItems(filtered, state.page, state.limit)
    },
  },
  extraReducers: (builder) => {
    // Fetch roles
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        fetchRoles.fulfilled,
        (state, action: PayloadAction<Role[]>) => {
          state.loading = false
          state.allItems = action.payload
          // Apply current filters and pagination
          const filtered = filterItems(action.payload, state.searchTerm)
          state.total = filtered.length
          state.items = paginateItems(filtered, state.page, state.limit)
        }
      )
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch roles"
      })

    // Fetch role by ID
    builder
      .addCase(fetchRoleById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        fetchRoleById.fulfilled,
        (state, action: PayloadAction<Role>) => {
          state.loading = false
          state.currentRole = action.payload
        }
      )
      .addCase(fetchRoleById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch role"
      })

    // Create role
    builder
      .addCase(createRole.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createRole.fulfilled, (state, action: PayloadAction<Role>) => {
        state.loading = false
        state.allItems.unshift(action.payload)
        // Re-apply filtering and pagination
        const filtered = filterItems(state.allItems, state.searchTerm)
        state.total = filtered.length
        state.items = paginateItems(filtered, state.page, state.limit)
      })
      .addCase(createRole.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to create role"
      })

    // Update role
    builder
      .addCase(updateRole.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateRole.fulfilled, (state, action: PayloadAction<Role>) => {
        state.loading = false
        // Update in allItems first
        const allIndex = state.allItems.findIndex((r) => r.id === action.payload.id)
        if (allIndex !== -1) {
          state.allItems[allIndex] = action.payload
        }
        // Update currentRole if it's the same
        if (state.currentRole?.id === action.payload.id) {
          state.currentRole = action.payload
        }
        // Re-apply filtering and pagination to update display items
        const filtered = filterItems(state.allItems, state.searchTerm)
        state.total = filtered.length
        state.items = paginateItems(filtered, state.page, state.limit)
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to update role"
      })

    // Delete role
    builder
      .addCase(deleteRole.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteRole.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false
        // Remove from allItems first
        state.allItems = state.allItems.filter((r) => r.id !== action.payload)
        // Re-apply filtering and pagination to update display items
        const filtered = filterItems(state.allItems, state.searchTerm)
        state.total = filtered.length
        state.items = paginateItems(filtered, state.page, state.limit)
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to delete role"
      })
  },
})

export const { setCurrentRole, setPage, setSearchTerm } = roleSlice.actions
export default roleSlice.reducer
