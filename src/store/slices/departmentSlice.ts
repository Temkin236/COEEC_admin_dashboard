import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import axiosInstance from "@/utils/axios"

export interface Department {
  id: string
  name: string
  slug: string
  description: string
  headId?: string
  pageId?: string
  createdAt?: string
  updatedAt?: string
}

interface DepartmentState {
  items: Department[]
  loading: boolean
  error: string | null
}

const initialState: DepartmentState = {
  items: [],
  loading: false,
  error: null,
}

export const fetchDepartments = createAsyncThunk<Department[], void, { rejectValue: string }>(
  "departments/fetchDepartments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/departments?all=false")
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Failed to fetch departments")
    }
  }
)

export const fetchDepartmentById = createAsyncThunk<Department, string, { rejectValue: string }>(
  "departments/fetchDepartmentById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/departments/${id}`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Failed to fetch department")
    }
  }
)

export const createDepartment = createAsyncThunk<Department, Partial<Department>, { rejectValue: string }>(
  "departments/createDepartment",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/departments", data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Failed to create department")
    }
  }
)

export const updateDepartment = createAsyncThunk<Department, { id: string; data: Partial<Department> }, { rejectValue: string }>(
  "departments/updateDepartment",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/departments/${id}`, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Failed to update department")
    }
  }
)

export const deleteDepartment = createAsyncThunk<string, string, { rejectValue: string }>(
  "departments/deleteDepartment",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/departments/${id}`)
      return id
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Failed to delete department")
    }
  }
)

const departmentSlice = createSlice({
  name: "departments",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDepartments.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false
        // Handle both direct array and { items: [] } response formats
        if (Array.isArray(action.payload)) {
          state.items = action.payload
        } else if (action.payload && Array.isArray(action.payload.items)) {
          state.items = action.payload.items
        } else {
          state.items = []
        }
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createDepartment.fulfilled, (state, action: PayloadAction<Department>) => {
        state.items.push(action.payload)
      })
      .addCase(updateDepartment.fulfilled, (state, action: PayloadAction<Department>) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(deleteDepartment.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
  },
})

export const { clearError } = departmentSlice.actions
export default departmentSlice.reducer
