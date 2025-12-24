import axiosInstance from "@/utils/axios"
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface CalendarEvent {
  id: string | number
  title: string
  description?: string
  startDate: string
  endDate: string
  state?: string
  status?: string
  createdAt?: string
  updatedAt?: string
  [key: string]: any
}

export interface AcademicCalendar {
  id: string | number
  title: string
  description?: string
  academicYear?: string
  state?: string
  status?: string
  events?: CalendarEvent[]
  createdAt?: string
  updatedAt?: string
  [key: string]: any
}

interface CalendarState {
  calendars: AcademicCalendar[]
  currentCalendar: AcademicCalendar | null
  loading: boolean
  error: string | null
}

const initialState: CalendarState = {
  calendars: [],
  currentCalendar: null,
  loading: false,
  error: null,
}

// Fetch all academic calendars
export const fetchCalendars = createAsyncThunk<AcademicCalendar[], void, { rejectValue: string }>(
  "calendar/fetchCalendars",
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching academic calendars...')
      const res = await axiosInstance.get("/academic-calendar")
      console.log('Calendars fetched:', res.data)
      return res.data
    } catch (err: any) {
      console.error('Failed to fetch calendars:', err.response?.data || err.message)
      return rejectWithValue(err?.response?.data?.message || err.message || "Failed to fetch calendars")
    }
  }
)

// Fetch calendar by ID
export const fetchCalendarById = createAsyncThunk<AcademicCalendar, string | number, { rejectValue: string }>(
  "calendar/fetchCalendarById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/academic-calendar/${id}`)
      return res.data
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || err.message || "Failed to fetch calendar")
    }
  }
)

// Create new academic calendar
export const createCalendar = createAsyncThunk<AcademicCalendar, Partial<AcademicCalendar>, { rejectValue: string }>(
  "calendar/createCalendar",
  async (payload, { rejectWithValue }) => {
    try {
      console.log('Creating calendar with payload:', payload)
      const res = await axiosInstance.post("/academic-calendar", payload)
      console.log('Calendar created:', res.data)
      return res.data
    } catch (err: any) {
      console.error('Failed to create calendar:', err.response?.data || err.message)
      const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || "Failed to create calendar"
      return rejectWithValue(errorMsg)
    }
  }
)

// Update academic calendar
export const updateCalendar = createAsyncThunk<AcademicCalendar, { id: string | number; data: Partial<AcademicCalendar> }, { rejectValue: string }>(
  "calendar/updateCalendar",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/academic-calendar/${id}`, data)
      return res.data
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || err.message || "Failed to update calendar")
    }
  }
)

// Delete academic calendar
export const deleteCalendar = createAsyncThunk<string | number, string | number, { rejectValue: string }>(
  "calendar/deleteCalendar",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/academic-calendar/${id}`)
      return id
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || err.message || "Failed to delete calendar")
    }
  }
)

// Publish academic calendar
export const publishCalendar = createAsyncThunk<AcademicCalendar, string | number, { rejectValue: string }>(
  "calendar/publishCalendar",
  async (id, { rejectWithValue }) => {
    try {
      console.log('Publishing calendar:', id)
      const res = await axiosInstance.post(`/academic-calendar/${id}/publish`)
      console.log('Calendar published:', res.data)
      return res.data
    } catch (err: any) {
      console.error('Failed to publish calendar:', err.response?.data || err.message)
      return rejectWithValue(err?.response?.data?.message || err.message || "Failed to publish calendar")
    }
  }
)

// Add event to calendar
export const addEventToCalendar = createAsyncThunk<CalendarEvent, { calendarId: string | number; event: Partial<CalendarEvent> }, { rejectValue: string }>(
  "calendar/addEvent",
  async ({ calendarId, event }, { rejectWithValue }) => {
    try {
      console.log('Adding event to calendar:', calendarId, event)
      const res = await axiosInstance.post(`/academic-calendar/${calendarId}/events`, event)
      console.log('Event added:', res.data)
      return res.data
    } catch (err: any) {
      console.error('Failed to add event:', err.response?.data || err.message)
      return rejectWithValue(err?.response?.data?.message || err.message || "Failed to add event")
    }
  }
)

