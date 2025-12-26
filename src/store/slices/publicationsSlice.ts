import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import axiosInstance from "@/utils/axios"

export interface Publication {
  id?: string
  title: string
  abstract?: string
  authors?: string[]
  year?: number
  pdfId?: string
  url?: string
  createdById?: string
  state?: string
}

interface PublicationsState {
  items: Publication[]
  loading: boolean
  error: string | null
}

const initialState: PublicationsState = {
  items: [],
  loading: false,
  error: null,
}

export const fetchMyPublications = createAsyncThunk<Publication[], void, { rejectValue: string }>(
  "publications/fetchMyPublications",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/publications/me")
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Failed to fetch publications")
    }
  }
)

export const createPublication = createAsyncThunk<Publication, Partial<Publication>, { rejectValue: string }>(
  "publications/createPublication",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/publications", data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Failed to create publication")
    }
  }
)

export const updatePublication = createAsyncThunk<Publication, { id: string; data: Partial<Publication> }, { rejectValue: string }>(
  "publications/updatePublication",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/publications/${id}`, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Failed to update publication")
    }
  }
)

export const deletePublication = createAsyncThunk<string, string, { rejectValue: string }>(
  "publications/deletePublication",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/publications/${id}`)
      return id
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Failed to delete publication")
    }
  }
)

const publicationsSlice = createSlice({
  name: "publications",
  initialState,
  reducers: {
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyPublications.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchMyPublications.fulfilled, (state, action: PayloadAction<Publication[]>) => { state.loading = false; state.items = action.payload })
      .addCase(fetchMyPublications.rejected, (state, action) => { state.loading = false; state.error = action.payload as string })
      .addCase(createPublication.fulfilled, (state, action: PayloadAction<Publication>) => { state.items.unshift(action.payload) })
      .addCase(updatePublication.fulfilled, (state, action: PayloadAction<Publication>) => {
        const idx = state.items.findIndex(i => i.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      .addCase(deletePublication.fulfilled, (state, action: PayloadAction<string>) => { state.items = state.items.filter(i => i.id !== action.payload) })
  }
})

export const { clearError } = publicationsSlice.actions
export default publicationsSlice.reducer
