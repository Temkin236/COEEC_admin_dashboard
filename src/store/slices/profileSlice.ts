import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import axiosInstance from "@/utils/axios"

interface ProfileState {
  data: {
    id?: string
    displayName?: string
    title?: string
    departmentId?: string
    role?: string
    email?: string
    phone?: string
    officeLocation?: string
    photoUrl?: string
    cvUrl?: string
    researchAreas?: string[]
    biography?: any
    photoId?: string
    cvId?: string
    socialLinks?: any[]
    links?: any[]
    experiences?: any[]
    experience?: any[]
    education?: any[]
  } | null
  loading: boolean
  error: string | null
}

const initialState: ProfileState = {
  data: null,
  loading: false,
  error: null,
}

export const saveProfile = createAsyncThunk<any, any, { rejectValue: string }>(
  "profile/save",
  async (payload, { rejectWithValue }) => {
    try {
      // If the backend expects PUT when updating an existing profile, adapt accordingly.
      const response = await axiosInstance.put("/profile", payload)
      return response.data
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to save profile")
    }
  },
)

export const fetchProfile = createAsyncThunk<any, string, { rejectValue: string }>(
  "profile/fetch",
  async (url, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(url)
      return response.data
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to fetch profile")
    }
  },
)

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<any>) => {
      state.data = action.payload
    },
    clearProfileError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(saveProfile.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(saveProfile.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) ?? "Save failed"
      })
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProfile.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) ?? "Fetch failed"
      })
  },
})

export const { setProfile, clearProfileError } = profileSlice.actions
export default profileSlice.reducer
