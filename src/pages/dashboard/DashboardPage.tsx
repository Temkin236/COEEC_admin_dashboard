"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Row, Col, Card, Statistic, Tag, Typography, Spin } from "antd"
import DataTable from "@/components/common/DataTable"
import { UserOutlined, TeamOutlined, ExperimentOutlined, FileTextOutlined, ArrowUpOutlined } from "@ant-design/icons"
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
import { formatRelativeTime } from "@/utils/helpers"

const { Title, Text } = Typography

const COLORS = ["#163b6b", "#1a73e8", "#ff5722", "#ff7849"]

const DashboardPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { dashboardStats, loading } = useAppSelector((state) => state.analytics)
  const { user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    dispatch(fetchDashboardStats() as any)
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
  const recentActivity: any[] = ds.recentActivity || []
  const contentByStatus: any[] = ds.contentByStatus || []
  const visitorTrend: any[] = ds.visitorTrend || []

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
              value={stats.totalStaff}
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
              value={stats.totalResearch}
              prefix={<ExperimentOutlined />}
              styles={{ content: { color: "#1a73e8" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Students"
              value={stats.totalStudents}
              prefix={<UserOutlined />}
              styles={{ content: { color: "#ff5722" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Approvals"
              value={stats.pendingApprovals}
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
              <LineChart data={visitorTrend}>
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
                  data={contentByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {contentByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
              <BarChart data={stats.departmentStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="staff" fill="#163b6b" />
                <Bar dataKey="students" fill="#1a73e8" />
                <Bar dataKey="research" fill="#ff5722" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      {/* Recent Activity with horizontal scroll on mobile */}
      <Card title="Recent Activity" variant="outlined">
        <div className="overflow-x-auto">
          <DataTable
            columns={recentColumns as any}
            dataSource={recentActivity}
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
