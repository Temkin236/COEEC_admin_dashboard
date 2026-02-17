"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, Button, Table, Space, Tag, Input, Select, Avatar, Modal, message, Descriptions } from "antd"
import { PlusOutlined, SearchOutlined, DownloadOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchStaff, deleteStaff, setPage, setLimit } from "@/store/slices/staffSlice"
import { getInitials } from "@/utils/helpers"
import { fetchDepartments } from "@/store/slices/departmentSlice"
import { usePermissions } from "@/hooks/usePermissions"
import TableActions from "@/components/common/TableActions"
import DataTable from "@/components/common/DataTable"

const StaffListPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { items, total, page, limit, loading } = useAppSelector((state) => state.staff)
  const { items: departments = [] } = useAppSelector((state) => state.departments)
  const [filters, setFilters] = useState<{ search: string; department: string }>({ search: "", department: "" })
  const perms = usePermissions()
  const { canCreate, canView, canUpdate, canDelete, permissions: userPermissions } = perms

  const hasStaffView = canView("staff")
  const hasStaffCreate = canCreate("staff")
  const hasStaffUpdate = canUpdate("staff")
  const hasStaffDelete = canDelete("staff")

  // Has any action permission
  const hasAnyAction = hasStaffView || hasStaffUpdate || hasStaffDelete

  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewingStaff, setViewingStaff] = useState<any>(null)

  const getPhotoUrl = (record: any) => {
    try {
      let photoUrl: string | null = null
      if (!record) return null
      if (record.photo) {
        if (typeof record.photo === "string") photoUrl = record.photo
        else if (record.photo?.url) photoUrl = record.photo.url
      } else if (record.photoUrl) {
        photoUrl = record.photoUrl
      }

      if (photoUrl && (photoUrl.includes("localhost") || photoUrl.startsWith("http://localhost"))) {
        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || ''
        photoUrl = photoUrl.replace(/http:\/\/localhost:\d+/, baseUrl)
      }

      return photoUrl
    } catch (err) {
      return null
    }
  }

  useEffect(() => {
    dispatch((fetchStaff as any)({ page, limit, filters }))
  }, [dispatch, page, limit, filters])

  useEffect(() => {
    dispatch(fetchDepartments() as any)
  }, [dispatch])

  const handleDelete = async (id: string | number) => {
    Modal.confirm({
      title: "Delete Staff",
      content: "Are you sure you want to delete this staff member?",
      centered: true,
      width: 640,
      okText: "Delete",
      okButtonProps: { danger: true },
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
        let photoUrl = null
        
        if (record.photo) {
          if (typeof record.photo === 'string') {
            photoUrl = record.photo
          } else if (record.photo?.url) {
            photoUrl = record.photo.url
          }
          
          // Convert localhost URLs to backend URL
          if (photoUrl && (photoUrl.includes('localhost') || photoUrl.startsWith('http://localhost'))) {
            const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || ''
            photoUrl = photoUrl.replace(/http:\/\/localhost:\d+/, baseUrl)
          }
        }

        return (
          <Space>
            {photoUrl ? (
              <Avatar src={photoUrl} style={{ backgroundColor: "#1e3a5f" }} crossOrigin="anonymous" />
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
          onView={() => {
            setViewingStaff(record)
            setViewModalOpen(true)
          }}
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
            {Array.isArray(departments) && departments.map((dept: any) => (
              <Select.Option key={dept.id || dept.code} value={dept.code || dept.id}>
                {dept.name || dept.title || dept.code}
              </Select.Option>
            ))}
          </Select>
        </div>

        <DataTable
          columns={columns as any}
          dataSource={Array.isArray(items) ? items : []}
          loading={loading as any}
          rowKey="id"
          onRow={(record) => ({
            onClick: (e: any) => {
              // Open detail modal when row clicked (buttons stop propagation)
              setViewingStaff(record)
              setViewModalOpen(true)
            },
            style: { cursor: 'pointer' }
          })}
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
        <Modal
          title="Staff Details"
          open={viewModalOpen}
          onCancel={() => setViewModalOpen(false)}
          footer={<Button onClick={() => setViewModalOpen(false)}>Close</Button>}
          centered
          width={640}
          style={{ maxWidth: 600 }}
        >
          {viewingStaff && (() => {
            const photoUrl = getPhotoUrl(viewingStaff)
            return (
              <Descriptions bordered column={1} layout="horizontal">
                <Descriptions.Item label="Photo">
                  {photoUrl ? (
                    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                      <img src={photoUrl} alt={viewingStaff.displayName || 'staff'} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">No photo available</span>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Name">{viewingStaff.displayName || viewingStaff.fullName || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Email">{viewingStaff.email || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Title">{viewingStaff.title || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Department">{viewingStaff.department?.name || viewingStaff.department || 'None'}</Descriptions.Item>
                <Descriptions.Item label="Research Areas">{(Array.isArray(viewingStaff.researchAreas) && viewingStaff.researchAreas.length) ? viewingStaff.researchAreas.join(', ') : 'None'}</Descriptions.Item>
                <Descriptions.Item label="Office">{viewingStaff.officeLocation || 'Not set'}</Descriptions.Item>
                <Descriptions.Item label="Status">{viewingStaff.status || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Created At">{viewingStaff.createdAt ? new Date(viewingStaff.createdAt).toLocaleString() : 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Updated At">{viewingStaff.updatedAt ? new Date(viewingStaff.updatedAt).toLocaleString() : 'N/A'}</Descriptions.Item>
              </Descriptions>
            )
          })()}
        </Modal>
    </div>
  )
}

export default StaffListPage
