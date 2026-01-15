import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import { profileApi, experienceApi, educationApi, connectionsApi } from "@/api/profileApi"

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
    photo?: string
    cv?: string
    researchAreas?: string[]
    biography?: any
    socialLinks?: any[]
    links?: any[]
    experiences?: any[]
    experience?: any[]
    education?: any[]
    connections?: any[]
  } | null
  loading: boolean
  error: string | null
  experiencesLoading?: boolean
  experiencesError?: string | null
  lastAddedExperience?: any | null
  educationLoading?: boolean
  educationError?: string | null
  connectionsLoading?: boolean
}

const initialState: ProfileState = {
  data: null,
  loading: false,
  error: null,
  experiencesLoading: false,
  experiencesError: null,
  lastAddedExperience: null,
  educationLoading: false,
  educationError: null,
}

export type UpdateProfilePayload = { id: string; data: any }

export const updateProfile = createAsyncThunk<any, UpdateProfilePayload, { rejectValue: string }>(
  "profile/save",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await profileApi.updateProfile({ id, ...data })
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to save profile")
    }
  },
)

export const createProfile = createAsyncThunk<any, { userId: string; data: any }, { rejectValue: string }>(
  "profile/create",
  async ({ userId, data }, { rejectWithValue }) => {
    try {
      return await profileApi.createProfile({ userId, ...data })
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to create profile")
    }
  },
)

export const fetchProfile = createAsyncThunk<any, string, { rejectValue: string }>(
  "profile/fetch",
  async (id, { rejectWithValue }) => {
    try {
      return await profileApi.fetchProfile(id)
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to fetch profile")
    }
  },
)

export const fetchExperiences = createAsyncThunk<any[], string, { rejectValue: string }>(
  "profile/fetchExperiences",
  async (staffId, { rejectWithValue }) => {
    try {
      return await experienceApi.fetchExperiences(staffId)
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to fetch experiences")
    }
  },
)

export const addExperience = createAsyncThunk<any, { staffId: string; data: any }, { rejectValue: string }>(
  "profile/addExperience",
  async ({ staffId, data }, { rejectWithValue }) => {
    try {
      return await experienceApi.addExperience({ staffId, data })
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to add experience")
    }
  },
)

export const updateExperience = createAsyncThunk<any, { id: string; data: any }, { rejectValue: string }>(
  "profile/updateExperience",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await experienceApi.updateExperience({ id, data })
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to update experience")
    }
  },
)

export const deleteExperience = createAsyncThunk<string, string, { rejectValue: string }>(
  "profile/deleteExperience",
  async (id, { rejectWithValue }) => {
    try {
      return await experienceApi.deleteExperience(id)
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to delete experience")
    }
  },
)

export const getMyEducation = createAsyncThunk<any[], void, { rejectValue: string }>(
  "profiles/getMyEducation",
  async (_, { rejectWithValue }) => {
    try {
      return await educationApi.getMyEducation()
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to fetch my education")
    }
  },
)

export const fetchEducationByStaff = createAsyncThunk<any[], string, { rejectValue: string }>(
  "profiles/fetchEducationByStaff",
  async (staffId, { rejectWithValue }) => {
    try {
      return await educationApi.fetchEducationByStaff(staffId)
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to fetch education")
    }
  },
)

export const updateEducation = createAsyncThunk<any, { id: string; data: any }, { rejectValue: string }>(
  "profiles/updateEducation",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await educationApi.updateEducation({ id, data })
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to update education")
    }
  },
)

export const deleteEducation = createAsyncThunk<string, string, { rejectValue: string }>(
  "profiles/deleteEducation",
  async (id, { rejectWithValue }) => {
    try {
      return await educationApi.deleteEducation(id)
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to delete education")
    }
  },
)

export const addEducation = createAsyncThunk<any, { staffId?: string; data: any }, { rejectValue: string }>(
  "profiles/addEducation",
  async ({ staffId, data }, { rejectWithValue }) => {
    try {
      return await educationApi.addEducation({ staffId, data })
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to add education")
    }
  },
)

