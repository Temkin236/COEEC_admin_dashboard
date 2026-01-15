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
  // Full file object from API
  file?: {
    id: string
    filename: string
    originalName: string
    mimeType: string
    size: number
    url: string
    storage: string
    resourceType: string
    visibility: string
  }
  // For backward compatibility
  fileId?: string
  uploadedAt?: string
  visibility?: string
  version?: string
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
  categories?: string[]
}

export const fetchDownloads = createAsyncThunk<{ items: DownloadItem[]; total: number }, FetchArgs>(
  "downloads/fetchDownloads",
  async ({ category, page = 1, limit = 10 }) => {
    try {
      const params = category ? `?category=${category}&page=${page}&limit=${limit}` : `?page=${page}&limit=${limit}`
      const response = await axiosInstance.get(`/downloads${params}`)
      // support APIs that return { data: [...], meta: { total } }
      const body = response.data
      if (body && Array.isArray(body.data)) {
        // Map API response to include file object and flatten needed properties
        const items = body.data.map((item: any) => ({
          ...item,
          // Keep the nested file object for access to file.url
          file: item.file,
          // Also set top-level url for backward compatibility
          url: item.file?.url || item.url || "#",
          size: item.file?.size || item.size || 0,
          downloadCount: item.downloadCount || 0,
        }))
        return { items, total: (body.meta && body.meta.total) || body.data.length }
      }
      return response.data
    } catch (e) {
      const items: DownloadItem[] = [
        { id: 1, title: "Admission Form 2024", category: "Forms", size: 204800, createdAt: new Date().toISOString(), downloadCount: 156, url: "#" },
      ]
      return { items, total: items.length }
    }
  },
)

export const fetchDownloadCategories = createAsyncThunk<string[]>(
  "downloads/fetchCategories",
  async () => {
    try {
      const response = await axiosInstance.get(`/downloads/categories`)
      const body = response.data
      if (Array.isArray(body)) return body
      if (body && Array.isArray(body.data)) return body.data
      return []
    } catch (e) {
      return []
    }
  },
)

export const uploadFile = createAsyncThunk<DownloadItem, { file: File; category: string; title: string; description?: string }>(
  "downloads/uploadFile",
  async ({ file, category, title, description }) => {
    try {
      // 1) Upload the raw file to media endpoint to obtain a fileId
      // Try several common multipart field names until one succeeds — some backends expect
      // 'file', others 'files' or 'upload' etc. This avoids 'Unexpected field' errors.
      const fieldNames = ["file", "files", "file[]", "upload", "media"]
      let mediaBody: any = null
      let lastErr: any = null
      for (const fieldName of fieldNames) {
        try {
          const fd = new FormData()
          fd.append(fieldName, file)
          fd.append("visibility", "PUBLIC")
          const resp = await axiosInstance.post("/media/upload", fd, { headers: { "Content-Type": undefined } as any })
          mediaBody = resp && resp.data ? resp.data : resp
          // success — stop attempting
          break
        } catch (err) {
          lastErr = err
          // If server responded with 'Unexpected field' or similar, try next field name
          const msg = err?.response?.data?.message || err?.response?.data || err?.message
          if (typeof msg === 'string' && msg.toLowerCase().includes('unexpected field')) {
            continue
          }
          // For other errors, continue trying other field names as well
          continue
        }
      }
      if (!mediaBody) {
        // All attempts failed — throw last error so caller falls back
        throw lastErr || new Error('Failed to upload media')
      }
      const fileId = (mediaBody && (mediaBody.id || (mediaBody.data && mediaBody.data.id))) || null

      // 2) Create the download entry referencing uploaded fileId
      const payload: any = {
        title,
        description: description || "",
        category,
        visibility: "PUBLIC",
      }
      if (fileId) payload.fileId = fileId

      const createResp = await axiosInstance.post("/downloads", payload)
      const createBody = createResp && createResp.data ? createResp.data : createResp
      return createBody
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
        // Normalize backend shapes: some APIs return items with nested `file` and `uploadedAt`
        state.items = action.payload.items.map((it: any) => ({
          id: it.id,
          title: it.title || it.originalName || (it.file && it.file.originalName) || "Untitled",
          category: it.category || (it.file && it.file.category) || "Uncategorized",
          size: (it.size || (it.file && it.file.size) || 0) as number,
          createdAt: it.createdAt || it.uploadedAt || (it.file && it.file.createdAt) || new Date().toISOString(),
          url: it.url || (it.file && it.file.url) || "#",
          downloadCount: it.downloadCount || 0,
          description: it.description,
        }))
        state.total = action.payload.total
      })
      .addCase(fetchDownloadCategories.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.categories = action.payload
      })
      .addCase(uploadFile.fulfilled, (state, action: PayloadAction<DownloadItem>) => {
        state.items.unshift(action.payload)
      })
  },
})

export const { removeDownload, incrementDownloadCount } = downloadSlice.actions
export default downloadSlice.reducer
