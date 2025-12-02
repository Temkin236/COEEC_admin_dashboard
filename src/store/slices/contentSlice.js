import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "@/utils/axios"

// Demo content for offline usability
const DEMO_CONTENT = {
  homepage: [
    {
      id: "h1",
      type: "hero",
      title: "Welcome to COEEC",
      subtitle: "Driving innovation in Engineering & Computing",
      description: "Explore programs, research, and community at ASTU.",
      language: "en",
      status: "draft",
      order: 1,
      image: "",
    },
  ],
  about: [
    {
      id: "a1",
      history: "Founded to lead excellence in engineering education.",
      mission: "Educate, Innovate, Serve.",
      vision: "Global impact through research and teaching.",
      deanName: "Dr. Abebe Kebede",
      deanMessage: "Welcome to our vibrant academic community.",
      deanImage: "",
      values: "Integrity\nExcellence\nService",
      goals: "Quality Education\nResearch Leadership",
      language: "en",
    },
  ],
  departments: [
    {
      id: "d1",
      name: "Computer Science and Engineering",
      code: "CSE",
      head: "Dr. Abebe Kebede",
      description: "Leading CS education and research.",
      programs: ["BSc", "MSc", "PhD"],
      researchAreas: ["AI", "Systems"],
      staffCount: 45,
      email: "cse@astu.edu.et",
      phone: "+251-11-0000000",
    },
  ],
}

export const fetchContent = createAsyncThunk("content/fetchContent", async ({ type, language = "en" }) => {
  try {
    const response = await axiosInstance.get(`/content/${type}?lang=${language}`)
    return { type, data: response.data }
  } catch (e) {
    const data = DEMO_CONTENT[type] || []
    return { type, data }
  }
})

export const createContent = createAsyncThunk("content/createContent", async ({ type, data }) => {
  try {
    const response = await axiosInstance.post(`/content/${type}`, data)
    return { type, data: response.data }
  } catch (e) {
    return { type, data: { id: Date.now().toString(), ...data } }
  }
})

export const updateContent = createAsyncThunk("content/updateContent", async ({ type, id, data }) => {
  try {
    const response = await axiosInstance.put(`/content/${type}/${id}`, data)
    return { type, data: response.data }
  } catch (e) {
    return { type, data: { id, ...data } }
  }
})

export const deleteContent = createAsyncThunk("content/deleteContent", async ({ type, id }) => {
  try {
    await axiosInstance.delete(`/content/${type}/${id}`)
  } catch (e) {
    // ignore in demo mode
  }
  return { type, id }
})

const contentSlice = createSlice({
  name: "content",
  initialState: {
    homepage: { items: [], loading: false, error: null },
    about: { items: [], loading: false, error: null },
    departments: { items: [], loading: false, error: null },
    news: { items: [], loading: false, error: null },
  },
  reducers: {
    clearContentError: (state, action) => {
      const { type } = action.payload
      if (state[type]) {
        state[type].error = null
      }
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
      .addCase(fetchContent.fulfilled, (state, action) => {
        const { type, data } = action.payload
        if (state[type]) {
          state[type].loading = false
          state[type].items = data
        }
      })
      .addCase(fetchContent.rejected, (state, action) => {
        const type = action.meta.arg.type
        if (state[type]) {
          state[type].loading = false
          state[type].error = action.error.message
        }
      })
      .addCase(createContent.fulfilled, (state, action) => {
        const { type, data } = action.payload
        if (state[type]) {
          state[type].items.unshift(data)
        }
      })
      .addCase(updateContent.fulfilled, (state, action) => {
        const { type, data } = action.payload
        if (state[type]) {
          const index = state[type].items.findIndex((item) => item.id === data.id)
          if (index !== -1) {
            state[type].items[index] = data
          }
        }
      })
      .addCase(deleteContent.fulfilled, (state, action) => {
        const { type, id } = action.payload
        if (state[type]) {
          state[type].items = state[type].items.filter((item) => item.id !== id)
        }
      })
  },
})

export const { clearContentError } = contentSlice.actions
export default contentSlice.reducer
