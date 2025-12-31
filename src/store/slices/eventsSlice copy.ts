import { createSlice, createAsyncThunk, PayloadAction, isAnyOf } from "@reduxjs/toolkit"
import axiosInstance from "@/utils/axios"

export interface EventItem {
  id: string
  title: string
  slug: string
  description: string
  location?: string
  startAt: string
  endAt?: string
  isOnline: boolean
  eventUrl?: string
  featuredImageId?: string
  tags?: string[]
  state: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  createdAt?: string
}

interface EventState {
  items: EventItem[]
  currentEvent: EventItem | null
  total: number
  loading: boolean
  error: string | null
}

const initialState: EventState = {
  items: [],
  currentEvent: null,
  total: 0,
  loading: false,
  error: null,
}

export const fetchEvents = createAsyncThunk<{ items: EventItem[]; total: number }, { page?: number; limit?: number }>(
  "events/fetchEvents",
  async ({ page = 1, limit = 10 }) => {
    const response = await axiosInstance.get(`/events?page=${page}&limit=${limit}`)
    const data = response.data
    return Array.isArray(data) ? { items: data, total: data.length } : data
  }
)

export const createEvent = createAsyncThunk<EventItem, any>(
  "events/createEvent",
  async (data) => {
    const response = await axiosInstance.post("/events", data)
    return response.data
  }
)

export const updateEvent = createAsyncThunk<EventItem, { id: string; data: any }>(
  "events/updateEvent",
  async ({ id, data }) => {
    const response = await axiosInstance.put(`/events/${id}`, data)
    return response.data
  }
)

export const publishEvent = createAsyncThunk<EventItem, string>(
  "events/publishEvent",
  async (id) => {
    const response = await axiosInstance.post(`/events/${id}/publish`)
    return response.data
  }
)

export const deleteEvent = createAsyncThunk<string, string>(
  "events/deleteEvent",
  async (id) => {
    await axiosInstance.delete(`/events/${id}`)
    return id
  }
)

const eventSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    clearEventError: (state) => { state.error = null },
    setCurrentEvent: (state, action: PayloadAction<EventItem | null>) => {
      state.currentEvent = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.total = action.payload.total
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false
        state.items.unshift(action.payload)
        state.total += 1
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.loading = false
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) state.items[index] = action.payload
      })
      .addCase(publishEvent.fulfilled, (state, action) => {
        state.loading = false
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) state.items[index].state = "PUBLISHED"
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter((item) => item.id !== action.payload)
        state.total -= 1
      })
      .addMatcher(
        isAnyOf(fetchEvents.pending, createEvent.pending, updateEvent.pending, deleteEvent.pending, publishEvent.pending),
        (state) => { state.loading = true; state.error = null }
      )
      .addMatcher(
        isAnyOf(fetchEvents.rejected, createEvent.rejected, updateEvent.rejected, deleteEvent.rejected, publishEvent.rejected),
        (state, action) => {
          state.loading = false
          state.error = action.error.message || "An error occurred"
        }
      )
  },
})

export const { clearEventError, setCurrentEvent } = eventSlice.actions
export default eventSlice.reducer
