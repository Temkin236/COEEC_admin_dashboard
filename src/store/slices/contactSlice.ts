import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import axiosInstance from "@/utils/axios"

export interface ContactItem {
  id: string | number
  name: string
  email: string
  subject?: string
  message: string
  category?: string
  ip?: string
  handledById?: string | null
  handledAt?: string | null
  handledBy?: { id: string; displayName?: string } | null
  status: "new" | "read" | "responded" | "archived" | string
  createdAt: string | Date
}

interface FetchArgs { page?: number; limit?: number; status?: string }
interface ContactState { items: ContactItem[]; total: number; loading: boolean; error: string | null; selected?: ContactItem | null }

export const fetchContacts = createAsyncThunk<{ items: ContactItem[]; total: number }, FetchArgs>(
  "contact/fetchContacts",
  async ({ page = 1, limit = 10, status }) => {
    try {
      const params = status ? `?page=${page}&limit=${limit}&status=${status}` : `?page=${page}&limit=${limit}`
      const response = await axiosInstance.get(`/contact-messages${params}`)
      const body = response.data
      // Support APIs that return { data: [...], meta: { total } } or { items, total }
      if (body) {
        if (Array.isArray(body.data)) {
          return { items: body.data as ContactItem[], total: (body.meta && body.meta.total) || body.data.length }
        }
        if (Array.isArray(body.items)) {
          return { items: body.items as ContactItem[], total: body.total || body.items.length }
        }
      }
      // Fallback: assume response.data is already { items, total }
      return response.data
    } catch (e) {
      const items: ContactItem[] = [
        { id: 'sample-1', name: "John Doe", email: "john@example.com", subject: "Inquiry about admission", message: "I would like to know more about the admission process...", status: "new", createdAt: new Date().toISOString() },
      ]
      return { items, total: items.length }
    }
  },
)

export const updateContactStatus = createAsyncThunk<ContactItem, { id: string | number; status: string }>(
  "contact/updateStatus",
  async ({ id, status }) => {
    try {
      const response = await axiosInstance.patch(`/contact-messages/${id}/status`, { status })
      const body = response.data
      return (body && (body.data || body)) || body
    } catch (e) {
      return { id, status } as unknown as ContactItem
    }
  },
)

export const fetchContactById = createAsyncThunk<ContactItem, string | number>(
  "contact/fetchById",
  async (id) => {
    try {
      const response = await axiosInstance.get(`/contact-messages/${id}`)
      const body = response.data
      if (body && body.data) return body.data as ContactItem
      return body
    } catch (e) {
      return { id, name: "Unknown", email: "", subject: "", message: "", status: "new", createdAt: new Date().toISOString() } as ContactItem
    }
  },
)

export const deleteContact = createAsyncThunk<string | number, string | number>(
  "contact/delete",
  async (id) => {
    try {
      await axiosInstance.delete(`/contact-messages/${id}`)
      return id
    } catch (e) {
      return id
    }
  },
)

export const handleContact = createAsyncThunk<ContactItem, { id: string | number }>(
  "contact/handle",
  async ({ id }) => {
    try {
      const response = await axiosInstance.patch(`/contact-messages/${id}/handle`)
      const body = response.data
      if (body && body.data) return body.data as ContactItem
      return body
    } catch (e) {
      return { id, name: "", email: "", subject: "", message: "", status: "handled", createdAt: new Date().toISOString() } as ContactItem
    }
  },
)

const initialState: ContactState = { items: [], total: 0, loading: false, error: null, selected: null }

const contactSlice = createSlice({
  name: "contact",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchContacts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchContacts.fulfilled, (state, action: PayloadAction<{ items: ContactItem[]; total: number }>) => {
        state.loading = false
        state.items = action.payload.items
        state.total = action.payload.total
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? "Failed to fetch contacts"
      })

      .addCase(fetchContactById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchContactById.fulfilled, (state, action: PayloadAction<ContactItem>) => {
        state.loading = false
        state.selected = action.payload
        const idx = state.items.findIndex((i) => String(i.id) === String(action.payload.id))
        if (idx === -1) state.items.unshift(action.payload)
        else state.items[idx] = action.payload
      })
      .addCase(fetchContactById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? "Failed to fetch contact"
      })

      .addCase(deleteContact.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteContact.fulfilled, (state, action: PayloadAction<string | number>) => {
        state.loading = false
        state.items = state.items.filter((i) => String(i.id) !== String(action.payload))
        state.total = Math.max(0, state.total - 1)
        if (state.selected && String(state.selected.id) === String(action.payload)) state.selected = null
      })
      .addCase(deleteContact.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? "Failed to delete contact"
      })

      .addCase(handleContact.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(handleContact.fulfilled, (state, action: PayloadAction<ContactItem>) => {
        state.loading = false
        const index = state.items.findIndex((item) => String(item.id) === String(action.payload.id))
        if (index !== -1) state.items[index] = action.payload
        if (state.selected && String(state.selected.id) === String(action.payload.id)) state.selected = action.payload
      })
      .addCase(handleContact.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? "Failed to mark contact as handled"
      })

      .addCase(updateContactStatus.fulfilled, (state, action: PayloadAction<ContactItem>) => {
        const index = state.items.findIndex((item) => String(item.id) === String(action.payload.id))
        if (index !== -1) state.items[index] = action.payload
        if (state.selected && String(state.selected.id) === String(action.payload.id)) state.selected = action.payload
      })
  },
})

export default contactSlice.reducer
