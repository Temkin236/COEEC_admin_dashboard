import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import axiosInstance from "@/utils/axios"

export interface StaffItem {
  id: string
  userId?: string
  displayName: string
  title: string
  departmentId?: string
  photoId?: string | null
  researchAreas?: string[]
  biography?: any
  email: string
  phone?: string
  officeLocation?: string
  cvId?: string | null
  createdAt?: string
  updatedAt?: string
  department?: {
    id: string
    name: string
    slug: string
    description: string
    headId: string | null
    pageId: string | null
    createdAt: string
    updatedAt: string
    isDisabled: boolean
  }
  photo?: string | null
  cvUrl?: string
}

export const fetchStaff = createAsyncThunk<{ items: StaffItem[]; total: number; page: number; limit: number }, { page?: number; limit?: number; filters?: Record<string, any> }>(
  "staff/fetchStaff",
  async ({ page = 1, limit = 10, filters = {} }) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit), ...filters as any })
    const response = await axiosInstance.get(`/staff?${params}`)
    return response.data
  },
)

export const fetchStaffById = createAsyncThunk<StaffItem | null, string>("staff/fetchStaffById", async (id) => {
  const response = await axiosInstance.get(`/staff/${id}`)
  return response.data
})

export const createStaff = createAsyncThunk<StaffItem, any>("staff/createStaff", async (data) => {
  // Prepare data according to API structure - userId will come from token
  const payload = {
    displayName: data.displayName,
    title: data.title,
    departmentId: data.departmentId,
    email: data.email,
    phone: data.phone,
    officeLocation: data.officeLocation,
    researchAreas: data.researchAreas || [],
    biography: data.biography || {},
    photoId: data.photoId,
    cvId: data.cvId
  }
  const response = await axiosInstance.post("/staff", payload)
  return response.data
})

export const updateStaff = createAsyncThunk<StaffItem, { id: string; data: any }>("staff/updateStaff", async ({ id, data }) => {
  // Prepare data for PUT request (excluding computed fields)
  const payload = {
    displayName: data.displayName,
    title: data.title,
    biography: data.biography || {},
    researchAreas: data.researchAreas || [],
    email: data.email,
    phone: data.phone,
    officeLocation: data.officeLocation
  }
  const response = await axiosInstance.put(`/staff/${id}`, payload)
  return response.data
})

export const deleteStaff = createAsyncThunk<string, string>("staff/deleteStaff", async (id) => {
  await axiosInstance.delete(`/staff/${id}`)
  return id
})

export const uploadCV = createAsyncThunk<{ id: string; cvUrl: string }, { id: string; file: File }>(
  "staff/uploadCV",
  async ({ id, file }) => {
    const formData = new FormData()
    formData.append("file", file)
    const response = await axiosInstance.post(`/staff/${id}/cv`, formData, { 
      headers: { "Content-Type": "multipart/form-data" } 
    })
    return response.data
  },
)

interface StaffState {
  items: StaffItem[]
  currentStaff: StaffItem | null
  total: number
  page: number
  limit: number
  loading: boolean
  error: string | null
}

const initialState: StaffState = { items: [], currentStaff: null, total: 0, page: 1, limit: 10, loading: false, error: null }

const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    clearStaffError: (state) => { state.error = null },
    setCurrentStaff: (state, action: PayloadAction<StaffItem | null>) => { state.currentStaff = action.payload },
    setPage: (state, action: PayloadAction<number>) => { state.page = action.payload },
    setLimit: (state, action: PayloadAction<number>) => { state.limit = action.payload },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStaff.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchStaff.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false
        if (Array.isArray(action.payload)) {
          state.items = action.payload
          state.total = action.payload.length
        } else if (action.payload && Array.isArray(action.payload.items)) {
          state.items = action.payload.items
          state.total = action.payload.total || action.payload.items.length
          state.page = action.payload.page || state.page
          state.limit = action.payload.limit || state.limit
        } else {
          state.items = []
          state.total = 0
        }
      })
      .addCase(fetchStaff.rejected, (state, action) => { state.loading = false; state.error = action.error.message || null })
      .addCase(fetchStaffById.fulfilled, (state, action: PayloadAction<StaffItem | null>) => { state.currentStaff = action.payload })
      .addCase(createStaff.fulfilled, (state, action: PayloadAction<StaffItem>) => { state.items.unshift(action.payload); state.total += 1 })
      .addCase(updateStaff.fulfilled, (state, action: PayloadAction<StaffItem>) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) state.items[index] = action.payload
        if (state.currentStaff?.id === action.payload.id) state.currentStaff = action.payload
      })
      .addCase(deleteStaff.fulfilled, (state, action: PayloadAction<string>) => { state.items = state.items.filter((item) => item.id !== action.payload); state.total -= 1 })
      .addCase(uploadCV.fulfilled, (state, action: PayloadAction<{ id: string; cvUrl: string }>) => { if (state.currentStaff && state.currentStaff.id === action.payload.id) state.currentStaff.cvUrl = action.payload.cvUrl })
  },
})

export const { clearStaffError, setCurrentStaff, setPage, setLimit } = staffSlice.actions
export default staffSlice.reducer
