import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import { staffApi, mediaApi, StaffItem } from "@/api/staffApi"

export const fetchStaff = createAsyncThunk<{ items: StaffItem[]; total: number; page: number; limit: number }, { page?: number; limit?: number; filters?: Record<string, any> }>(
  "staff/fetchStaff",
  async (params) => {
    return await staffApi.fetchStaff(params)
  },
)

export const fetchStaffById = createAsyncThunk<StaffItem | null, string>("staff/fetchStaffById", async (id) => {
  return await staffApi.fetchStaffById(id)
})

export const createStaff = createAsyncThunk<StaffItem, any>("staff/createStaff", async (data) => {
  return await staffApi.createStaff(data)
})

export const updateStaff = createAsyncThunk<StaffItem, { id: string; data: any }>("staff/updateStaff", async (params) => {
  return await staffApi.updateStaff(params)
})

export const deleteStaff = createAsyncThunk<string, string>("staff/deleteStaff", async (id) => {
  return await staffApi.deleteStaff(id)
})

export const uploadCV = createAsyncThunk<{ id: string; cvUrl: string }, { id: string; file: File }>(
  "staff/uploadCV",
  async (params) => {
    return await mediaApi.uploadCV(params)
  },
)

export const uploadPhoto = createAsyncThunk<{ id: string; photoUrl: string } , { id: string; file: File }>(
  "staff/uploadPhoto",
  async (params) => {
    return await mediaApi.uploadPhoto(params)
  }
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
      .addCase(createStaff.fulfilled, (state, action: PayloadAction<StaffItem>) => {
        state.items.unshift(action.payload); state.total += 1
        try {
          if (typeof window !== 'undefined' && action.payload) {
            const id = (action.payload as any).id || (action.payload as any)._id
            if (id) {
              localStorage.setItem('staff_id', String(id))
              localStorage.setItem('staffId', String(id))
            }
          }
        } catch (e) {
          // ignore localStorage errors
        }
      })
      .addCase(updateStaff.fulfilled, (state, action: PayloadAction<StaffItem>) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) state.items[index] = action.payload
        if (state.currentStaff?.id === action.payload.id) state.currentStaff = action.payload
      })
      .addCase(deleteStaff.fulfilled, (state, action: PayloadAction<string>) => { state.items = state.items.filter((item) => item.id !== action.payload); state.total -= 1 })
      .addCase(uploadCV.fulfilled, (state, action: PayloadAction<{ id: string; cvUrl: string }>) => { if (state.currentStaff && state.currentStaff.id === action.payload.id) state.currentStaff.cvUrl = action.payload.cvUrl })
      .addCase(uploadPhoto.fulfilled, (state, action: PayloadAction<{ id: string; photoUrl: string }>) => { if (state.currentStaff && state.currentStaff.id === action.payload.id) state.currentStaff.photo = action.payload.photoUrl })
  },
})

export const { clearStaffError, setCurrentStaff, setPage, setLimit } = staffSlice.actions
export default staffSlice.reducer
