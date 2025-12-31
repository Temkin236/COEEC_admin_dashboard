import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "@/utils/axios"

interface MediaItem {
    id: string
    url: string
    filename: string
    mimetype: string
    size: number
    path: string
    type: string
}

interface MediaState {
    items: MediaItem[]
    loading: boolean
    error: string | null
}

const initialState: MediaState = {
    items: [],
    loading: false,
    error: null,
}

export const uploadMedia = createAsyncThunk<MediaItem, File>(
    "media/upload",
    async (file) => {
        const formData = new FormData()
        formData.append("file", file)
        // Default visibility to PUBLIC for news images
        formData.append("visibility", "PUBLIC")

        const response = await axiosInstance.post("/media/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
        return response.data
    }
)

const mediaSlice = createSlice({
    name: "media",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(uploadMedia.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(uploadMedia.fulfilled, (state, action) => {
                state.loading = false
                state.items.push(action.payload)
            })
            .addCase(uploadMedia.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message || "Upload failed"
            })
    },
})

export default mediaSlice.reducer