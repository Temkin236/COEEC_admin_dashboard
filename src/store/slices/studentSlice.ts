import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "@/utils/axios"

export type StudentItem = {
  id: number
  program: string
  level: string
  count: number
  male: number
  female: number
}

export type AlumniItem = {
  id: number
  name: string
  program: string
  graduationYear: number
  currentPosition: string
  organization: string
  status: string
}

export type Paginated<T> = { items: T[]; total: number }

export const fetchStudents = createAsyncThunk<Paginated<StudentItem>, { page?: number; limit?: number }>(
  "students/fetchStudents",
  async ({ page = 1, limit = 10 }) => {
    try {
      const response = await axiosInstance.get<Paginated<StudentItem>>(`/students?page=${page}&limit=${limit}`)
      return response.data
    } catch (e) {
      const items: StudentItem[] = [
        { id: 1, program: "Computer Science", level: "BSc", count: 450, male: 320, female: 130 },
        { id: 2, program: "Computer Science", level: "MSc", count: 45, male: 30, female: 15 },
      ]
      return { items, total: items.length }
    }
  }
)

export const fetchAlumni = createAsyncThunk<Paginated<AlumniItem>, { page?: number; limit?: number }>(
  "students/fetchAlumni",
  async ({ page = 1, limit = 10 }) => {
    try {
      const response = await axiosInstance.get<Paginated<AlumniItem>>(
        `/students/alumni?page=${page}&limit=${limit}`
      )
      return response.data
    } catch (e) {
      const items: AlumniItem[] = [
        {
          id: 1,
          name: "Abebe Kebede",
          program: "Computer Science",
          graduationYear: 2023,
          currentPosition: "Software Engineer",
          organization: "Google",
          status: "verified",
        },
        {
          id: 2,
          name: "Chaltu Gemechu",
          program: "Electrical Engineering",
          graduationYear: 2022,
          currentPosition: "Hardware Engineer",
          organization: "Intel",
          status: "verified",
        },
      ]
      return { items, total: items.length }
    }
  }
)

type StudentState = {
  students: Paginated<StudentItem> & { loading: boolean }
  alumni: Paginated<AlumniItem> & { loading: boolean }
}

const initialState: StudentState = {
  students: { items: [], total: 0, loading: false },
  alumni: { items: [], total: 0, loading: false },
}

const studentSlice = createSlice({
  name: "students",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.students.loading = true
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.students.loading = false
        state.students.items = action.payload.items
        state.students.total = action.payload.total
      })
      .addCase(fetchAlumni.pending, (state) => {
        state.alumni.loading = true
      })
      .addCase(fetchAlumni.fulfilled, (state, action) => {
        state.alumni.loading = false
        state.alumni.items = action.payload.items
        state.alumni.total = action.payload.total
      })
  },
})

export default studentSlice.reducer
