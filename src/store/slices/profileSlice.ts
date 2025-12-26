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
  experiencesLoading?: boolean
  experiencesError?: string | null
  educationLoading?: boolean
  educationError?: string | null
}

const initialState: ProfileState = {
  data: null,
  loading: false,
  error: null,
  experiencesLoading: false,
  experiencesError: null,
  educationLoading: false,
  educationError: null,
}

export type UpdateProfilePayload = { id: string; data: any }

export const UpdateProfile = createAsyncThunk<any, UpdateProfilePayload, { rejectValue: string }>(
  "profile/save",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      // If the backend expects PUT when updating an existing profile, adapt accordingly.
      const response = await axiosInstance.put(`/staff/${id}`, data)
      return response.data
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to save profile")
    }
  },
)

export const createProfile = createAsyncThunk<any, { userId: string; data: any }, { rejectValue: string }>(
  "profile/create",
  async ({ userId, data }, { rejectWithValue }) => {
    try {
      // Include userId in the payload as required by the API
      const payload = { userId, ...data }
      const response = await axiosInstance.post(`/staff`, payload)
      return response.data
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to create profile")
    }
  },
)

export const fetchProfile = createAsyncThunk<any, string, { rejectValue: string }>(
  "profile/fetch",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/staff/${id}`)
      return response.data
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to fetch profile")
    }
  },
)

export const fetchExperiences = createAsyncThunk<any[], string, { rejectValue: string }>(
  "profile/fetchExperiences",
  async (staffId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/profiles/experiences/staff/${staffId}/experiences`)
      return response.data
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to fetch experiences")
    }
  },
)

export const addExperience = createAsyncThunk<any, { staffId: string; data: any }, { rejectValue: string }>(
  "profile/addExperience",
  async ({ staffId, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/profiles/experiences/staff/${staffId}/experiences`, data)
      return response.data
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to add experience")
    }
  },
)

export const updateExperience = createAsyncThunk<any, { id: string; data: any }, { rejectValue: string }>(
  "profile/updateExperience",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/profiles/experiences/experiences/${id}`, data)
      return response.data
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to update experience")
    }
  },
)

export const deleteExperience = createAsyncThunk<string, string, { rejectValue: string }>(
  "profile/deleteExperience",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/profiles/experiences/experiences/${id}`)
      return id
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to delete experience")
    }
  },
)

export const getMyEducation = createAsyncThunk<any[], void, { rejectValue: string }>(
  "profile/getMyEducation",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/profiles/education/me`)
      return response.data
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to fetch my education")
    }
  },
)

export const fetchEducationByStaff = createAsyncThunk<any[], string, { rejectValue: string }>(
  "profile/fetchEducationByStaff",
  async (staffId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/profiles/education/${staffId}`)
      return response.data
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to fetch education")
    }
  },
)

export const updateEducation = createAsyncThunk<any, { staffId: string; data: any }, { rejectValue: string }>(
  "profile/updateEducation",
  async ({ staffId, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/profiles/education/${staffId}`, data)
      return response.data
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to update education")
    }
  },
)

