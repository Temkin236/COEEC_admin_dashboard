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

export type StudentLife = {
  id: string
  heading: string
  description: string | null
  statClubs: string | null
  statInternships: string | null
  statAlumni: string | null
  clubsHeading: string | null
  clubsDescription: string | null
  careerHeading: string | null
  careerDescription: string | null
  updatedAt: string
}

export type Club = {
  id: string
  name: string
  description: string
  websiteUrl: string
  images: string[]
  order: number
}

export type Career = {
  id: string
  title: string
  description: string
  link: string
  order: number
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

// Student Life async thunks
export const fetchStudentLife = createAsyncThunk<StudentLife, void>(
  "students/fetchStudentLife",
  async () => {
    const response = await axiosInstance.get("/student-life")
    return response.data
  }
)

export const updateStudentLife = createAsyncThunk<StudentLife, Partial<StudentLife>>(
  "students/updateStudentLife",
  async (data) => {
    const response = await axiosInstance.put("/student-life", data)
    return response.data
  }
)

export const fetchClubs = createAsyncThunk<Club[], void>(
  "students/fetchClubs",
  async () => {
    const response = await axiosInstance.get("/student-life/clubs")
    return response.data
  }
)

export const createClub = createAsyncThunk<Club, Partial<Club>>(
  "students/createClub",
  async (data) => {
    const response = await axiosInstance.post("/student-life/clubs", data)
    return response.data
  }
)

export const updateClub = createAsyncThunk<Club, { id: string; data: Partial<Club> }>(
  "students/updateClub",
  async ({ id, data }) => {
    const response = await axiosInstance.put(`/student-life/clubs/${id}`, data)
    return response.data
  }
)

export const deleteClub = createAsyncThunk<string, string>(
  "students/deleteClub",
  async (id) => {
    await axiosInstance.delete(`/student-life/clubs/${id}`)
    return id
  }
)

export const fetchCareers = createAsyncThunk<Career[], void>(
  "students/fetchCareers",
  async () => {
    const response = await axiosInstance.get("/student-life/career")
    return response.data
  }
)

export const createCareer = createAsyncThunk<Career, Partial<Career>>(
  "students/createCareer",
  async (data) => {
    const response = await axiosInstance.post("/student-life/career", data)
    return response.data
  }
)

export const updateCareer = createAsyncThunk<Career, { id: string; data: Partial<Career> }>(
  "students/updateCareer",
  async ({ id, data }) => {
    const response = await axiosInstance.put(`/student-life/career/${id}`, data)
    return response.data
  }
)

export const deleteCareer = createAsyncThunk<string, string>(
  "students/deleteCareer",
  async (id) => {
    await axiosInstance.delete(`/student-life/career/${id}`)
    return id
  }
)

type StudentState = {
  students: Paginated<StudentItem> & { loading: boolean }
  alumni: Paginated<AlumniItem> & { loading: boolean }
  studentLife: {
    data: StudentLife | null
    loading: boolean
  }
  clubs: {
    data: Club[]
    loading: boolean
  }
  careers: {
    data: Career[]
    loading: boolean
  }
}

const initialState: StudentState = {
  students: { items: [], total: 0, loading: false },
  alumni: { items: [], total: 0, loading: false },
  studentLife: { data: null, loading: false },
  clubs: { data: [], loading: false },
  careers: { data: [], loading: false },
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
      // Student Life
      .addCase(fetchStudentLife.pending, (state) => {
        state.studentLife.loading = true
      })
      .addCase(fetchStudentLife.fulfilled, (state, action) => {
        state.studentLife.loading = false
        state.studentLife.data = action.payload
      })
      .addCase(updateStudentLife.fulfilled, (state, action) => {
        state.studentLife.data = action.payload
      })
      // Clubs
      .addCase(fetchClubs.pending, (state) => {
        state.clubs.loading = true
      })
      .addCase(fetchClubs.fulfilled, (state, action) => {
        state.clubs.loading = false
        state.clubs.data = action.payload
      })
      .addCase(createClub.fulfilled, (state, action) => {
        state.clubs.data.push(action.payload)
      })
      .addCase(updateClub.fulfilled, (state, action) => {
        const index = state.clubs.data.findIndex((club) => club.id === action.payload.id)
        if (index !== -1) {
          state.clubs.data[index] = action.payload
        }
      })
      .addCase(deleteClub.fulfilled, (state, action) => {
        state.clubs.data = state.clubs.data.filter((club) => club.id !== action.payload)
      })
      // Careers
      .addCase(fetchCareers.pending, (state) => {
        state.careers.loading = true
      })
      .addCase(fetchCareers.fulfilled, (state, action) => {
        state.careers.loading = false
        state.careers.data = action.payload
      })
      .addCase(createCareer.fulfilled, (state, action) => {
        state.careers.data.push(action.payload)
      })
      .addCase(updateCareer.fulfilled, (state, action) => {
        const index = state.careers.data.findIndex((career) => career.id === action.payload.id)
        if (index !== -1) {
          state.careers.data[index] = action.payload
        }
      })
      .addCase(deleteCareer.fulfilled, (state, action) => {
        state.careers.data = state.careers.data.filter((career) => career.id !== action.payload)
      })
  },
})

export default studentSlice.reducer
