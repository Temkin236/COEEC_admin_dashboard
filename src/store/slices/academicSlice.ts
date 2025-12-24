import axiosInstance from "@/utils/axios"
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
type Course = {
  id: number
  code: string
  name: string
  credits: number
  department?: string
  [key: string]: any
}
type AcademicState = {
  coursesByProgram: Record<string, Course[]>
  currentCourse: Course | null
  loading: boolean
  error: string | null
}
const initialState: AcademicState = {
  coursesByProgram: {},
  currentCourse: null,
  loading: false,
  error: null,
}
// No client-side admin guard here; rely on server authorization.
export const fetchCoursesByProgram = createAsyncThunk(
  "academic/fetchCoursesByProgram",
  async (programId: string | number, { rejectWithValue }) => {
    try {
      // Add state parameter to get all courses (DRAFT and PUBLISHED)
      const res = await axiosInstance.get(`/courses/programs/${programId}/courses?all=true`)
      return { programId: String(programId), courses: res.data }
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err.message)
    }
  },
)
export const fetchCourseById = createAsyncThunk(
  "academic/fetchCourseById",
  async (id: string | number, { rejectWithValue }) => {
    try {
  const res = await axiosInstance.get(`/courses/${id}`)
      return res.data as Course
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err.message)
    }
  },
)
export const createCourse = createAsyncThunk(
  "academic/createCourse",
  async (
    { programId, payload }: { programId: string | number; payload: Partial<Course> },
    { rejectWithValue, getState },
  ) => {
    try {
      const res = await axiosInstance.post(`/courses/programs/${programId}/courses`, payload)
      return { programId: String(programId), course: res.data }
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err.message)
    }
  },
)
export const updateCourse = createAsyncThunk(
  "academic/updateCourse",
  async (
    { id, payload }: { id: string | number; payload: Partial<Course> },
    { rejectWithValue, getState },
  ) => {
    try {
      const res = await axiosInstance.put(`/courses/${id}`, payload)
      return res.data as Course
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err.message)
    }
  },
)
export const deleteCourse = createAsyncThunk(
  "academic/deleteCourse",
  async (id: string | number, { rejectWithValue, getState }) => {
    try {
      await axiosInstance.delete(`/courses/${id}`)
      return id
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err.message)
    }
  },
)
export const publishCourse = createAsyncThunk(
  "academic/publishCourse",
  async (id: string | number, { rejectWithValue, getState }) => {
    try {
      const res = await axiosInstance.post(`/courses/${id}/publish`)
      return res.data as Course
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err.message)
    }
  },
)
const slice = createSlice({
  name: "academic",
  initialState,
  reducers: {
    clearCurrentCourse(state) {
      state.currentCourse = null
      state.error = null
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoursesByProgram.pending, (s) => { s.loading = true; s.error = null })
      .addCase(fetchCoursesByProgram.fulfilled, (s, a: PayloadAction<{ programId: string; courses: Course[] }>) => {
        s.loading = false
        s.coursesByProgram[a.payload.programId] = a.payload.courses
      })
      .addCase(fetchCoursesByProgram.rejected, (s, a) => { s.loading = false; s.error = String(a.payload || a.error?.message) })

      .addCase(fetchCourseById.pending, (s) => { s.loading = true; s.error = null })
      .addCase(fetchCourseById.fulfilled, (s, a: PayloadAction<Course>) => { s.loading = false; s.currentCourse = a.payload })
      .addCase(fetchCourseById.rejected, (s, a) => { s.loading = false; s.error = String(a.payload || a.error?.message) })

      .addCase(createCourse.pending, (s) => { s.loading = true; s.error = null })
      .addCase(createCourse.fulfilled, (s, a: PayloadAction<{ programId: string; course: Course }>) => {
        s.loading = false
        const pid = a.payload.programId
        const list = s.coursesByProgram[pid] || []
        s.coursesByProgram[pid] = [a.payload.course, ...list]
      })
      .addCase(createCourse.rejected, (s, a) => { s.loading = false; s.error = String(a.payload || a.error?.message) })

      .addCase(updateCourse.pending, (s) => { s.loading = true; s.error = null })
      .addCase(updateCourse.fulfilled, (s, a: PayloadAction<Course>) => {
        s.loading = false
        // update wherever this course exists
        const updated = a.payload
        Object.keys(s.coursesByProgram).forEach((pid) => {
          s.coursesByProgram[pid] = s.coursesByProgram[pid].map(c => c.id === updated.id ? updated : c)
        })
        if (s.currentCourse && s.currentCourse.id === updated.id) s.currentCourse = updated
      })
      .addCase(updateCourse.rejected, (s, a) => { s.loading = false; s.error = String(a.payload || a.error?.message) })

      .addCase(deleteCourse.pending, (s) => { s.loading = true; s.error = null })
      .addCase(deleteCourse.fulfilled, (s, a: PayloadAction<string | number>) => {
        s.loading = false
        const id = Number(a.payload)
        Object.keys(s.coursesByProgram).forEach((pid) => {
          s.coursesByProgram[pid] = s.coursesByProgram[pid].filter(c => c.id !== id)
        })
        if (s.currentCourse && s.currentCourse.id === id) s.currentCourse = null
      })
      .addCase(deleteCourse.rejected, (s, a) => { s.loading = false; s.error = String(a.payload || a.error?.message) })

      .addCase(publishCourse.pending, (s) => { s.loading = true; s.error = null })
      .addCase(publishCourse.fulfilled, (s, a: PayloadAction<Course>) => {
        s.loading = false
        const updated = a.payload
        Object.keys(s.coursesByProgram).forEach((pid) => {
          s.coursesByProgram[pid] = s.coursesByProgram[pid].map(c => c.id === updated.id ? updated : c)
        })
        if (s.currentCourse && s.currentCourse.id === updated.id) s.currentCourse = updated
      })
      .addCase(publishCourse.rejected, (s, a) => { s.loading = false; s.error = String(a.payload || a.error?.message) })
  },
})
export const { clearCurrentCourse, clearError } = slice.actions
export default slice.reducer
