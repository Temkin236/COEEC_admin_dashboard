import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "@/utils/axios"

export const fetchStudents = createAsyncThunk("students/fetchStudents", async ({ page = 1, limit = 10 }) => {
  try {
    const response = await axiosInstance.get(`/students?page=${page}&limit=${limit}`)
    return response.data
  } catch (e) {
    const items = [
      { id: 1, program: "Computer Science", level: "BSc", count: 450, male: 320, female: 130 },
      { id: 2, program: "Computer Science", level: "MSc", count: 45, male: 30, female: 15 },
    ]
    return { items, total: items.length }
  }
})

export const fetchAlumni = createAsyncThunk("students/fetchAlumni", async ({ page = 1, limit = 10 }) => {
  try {
    const response = await axiosInstance.get(`/students/alumni?page=${page}&limit=${limit}`)
    return response.data
  } catch (e) {
    const items = [
      { id: 1, name: "Abebe Kebede", program: "Computer Science", graduationYear: 2023, currentPosition: "Software Engineer", organization: "Google", status: "verified" },
      { id: 2, name: "Chaltu Gemechu", program: "Electrical Engineering", graduationYear: 2022, currentPosition: "Hardware Engineer", organization: "Intel", status: "verified" },
    ]
    return { items, total: items.length }
  }
})

const studentSlice = createSlice({
  name: "students",
  initialState: {
    students: { items: [], total: 0, loading: false },
    alumni: { items: [], total: 0, loading: false },
  },
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
