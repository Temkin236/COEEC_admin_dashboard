"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, Button, Table, Space, Tag, Input, Select, Avatar, Modal, message } from "antd"
import { PlusOutlined, SearchOutlined, DownloadOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchStaff, deleteStaff, setPage, setLimit } from "@/store/slices/staffSlice"
import { getInitials } from "@/utils/helpers"
import { DEPARTMENTS } from "@/utils/constants"
import { usePermissions } from "@/hooks/usePermissions"
import TableActions from "@/components/common/TableActions"

const StaffListPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { items, total, page, limit, loading } = useAppSelector((state) => state.staff)
  const [filters, setFilters] = useState<{ search: string; department: string }>({ search: "", department: "" })
  const perms = usePermissions()
  const { canCreate, canView, canUpdate, canDelete, permissions: userPermissions } = perms

  const hasStaffView = canView("staff")
  const hasStaffCreate = canCreate("staff")
  const hasStaffUpdate = canUpdate("staff")
  const hasStaffDelete = canDelete("staff")

  // Has any action permission
  const hasAnyAction = hasStaffView || hasStaffUpdate || hasStaffDelete

  // Debugging: log permission array and derived booleans
  console.log("StaffList permissions:", { userPermissions, hasStaffView, hasStaffCreate, hasStaffUpdate, hasStaffDelete })

  useEffect(() => {
    dispatch((fetchStaff as any)({ page, limit, filters }))
  }, [dispatch, page, limit, filters])

  const handleDelete = async (id: string | number) => {
    Modal.confirm({
      title: "Delete Staff",
      content: "Are you sure you want to delete this staff member?",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        await dispatch((deleteStaff as any)(id))
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
      dataIndex: "displayName",
      key: "name",
      width: 250,
      render: (_: string, record: any) => {
        const fullName = record.displayName || 'N/A'

        // Safely compute photo source: API may return a string (base64 or url) or an object
        let photoSrc: string | null = null
        const p = record.photo
        if (typeof p === 'string') {
          if (p.startsWith && p.startsWith('data:image')) {
            photoSrc = p
          } else if (p.startsWith && (p.startsWith('http') || p.startsWith('//'))) {
            photoSrc = p
          } else {
            // assume base64 string
            photoSrc = `data:image/*;base64,${p}`
          }
        } else if (p && typeof p === 'object') {
          if (typeof p.url === 'string' && p.url) photoSrc = p.url
          else if (typeof p.path === 'string' && p.path) photoSrc = p.path
          else if (typeof p.data === 'string' && p.data) {
            photoSrc = p.data.startsWith && p.data.startsWith('data:image') ? p.data : `data:image/*;base64,${p.data}`
          }
        }

        return (
          <Space>
            {photoSrc ? (
              <Avatar src={photoSrc} style={{ backgroundColor: "#1e3a5f" }} />
            ) : (
              <Avatar style={{ backgroundColor: "#1e3a5f" }}>{getInitials(fullName)}</Avatar>
            )}
            <div>
              <div className="font-medium">{fullName}</div>
              <div className="text-xs text-gray-500">{record.email || 'No email'}</div>
            </div>
          </Space>
        )
      },
    },
    { 
      title: "Title", 
      dataIndex: "title", 
      key: "title",
      width: 150,
      ellipsis: { showTitle: true },
      render: (title: string) => title || 'N/A'
    },
    { 
      title: "Department", 
      dataIndex: "department", 
      key: "department",
      width: 200,
      render: (dept: any, record: any) => {
        if (!dept) return <Tag color="default">No Department</Tag>
        
        const deptName = dept.name || 'Unknown Department'
        const isDisabled = dept.isDisabled
        
        return (
          <div>
            <Tag color={isDisabled ? "orange" : "blue"}>{deptName}</Tag>
            {isDisabled && (
              <div className="text-xs text-orange-500 mt-1">Department Archived</div>
            )}
          </div>
        )
      }
    },
    {
      title: "Research Areas",
      dataIndex: "researchAreas",
      key: "researchAreas",
      width: 200,
      render: (areas: any) => {
        if (!areas || !Array.isArray(areas) || areas.length === 0) {
          return <span className="text-gray-400">None</span>
        }
        
        return (
          <div className="flex flex-wrap gap-1">
            {areas.slice(0, 2).map((area, idx) => (
              <Tag key={idx} color="green" size="small">
                {area}
              </Tag>
            ))}
            {areas.length > 2 && <Tag size="small">+{areas.length - 2}</Tag>}
          </div>
        )
      },
    },
    {
      title: "Office",
      dataIndex: "officeLocation",
      key: "officeLocation",
      width: 120,
      render: (office: string) => office || <span className="text-gray-400 text-xs">Not set</span>,
    },
    { 
      title: "Status", 
      dataIndex: "status", 
      key: "status",
      width: 100,
      render: (status: any, record: any) => {
        // If no status field, assume active if they have a department
        const isActive = status === 'active' || (!status && record.department && !record.department.isDisabled)
        return (
          <Tag color={isActive ? "success" : "default"}>
            {status || (isActive ? 'Active' : 'Inactive')}
          </Tag>
        )
      }
    },
    {
      title: "CV",
      key: "cv",
      width: 80,
      render: (_: any, record: any) => {
        const hasCv = record.cvUrl || record.cvId
        return hasCv ? (
          <Button 
            type="link" 
            icon={<DownloadOutlined />} 
            onClick={() => window.open(record.cvUrl, "_blank")} 
            size="small"
            disabled={!record.cvUrl}
          >
            View
          </Button>
        ) : (
          <span className="text-gray-400 text-xs">No CV</span>
        )
      },
    },
    ...(hasAnyAction ? [{
      title: "Actions",
      key: "actions",
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <TableActions
          resource="staff"
          onView={() => navigate(`/staff/${record.id}`)}
          onEdit={() => navigate(`/staff/${record.id}`)}
          onDelete={() => handleDelete(record.id)}
          deleteConfirmTitle="Delete Staff Member?"
          deleteConfirmDescription={`Are you sure you want to delete ${record.displayName}?`}
          record={record}
        />
      ),
    }] : []),
  ]

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card
        title={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-lg font-semibold">Staff Members</span>
            {hasStaffCreate && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => navigate("/staff/new")}
                className="min-w-fit"
              >
                <span className="hidden sm:inline">Add Staff</span>
                <span className="sm:hidden">Add</span>
              </Button>
            )}
          </div>
        }
      >
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input 
            placeholder="Search by name or email..." 
            prefix={<SearchOutlined />} 
            onChange={(e) => handleSearch(e.target.value)} 
            className="w-full"
            allowClear 
          />
          <Select 
            placeholder="Filter by department" 
            onChange={handleDepartmentFilter} 
            className="w-full"
            allowClear
          >
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
          scroll={{ x: 800 }}
          pagination={{ 
              current: page, 
              pageSize: limit, 
              total, 
              showSizeChanger: true, 
              showQuickJumper: true,
              showTotal: (t, range) => `${range[0]}-${range[1]} of ${t} staff members`,
              onChange: (newPage: number, newPageSize?: number) => {
                if (newPageSize && newPageSize !== limit) dispatch(setLimit(newPageSize))
                dispatch(setPage(newPage))
              }
            }}
          className="border-0"
        />
      </Card>
    </div>
  )
}

export default StaffListPage
