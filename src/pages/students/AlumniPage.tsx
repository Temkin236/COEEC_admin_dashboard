"use client"

import { useEffect, useState } from "react"
import { Card, Tag, Input, Select, Space, Button } from "antd"
import DataTable from "@/components/common/DataTable"
import { usePermissions } from "@/hooks/usePermissions"
import TableActions from "@/components/common/TableActions"
import { SearchOutlined, ExportOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchAlumni } from "@/store/slices/studentSlice"

const AlumniPage = () => {
  const dispatch = useAppDispatch()
  const { alumni } = useAppSelector((state) => state.students)
  const [filters, setFilters] = useState({ search: "", year: "" })

  useEffect(() => {
    dispatch((fetchAlumni as any)({ page: 1, limit: 10 }))
  }, [dispatch])

  const { canView, canCreate, canUpdate, canDelete } = usePermissions()
  const hasAlumniView = canView("alumni")
  const hasAlumniCreate = canCreate("alumni")
  const hasAlumniUpdate = canUpdate("alumni")
  const hasAlumniDelete = canDelete("alumni")

  const hasAnyAction = hasAlumniView || hasAlumniUpdate || hasAlumniDelete

  const columns = [
    { title: "Name", dataIndex: "name", key: "name", ellipsis: true },
    { title: "Program", dataIndex: "program", key: "program", render: (program: string) => <Tag color="blue">{program}</Tag> },
    { title: "Graduation Year", dataIndex: "graduationYear", key: "year" },
    { title: "Current Position", dataIndex: "currentPosition", key: "position", ellipsis: true },
    { title: "Company/Organization", dataIndex: "organization", key: "organization" },
    { title: "Status", dataIndex: "status", key: "status", render: (status: string) => <Tag color={status === "verified" ? "success" : "default"}>{status}</Tag> },
    ...(hasAnyAction ? [{
      title: "Actions",
      key: "actions",
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <TableActions resource="alumni" onView={() => {}} record={record} />
      ),
    }] : []),
  ]

  const mockData = [
    { id: 1, name: "Abebe Kebede", program: "Computer Science", graduationYear: 2023, currentPosition: "Software Engineer", organization: "Google", status: "verified" },
    { id: 2, name: "Chaltu Gemechu", program: "Electrical Engineering", graduationYear: 2022, currentPosition: "Hardware Engineer", organization: "Intel", status: "verified" },
    { id: 3, name: "Dawit Tesfaye", program: "Information Technology", graduationYear: 2023, currentPosition: "Data Scientist", organization: "Amazon", status: "pending" },
  ]

  return (
    <div className="space-y-4 p-2 md:p-4">
      <Card
        title="Alumni Directory"
        extra={
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <div className="w-full sm:w-auto">
              <Input
                placeholder="Search alumni..."
                prefix={<SearchOutlined />}
                className="w-full sm:w-52"
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div className="w-full sm:w-auto">
              <Select
                placeholder="Graduation Year"
                className="w-full sm:w-40"
                onChange={(value) => setFilters({ ...filters, year: String(value) })}
                allowClear
              >
                <Select.Option value="2023">2023</Select.Option>
                <Select.Option value="2022">2022</Select.Option>
                <Select.Option value="2021">2021</Select.Option>
              </Select>
            </div>
            <Button className="w-full sm:w-auto" icon={<ExportOutlined />}>Export</Button>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <DataTable
            columns={columns as any}
            dataSource={Array.isArray(mockData) ? mockData : []}
            loading={!!alumni.loading}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </div>
      </Card>
    </div>
  )
}

export default AlumniPage
