import axiosInstance from "@/utils/axios"
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface Program {
  id: string | number
  name?: string
  title?: string
  slug?: string
  description?: string
  level?: string
  duration?: string
  durationMonths?: number | null
  credits?: number
  department?: string
  departmentId?: string
  status?: string
  state?: string  // Backend uses 'state' not 'status'
  code?: string
  order?: number
  createdAt?: string
  updatedAt?: string
  [key: string]: any
}

interface ProgramsState {
  items: Program[]
  loading: boolean
  error: string | null
}

const initialState: ProgramsState = {
  items: [],
  loading: false,
  error: null,
}

export const fetchPrograms = createAsyncThunk<Program[], void, { rejectValue: string }>(
  "programs/fetchPrograms",
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching programs from /programs endpoint...')
      // Add state parameter to get all programs (DRAFT and PUBLISHED)
      const res = await axiosInstance.get("/programs?all=true")
      console.log('Programs fetched successfully:', res.data)
      return res.data
    } catch (err: any) {
      console.error('Failed to fetch programs:', err.response?.data || err.message)
      return rejectWithValue(err?.response?.data?.message || err.message || "Failed to fetch programs")
    }
  },
)

export const fetchProgramById = createAsyncThunk<Program, string | number, { rejectValue: string }>(
  "programs/fetchProgramById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/programs/${id}`)
      return res.data
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || err.message || "Failed to fetch program")
    }
  },
)

export const createProgram = createAsyncThunk<Program, Partial<Program>, { rejectValue: string }>(
  "programs/createProgram",
  async (payload, { rejectWithValue }) => {
    try {
      console.log('Creating program with payload:', payload)
      console.log('Current token:', localStorage.getItem('token')?.substring(0, 50) + '...')
      const res = await axiosInstance.post(`/programs`, payload)
      return res.data
    } catch (err: any) {
      console.error('Create program error:', err.response?.data || err.message)
      const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || "Failed to create program"
      return rejectWithValue(errorMsg)
    }
  },
)

export const updateProgram = createAsyncThunk<Program, { id: string | number; data: Partial<Program> }, { rejectValue: string }>(
  "programs/updateProgram",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/programs/${id}`, data)
      return res.data
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || err.message || "Failed to update program")
    }
  },
)

export const deleteProgram = createAsyncThunk<string | number, string | number, { rejectValue: string }>(
  "programs/deleteProgram",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/programs/${id}`)
      return id
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || err.message || "Failed to delete program")
    }
  },
)

export const publishProgram = createAsyncThunk<Program, string | number, { rejectValue: string }>(
  "programs/publishProgram",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/programs/${id}/publish`)
      return res.data
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || err.message || "Failed to publish program")
    }
  },
)

const slice = createSlice({
  name: "programs",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrograms.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchPrograms.fulfilled, (state, action: PayloadAction<Program[]>) => { state.loading = false; state.items = action.payload })
      .addCase(fetchPrograms.rejected, (state, action) => { state.loading = false; state.error = action.payload as string })

      .addCase(fetchProgramById.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchProgramById.fulfilled, (state, action: PayloadAction<Program>) => { state.loading = false; const idx = state.items.findIndex(i => String(i.id) === String(action.payload.id)); if (idx === -1) state.items.push(action.payload); else state.items[idx] = action.payload })
      .addCase(fetchProgramById.rejected, (state, action) => { state.loading = false; state.error = action.payload as string })

      .addCase(createProgram.fulfilled, (state, action: PayloadAction<Program>) => { state.items.unshift(action.payload) })
      .addCase(updateProgram.fulfilled, (state, action: PayloadAction<Program>) => { const idx = state.items.findIndex(i => String(i.id) === String(action.payload.id)); if (idx !== -1) state.items[idx] = action.payload })
      .addCase(deleteProgram.fulfilled, (state, action: PayloadAction<string | number>) => { state.items = state.items.filter(i => String(i.id) !== String(action.payload)) })
      .addCase(publishProgram.fulfilled, (state, action: PayloadAction<Program>) => { const idx = state.items.findIndex(i => String(i.id) === String(action.payload.id)); if (idx !== -1) state.items[idx] = action.payload })
  },
})

export const { clearError } = slice.actions

export default slice.reducer
