import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import axiosInstance from "@/utils/axios"

export interface Event {
  id: string | number
  title: string
  description?: string
  startDate: string
  endDate: string
  location?: string
  type?: string
  state?: string
  status?: string
  createdAt?: string
  updatedAt?: string
  [key: string]: any
}

interface EventsState {
  items: Event[]
  publicEvents: Event[]
  currentEvent: Event | null
  loading: boolean
  error: string | null
}

const initialState: EventsState = {
  items: [],
  publicEvents: [],
  currentEvent: null,
  loading: false,
  error: null,
}

// Fetch public events
export const fetchPublicEvents = createAsyncThunk<Event[], void, { rejectValue: string }>(
  "events/fetchPublicEvents",
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching public events...')
      const res = await axiosInstance.get("/events/public")
      console.log('Public events fetched:', res.data)
      return res.data
    } catch (err: any) {
      console.error('Failed to fetch public events:', err.response?.data || err.message)
      return rejectWithValue(err?.response?.data?.message || err.message || "Failed to fetch public events")
    }
  }
)

// Fetch all events (admin)
export const fetchEvents = createAsyncThunk<Event[], void, { rejectValue: string }>(
  "events/fetchEvents",
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching all events...')
      const res = await axiosInstance.get("/events")
      console.log('Events fetched:', res.data)
      return res.data
    } catch (err: any) {
      console.error('Failed to fetch events:', err.response?.data || err.message)
      return rejectWithValue(err?.response?.data?.message || err.message || "Failed to fetch events")
    }
  }
)

// Fetch event by ID
export const fetchEventById = createAsyncThunk<Event, string | number, { rejectValue: string }>(
  "events/fetchEventById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/events/${id}`)
      return res.data
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || err.message || "Failed to fetch event")
    }
  }
)

// Create new event
export const createEvent = createAsyncThunk<Event, Partial<Event>, { rejectValue: string }>(
  "events/createEvent",
  async (payload, { rejectWithValue }) => {
    try {
      console.log('Creating event with payload:', payload)
      const res = await axiosInstance.post("/events", payload)
      console.log('Event created:', res.data)
      return res.data
    } catch (err: any) {
      console.error('Failed to create event:', err.response?.data || err.message)
      const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || "Failed to create event"
      return rejectWithValue(errorMsg)
    }
  }
)

// Update event
export const updateEvent = createAsyncThunk<Event, { id: string | number; data: Partial<Event> }, { rejectValue: string }>(
  "events/updateEvent",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/events/${id}`, data)
      return res.data
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || err.message || "Failed to update event")
    }
  }
)

// Delete event
export const deleteEvent = createAsyncThunk<string | number, string | number, { rejectValue: string }>(
  "events/deleteEvent",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/events/${id}`)
      return id
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || err.message || "Failed to delete event")
    }
  }
)

// Publish event
export const publishEvent = createAsyncThunk<Event, string | number, { rejectValue: string }>(
  "events/publishEvent",
  async (id, { rejectWithValue }) => {
    try {
      console.log('Publishing event:', id)
      const res = await axiosInstance.post(`/events/${id}/publish`)
      console.log('Event published:', res.data)
      return res.data
    } catch (err: any) {
      console.error('Failed to publish event:', err.response?.data || err.message)
      return rejectWithValue(err?.response?.data?.message || err.message || "Failed to publish event")
    }
  }
)

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch public events
      .addCase(fetchPublicEvents.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPublicEvents.fulfilled, (state, action: PayloadAction<Event[]>) => {
        state.loading = false
        state.publicEvents = action.payload
      })
      .addCase(fetchPublicEvents.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to fetch public events"
      })

      // Fetch all events
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEvents.fulfilled, (state, action: PayloadAction<Event[]>) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to fetch events"
      })

      // Fetch event by ID
      .addCase(fetchEventById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEventById.fulfilled, (state, action: PayloadAction<Event>) => {
        state.loading = false
        state.currentEvent = action.payload
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to fetch event"
      })

      // Create event
      .addCase(createEvent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createEvent.fulfilled, (state, action: PayloadAction<Event>) => {
        state.loading = false
        state.items.push(action.payload)
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to create event"
      })

      // Update event
      .addCase(updateEvent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateEvent.fulfilled, (state, action: PayloadAction<Event>) => {
        state.loading = false
        const index = state.items.findIndex(e => e.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        if (state.currentEvent?.id === action.payload.id) {
          state.currentEvent = action.payload
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to update event"
      })

      // Delete event
      .addCase(deleteEvent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteEvent.fulfilled, (state, action: PayloadAction<string | number>) => {
        state.loading = false
        state.items = state.items.filter(e => e.id !== action.payload)
        if (state.currentEvent?.id === action.payload) {
          state.currentEvent = null
        }
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to delete event"
      })

      // Publish event
      .addCase(publishEvent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(publishEvent.fulfilled, (state, action: PayloadAction<Event>) => {
        state.loading = false
        const index = state.items.findIndex(e => e.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(publishEvent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to publish event"
      })
  },
})

export const { clearError } = eventsSlice.actions
export default eventsSlice.reducer
