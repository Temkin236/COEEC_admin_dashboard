import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "@/utils/axios"

export const fetchDownloads = createAsyncThunk(
  "downloads/fetchDownloads",
  async ({ category, page = 1, limit = 10 }) => {
    try {
      const params = category ? `?category=${category}&page=${page}&limit=${limit}` : `?page=${page}&limit=${limit}`
      const response = await axiosInstance.get(`/downloads${params}`)
      return response.data
    } catch (e) {
      const items = [
        {
          id: 1,
          title: "Admission Form 2024",
          category: "Forms",
          size: 204800,
          createdAt: new Date().toISOString(),
          downloadCount: 156,
          url: "#",
        },
      ]
      return { items, total: items.length }
    }
  },
)

export const uploadFile = createAsyncThunk("downloads/uploadFile", async ({ file, category, title, description }) => {
  try {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("category", category)
    formData.append("title", title)
    formData.append("description", description)
    const response = await axiosInstance.post("/downloads", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data
  } catch (e) {
    return {
      id: Date.now().toString(),
      title,
      category,
      description,
      size: file?.size || 0,
      createdAt: new Date().toISOString(),
      url: URL.createObjectURL(file),
      downloadCount: 0,
    }
  }
})

const downloadSlice = createSlice({
  name: "downloads",
  initialState: {
    items: [],
    total: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDownloads.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchDownloads.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.total = action.payload.total
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
  },
})

export default downloadSlice.reducer
