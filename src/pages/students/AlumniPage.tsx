"use client"

import { useEffect, useState } from "react"
import { Card, Table, Tag, Input, Select, Space, Button } from "antd"
import { SearchOutlined, ExportOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchAlumni } from "@/store/slices/studentSlice"

const AlumniPage = () => {
  const dispatch = useAppDispatch()
  const { alumni } = useAppSelector((state) => state.students)
  const [filters, setFilters] = useState({ search: "", year: "" })

  useEffect(() => {
    dispatch(fetchAlumni({ page: 1, limit: 10 }) as any)
  }, [dispatch])

  const columns = [
    { title: "Name", dataIndex: "name", key: "name", ellipsis: true },
    { title: "Program", dataIndex: "program", key: "program", render: (program: string) => <Tag color="blue">{program}</Tag> },
    { title: "Graduation Year", dataIndex: "graduationYear", key: "year" },
    { title: "Current Position", dataIndex: "currentPosition", key: "position", ellipsis: true },
    { title: "Company/Organization", dataIndex: "organization", key: "organization" },
    { title: "Status", dataIndex: "status", key: "status", render: (status: string) => <Tag color={status === "verified" ? "success" : "default"}>{status}</Tag> },
  ]

  const mockData = [
    { id: 1, name: "Abebe Kebede", program: "Computer Science", graduationYear: 2023, currentPosition: "Software Engineer", organization: "Google", status: "verified" },
    { id: 2, name: "Chaltu Gemechu", program: "Electrical Engineering", graduationYear: 2022, currentPosition: "Hardware Engineer", organization: "Intel", status: "verified" },
    { id: 3, name: "Dawit Tesfaye", program: "Information Technology", graduationYear: 2023, currentPosition: "Data Scientist", organization: "Amazon", status: "pending" },
  ]

  return (
    <div className="space-y-4">
      <Card
        title="Alumni Directory"
        extra={
          <Space>
            <Input placeholder="Search alumni..." prefix={<SearchOutlined />} style={{ width: 200 }} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
            <Select placeholder="Graduation Year" style={{ width: 150 }} onChange={(value) => setFilters({ ...filters, year: String(value) })} allowClear>
              <Select.Option value="2023">2023</Select.Option>
              <Select.Option value="2022">2022</Select.Option>
              <Select.Option value="2021">2021</Select.Option>
            </Select>
            <Button icon={<ExportOutlined />}>Export</Button>
          </Space>
        }
      >
        <Table columns={columns as any} dataSource={Array.isArray(mockData) ? mockData : []} loading={!!alumni.loading} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  )
}

export default AlumniPage
