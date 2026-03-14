import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import axiosInstance from "@/utils/axios"

export interface ResearchProject {
  id?: string
  title: string
  slug: string
  summary?: any
  startDate?: string
  endDate?: string
  members?: any[]
  documentIds?: string[]
  state?: "DRAFT" | "PUBLISHED"
}

interface ResearchProjectsState {
  items: ResearchProject[]
  loading: boolean
  error: string | null
}

const initialState: ResearchProjectsState = {
  items: [],
  loading: false,
  error: null,
}

export const fetchResearchProjects = createAsyncThunk<ResearchProject[], void, { rejectValue: string }>(
  "researchProjects/fetchResearchProjects",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/research-projects?all=true")
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Failed to fetch research projects")
    }
  }
)

export const createResearchProject = createAsyncThunk<ResearchProject, Partial<ResearchProject>, { rejectValue: string }>(
  "researchProjects/createResearchProject",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/research-projects", data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Failed to create research project")
    }
  }
)

export const updateResearchProject = createAsyncThunk<ResearchProject, { id: string; data: Partial<ResearchProject> }, { rejectValue: string }>(
  "researchProjects/updateResearchProject",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/research-projects/${id}`, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Failed to update research project")
    }
  }
)

export const deleteResearchProject = createAsyncThunk<string, string, { rejectValue: string }>(
  "researchProjects/deleteResearchProject",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/research-projects/${id}`)
      return id
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Failed to delete research project")
    }
  }
)

export const publishResearchProject = createAsyncThunk<ResearchProject, string, { rejectValue: string }>(
  "researchProjects/publishResearchProject",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/research-projects/${id}/publish`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Failed to publish research project")
    }
  }
)

const researchProjectsSlice = createSlice({
  name: "researchProjects",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchResearchProjects.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchResearchProjects.fulfilled, (state, action: PayloadAction<ResearchProject[] | any>) => {
        state.loading = false
        const payload = action.payload
        if (Array.isArray(payload)) {
          state.items = payload
        } else if (payload && Array.isArray(payload.items)) {
          state.items = payload.items
        } else {
          // Fallback: ensure items is always an array to avoid runtime errors in components
          state.items = []
        }
      })
      .addCase(fetchResearchProjects.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createResearchProject.fulfilled, (state, action: PayloadAction<ResearchProject>) => {
        state.items.push(action.payload)
      })
      .addCase(updateResearchProject.fulfilled, (state, action: PayloadAction<ResearchProject>) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(deleteResearchProject.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
      .addCase(publishResearchProject.fulfilled, (state, action: PayloadAction<ResearchProject>) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
  },
})

export const { clearError } = researchProjectsSlice.actions
export default researchProjectsSlice.reducer
