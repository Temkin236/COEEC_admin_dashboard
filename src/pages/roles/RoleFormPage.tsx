"use client"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Card, Form, Input, Button, Space, message, Spin, Divider, Tag } from "antd"
import { ArrowLeftOutlined, CloseOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  fetchRoleById,
  createRole,
  updateRole,
  setCurrentRole,
} from "@/store/slices/roleSlice"
import { fetchPermissions } from "@/store/slices/permissionSlice"
import PermissionsSelection from "@/components/PermissionsSelection"

const RoleFormPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const [form] = Form.useForm()

  const { currentRole, loading: roleLoading } = useAppSelector(
    (state) => state.role
  )
  const { items: permissions, loading: permissionLoading } = useAppSelector(
    (state) => state.permission
  )
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loading = roleLoading || permissionLoading
  const isEditMode = Boolean(id)
  const pageTitle = isEditMode ? "Edit Role" : "Create New Role"

  // Fetch permissions on mount
  useEffect(() => {
    dispatch((fetchPermissions as any)())
  }, [dispatch])

  // Fetch role data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      dispatch((fetchRoleById as any)(id))
    } else {
      dispatch((setCurrentRole as any)(null))
    }
  }, [dispatch, id, isEditMode])

  // Debug log to see role structure
  useEffect(() => {
    if (currentRole) {
      console.log('Current role data:', currentRole)
    }
  }, [currentRole])

  // Populate form when role data is loaded
  useEffect(() => {
    if (currentRole) {
      if (currentRole.system) {
        message.error("System roles cannot be edited")
        navigate("/roles")
        return
      }

      form.setFieldsValue({
        name: currentRole.name,
        description: currentRole.description || "",
      })
      
      // Extract permission IDs - handle different possible data structures
      let permIds: string[] = []
      
      if (currentRole.permissionIds && Array.isArray(currentRole.permissionIds)) {
        // Direct permission IDs array
        permIds = currentRole.permissionIds
      } else if (currentRole.permissions && Array.isArray(currentRole.permissions)) {
        // Handle nested permission structure from API
        permIds = currentRole.permissions.map((p: any) => {
          // Check if it's the nested structure with permission.permission.id
          if (p.permission && p.permission.id) {
            return p.permission.id
          }
          // Check if it's a direct permission object with id
          if (p.id && !p.permissionId) {
            return p.id
          }
          // Check if it's a role-permission relation with permissionId
          if (p.permissionId) {
            return p.permissionId
          }
          // Fallback for string IDs
          if (typeof p === 'string') {
            return p
          }
          return null
        }).filter(Boolean)
      } else if (currentRole.rolePermissions && Array.isArray(currentRole.rolePermissions)) {
        permIds = currentRole.rolePermissions.map((rp: any) => 
          rp.permissionId || rp.permission?.id
        ).filter(Boolean)
      }
      
      console.log('Role data:', currentRole)
      console.log('Extracted permission IDs:', permIds)
      console.log('Available permissions:', permissions.map(p => ({id: p.id, action: p.action, resource: p.resource})))
      setSelectedPermissions(permIds)
    } else if (!isEditMode) {
      form.resetFields()
      setSelectedPermissions([])
    }
  }, [currentRole, form, isEditMode, permissions])

  const handleSubmit = async (values: any) => {
    if (selectedPermissions.length === 0) {
      message.warning("Please select at least one permission")
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        name: values.name.trim(),
        description: values.description?.trim() || "",
        permissionIds: selectedPermissions,
      }

      if (isEditMode && id) {
        await dispatch(
          (updateRole as any)({
            id,
            ...payload,
          })
        )
        message.success("Role updated successfully")
      } else {
        await dispatch((createRole as any)(payload))
        message.success("Role created successfully")
      }

      navigate("/roles")
    } catch (error: any) {
      message.error(
        error?.message || "Failed to save role. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/roles")}
          className="self-start"
        >
          Back to Roles
        </Button>
      </div>

      <div className="space-y-4">
        <div className="text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEditMode
              ? "Update role details and permissions"
              : "Create a new role with specific permissions"}
          </p>
        </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spin size="large" />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Form Section */}
          <Card className="xl:col-span-1 order-2 xl:order-1">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
              requiredMark="optional"
            >
              <Form.Item
                label="Role Name"
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Please enter a role name",
                    whitespace: true,
                  },
                  {
                    min: 2,
                    message: "Role name must be at least 2 characters",
                  },
                  {
                    max: 50,
                    message: "Role name must not exceed 50 characters",
                  },
                ]}
              >
                <Input
                  placeholder="e.g., Admin, Editor, Viewer"
                  disabled={isSubmitting}
                />
              </Form.Item>

              <Form.Item
                label="Description"
                name="description"
                rules={[
                  {
                    max: 500,
                    message: "Description must not exceed 500 characters",
                  },
                ]}
              >
                <Input.TextArea
                  placeholder="Describe the purpose of this role (optional)"
                  rows={4}
                  disabled={isSubmitting}
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              <Divider />

              <Form.Item label="Form Actions">
                <div className="space-y-3">
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={isSubmitting}
                    disabled={selectedPermissions.length === 0}
                  >
                    {isEditMode ? "Update Role" : "Create Role"}
                  </Button>
                  <Button
                    onClick={() => navigate("/roles")}
                    disabled={isSubmitting}
                    block
                  >
                    Cancel
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </Card>

          {/* Permissions Section */}
          <Card className="xl:col-span-2 order-1 xl:order-2">
            <h3 className="text-base sm:text-lg font-medium mb-4">Permissions</h3>
            
            {/* Selected Permissions Tags */}
            {selectedPermissions.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm font-medium text-blue-900 mb-2">
                  Selected Permissions ({selectedPermissions.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedPermissions.map((permId) => {
                    const permission = permissions.find(p => p.id === permId)
                    if (!permission) return null
                    
                    return (
                      <Tag
                        key={permId}
                        closable
                        onClose={() => {
                          setSelectedPermissions(prev => prev.filter(id => id !== permId))
                        }}
                        color="blue"
                        className="text-sm px-3 py-1"
                      >
                        {permission.resource}.{permission.action}
                      </Tag>
                    )
                  })}
                </div>
              </div>
            )}

            <PermissionsSelection
              permissions={permissions}
              selectedPermissionIds={selectedPermissions}
              onPermissionChange={setSelectedPermissions}
              loading={loading}
            />
          </Card>
        </div>
      )}
      </div>
    </div>
  )
}

export default RoleFormPage