// Connections Thunks
export const getMyConnections = createAsyncThunk<any[], void, { rejectValue: string }>(
  "profiles/getMyConnections",
  async (_, { rejectWithValue }) => {
    try {
      return await connectionsApi.getMyConnections()
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to fetch connections")
    }
  },
)

export const createConnection = createAsyncThunk<any, any, { rejectValue: string }>(
  "profiles/createConnection",
  async (data, { rejectWithValue }) => {
    try {
      return await connectionsApi.createConnection(data)
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to create connection")
    }
  },
)

export const updateConnection = createAsyncThunk<any, { id: string; data: any }, { rejectValue: string }>(
  "profiles/updateConnection",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await connectionsApi.updateConnection({ id, data })
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to update connection")
    }
  },
)

export const deleteConnection = createAsyncThunk<string, string, { rejectValue: string }>(
  "profiles/deleteConnection",
  async (id, { rejectWithValue }) => {
    try {
      return await connectionsApi.deleteConnection(id)
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to delete connection")
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
      .addCase(updateProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(updateProfile.rejected, (state, action) => {
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
        try {
          if (typeof window !== 'undefined' && action.payload) {
            const id = (action.payload as any).id || (action.payload as any)._id
            if (id) {
              localStorage.setItem('staff_id', String(id))
              localStorage.setItem('staffId', String(id))
            }
          }
        } catch (e) {
          // ignore localStorage errors
        }
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
        // Ensure state.data is an object before adding experiences
        if (!state.data || typeof state.data === 'string') {
          state.data = {}
        }
        ; (state.data as any).experiences = action.payload
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
        // Ensure state.data is an object before adding experiences
        if (!state.data || typeof state.data === 'string') {
          state.data = {}
        }
        ; (state.data as any).experiences = [action.payload].concat((state.data as any).experiences || [])
        state.lastAddedExperience = action.payload
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
          ; (state.data as any).experiences = list.map((it: any) => (it.id === updated.id || it._id === updated._id ? updated : it))
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
          ; (state.data as any).experiences = ((state.data as any).experiences || []).filter((it: any) => it.id !== id && it._id !== id)
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
          ; (state.data as any) = (state.data as any) || {}
          ; (state.data as any).education = action.payload
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
          ; (state.data as any) = (state.data as any) || {}
          ; (state.data as any).education = action.payload
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
          ; (state.data as any) = (state.data as any) || {}
        const list = (state.data as any).education || []
          ; (state.data as any).education = list.map((it: any) => (it.id === updated.id || it._id === updated._id ? updated : it))
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
          ; (state.data as any).education = ((state.data as any).education || []).filter((it: any) => it.id !== id && it._id !== id)
      })
      .addCase(deleteEducation.rejected, (state, action) => {
        state.educationLoading = false
        state.educationError = (action.payload as string) ?? "Delete education failed"
      })
      // Connections extraReducers
      .addCase(getMyConnections.pending, (state) => {
        state.connectionsLoading = true
      })
      .addCase(getMyConnections.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.connectionsLoading = false
        if (state.data) {
          state.data.connections = action.payload
        }
      })
      .addCase(getMyConnections.rejected, (state) => {
        state.connectionsLoading = false
      })
      .addCase(createConnection.fulfilled, (state, action: PayloadAction<any>) => {
        if (state.data) {
          state.data.connections = [action.payload, ...(state.data.connections || [])]
        }
      })
      .addCase(updateConnection.fulfilled, (state, action: PayloadAction<any>) => {
        if (state.data && state.data.connections) {
          const index = state.data.connections.findIndex(c => c.id === action.payload.id || c._id === action.payload.id)
          if (index !== -1) {
            state.data.connections[index] = action.payload
          }
        }
      })
      .addCase(deleteConnection.fulfilled, (state, action: PayloadAction<string>) => {
        if (state.data && state.data.connections) {
          state.data.connections = state.data.connections.filter(c => c.id !== action.payload && c._id !== action.payload)
        }
      })
  },
})

export const { setProfile, clearProfileError } = profileSlice.actions
export default profileSlice.reducer
