import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import axiosInstance from "@/utils/axios"

type ContentType = "homepage" | "about" | "departments" | "news" | string

const DEMO_CONTENT: Record<string, any[]> = {
  homepage: [
    { id: "h1", type: "hero", title: "Welcome to COEEC", subtitle: "Driving innovation in Engineering & Computing", description: "Explore programs, research, and community at ASTU.", language: "en", status: "draft", order: 1, image: "" },
  ],
  about: [
    { id: "a1", history: "Founded to lead excellence in engineering education.", mission: "Educate, Innovate, Serve.", vision: "Global impact through research and teaching.", deanName: "Dr. Abebe Kebede", deanMessage: "Welcome to our vibrant academic community.", deanImage: "", values: "Integrity\nExcellence\nService", goals: "Quality Education\nResearch Leadership", language: "en" },
  ],
  departments: [
    { id: "d1", name: "Computer Science and Engineering", code: "CSE", head: "Dr. Abebe Kebede", description: "Leading CS education and research.", programs: ["BSc", "MSc", "PhD"], researchAreas: ["AI", "Systems"], staffCount: 45, email: "cse@astu.edu.et", phone: "+251-11-0000000" },
  ],
}

export const fetchContent = createAsyncThunk<{ type: ContentType; data: any[] }, { type: ContentType; language?: string }>(
  "content/fetchContent",
  async ({ type, language = "en" }) => {
    try {
      const response = await axiosInstance.get(`/content/${type}?lang=${language}`)
      return { type, data: response.data }
    } catch (e) {
      const data = DEMO_CONTENT[type] || []
      return { type, data }
    }
  },
)

export const createContent = createAsyncThunk<{ type: ContentType; data: any }, { type: ContentType; data: any }>(
  "content/createContent",
  async ({ type, data }) => {
    try {
      const response = await axiosInstance.post(`/content/${type}`, data)
      return { type, data: response.data }
    } catch (e) {
      return { type, data: { id: Date.now().toString(), ...data } }
    }
  },
)

export const updateContent = createAsyncThunk<{ type: ContentType; data: any }, { type: ContentType; id: string; data: any }>(
  "content/updateContent",
  async ({ type, id, data }) => {
    try {
      const response = await axiosInstance.put(`/content/${type}/${id}`, data)
      return { type, data: response.data }
    } catch (e) {
      return { type, data: { id, ...data } }
    }
  },
)

export const deleteContent = createAsyncThunk<{ type: ContentType; id: string }, { type: ContentType; id: string }>(
  "content/deleteContent",
  async ({ type, id }) => {
    try {
      await axiosInstance.delete(`/content/${type}/${id}`)
    } catch (e) {}
    return { type, id }
  },
)

interface SectionState { items: any[]; loading: boolean; error: string | null }
interface ContentState { [key: string]: SectionState }

const initialState: ContentState = {
  homepage: { items: [], loading: false, error: null },
  about: { items: [], loading: false, error: null },
  departments: { items: [], loading: false, error: null },
  news: { items: [], loading: false, error: null },
}

const contentSlice = createSlice({
  name: "content",
  initialState,
  reducers: {
    clearContentError: (state, action: PayloadAction<{ type: ContentType }>) => {
      const { type } = action.payload
      if (state[type]) state[type].error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContent.pending, (state, action) => {
        const type = action.meta.arg.type
        if (state[type]) {
          state[type].loading = true
          state[type].error = null
        }
      })
      .addCase(fetchContent.fulfilled, (state, action: PayloadAction<{ type: ContentType; data: any[] }>) => {
        const { type, data } = action.payload
        if (state[type]) {
          state[type].loading = false
          state[type].items = data
        }
      })
      .addCase(fetchContent.rejected, (state, action) => {
        const type = (action.meta as any).arg.type as ContentType
        if (state[type]) {
          state[type].loading = false
          state[type].error = action.error.message || null
        }
      })
      .addCase(createContent.fulfilled, (state, action: PayloadAction<{ type: ContentType; data: any }>) => {
        const { type, data } = action.payload
        if (state[type]) state[type].items.unshift(data)
      })
      .addCase(updateContent.fulfilled, (state, action: PayloadAction<{ type: ContentType; data: any }>) => {
        const { type, data } = action.payload
        if (state[type]) {
          const index = state[type].items.findIndex((item: any) => item.id === data.id)
          if (index !== -1) state[type].items[index] = data
        }
      })
      .addCase(deleteContent.fulfilled, (state, action: PayloadAction<{ type: ContentType; id: string }>) => {
        const { type, id } = action.payload
        if (state[type]) state[type].items = state[type].items.filter((item: any) => item.id !== id)
      })
  },
})

export const { clearContentError } = contentSlice.actions
export default contentSlice.reducer