// Update event in calendar
export const updateCalendarEvent = createAsyncThunk<CalendarEvent, { eventId: string | number; data: Partial<CalendarEvent> }, { rejectValue: string }>(
  "calendar/updateEvent",
  async ({ eventId, data }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/academic-calendar/events/${eventId}`, data)
      return res.data
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || err.message || "Failed to update event")
    }
  }
)

// Delete event from calendar
export const deleteCalendarEvent = createAsyncThunk<string | number, string | number, { rejectValue: string }>(
  "calendar/deleteEvent",
  async (eventId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/academic-calendar/events/${eventId}`)
      return eventId
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || err.message || "Failed to delete event")
    }
  }
)

const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch calendars
      .addCase(fetchCalendars.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCalendars.fulfilled, (state, action: PayloadAction<AcademicCalendar[]>) => {
        state.loading = false
        state.calendars = action.payload
      })
      .addCase(fetchCalendars.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to fetch calendars"
      })

      // Fetch calendar by ID
      .addCase(fetchCalendarById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCalendarById.fulfilled, (state, action: PayloadAction<AcademicCalendar>) => {
        state.loading = false
        state.currentCalendar = action.payload
      })
      .addCase(fetchCalendarById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to fetch calendar"
      })

      // Create calendar
      .addCase(createCalendar.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCalendar.fulfilled, (state, action: PayloadAction<AcademicCalendar>) => {
        state.loading = false
        state.calendars.push(action.payload)
      })
      .addCase(createCalendar.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to create calendar"
      })

      // Update calendar
      .addCase(updateCalendar.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCalendar.fulfilled, (state, action: PayloadAction<AcademicCalendar>) => {
        state.loading = false
        const index = state.calendars.findIndex(c => c.id === action.payload.id)
        if (index !== -1) {
          state.calendars[index] = action.payload
        }
        if (state.currentCalendar?.id === action.payload.id) {
          state.currentCalendar = action.payload
        }
      })
      .addCase(updateCalendar.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to update calendar"
      })

      // Delete calendar
      .addCase(deleteCalendar.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteCalendar.fulfilled, (state, action: PayloadAction<string | number>) => {
        state.loading = false
        state.calendars = state.calendars.filter(c => c.id !== action.payload)
        if (state.currentCalendar?.id === action.payload) {
          state.currentCalendar = null
        }
      })
      .addCase(deleteCalendar.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to delete calendar"
      })

      // Publish calendar
      .addCase(publishCalendar.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(publishCalendar.fulfilled, (state, action: PayloadAction<AcademicCalendar>) => {
        state.loading = false
        const index = state.calendars.findIndex(c => c.id === action.payload.id)
        if (index !== -1) {
          state.calendars[index] = action.payload
        }
      })
      .addCase(publishCalendar.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to publish calendar"
      })

      // Add event
      .addCase(addEventToCalendar.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addEventToCalendar.fulfilled, (state, action: PayloadAction<CalendarEvent>) => {
        state.loading = false
        // Event added successfully
      })
      .addCase(addEventToCalendar.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to add event"
      })

      // Update event
      .addCase(updateCalendarEvent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCalendarEvent.fulfilled, (state, action: PayloadAction<CalendarEvent>) => {
        state.loading = false
        // Event updated successfully
      })
      .addCase(updateCalendarEvent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to update event"
      })

      // Delete event
      .addCase(deleteCalendarEvent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteCalendarEvent.fulfilled, (state) => {
        state.loading = false
        // Event deleted successfully
      })
      .addCase(deleteCalendarEvent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to delete event"
      })
  },
})

export const { clearError } = calendarSlice.actions
export default calendarSlice.reducer
