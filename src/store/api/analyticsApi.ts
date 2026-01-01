import { api } from './baseApi'
import { DashboardStats, VisitorStats } from '@/types/analytics.types'

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

export const analyticsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getDashboardStats: builder.query<DashboardStats, void>({
            async queryFn(args, _queryApi, _extraOptions, fetchWithBQ) {
                const result = await fetchWithBQ("/analytics/dashboard")

                if (result.error) {
                    console.error("Failed to fetch dashboard stats, using demo data as fallback.")
                    return { data: demoDashboard() }
                }

                return { data: result.data as DashboardStats }
            },
        }),
        getVisitorStats: builder.query<VisitorStats, { startDate: string; endDate: string }>({
            query: ({ startDate, endDate }) => `/analytics/visitors?startDate=${startDate}&endDate=${endDate}`,
        }),
    }),
})

export const { useGetDashboardStatsQuery, useGetVisitorStatsQuery } = analyticsApi
