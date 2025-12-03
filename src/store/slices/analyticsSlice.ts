import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "@/utils/axios"

type DepartmentStat = { name: string; staff: number; students: number; research: number }
type RecentActivity = { id: number; action: string; type: string; user: string; timestamp: string }
type ContentStatus = { name: string; value: number }
type VisitorPoint = { date: string; visitors: number }

export type DashboardStats = {
  stats: {
    totalStaff: number
    staffGrowth: number
    totalResearch: number
    totalStudents: number
    pendingApprovals: number
    departmentStats: DepartmentStat[]
  }
  recentActivity: RecentActivity[]
  contentByStatus: ContentStatus[]
  visitorTrend: VisitorPoint[]
}

export type VisitorStats = Array<{ date: string; visitors: number }>

const demoDashboard = (): DashboardStats => {
  const now = new Date()
  const day = (i: number) => {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    return d.toISOString().slice(0, 10)
  }
  return {
    stats: {
      totalStaff: 64,
      staffGrowth: 8,
      totalResearch: 23,
      totalStudents: 1240,
      pendingApprovals: 5,
      departmentStats: [
        { name: "CSE", staff: 22, students: 520, research: 9 },
        { name: "EEE", staff: 18, students: 410, research: 7 },
        { name: "IT", staff: 24, students: 310, research: 7 },
      ],
    },
    recentActivity: [
      { id: 1, action: "Created", type: "News", user: "Admin", timestamp: new Date().toISOString() },
      { id: 2, action: "Updated", type: "Staff", user: "Editor", timestamp: new Date(Date.now() - 3600e3).toISOString() },
      { id: 3, action: "Approved", type: "Research", user: "Admin", timestamp: new Date(Date.now() - 7200e3).toISOString() },
    ],
    contentByStatus: [
      { name: "Draft", value: 12 },
      { name: "Pending", value: 7 },
      { name: "Published", value: 32 },
      { name: "Archived", value: 4 },
    ],
    visitorTrend: [
      { date: day(6), visitors: 120 },
      { date: day(5), visitors: 150 },
      { date: day(4), visitors: 180 },
      { date: day(3), visitors: 160 },
      { date: day(2), visitors: 210 },
      { date: day(1), visitors: 240 },
      { date: day(0), visitors: 260 },
    ],
  }
}

export const fetchDashboardStats = createAsyncThunk<DashboardStats, void, { rejectValue: string }>(
  "analytics/fetchDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<DashboardStats>("/analytics/dashboard")
      return response.data
    } catch (err: any) {
      // On failure, reject the promise. The reducer will handle the fallback.
      console.error("Failed to fetch dashboard stats, using demo data as fallback.", err)
      return rejectWithValue(err.response?.data?.message || "Failed to fetch dashboard stats")
    }
  }
)

export const fetchVisitorStats = createAsyncThunk<VisitorStats, { startDate: string; endDate: string }, { rejectValue: string }>(
  "analytics/fetchVisitorStats",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<VisitorStats>(
        `/analytics/visitors?startDate=${startDate}&endDate=${endDate}`
      )
      return response.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch visitor stats")
    }
  }
)

type AnalyticsState = {
  dashboardStats: DashboardStats | null
  visitorStats: VisitorStats | null
  loading: boolean
  error: string | null | unknown
}

const initialState: AnalyticsState = {
  dashboardStats: null,
  visitorStats: null,
  loading: false,
  error: null,
}

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false
        state.dashboardStats = action.payload
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        // Fallback to demo data on API failure
        state.dashboardStats = demoDashboard()
      })
      .addCase(fetchVisitorStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVisitorStats.fulfilled, (state, action) => {
        state.loading = false
        state.visitorStats = action.payload
      })
      .addCase(fetchVisitorStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export default analyticsSlice.reducer
