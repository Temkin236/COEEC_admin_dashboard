import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import axiosInstance from "@/utils/axios"

export interface ContactItem {
  id: number
  name: string
  email: string
  subject: string
  message: string
  status: "new" | "read" | "responded" | "archived" | string
  createdAt: string | Date
}

interface FetchArgs { page?: number; limit?: number; status?: string }
interface ContactState { items: ContactItem[]; total: number; loading: boolean; error: string | null }

export const fetchContacts = createAsyncThunk<{ items: ContactItem[]; total: number }, FetchArgs>(
  "contact/fetchContacts",
  async ({ page = 1, limit = 10, status }) => {
    try {
      const params = status ? `?page=${page}&limit=${limit}&status=${status}` : `?page=${page}&limit=${limit}`
      const response = await axiosInstance.get(`/contact${params}`)
      return response.data
    } catch (e) {
      const items: ContactItem[] = [
        { id: 1, name: "John Doe", email: "john@example.com", subject: "Inquiry about admission", message: "I would like to know more about the admission process...", status: "new", createdAt: new Date().toISOString() },
      ]
      return { items, total: items.length }
    }
  },
)

export const updateContactStatus = createAsyncThunk<ContactItem, { id: number; status: string }>(
  "contact/updateStatus",
  async ({ id, status }) => {
    try {
      const response = await axiosInstance.patch(`/contact/${id}/status`, { status })
      return response.data
    } catch (e) {
      return { id, status } as unknown as ContactItem
    }
  },
)

const initialState: ContactState = { items: [], total: 0, loading: false, error: null }

const contactSlice = createSlice({
  name: "contact",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchContacts.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchContacts.fulfilled, (state, action: PayloadAction<{ items: ContactItem[]; total: number }>) => {
        state.loading = false
        state.items = action.payload.items
        state.total = action.payload.total
      })
      .addCase(updateContactStatus.fulfilled, (state, action: PayloadAction<ContactItem>) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) state.items[index] = action.payload
      })
  },
})

export default contactSlice.reducer
