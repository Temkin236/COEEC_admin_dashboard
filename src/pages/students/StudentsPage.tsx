"use client"

import { useEffect } from "react"
import { Card, Table, Tag, Statistic, Row, Col } from "antd"
import { UserOutlined, TeamOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchStudents } from "@/store/slices/studentSlice"

const StudentsPage = () => {
  const dispatch = useAppDispatch()
  const { students } = useAppSelector((state) => state.students)

  useEffect(() => {
    dispatch(fetchStudents({ page: 1, limit: 10 }) as any)
  }, [dispatch])

  const columns = [
    { title: "Program", dataIndex: "program", key: "program", render: (program: string) => <Tag color="blue">{program}</Tag> },
    { title: "Level", dataIndex: "level", key: "level" },
    { title: "Total Students", dataIndex: "count", key: "count", render: (count: number) => <span className="font-medium">{count}</span> },
    { title: "Male", dataIndex: "male", key: "male" },
    { title: "Female", dataIndex: "female", key: "female" },
  ]

  const mockData = [
    { id: 1, program: "Computer Science", level: "BSc", count: 450, male: 320, female: 130 },
    { id: 2, program: "Computer Science", level: "MSc", count: 45, male: 30, female: 15 },
    { id: 3, program: "Computer Science", level: "PhD", count: 12, male: 8, female: 4 },
    { id: 4, program: "Electrical Engineering", level: "BSc", count: 380, male: 290, female: 90 },
    { id: 5, program: "Electrical Engineering", level: "MSc", count: 35, male: 25, female: 10 },
    { id: 6, program: "Information Technology", level: "BSc", count: 320, male: 200, female: 120 },
  ]

  return (
    <div className="space-y-4">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Total Students" value={1242} prefix={<UserOutlined />} styles={{ content: { color: "#163b6b" } }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Undergraduate" value={1150} prefix={<TeamOutlined />} styles={{ content: { color: "#1a73e8" } }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Graduate" value={80} prefix={<TeamOutlined />} styles={{ content: { color: "#ff5722" } }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="PhD Students" value={12} prefix={<TeamOutlined />} styles={{ content: { color: "#ff7849" } }} />
          </Card>
        </Col>
      </Row>

      <Card title="Students by Program">
        <Table columns={columns as any} dataSource={Array.isArray(mockData) ? mockData : []} loading={!!students.loading} rowKey="id" pagination={false} />
      </Card>
    </div>
  )
}

export default StudentsPage
