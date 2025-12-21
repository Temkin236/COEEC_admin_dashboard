import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import axiosInstance from "@/utils/axios"

export interface StaffItem {
  id: string
  firstName?: string
  lastName?: string
  name?: string
  email?: string
  title?: string
  department?: string
  researchAreas?: string[]
  status?: string
  cvUrl?: string
  photo?: string
}

const DEMO_STAFF: StaffItem[] = [
  { id: "1", firstName: "Abebe", lastName: "Kebede", name: "Abebe Kebede", email: "abebe@astu.edu.et", title: "Associate Professor", department: "CSE", researchAreas: ["AI", "ML"], status: "active", cvUrl: "#", photo: "" },
  { id: "2", firstName: "Chaltu", lastName: "Gemechu", name: "Chaltu Gemechu", email: "chaltu@astu.edu.et", title: "Lecturer", department: "EE", researchAreas: ["Power Systems"], status: "active", cvUrl: "#", photo: "" },
  { id: "3", firstName: "Dawit", lastName: "Tesfaye", name: "Dawit Tesfaye", email: "dawit@astu.edu.et", title: "Assistant Professor", department: "IT", researchAreas: ["Networks"], status: "on_leave", cvUrl: "#", photo: "" },
]

export const fetchStaff = createAsyncThunk<{ items: StaffItem[]; total: number; page: number; limit: number }, { page?: number; limit?: number; filters?: Record<string, any> }>(
  "staff/fetchStaff",
  async ({ page = 1, limit = 10, filters = {} }) => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit), ...filters as any })
      const response = await axiosInstance.get(`/staff?${params}`)
      return response.data
    } catch (e) {
      const items = DEMO_STAFF.filter((s) => {
        const byDept = !filters.department || s.department === filters.department
        const q = String(filters.search || "").toLowerCase()
        const bySearch = !q || s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q)
        return byDept && bySearch
      })
      return { items, total: items.length, page, limit }
    }
  },
)

export const fetchStaffById = createAsyncThunk<StaffItem | null, string>("staff/fetchStaffById", async (id) => {
  try {
    const response = await axiosInstance.get(`/staff/${id}`)
    return response.data
  } catch (e) {
    return DEMO_STAFF.find((s) => String(s.id) === String(id)) || null
  }
})

export const createStaff = createAsyncThunk<StaffItem, any>("staff/createStaff", async (data) => {
  try {
    const response = await axiosInstance.post("/staff", data)
    return response.data
  } catch (e) {
    const id = Date.now().toString()
    const name = `${data.firstName || ""} ${data.lastName || ""}`.trim()
    return { id, name, ...data }
  }
})

export const updateStaff = createAsyncThunk<StaffItem, { id: string; data: any }>("staff/updateStaff", async ({ id, data }) => {
  try {
    const response = await axiosInstance.put(`/staff/${id}`, data)
    return response.data
  } catch (e) {
    const name = `${data.firstName || ""} ${data.lastName || ""}`.trim()
    return { id, name, ...data }
  }
})

export const deleteStaff = createAsyncThunk<string, string>("staff/deleteStaff", async (id) => {
  try {
    await axiosInstance.delete(`/staff/${id}`)
  } catch (e) {}
  return id
})

export const uploadCV = createAsyncThunk<{ id: string; cvUrl: string }, { id: string; file: File }>(
  "staff/uploadCV",
  async ({ id, file }) => {
    try {
      const formData = new FormData()
      formData.append("file", file)
      const response = await axiosInstance.post(`/staff/${id}/cv`, formData, { headers: { "Content-Type": "multipart/form-data" } })
      return response.data
    } catch (e) {
      return { id, cvUrl: URL.createObjectURL(file) }
    }
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

export const { clearStaffError, setCurrentStaff } = staffSlice.actions
export default staffSlice.reducer
