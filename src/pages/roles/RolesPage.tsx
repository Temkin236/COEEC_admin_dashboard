"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Card,
  Button,
  Table,
  Space,
  Tag,
  Input,
  Modal,
  message,
  Pagination,
  Empty,
} from "antd"
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
} from "@ant-design/icons"
import { usePermissions } from "@/hooks/usePermissions"
import TableActions from "@/components/common/TableActions"
import { Descriptions } from "antd"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchRoles, deleteRole, setPage, setSearchTerm } from "@/store/slices/roleSlice"
import type { Role } from "@/store/slices/roleSlice"

const RolesPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { items, total, page, limit, loading, searchTerm } = useAppSelector(
    (state) => state.role
  )
  const { items: allPermissions } = useAppSelector((state) => state.permission)
  
  useEffect(() => {
    dispatch(fetchRoles())
  }, [dispatch])

  const { canCreate, canView, canUpdate, canDelete } = usePermissions()
  const hasRoleView = canView("roles") || canView("role")
  const hasRoleCreate = canCreate("roles") || canCreate("role")
  const hasRoleUpdate = canUpdate("roles") || canUpdate("role")
  const hasRoleDelete = canDelete("roles") || canDelete("role")

  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewingRole, setViewingRole] = useState<Role | null>(null)

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Delete Role",
      content: "Are you sure you want to delete this role? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await dispatch((deleteRole as any)(id))
          message.success("Role deleted successfully")
        } catch (error) {
          message.error("Failed to delete role")
        }
      },
    })
  }

  const handleSearch = (value: string) => {
    dispatch(setSearchTerm(value))
  }

  const columns = [
    {
      title: "Role Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Role) => (
        <Space>
          <span className="font-medium">{text}</span>
          {record.system && <Tag color="gold">System</Tag>}
        </Space>
      ),
      width: 150,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 300,
      render: (text: string) => (
        <span className="text-gray-600">{text || "No description"}</span>
      ),
    },
    {
      title: "Permissions",
      dataIndex: "permissionIds",
      key: "permissions",
      width: 100,
      render: (permIds: string[], record: any) => {
        const count = permIds?.length || record.permissions?.length || 0
        return (
          <Tag color="blue" className="font-semibold">
            {count} permission{count !== 1 ? "s" : ""}
          </Tag>
        )
      },
    },
    {
      title: "Last Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 150,
      render: (date: string) => {
        if (!date) return "-"
        return new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      },
    },
    ...(hasRoleView || hasRoleUpdate || hasRoleDelete ? [{
      title: "Actions",
      key: "actions",
      width: 140,
      fixed: "right" as const,
      render: (_: any, record: Role) => {
        const onEdit = !record.system && hasRoleUpdate ? () => navigate(`/roles/${record.id}/edit`) : undefined
        const onDelete = !record.system && hasRoleDelete ? () => handleDelete(record.id) : undefined
        return (
          <TableActions
            resource="roles"
            onView={() => { setViewingRole(record); setViewModalOpen(true) }}
            onEdit={onEdit}
            onDelete={onDelete}
            record={record}
            allowEditIfOwner={false}
            hasUpdate={hasRoleUpdate}
            hasDelete={hasRoleDelete}
          />
        )
      }
    }] : []),
  ]

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card
        title={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-lg font-semibold">Roles</span>
              <p className="text-sm text-gray-500 mt-1 font-normal">
                Manage system roles and permissions
              </p>
            </div>
            {hasRoleCreate && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/roles/create")}
                className="min-w-fit"
              >
                <span className="hidden sm:inline">Create Role</span>
                <span className="sm:hidden">Create</span>
              </Button>
            )}
          </div>
        }
      >
        <div className="mb-6">
          <Input
            placeholder="Search roles by name..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
            className="w-full sm:max-w-sm"
          />
        </div>

        {items.length === 0 && !loading ? (
          <Empty description="No roles found" className="py-8" />
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={items}
              loading={loading}
              rowKey="id"
              onRow={(record) => ({
                onClick: () => {
                  setViewingRole(record)
                  setViewModalOpen(true)
                },
                style: { cursor: 'pointer' }
              })}
              pagination={false}
              scroll={{ x: 800 }}
              className="border-0"
            />
            <Modal
              title="Role Permissions"
              open={viewModalOpen}
              onCancel={() => setViewModalOpen(false)}
              footer={[<Button key="close" onClick={() => setViewModalOpen(false)}>Close</Button>]}
              width={800}
            >
              {viewingRole && (
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Role Name">{viewingRole.name}</Descriptions.Item>
                  <Descriptions.Item label="Description">{viewingRole.description || '—'}</Descriptions.Item>
                  <Descriptions.Item label="Permissions">
                    <div className="flex flex-wrap gap-2">
                        {(viewingRole.permissions || viewingRole.permissionIds || []).map((p: any) => {
                          const permId = typeof p === "string" ? p : (p.permissionId || p.id || p.permission?.id)

                          let label = ""
                          if (typeof p === "string") {
                            const found = allPermissions.find((ap: any) => ap.id === p)
                            label = found ? `${found.resource}.${found.action}` : p
                          } else if (p.permission) {
                            const pr = p.permission
                            label = pr.resource && pr.action ? `${pr.resource}.${pr.action}` : (pr.action || pr.id || JSON.stringify(pr))
                          } else if (p.resource && p.action) {
                            label = `${p.resource}.${p.action}`
                          } else if (p.permissionId) {
                            const found = allPermissions.find((ap: any) => ap.id === p.permissionId)
                            label = found ? `${found.resource}.${found.action}` : p.permissionId
                          } else if (p.id) {
                            const found = allPermissions.find((ap: any) => ap.id === p.id)
                            label = found ? `${found.resource}.${found.action}` : p.id
                          } else {
                            label = String(p)
                          }

                          return (
                            <Tag key={permId || JSON.stringify(p)} color="blue">{label}</Tag>
                          )
                        })}
                      </div>
                  </Descriptions.Item>
                </Descriptions>
              )}
            </Modal>
            {total > 0 && (
              <div className="flex justify-center sm:justify-end mt-6 pt-4 border-t border-gray-200">
                <Pagination
                  current={page}
                  pageSize={limit}
                  total={total}
                  onChange={(newPage) => dispatch(setPage(newPage))}
                  showSizeChanger={true}
                  showQuickJumper={true}
                  showTotal={(t, range) => `${range[0]}-${range[1]} of ${t} roles`}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}

export default RolesPage
