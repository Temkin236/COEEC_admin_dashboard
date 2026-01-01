export type DepartmentStat = { name: string; staff: number; students: number; research: number }
export type RecentActivity = { id: number; action: string; type: string; user: string; timestamp: string }
export type ContentStatus = { name: string; value: number }
export type VisitorPoint = { date: string; visitors: number }

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
