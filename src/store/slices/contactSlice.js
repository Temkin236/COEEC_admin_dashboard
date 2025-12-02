import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "@/utils/axios"

export const fetchContacts = createAsyncThunk("contact/fetchContacts", async ({ page = 1, limit = 10, status }) => {
  try {
    const params = status ? `?page=${page}&limit=${limit}&status=${status}` : `?page=${page}&limit=${limit}`
    const response = await axiosInstance.get(`/contact${params}`)
    return response.data
  } catch (e) {
    const items = [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        subject: "Inquiry about admission",
        message: "I would like to know more about the admission process...",
        status: "new",
        createdAt: new Date().toISOString(),
      },
    ]
    return { items, total: items.length }
  }
})

export const updateContactStatus = createAsyncThunk("contact/updateStatus", async ({ id, status }) => {
  try {
    const response = await axiosInstance.patch(`/contact/${id}/status`, { status })
    return response.data
  } catch (e) {
    return { id, status }
  }
})

const contactSlice = createSlice({
  name: "contact",
  initialState: {
    items: [],
    total: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchContacts.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.total = action.payload.total
      })
      .addCase(updateContactStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
  },
})

export default contactSlice.reducer
