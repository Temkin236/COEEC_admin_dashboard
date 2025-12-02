import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "@/utils/axios"

const DEMO_APPROVALS = [
  {
    id: 1,
    type: "News",
    title: "New research lab opening",
    submittedBy: "Dr. Abebe Kebede",
    submittedAt: new Date().toISOString(),
    content: "We are excited to announce the opening of our new AI research lab...",
  },
]

export const fetchPendingApprovals = createAsyncThunk("approval/fetchPending", async () => {
  try {
    const response = await axiosInstance.get("/approval/pending")
    return response.data
  } catch (e) {
    return DEMO_APPROVALS
  }
})

export const approveItem = createAsyncThunk("approval/approve", async ({ type, id, comment }) => {
  try {
    const response = await axiosInstance.post(`/approval/${type}/${id}/approve`, { comment })
    return { type, data: response.data }
  } catch (e) {
    return { type, data: { id, status: "approved", comment } }
  }
})

export const rejectItem = createAsyncThunk("approval/reject", async ({ type, id, comment }) => {
  try {
    const response = await axiosInstance.post(`/approval/${type}/${id}/reject`, { comment })
    return { type, data: response.data }
  } catch (e) {
    return { type, data: { id, status: "rejected", comment } }
  }
})

const approvalSlice = createSlice({
  name: "approval",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingApprovals.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchPendingApprovals.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(approveItem.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => !(item.type === action.payload.type && item.id === action.payload.data.id),
        )
      })
      .addCase(rejectItem.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => !(item.type === action.payload.type && item.id === action.payload.data.id),
        )
      })
  },
})

export default approvalSlice.reducer
