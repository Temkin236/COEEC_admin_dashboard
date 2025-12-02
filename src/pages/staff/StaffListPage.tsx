"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, Button, Table, Space, Tag, Input, Select, Avatar, Modal, message } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined, DownloadOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchStaff, deleteStaff } from "@/store/slices/staffSlice"
import { getInitials } from "@/utils/helpers"
import { DEPARTMENTS } from "@/utils/constants"

const StaffListPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { items, total, page, limit, loading } = useAppSelector((state) => state.staff)
  const [filters, setFilters] = useState<{ search: string; department: string }>({ search: "", department: "" })

  useEffect(() => {
    dispatch(fetchStaff({ page, limit, filters }) as any)
  }, [dispatch, page, limit, filters])

  const handleDelete = async (id: string | number) => {
    Modal.confirm({
      title: "Delete Staff",
      content: "Are you sure you want to delete this staff member?",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        await dispatch(deleteStaff(id) as any)
        message.success("Staff deleted successfully")
      },
    })
  }

  const handleSearch = (value: string) => {
    setFilters({ ...filters, search: value })
  }

  const handleDepartmentFilter = (value: string) => {
    setFilters({ ...filters, department: value })
  }

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: any) => (
        <Space>
          <Avatar src={record.photo} style={{ backgroundColor: "#1e3a5f" }}>{getInitials(name)}</Avatar>
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-xs text-gray-500">{record.email}</div>
          </div>
        </Space>
      ),
    },
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Department", dataIndex: "department", key: "department", render: (dept: string) => <Tag color="blue">{dept}</Tag> },
    {
      title: "Research Areas",
      dataIndex: "researchAreas",
      key: "researchAreas",
      render: (areas: string[]) => (
        <div className="space-x-1">
          {areas?.slice(0, 2).map((area, idx) => (
            <Tag key={idx} color="green">
              {area}
            </Tag>
          ))}
          {areas?.length > 2 && <Tag>+{areas.length - 2}</Tag>}
        </div>
      ),
    },
    { title: "Status", dataIndex: "status", key: "status", render: (status: string) => <Tag color={status === "active" ? "success" : "default"}>{status}</Tag> },
    {
      title: "CV",
      key: "cv",
      width: 80,
      render: (_: any, record: any) =>
        record.cvUrl ? (
          <Button type="link" icon={<DownloadOutlined />} onClick={() => window.open(record.cvUrl, "_blank")}>View</Button>
        ) : (
          <span className="text-gray-400">No CV</span>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="text" icon={<EyeOutlined />} onClick={() => navigate(`/staff/${record.id}`)} />
          <Button type="text" icon={<EditOutlined />} onClick={() => navigate(`/staff/${record.id}`)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <Card
        title="Staff Members"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/staff/new")}>
            Add Staff
          </Button>
        }
      >
        <div className="mb-4 flex gap-4">
          <Input placeholder="Search by name or email..." prefix={<SearchOutlined />} onChange={(e) => handleSearch(e.target.value)} style={{ width: 300 }} allowClear />
          <Select placeholder="Filter by department" onChange={handleDepartmentFilter} style={{ width: 200 }} allowClear>
            {DEPARTMENTS.map((dept) => (
              <Select.Option key={dept.code} value={dept.code}>
                {dept.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        <Table
          columns={columns as any}
          dataSource={Array.isArray(items) ? items : []}
          loading={loading as any}
          rowKey="id"
          pagination={{ current: page, pageSize: limit, total, showSizeChanger: true, showTotal: (t) => `Total ${t} staff members` }}
        />
      </Card>
    </div>
  )
}

export default StaffListPage
