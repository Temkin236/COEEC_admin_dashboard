import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import axiosInstance from "@/utils/axios"

interface ResearchItem { id: string; title: string; principalInvestigator?: string; status?: string; startDate?: string; endDate?: string; fundingAmount?: number }
interface PublicationItem { id: string; title: string; authors: string[]; type: string; venue: string; publicationDate: string; url: string }

const DEMO_PROJECTS: ResearchItem[] = [
  { id: "rp1", title: "AI for Public Health", principalInvestigator: "Dr. Abebe Kebede", status: "ongoing", startDate: "2024-01-01", endDate: "2025-12-31", fundingAmount: 150000 },
]

const DEMO_PUBLICATIONS: PublicationItem[] = [
  { id: "pb1", title: "Efficient CNNs for Edge AI", authors: ["A. Kebede", "C. Gemechu"], type: "Journal", venue: "IEEE Access", publicationDate: "2024-06-01", url: "#" },
]

export const fetchResearch = createAsyncThunk<{ items: ResearchItem[]; total: number }, { page?: number; limit?: number }>(
  "research/fetchResearch",
  async ({ page = 1, limit = 10 }) => {
    try {
      const response = await axiosInstance.get(`/research?page=${page}&limit=${limit}`)
      return response.data
    } catch (e) {
      return { items: DEMO_PROJECTS, total: DEMO_PROJECTS.length }
    }
  },
)

export const fetchPublications = createAsyncThunk<{ items: PublicationItem[]; total: number }, { page?: number; limit?: number }>(
  "research/fetchPublications",
  async ({ page = 1, limit = 10 }) => {
    try {
      const response = await axiosInstance.get(`/research/publications?page=${page}&limit=${limit}`)
      return response.data
    } catch (e) {
      return { items: DEMO_PUBLICATIONS, total: DEMO_PUBLICATIONS.length }
    }
  },
)

export const createResearch = createAsyncThunk<ResearchItem, any>("research/createResearch", async (data) => {
  try {
    const response = await axiosInstance.post("/research", data)
    return response.data
  } catch (e) {
    return { id: Date.now().toString(), ...data }
  }
})

export const createPublication = createAsyncThunk<PublicationItem, any>("research/createPublication", async (data) => {
  try {
    const response = await axiosInstance.post("/research/publications", data)
    return response.data
  } catch (e) {
    return { id: Date.now().toString(), ...data }
  }
})

interface SectionState<T> { items: T[]; total: number; loading: boolean; error: string | null }
interface ResearchState { projects: SectionState<ResearchItem>; publications: SectionState<PublicationItem> }

const initialState: ResearchState = {
  projects: { items: [], total: 0, loading: false, error: null },
  publications: { items: [], total: 0, loading: false, error: null },
}

const researchSlice = createSlice({
  name: "research",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchResearch.pending, (state) => { state.projects.loading = true })
      .addCase(fetchResearch.fulfilled, (state, action: PayloadAction<{ items: ResearchItem[]; total: number }>) => {
        state.projects.loading = false
        state.projects.items = action.payload.items
        state.projects.total = action.payload.total
      })
      .addCase(fetchPublications.pending, (state) => { state.publications.loading = true })
      .addCase(fetchPublications.fulfilled, (state, action: PayloadAction<{ items: PublicationItem[]; total: number }>) => {
        state.publications.loading = false
        state.publications.items = action.payload.items
        state.publications.total = action.payload.total
      })
      .addCase(createResearch.fulfilled, (state, action: PayloadAction<ResearchItem>) => {
        state.projects.items.unshift(action.payload)
      })
      .addCase(createPublication.fulfilled, (state, action: PayloadAction<PublicationItem>) => {
        state.publications.items.unshift(action.payload)
      })
  },
})

export default researchSlice.reducer
