import { createSlice, createAsyncThunk, PayloadAction, isAnyOf } from "@reduxjs/toolkit"
import axiosInstance from "@/utils/axios"
import { transformTranslatedItems } from "@/utils/helpers"

export interface NewsTranslation {
  id?: string
  language: "EN" | "AM" | "OM"
  title: string
  slug: string
  excerpt?: string
  content: any
}

export interface NewsItem {
  id: string
  featuredImageId?: string
  authorId?: string
  state: "DRAFT" | "NEEDS_REVIEW" | "PUBLISHED" | "ARCHIVED" | "DELETED"
  publishAt?: string
  tags?: string[]
  createdAt?: string
  updatedAt?: string
  translations: NewsTranslation[]
  // These are for the flattened view in the list, though the backend returns translations
  title?: string
  slug?: string
  excerpt?: string
  content?: any
  language?: string
}

interface NewsState {
  items: NewsItem[]
  currentNews: NewsItem | null
  total: number
  loading: boolean
  error: string | null
}

const initialState: NewsState = {
  items: [],
  currentNews: null,
  total: 0,
  loading: false,
  error: null,
}

export const fetchNews = createAsyncThunk<{ items: NewsItem[]; total: number }, { page?: number; limit?: number; state?: string }>(
  "news/fetchNews",
  async ({ page = 1, limit = 10, state }) => {
    let url = `/news?page=${page}&limit=${limit}`
    if (state && state !== 'ALL') {
      url += `&state=${state}`
    }
    const response = await axiosInstance.get(url)
    const data = response.data

    // Get current language from localStorage or default to EN
    const language = localStorage.getItem('language')?.toUpperCase() || 'EN'

    if (data.data && Array.isArray(data.data)) {
      const transformedItems = transformTranslatedItems(data.data, language)
      return { items: transformedItems, total: data.meta?.total || data.data.length }
    }

    if (Array.isArray(data)) {
      const transformedItems = transformTranslatedItems(data, language)
      return { items: transformedItems, total: data.length }
    }

    return data
  }
)

export const createNews = createAsyncThunk<NewsItem, any>(
  "news/createNews",
  async (data) => {
    const response = await axiosInstance.post("/news", data)
    return response.data
  }
)

export const updateNews = createAsyncThunk<NewsItem, { id: string; data: any }>(
  "news/updateNews",
  async ({ id, data }) => {
    const response = await axiosInstance.put(`/news/${id}`, data)
    return response.data
  }
)

export const publishNews = createAsyncThunk<NewsItem, string>(
  "news/publishNews",
  async (id) => {
    const response = await axiosInstance.post(`/news/${id}/publish`)
    return response.data
  }
)

export const deleteNews = createAsyncThunk<string, string>(
  "news/deleteNews",
  async (id) => {
    await axiosInstance.delete(`/news/${id}`)
    return id
  }
)

const newsSlice = createSlice({
  name: "news",
  initialState,
  reducers: {
    clearNewsError: (state) => { state.error = null },
    setCurrentNews: (state, action: PayloadAction<NewsItem | null>) => {
      state.currentNews = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.total = action.payload.total
      })
      .addCase(createNews.fulfilled, (state, action) => {
        state.loading = false
        state.items.unshift(action.payload)
        state.total += 1
      })
      .addCase(updateNews.fulfilled, (state, action) => {
        state.loading = false
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) state.items[index] = action.payload
      })
      .addCase(publishNews.fulfilled, (state, action) => {
        state.loading = false
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) state.items[index].state = "PUBLISHED"
      })
      .addCase(deleteNews.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter((item) => item.id !== action.payload)
        state.total -= 1
      })
      .addMatcher(
        isAnyOf(fetchNews.pending, createNews.pending, updateNews.pending, deleteNews.pending, publishNews.pending),
        (state) => { state.loading = true; state.error = null }
      )
      .addMatcher(
        isAnyOf(fetchNews.rejected, createNews.rejected, updateNews.rejected, deleteNews.rejected, publishNews.rejected),
        (state, action) => {
          state.loading = false
          state.error = action.error.message || "An error occurred"
        }
      )
  },
})

export const { clearNewsError, setCurrentNews } = newsSlice.actions
export default newsSlice.reducer
