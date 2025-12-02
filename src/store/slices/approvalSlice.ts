import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import axiosInstance from "@/utils/axios"

export interface ApprovalItem {
  id: number
  type: string
  title: string
  submittedBy: string
  submittedAt: string | Date
  content?: string
}

const DEMO_APPROVALS: ApprovalItem[] = [
  { id: 1, type: "News", title: "New research lab opening", submittedBy: "Dr. Abebe Kebede", submittedAt: new Date().toISOString(), content: "We are excited to announce the opening of our new AI research lab..." },
]

export const fetchPendingApprovals = createAsyncThunk<ApprovalItem[]>("approval/fetchPending", async () => {
  try {
    const response = await axiosInstance.get("/approval/pending")
    return response.data
  } catch {
    return DEMO_APPROVALS
  }
})

export const approveItem = createAsyncThunk<{ type: string; data: { id: number; status: string; comment?: string } }, { type: string; id: number; comment?: string }>(
  "approval/approve",
  async ({ type, id, comment }) => {
    try {
      const response = await axiosInstance.post(`/approval/${type}/${id}/approve`, { comment })
      return { type, data: response.data }
    } catch {
      return { type, data: { id, status: "approved", comment } }
    }
  },
)

export const rejectItem = createAsyncThunk<{ type: string; data: { id: number; status: string; comment?: string } }, { type: string; id: number; comment?: string }>(
  "approval/reject",
  async ({ type, id, comment }) => {
    try {
      const response = await axiosInstance.post(`/approval/${type}/${id}/reject`, { comment })
      return { type, data: response.data }
    } catch {
      return { type, data: { id, status: "rejected", comment } }
    }
  },
)

interface ApprovalState { items: ApprovalItem[]; loading: boolean; error: string | null }
const initialState: ApprovalState = { items: [], loading: false, error: null }

const approvalSlice = createSlice({
  name: "approval",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingApprovals.pending, (state) => { state.loading = true })
      .addCase(fetchPendingApprovals.fulfilled, (state, action: PayloadAction<ApprovalItem[]>) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(approveItem.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => !(item.type === action.payload.type && item.id === action.payload.data.id))
      })
      .addCase(rejectItem.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => !(item.type === action.payload.type && item.id === action.payload.data.id))
      })
  },
})

export default approvalSlice.reducer
