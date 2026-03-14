"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Row, Col, Card, Statistic, Tag, Typography, Spin } from "antd"
import DataTable from "@/components/common/DataTable"
import { TeamOutlined, ExperimentOutlined, FileTextOutlined, ArrowUpOutlined, ApartmentOutlined } from "@ant-design/icons"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchDashboardStats } from "@/store/slices/analyticsSlice"
import { fetchNews } from "@/store/slices/newsSlice"
import { fetchStaff } from "@/store/slices/staffSlice"
import { formatRelativeTime } from "@/utils/helpers"
import axiosInstance from "@/utils/axios"

const { Title, Text } = Typography

const COLORS = ["#163b6b", "#1a73e8", "#ff5722", "#ff7849"]

const DashboardPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { dashboardStats, loading } = useAppSelector((state) => state.analytics)
  const { items: newsItems } = useAppSelector((state) => state.news)
  const { total: staffTotal, loading: staffLoading } = useAppSelector((state) => state.staff)
  const { user } = useAppSelector((state) => state.auth)
  const [researchTotal, setResearchTotal] = useState<number>(0)
  const [researchLoading, setResearchLoading] = useState<boolean>(false)
  const [pendingApprovals, setPendingApprovals] = useState<number>(0)
  const [researchContentStatus, setResearchContentStatus] = useState<any[]>([])
  const [departmentTotal, setDepartmentTotal] = useState<number>(0)
  const [departmentLoading, setDepartmentLoading] = useState<boolean>(false)
  const [departmentStats, setDepartmentStats] = useState<any[]>([])

  useEffect(() => {
    dispatch(fetchDashboardStats() as any)
    // Fetch staff totals directly from `/staff` for an authoritative count.
    dispatch((fetchStaff as any)({ page: 1, limit: 1 }))
    // Fetch latest news for recent activity section
    dispatch(fetchNews({ page: 1, limit: 5, state: "PUBLISHED" }) as any)

    const fetchResearchStats = async () => {
      setResearchLoading(true)
      try {
        const response = await axiosInstance.get("/research-projects/stats")
        const data = response?.data
        let total = 0
        if (typeof data?.total === "number") {
          total = data.total
        } else if (Array.isArray(data?.items)) {
          total = data.items.length
        } else if (Array.isArray(data)) {
          total = data.length
        }
        setResearchTotal(total)

        if (typeof data?.pending === "number") {
          setPendingApprovals(data.pending)
        } else {
          setPendingApprovals(0)
        }

        const statusData: any[] = []
        if (typeof data?.published === "number") {
          statusData.push({ name: "Published", value: data.published })
        }
        if (typeof data?.pending === "number") {
          statusData.push({ name: "Pending", value: data.pending })
        }
        if (typeof data?.archived === "number") {
          statusData.push({ name: "Archived", value: data.archived })
        }
        setResearchContentStatus(statusData)
      } catch {
        setResearchTotal(0)
        setPendingApprovals(0)
        setResearchContentStatus([])
      } finally {
        setResearchLoading(false)
      }
    }

    const fetchDepartmentTotal = async () => {
      setDepartmentLoading(true)
      try {
        const response = await axiosInstance.get("/departments")
        const data = response?.data
        let items: any[] = []
        if (typeof data?.total === "number" && Array.isArray(data?.items)) {
          setDepartmentTotal(data.total)
          items = data.items
        } else if (Array.isArray(data?.items)) {
          setDepartmentTotal(data.items.length)
          items = data.items
        } else if (Array.isArray(data)) {
          setDepartmentTotal(data.length)
          items = data
        } else {
          setDepartmentTotal(0)
        }

        const mappedStats = items.map((dept: any) => {
          const staff =
            typeof dept.staffCount === "number" ? dept.staffCount :
            typeof dept.staff === "number" ? dept.staff :
            typeof dept.facultyCount === "number" ? dept.facultyCount :
            0

          const research =
            typeof dept.researchCount === "number" ? dept.researchCount :
            typeof dept.researchProjects === "number" ? dept.researchProjects :
            typeof dept.research === "number" ? dept.research :
            0

          const projects =
            typeof dept.projectCount === "number" ? dept.projectCount :
            typeof dept.projects === "number" ? dept.projects :
            0

          return {
            name: dept.name || dept.code || dept.slug || "Unknown",
            staff,
            research,
            projects,
          }
        })

        setDepartmentStats(mappedStats)
      } catch {
        setDepartmentTotal(0)
        setDepartmentStats([])
      } finally {
        setDepartmentLoading(false)
      }
    }

    fetchResearchStats()
    fetchDepartmentTotal()
  }, [dispatch])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    )
  }

  const DEFAULT_STATS = {
    totalStaff: 0,
    staffGrowth: 0,
    totalResearch: 0,
    totalStudents: 0,
    pendingApprovals: 0,
    departmentStats: [] as any[],
  }

  const ds: any = dashboardStats || {}
  const stats = ds.stats || DEFAULT_STATS
  const totalStaffValue = staffLoading ? stats.totalStaff : staffTotal
  const totalResearchValue = researchLoading ? stats.totalResearch : researchTotal
  const pendingApprovalsValue = researchLoading ? stats.pendingApprovals : pendingApprovals
  const totalDepartmentValue = departmentLoading ? (stats.departmentStats?.length || 0) : departmentTotal
  const recentNewsActivity: any[] = (newsItems || []).slice(0, 5).map((n: any) => {
    const title = n.title || n.translations?.find((t: any) => t.language === "EN")?.title || "Untitled news"
    const authorName = (n.author as any)?.name || n.authorName || "System"
    const time = n.publishAt || n.createdAt || n.updatedAt
    return {
      id: n.id,
      action: title,
      type: "News",
      user: authorName,
      timestamp: time,
    }
  })
  const hasNonZeroResearchStatus = researchContentStatus.some((s: any) => typeof s?.value === "number" && s.value > 0)

  const rawContentByStatus: any[] =
    researchLoading || !hasNonZeroResearchStatus
      ? ds.contentByStatus || []
      : researchContentStatus

  const normalizeStatus = (arr: any[]) => {
    const map = new Map<string, number>()
    arr.forEach((s: any) => {
      const name = String(s?.name || s?.key || s?.status || "").trim()
      const value = typeof s?.value === "number" ? s.value : typeof s?.count === "number" ? s.count : Number(s?.value || s?.count || 0) || 0
      if (!name) return
      map.set(name, (map.get(name) || 0) + value)
    })

    const labels = ["Published", "Pending", "Archived"]
    return labels.map((label) => ({ name: label, value: map.get(label) || 0 }))
  }

  const contentByStatus: any[] = normalizeStatus(rawContentByStatus)

  const contentTotal = contentByStatus.reduce((sum, item) => sum + (Number(item?.value) || 0), 0)
  const pieData = contentTotal > 0 ? contentByStatus : [{ name: "No data", value: 1 }]
  const pieColors = contentTotal > 0 ? COLORS : ["#e6e6e6"]

  const departmentMetrics = [
    { key: "staff", label: "Staff", color: "#163b6b" },
    { key: "research", label: "Research Projects", color: "#ff5722" },
    { key: "projects", label: "Projects", color: "#1a73e8" },
  ]

  const effectiveDepartmentStats =
    !departmentLoading && departmentStats.length > 0
      ? departmentStats
      : stats.departmentStats || []

  const activeDepartmentMetrics = departmentMetrics
  const visitorTrend: any[] = ds.visitorTrend || []

  const makeLastNDaysZeroFill = (arr: any[], n = 7) => {
    const today = new Date()
    const days = Array.from({ length: n }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() - (n - 1 - i))
      return d.toISOString().slice(0, 10)
    })

    return days.map((date) => {
      const found = (arr || []).find((x: any) => String(x?.date) === date)
      return { date, visitors: found ? Number(found.visitors || 0) : 0 }
    })
  }

  const filledVisitorTrend: any[] = makeLastNDaysZeroFill(visitorTrend || [], 7)

  const recentColumns = [
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: "User",
      dataIndex: "user",
      key: "user",
    },
    {
      title: "Time",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (time: string) => <Text type="secondary">{formatRelativeTime(time)}</Text>,
    },
  ]

  return (
    <div className="space-y-6 px-3 md:px-0">
      {/* Header */}
      <div>
        <Title level={2}>Dashboard</Title>
        <Text type="secondary">Welcome back, {user?.name}! Here's what's happening today.</Text>
      </div>

      {/* Stats Cards */}
      {/* Responsive stats cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Staff"
              value={totalStaffValue}
              prefix={<TeamOutlined />}
              styles={{ content: { color: "#163b6b" } }}
              suffix={
                <span className="text-xs text-green-500">
                  <ArrowUpOutlined /> {stats.staffGrowth}%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Research Projects"
              value={totalResearchValue}
              prefix={<ExperimentOutlined />}
              styles={{ content: { color: "#1a73e8" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Departments"
              value={totalDepartmentValue}
              prefix={<ApartmentOutlined />}
              styles={{ content: { color: "#ff5722" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Approvals"
              value={pendingApprovalsValue}
              prefix={<FileTextOutlined />}
              styles={{ content: { color: "#ff7849" } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      {/* Charts: ensure responsive containers and spacing */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Visitor Trend (Last 7 Days)" variant="outlined">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filledVisitorTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="visitors" stroke="#163b6b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Content by Status" variant="outlined">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => {
                    if (name === "No data") return "No data"
                    const pct = Number.isFinite(percent) ? percent : 0
                    return `${name}: ${(pct * 100).toFixed(0)}%`
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Department Stats */}
      {/* Department Stats bar chart */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title="Department Statistics" variant="outlined">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={effectiveDepartmentStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                {activeDepartmentMetrics.map((metric) => (
                  <Bar key={metric.key} dataKey={metric.key} name={metric.label} fill={metric.color} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      {/* Recent Activity is commented out for now. */}
      
      <Card title="Recent Activity" variant="outlined">
        <div className="overflow-x-auto">
          <DataTable
            columns={recentColumns as any}
            dataSource={recentNewsActivity}
            pagination={{ pageSize: 5 }}
            rowKey="id"
          />
        </div>
      </Card>
     

      {/* Quick Actions */}
      {/* Quick Actions grid */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            className="text-center cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate("/content/about")}
          >
            <FileTextOutlined className="text-4xl text-primary-500 mb-2" />
            <Title level={4}>Create News</Title>
            <Text type="secondary">Add new announcement</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            className="text-center cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate("/staff/new")}
          >
            <TeamOutlined className="text-4xl text-primary-500 mb-2" />
            <Title level={4}>Add Staff</Title>
            <Text type="secondary">Register new faculty</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            className="text-center cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate("/research")}
          >
            <ExperimentOutlined className="text-4xl text-primary-500 mb-2" />
            <Title level={4}>New Research</Title>
            <Text type="secondary">Add research project</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            className="text-center cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate("/approval")}
          >
            <FileTextOutlined className="text-4xl text-primary-500 mb-2" />
            <Title level={4}>Approvals</Title>
            <Text type="secondary">Review pending items</Text>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default DashboardPage
