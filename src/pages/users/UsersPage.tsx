import { useEffect, useState } from "react"
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  message,
  Typography,
  Tooltip,
  Descriptions,
} from "antd"
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  UserOutlined,
  EyeOutlined,
} from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  fetchUsers,
  fetchUserById,
  createUser,
  updateUser,
  deleteUser,
  uploadUsersCsv,
  clearLastInvite,
  setCurrentUser,
  User,
} from "@/store/slices/usersSlice"
import { fetchRoles } from "@/store/slices/roleSlice"

const { Option } = Select
const { Text, Paragraph } = Typography

const UsersPage = () => {
  const dispatch = useAppDispatch()
  const { items, loading, lastInvite, currentUser } = useAppSelector((state) => state.users)
  const { allItems: roles } = useAppSelector((state) => state.role)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<User | null>(null)
  const [viewingItem, setViewingItem] = useState<User | null>(null)
  const [bulkFile, setBulkFile] = useState<File | null>(null)
  const [isBulkUploading, setIsBulkUploading] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(fetchUsers() as any)
    dispatch(fetchRoles() as any)
  }, [dispatch])

  useEffect(() => {
    if (currentUser) {
      form.setFieldsValue({
        ...currentUser,
        roleIds: currentUser.roles?.map((r: any) => r.roleId || r.role?.id || r.id) || [],
      })
    }
  }, [currentUser, form])

  useEffect(() => {
    if (lastInvite) {
      setIsInviteModalOpen(true)
      setIsModalOpen(false)
      form.resetFields()
      // Refresh list to show new user if backend adds them immediately, 
      // though usually invite flow means they are pending. 
      // We'll fetch anyway just in case.
      dispatch(fetchUsers() as any)
    }
  }, [lastInvite, dispatch, form])

  const handleAdd = () => {
    setEditingItem(null)
    dispatch(setCurrentUser(null))
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (record: User) => {
    setEditingItem(record)
    dispatch(fetchUserById(record.id) as any)
    setIsModalOpen(true)
  }

  const handleView = (record: User) => {
    setViewingItem(record)
    setIsViewModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteUser(id) as any)
      message.success("User deleted successfully!")
    } catch (error) {
      message.error("Failed to delete user")
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      if (editingItem && editingItem.id) {
        await dispatch(updateUser({ id: editingItem.id, data: values }) as any)
        message.success("User updated successfully!")
        setIsModalOpen(false)
        form.resetFields()
      } else {
        // Create new user -> triggers invite modal via useEffect
        await dispatch(createUser(values) as any)
      }
    } catch (error) {
      message.error("Failed to save user")
    }
  }

  const handleCopyToken = () => {
    if (lastInvite?.inviteUrl) {
      const token = lastInvite.inviteUrl.split("token=")[1]
      if (token) {
        const fullUrl = `${window.location.origin}/login?token=${token}`
        navigator.clipboard.writeText(fullUrl)
        message.success("Activation link copied to clipboard!")
      } else {
        message.error("Could not extract token from URL")
      }
    }
  }

  const handleCloseInviteModal = () => {
    setIsInviteModalOpen(false)
    dispatch(clearLastInvite())
  }

  const handleOpenBulkModal = () => {
    setBulkFile(null)
    setIsBulkModalOpen(true)
  }

  const handleBulkFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    if (!file) {
      setBulkFile(null)
      return
    }

    const fileName = file.name.toLowerCase()
    const allowedExtensions = [".csv", ".xls", ".xlsx", ".xlsm"]
    const isAllowed = allowedExtensions.some((ext) => fileName.endsWith(ext))

    if (!isAllowed) {
      message.error("Please select a CSV or Excel file (.csv, .xls, .xlsx, .xlsm)")
      event.target.value = ""
      setBulkFile(null)
      return
    }

    setBulkFile(file)
  }

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      message.error("Please select a CSV file first")
      return
    }

    try {
      setIsBulkUploading(true)
      const response = await dispatch(uploadUsersCsv(bulkFile) as any).unwrap()

      const createdCount = response?.createdCount
      const failedCount = response?.failedCount
      if (typeof createdCount === "number" || typeof failedCount === "number") {
        message.success(`CSV uploaded: ${createdCount || 0} created, ${failedCount || 0} failed`)
      } else {
        message.success(response?.message || "CSV uploaded successfully")
      }

      setIsBulkModalOpen(false)
      setBulkFile(null)
      dispatch(fetchUsers() as any)
    } catch (error: any) {
      message.error(error || "Failed to upload CSV")
    } finally {
      setIsBulkUploading(false)
    }
  }

  const columns = [
    {
      title: "Display Name",
      dataIndex: "displayName",
      key: "displayName",
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Roles",
      dataIndex: "roles",
      key: "roles",
      render: (roles: any[]) => (
        <>
          {roles?.map((roleItem: any) => {
            const role = roleItem.role || roleItem
            return (
              <Tag color={role.system ? "gold" : "blue"} key={roleItem.id || role.id}>
                {role.name}
              </Tag>
            )
          })}
        </>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: any, record: User) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation()
              handleView(record)
            }}
            title="View"
          />
          <Button
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation()
              handleEdit(record)
            }}
            title="Edit"
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(record.id)
            }}
            title="Delete"
          />
        </Space>
      ),
    },
  ]

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card
        title={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-lg font-semibold">User Management</span>
            <Space>
              <Button onClick={handleOpenBulkModal}>Bulk User</Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleAdd}
              >
                Add User
              </Button>
            </Space>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={items}
          rowKey="id"
          loading={loading}
          onRow={(record) => ({
            onClick: () => handleView(record),
            style: { cursor: 'pointer' }
          })}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingItem ? "Edit User" : "Add New User"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            label="Display Name"
            name="displayName"
            rules={[{ required: true, message: 'Please enter display name' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="John Doe" />
          </Form.Item>
          
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="user@example.com" disabled={!!editingItem} />
          </Form.Item>

          <Form.Item
            label="Roles"
            name="roleIds"
            rules={[{ required: true, message: 'Please select at least one role' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select roles"
              optionFilterProp="label"
              options={roles.map((role) => ({
                label: role.name,
                value: role.id,
              }))}
            />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {editingItem ? "Update" : "Create & Invite"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* View User Details Modal */}
      <Modal
        title="User Details"
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalOpen(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {viewingItem && (
          <Descriptions bordered column={2} className="mt-4">
            <Descriptions.Item label="Display Name" span={2}>{viewingItem.displayName}</Descriptions.Item>
            <Descriptions.Item label="Email" span={2}>{viewingItem.email}</Descriptions.Item>
            <Descriptions.Item label="Roles" span={2}>
              {viewingItem.roles?.map((roleItem: any) => {
                const role = roleItem.role || roleItem
                return (
                  <Tag color={role.system ? "gold" : "blue"} key={roleItem.id || role.id}>
                    {role.name}
                  </Tag>
                )
              })}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Invite Token Modal */}
      <Modal
        title="User Created Successfully"
        open={isInviteModalOpen}
        onCancel={handleCloseInviteModal}
        footer={[
          <Button key="close" type="primary" onClick={handleCloseInviteModal}>
            Done
          </Button>
        ]}
      >
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-md border border-green-200 text-green-800">
            User has been created. Please copy the activation token below and share it with the user.
          </div>
          
          <div>
            <Text type="secondary" className="block mb-1">Activation Link</Text>
            <div className="flex gap-2">
              <Input 
                value={lastInvite?.inviteUrl ? `${window.location.origin}/login?token=${lastInvite.inviteUrl.split("token=")[1]}` : "No token found"} 
                readOnly 
              />
              <Tooltip title="Copy Link">
                <Button icon={<CopyOutlined />} onClick={handleCopyToken} />
              </Tooltip>
            </div>
            <Text type="secondary" className="text-xs mt-1 block">
              Share this link with the user to activate their account.
            </Text>
          </div>
        </div>
      </Modal>

      <Modal
        title="Bulk User Upload"
        open={isBulkModalOpen}
        onCancel={() => setIsBulkModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsBulkModalOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="upload"
            type="primary"
            loading={isBulkUploading}
            onClick={handleBulkUpload}
          >
            Upload
          </Button>,
        ]}
      >
        <div className="space-y-3">
          <input
            type="file"
            accept=".csv,.xls,.xlsx,.xlsm,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleBulkFileChange}
          />
          <Text type="secondary" className="text-xs block">
            File columns: name,email
          </Text>
          {bulkFile && <Text>{bulkFile.name}</Text>}
        </div>
      </Modal>
    </div>
  )
}

export default UsersPage
