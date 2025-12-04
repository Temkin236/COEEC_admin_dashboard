import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import axiosInstance from "@/utils/axios"

export interface DownloadItem {
  id: number | string
  title: string
  category: string
  size: number
  createdAt: string | Date
  url: string
  downloadCount: number
  description?: string
}

interface FetchArgs {
  category?: string
  page?: number
  limit?: number
}

interface DownloadState {
  items: DownloadItem[]
  total: number
  loading: boolean
  error: string | null
}

export const fetchDownloads = createAsyncThunk<{ items: DownloadItem[]; total: number }, FetchArgs>(
  "downloads/fetchDownloads",
  async ({ category, page = 1, limit = 10 }) => {
    try {
      const params = category ? `?category=${category}&page=${page}&limit=${limit}` : `?page=${page}&limit=${limit}`
      const response = await axiosInstance.get(`/downloads${params}`)
      return response.data
    } catch (e) {
      const items: DownloadItem[] = [
        { id: 1, title: "Admission Form 2024", category: "Forms", size: 204800, createdAt: new Date().toISOString(), downloadCount: 156, url: "#" },
      ]
      return { items, total: items.length }
    }
  },
)

export const uploadFile = createAsyncThunk<DownloadItem, { file: File; category: string; title: string; description?: string }>(
  "downloads/uploadFile",
  async ({ file, category, title, description }) => {
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("category", category)
      formData.append("title", title)
      formData.append("description", description || "")
      const response = await axiosInstance.post("/downloads", formData, { headers: { "Content-Type": "multipart/form-data" } })
      return response.data
    } catch (e) {
      return {
        id: Date.now().toString(),
        title,
        category,
        description,
        size: (file as any)?.size || 0,
        createdAt: new Date().toISOString(),
        url: URL.createObjectURL(file),
        downloadCount: 0,
      }
    }
  },
)

const initialState: DownloadState = { items: [], total: 0, loading: false, error: null }

const downloadSlice = createSlice({
  name: "downloads",
  initialState,
  reducers: {
    removeDownload: (state, action: PayloadAction<string | number>) => {
      const id = action.payload
      state.items = state.items.filter((it) => String(it.id) !== String(id))
      state.total = Math.max(0, state.total - 1)
    },
    incrementDownloadCount: (state, action: PayloadAction<string | number>) => {
      const id = action.payload
      const item = state.items.find((it) => String(it.id) === String(id))
      if (item) item.downloadCount = (item.downloadCount || 0) + 1
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDownloads.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchDownloads.fulfilled, (state, action: PayloadAction<{ items: DownloadItem[]; total: number }>) => {
        state.loading = false
        state.items = action.payload.items
        state.total = action.payload.total
      })
      .addCase(uploadFile.fulfilled, (state, action: PayloadAction<DownloadItem>) => {
        state.items.unshift(action.payload)
      })
  },
})

export const { removeDownload, incrementDownloadCount } = downloadSlice.actions
export default downloadSlice.reducer