export const deleteEducation = createAsyncThunk<string, string, { rejectValue: string }>(
  "profile/deleteEducation",
  async (staffId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/profiles/education/${staffId}`)
      return staffId
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to delete education")
    }
  },
)

export const addEducation = createAsyncThunk<any, { staffId: string; data: any }, { rejectValue: string }>(
  "profile/addEducation",
  async ({ staffId, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/profiles/education`, data)
      return response.data
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to add education")
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
      .addCase(UpdateProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(UpdateProfile.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(UpdateProfile.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) ?? "Save failed"
      })
      .addCase(createProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createProfile.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(createProfile.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) ?? "Create profile failed"
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
      .addCase(fetchExperiences.pending, (state) => {
        state.experiencesLoading = true
        state.experiencesError = null
      })
      .addCase(fetchExperiences.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.experiencesLoading = false
        ;(state.data as any) = (state.data as any) || {}
        ;(state.data as any).experiences = action.payload
      })
      .addCase(fetchExperiences.rejected, (state, action) => {
        state.experiencesLoading = false
        state.experiencesError = (action.payload as string) ?? "Fetch experiences failed"
      })
      .addCase(addExperience.pending, (state) => {
        state.experiencesLoading = true
        state.experiencesError = null
      })
      .addCase(addExperience.fulfilled, (state, action: PayloadAction<any>) => {
        state.experiencesLoading = false
        ;(state.data as any) = (state.data as any) || {}
        ;(state.data as any).experiences = ((state.data as any).experiences || []).concat(action.payload)
      })
      .addCase(addExperience.rejected, (state, action) => {
        state.experiencesLoading = false
        state.experiencesError = (action.payload as string) ?? "Add experience failed"
      })
      .addCase(updateExperience.pending, (state) => {
        state.experiencesLoading = true
        state.experiencesError = null
      })
      .addCase(updateExperience.fulfilled, (state, action: PayloadAction<any>) => {
        state.experiencesLoading = false
        const updated = action.payload
        const list = (state.data as any)?.experiences || []
        ;(state.data as any).experiences = list.map((it: any) => (it.id === updated.id || it._id === updated._id ? updated : it))
      })
      .addCase(updateExperience.rejected, (state, action) => {
        state.experiencesLoading = false
        state.experiencesError = (action.payload as string) ?? "Update experience failed"
      })
      .addCase(deleteExperience.pending, (state) => {
        state.experiencesLoading = true
        state.experiencesError = null
      })
      .addCase(deleteExperience.fulfilled, (state, action: PayloadAction<string>) => {
        state.experiencesLoading = false
        const id = action.payload
        ;(state.data as any).experiences = ((state.data as any).experiences || []).filter((it: any) => it.id !== id && it._id !== id)
      })
      .addCase(deleteExperience.rejected, (state, action) => {
        state.experiencesLoading = false
        state.experiencesError = (action.payload as string) ?? "Delete experience failed"
      })
      .addCase(getMyEducation.pending, (state) => {
        state.educationLoading = true
        state.educationError = null
      })
      .addCase(getMyEducation.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.educationLoading = false
        ;(state.data as any) = (state.data as any) || {}
        ;(state.data as any).education = action.payload
      })
      .addCase(getMyEducation.rejected, (state, action) => {
        state.educationLoading = false
        state.educationError = (action.payload as string) ?? "Fetch my education failed"
      })
      .addCase(fetchEducationByStaff.pending, (state) => {
        state.educationLoading = true
        state.educationError = null
      })
      .addCase(fetchEducationByStaff.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.educationLoading = false
        ;(state.data as any) = (state.data as any) || {}
        ;(state.data as any).education = action.payload
      })
      .addCase(fetchEducationByStaff.rejected, (state, action) => {
        state.educationLoading = false
        state.educationError = (action.payload as string) ?? "Fetch education failed"
      })
      .addCase(updateEducation.pending, (state) => {
        state.educationLoading = true
        state.educationError = null
      })
      .addCase(updateEducation.fulfilled, (state, action: PayloadAction<any>) => {
        state.educationLoading = false
        const updated = action.payload
        ;(state.data as any) = (state.data as any) || {}
        const list = (state.data as any).education || []
        ;(state.data as any).education = list.map((it: any) => (it.id === updated.id || it._id === updated._id ? updated : it))
      })
      .addCase(updateEducation.rejected, (state, action) => {
        state.educationLoading = false
        state.educationError = (action.payload as string) ?? "Update education failed"
      })
      .addCase(deleteEducation.pending, (state) => {
        state.educationLoading = true
        state.educationError = null
      })
      .addCase(deleteEducation.fulfilled, (state, action: PayloadAction<string>) => {
        state.educationLoading = false
        const id = action.payload
        ;(state.data as any).education = ((state.data as any).education || []).filter((it: any) => it.id !== id && it._id !== id)
      })
      .addCase(deleteEducation.rejected, (state, action) => {
        state.educationLoading = false
        state.educationError = (action.payload as string) ?? "Delete education failed"
      })
  },
})

export const { setProfile, clearProfileError } = profileSlice.actions
export default profileSlice.reducer
