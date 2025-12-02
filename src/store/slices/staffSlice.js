import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "@/utils/axios"

// Demo fallback dataset to keep Staff pages fully usable without backend
const DEMO_STAFF = [
  {
    id: "1",
    firstName: "Abebe",
    lastName: "Kebede",
    name: "Abebe Kebede",
    email: "abebe@astu.edu.et",
    title: "Associate Professor",
    department: "CSE",
    researchAreas: ["AI", "ML"],
    status: "active",
    cvUrl: "#",
    photo: "",
  },
  {
    id: "2",
    firstName: "Chaltu",
    lastName: "Gemechu",
    name: "Chaltu Gemechu",
    email: "chaltu@astu.edu.et",
    title: "Lecturer",
    department: "EE",
    researchAreas: ["Power Systems"],
    status: "active",
    cvUrl: "#",
    photo: "",
  },
  {
    id: "3",
    firstName: "Dawit",
    lastName: "Tesfaye",
    name: "Dawit Tesfaye",
    email: "dawit@astu.edu.et",
    title: "Assistant Professor",
    department: "IT",
    researchAreas: ["Networks"],
    status: "on_leave",
    cvUrl: "#",
    photo: "",
  },
]

export const fetchStaff = createAsyncThunk("staff/fetchStaff", async ({ page = 1, limit = 10, filters = {} }) => {
  try {
    const params = new URLSearchParams({ page, limit, ...filters })
    const response = await axiosInstance.get(`/staff?${params}`)
    return response.data
  } catch (e) {
    // Demo fallback
    const items = DEMO_STAFF.filter((s) => {
      const byDept = !filters.department || s.department === filters.department
      const q = (filters.search || "").toLowerCase()
      const bySearch = !q || s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q)
      return byDept && bySearch
    })
    return { items, total: items.length, page, limit }
  }
})

export const fetchStaffById = createAsyncThunk("staff/fetchStaffById", async (id) => {
  try {
    const response = await axiosInstance.get(`/staff/${id}`)
    return response.data
  } catch (e) {
    return DEMO_STAFF.find((s) => String(s.id) === String(id)) || null
  }
})

export const createStaff = createAsyncThunk("staff/createStaff", async (data) => {
  try {
    const response = await axiosInstance.post("/staff", data)
    return response.data
  } catch (e) {
    const id = Date.now().toString()
    const name = `${data.firstName || ""} ${data.lastName || ""}`.trim()
    return { id, name, ...data }
  }
})

export const updateStaff = createAsyncThunk("staff/updateStaff", async ({ id, data }) => {
  try {
    const response = await axiosInstance.put(`/staff/${id}`, data)
    return response.data
  } catch (e) {
    const name = `${data.firstName || ""} ${data.lastName || ""}`.trim()
    return { id, name, ...data }
  }
})

export const deleteStaff = createAsyncThunk("staff/deleteStaff", async (id) => {
  try {
    await axiosInstance.delete(`/staff/${id}`)
  } catch (e) {
    // ignore in demo
  }
  return id
})

export const uploadCV = createAsyncThunk("staff/uploadCV", async ({ id, file }) => {
  try {
    const formData = new FormData()
    formData.append("file", file)
    const response = await axiosInstance.post(`/staff/${id}/cv`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data
  } catch (e) {
    return { id, cvUrl: URL.createObjectURL(file) }
  }
})

const staffSlice = createSlice({
  name: "staff",
  initialState: {
    items: [],
    currentStaff: null,
    total: 0,
    page: 1,
    limit: 10,
    loading: false,
    error: null,
  },
  reducers: {
    clearStaffError: (state) => {
      state.error = null
    },
    setCurrentStaff: (state, action) => {
      state.currentStaff = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStaff.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchStaff.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.total = action.payload.total
        state.page = action.payload.page
        state.limit = action.payload.limit
      })
      .addCase(fetchStaff.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(fetchStaffById.fulfilled, (state, action) => {
        state.currentStaff = action.payload
      })
      .addCase(createStaff.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
        state.total += 1
      })
      .addCase(updateStaff.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        if (state.currentStaff?.id === action.payload.id) {
          state.currentStaff = action.payload
        }
      })
      .addCase(deleteStaff.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload)
        state.total -= 1
      })
      .addCase(uploadCV.fulfilled, (state, action) => {
        if (state.currentStaff && state.currentStaff.id === action.payload.id) {
          state.currentStaff.cvUrl = action.payload.cvUrl
        }
      })
  },
})

export const { clearStaffError, setCurrentStaff } = staffSlice.actions
export default staffSlice.reducer
