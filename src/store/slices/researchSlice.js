import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "@/utils/axios"

const DEMO_PROJECTS = [
  {
    id: "rp1",
    title: "AI for Public Health",
    principalInvestigator: "Dr. Abebe Kebede",
    status: "ongoing",
    startDate: "2024-01-01",
    endDate: "2025-12-31",
    fundingAmount: 150000,
  },
]

const DEMO_PUBLICATIONS = [
  {
    id: "pb1",
    title: "Efficient CNNs for Edge AI",
    authors: ["A. Kebede", "C. Gemechu"],
    type: "Journal",
    venue: "IEEE Access",
    publicationDate: "2024-06-01",
    url: "#",
  },
]

export const fetchResearch = createAsyncThunk("research/fetchResearch", async ({ page = 1, limit = 10 }) => {
  try {
    const response = await axiosInstance.get(`/research?page=${page}&limit=${limit}`)
    return response.data
  } catch (e) {
    return { items: DEMO_PROJECTS, total: DEMO_PROJECTS.length }
  }
})

export const fetchPublications = createAsyncThunk("research/fetchPublications", async ({ page = 1, limit = 10 }) => {
  try {
    const response = await axiosInstance.get(`/research/publications?page=${page}&limit=${limit}`)
    return response.data
  } catch (e) {
    return { items: DEMO_PUBLICATIONS, total: DEMO_PUBLICATIONS.length }
  }
})

export const createResearch = createAsyncThunk("research/createResearch", async (data) => {
  try {
    const response = await axiosInstance.post("/research", data)
    return response.data
  } catch (e) {
    return { id: Date.now().toString(), ...data }
  }
})

export const createPublication = createAsyncThunk("research/createPublication", async (data) => {
  try {
    const response = await axiosInstance.post("/research/publications", data)
    return response.data
  } catch (e) {
    return { id: Date.now().toString(), ...data }
  }
})

const researchSlice = createSlice({
  name: "research",
  initialState: {
    projects: { items: [], total: 0, loading: false, error: null },
    publications: { items: [], total: 0, loading: false, error: null },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchResearch.pending, (state) => {
        state.projects.loading = true
      })
      .addCase(fetchResearch.fulfilled, (state, action) => {
        state.projects.loading = false
        state.projects.items = action.payload.items
        state.projects.total = action.payload.total
      })
      .addCase(fetchPublications.pending, (state) => {
        state.publications.loading = true
      })
      .addCase(fetchPublications.fulfilled, (state, action) => {
        state.publications.loading = false
        state.publications.items = action.payload.items
        state.publications.total = action.payload.total
      })
      .addCase(createResearch.fulfilled, (state, action) => {
        state.projects.items.unshift(action.payload)
      })
      .addCase(createPublication.fulfilled, (state, action) => {
        state.publications.items.unshift(action.payload)
      })
  },
})

export default researchSlice.reducer
