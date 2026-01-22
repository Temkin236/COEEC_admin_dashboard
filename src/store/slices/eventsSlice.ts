import axiosInstance from "@/utils/axios"
import { createSlice, createAsyncThunk, PayloadAction, isAnyOf } from "@reduxjs/toolkit"
import { transformTranslatedItems } from "@/utils/helpers"

export interface EventTranslation {
  id?: string
  language: "EN" | "AM" | "OM"
  title: string
  slug: string
  description?: string
  location?: string
}

export interface Event {
  id: string
  featuredImageId?: string
  authorId?: string
  state: "DRAFT" | "NEEDS_REVIEW" | "PUBLISHED" | "ARCHIVED" | "DELETED"
  startAt: string
  endAt?: string
  isOnline: boolean
  eventUrl?: string
  tags?: string[]
  createdAt?: string
  updatedAt?: string
  translations: EventTranslation[]
  // Flattened fields for UI
  title?: string
  slug?: string
  description?: string
  location?: string
  language?: string
}

interface EventsState {
  items: Event[]
  currentEvent: Event | null
  total: number
  loading: boolean
  error: string | null
}

const initialState: EventsState = {
  items: [],
  currentEvent: null,
  total: 0,
  loading: false,
  error: null,
}

// Fetch all events (admin)
export const fetchEvents = createAsyncThunk<{ items: Event[]; total: number }, { page?: number; limit?: number; state?: string }>(
  "events/fetchEvents",
  async ({ page = 1, limit = 10, state }) => {
    let url = `/events?page=${page}&limit=${limit}`
    if (state && state !== 'ALL') {
      url += `&state=${state}`
    }
    const response = await axiosInstance.get(url)
    const data = response.data

    // Get current language from localStorage or default to EN
    const language = localStorage.getItem('language')?.toUpperCase() || 'EN'

    if (data.data && Array.isArray(data.data)) {
      const transformedItems = transformTranslatedItems(data.data, language)
      return { items: transformedItems, total: data.meta?.total || data.data.length }
    }

    if (Array.isArray(data)) {
      const transformedItems = transformTranslatedItems(data, language)
      return { items: transformedItems, total: data.length }
    }

    return data
  }
)

// Create new event
export const createEvent = createAsyncThunk<Event, any>(
  "events/createEvent",
  async (data) => {
    const response = await axiosInstance.post("/events", data)
    return response.data
  }
)

// Update event
export const updateEvent = createAsyncThunk<Event, { id: string; data: any }>(
  "events/updateEvent",
  async ({ id, data }) => {
    const response = await axiosInstance.put(`/events/${id}`, data)
    return response.data
  }
)

// Publish event
export const publishEvent = createAsyncThunk<Event, string>(
  "events/publishEvent",
  async (id) => {
    const response = await axiosInstance.post(`/events/${id}/publish`)
    return response.data
  }
)

// Delete event
export const deleteEvent = createAsyncThunk<string, string>(
  "events/deleteEvent",
  async (id) => {
    await axiosInstance.delete(`/events/${id}`)
    return id
  }
)

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    clearEventsError: (state) => { state.error = null },
    setCurrentEvent: (state, action: PayloadAction<Event | null>) => {
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

export const { clearEventsError, setCurrentEvent } = eventsSlice.actions
export default eventsSlice.reducer
