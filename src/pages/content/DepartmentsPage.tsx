"use client"

import { useEffect, useState } from "react"
import {
  Card,
  Button,
  Table,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Descriptions,
  Tabs,
} from "antd"
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  InboxOutlined,
  ReloadOutlined,
} from "@ant-design/icons"
import { usePermissions } from "@/hooks/usePermissions"
import TableActions from "@/components/common/TableActions"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "@/store/slices/departmentSlice"
import { fetchStaff } from "@/store/slices/staffSlice"

const { TextArea } = Input

const DepartmentsPage = () => {
  const dispatch = useAppDispatch()

  // ✅ SAFE DEFAULTS — THIS IS THE KEY FIX
  const { items = [], loading } = useAppSelector(
    (state) => state.departments
  )
  const { items: staffItems = [] } = useAppSelector(
    (state) => state.staff
  )

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [viewingItem, setViewingItem] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [form] = Form.useForm()

  // Filter departments based on active tab
  const filteredItems = items.filter(item => {
    if (activeTab === "active") return !item.isDisabled
    if (activeTab === "archived") return item.isDisabled
    return true
  })

  useEffect(() => {
    dispatch(fetchDepartments())
    dispatch(fetchStaff({ limit: 100 }))
  }, [dispatch])

  const { permissions: userPermissions, canView, canCreate, canUpdate, canDelete } = usePermissions()
  const hasDeptView = canView("departments")
  const hasDeptCreate = canCreate("departments")
  const hasDeptUpdate = canUpdate("departments")
  const hasDeptDelete = canDelete("departments")

  const cuidRegex = /^[cC][^\s-]{8,}$/

  const handleCreate = () => {
    setEditingItem(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (record: any) => {
    setEditingItem(record)

    const initialValues = { ...record }

    if (initialValues.headId && !cuidRegex.test(initialValues.headId)) {
      initialValues.headId = undefined
    }

    if (initialValues.pageId && !cuidRegex.test(initialValues.pageId)) {
      initialValues.pageId = undefined
    }

    form.setFieldsValue(initialValues)
    setIsModalOpen(true)
  }

  const handleView = (record: any) => {
    setViewingItem(record)
    setViewModalOpen(true)
  }

  const handleDeactivate = (record: any) => {
    const isCurrentlyDisabled = record.isDisabled
    const action = isCurrentlyDisabled ? "reactivate" : "deactivate"
    const actionPast = isCurrentlyDisabled ? "reactivated" : "deactivated"
    
    Modal.confirm({
      title: `${isCurrentlyDisabled ? 'Reactivate' : 'Deactivate'} Department`,
      content: `Are you sure you want to ${action} "${record.name}"?`,
      okText: isCurrentlyDisabled ? 'Reactivate' : 'Deactivate',
      okType: isCurrentlyDisabled ? 'primary' : 'danger',
      onOk: async () => {
        try {
          await dispatch(updateDepartment({ 
            id: record.id, 
            data: { ...record, isDisabled: !isCurrentlyDisabled } 
          })).unwrap()
          message.success(`Department ${actionPast} successfully`)
          dispatch(fetchDepartments())
        } catch (error: any) {
          message.error(error?.message || `Failed to ${action} department`)
        }
      },
    })
  }

  const handleSubmit = async (values: any) => {
    try {
      const cleanedValues = { ...values }

      if (!cleanedValues.headId || !cuidRegex.test(cleanedValues.headId)) {
        delete cleanedValues.headId
      }

      if (!cleanedValues.pageId || !cuidRegex.test(cleanedValues.pageId)) {
        delete cleanedValues.pageId
      }

      if (editingItem) {
        await dispatch(
          updateDepartment({ id: editingItem.id, data: cleanedValues })
        ).unwrap()
        message.success("Department updated successfully")
      } else {
        await dispatch(createDepartment(cleanedValues)).unwrap()
        message.success("Department created successfully")
      }

      dispatch(fetchDepartments())
      setIsModalOpen(false)
      form.resetFields()
    } catch (error: any) {
      message.error(error?.message || "Operation failed")
    }
  }

  const columns = [
    {
      title: "Department",
      dataIndex: "name",
      key: "name",
      width: 250,
      render: (name: string, record: any) => (
        <div className={record.isDisabled ? "opacity-60" : ""}>
          <div className="font-medium flex items-center gap-2 mb-1">
            {name}
            {record.isDisabled && <Tag color="orange" size="small">Archived</Tag>}
          </div>
          <div className="text-xs text-gray-500">{record.slug}</div>
        </div>
      ),
    },
    {
      title: "Head",
      dataIndex: "headId",
      key: "headId",
      width: 200,
      render: (headId: string, record: any) => {
        const content = (() => {
          if (!headId) return <Tag size="small">No Head Assigned</Tag>

          const staff = staffItems.find((s) => s.id === headId)
          if (staff) {
            const name = staff.displayName || `${staff.firstName || ""} ${staff.lastName || ""}`.trim()
            return (
              <div className="font-medium">{name || "Unnamed"}</div>
            )
          }

          if (!cuidRegex.test(headId)) {
            return <Tag color="warning" size="small">Demo: {headId}</Tag>
          }

          return headId
        })()
        
        return <div className={record.isDisabled ? "opacity-60" : ""}>{content}</div>
      },
    },
    {
      title: "Status",
      dataIndex: "isDisabled",
      key: "status",
      width: 100,
      render: (isDisabled: boolean) => (
        <Tag color={isDisabled ? "orange" : "green"} className="font-medium">
          {isDisabled ? "Archived" : "Active"}
        </Tag>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: {
        showTitle: true,
      },
      render: (text: string, record: any) => (
        <div className={`${record.isDisabled ? "opacity-60" : ""} max-w-xs`}>
          {text}
        </div>
      ),
    },
    ...(hasDeptView || hasDeptUpdate || hasDeptDelete ? [{
      title: "Actions",
      key: "actions",
      width: 140,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small" className="flex-nowrap">
          {/* View button shown only if user can view */}
          <TableActions
            resource="departments"
            onView={() => handleView(record)}
            onEdit={() => handleEdit(record)}
            onDelete={() => {
              // If user can delete globally, use delete flow; otherwise don't show delete
              if (hasDeptDelete) {
                // confirm then delete
                Modal.confirm({
                  title: "Delete Department",
                  content: `Remove "${record.name}" permanently?`,
                  okText: "Delete",
                  okButtonProps: { danger: true },
                  onOk: async () => {
                    try {
                      await dispatch(deleteDepartment(record.id)).unwrap()
                      message.success("Department deleted")
                      dispatch(fetchDepartments())
                    } catch (err: any) {
                      message.error(err?.message || "Failed to delete")
                    }
                  },
                })
              }
            }}
            record={record}
            allowEditIfOwner={false}
            ownerIdField={"createdById"}
          />

          {/* Archive/reactivate - treat as update permission */}
          {hasDeptUpdate && (
            <Button
              type="text"
              danger={!record.isDisabled}
              icon={record.isDisabled ? <ReloadOutlined /> : <InboxOutlined />}
              onClick={() => handleDeactivate(record)}
              title={record.isDisabled ? "Reactivate Department" : "Archive Department"}
              size="small"
            />
          )}
        </Space>
      ),
    }] : []),
  ]

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card
        title={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-lg font-semibold">Departments</span>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              className="min-w-fit"
            >
              <span className="hidden sm:inline">Add Department</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: "all", label: "All Departments" },
            { key: "active", label: "Active" },
            { key: "archived", label: "Archived" },
          ]}
          className="mb-4"
        />
        <Table
          columns={columns as any}
          dataSource={filteredItems}
          loading={loading}
          rowKey="id"
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} departments`
          }}
          rowClassName={(record) => 
            record.isDisabled ? "bg-gray-50" : ""
          }
          scroll={{ x: 800 }}
          className="border-0"
        />
      </Card>

      <Modal
        title={editingItem ? "Edit Department" : "Add Department"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        width={"90%"}
        style={{ maxWidth: 600 }}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Department Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Slug"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="headId" label="Department Head">
            <Select
              allowClear
              showSearch
              placeholder="Select department head"
              options={[
                { value: "", label: "--- None ---" },
                ...(staffItems || []).map((s) => {
                  const label = s.displayName || `${s.firstName || ""} ${s.lastName || ""}`.trim() || "Unnamed"
                  return { value: s.id, label }
                }),
              ]}
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item name="pageId" label="Page ID">
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true }]}
          >
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Department Details"
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={<Button onClick={() => setViewModalOpen(false)}>Close</Button>}
        width={"90%"}
        style={{ maxWidth: 600 }}
      >
        {viewingItem && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Name">
              {viewingItem.name}
            </Descriptions.Item>
            <Descriptions.Item label="Slug">
              {viewingItem.slug}
            </Descriptions.Item>
            <Descriptions.Item label="Head">
              {staffItems.find((s) => s.id === viewingItem.headId)
                ? `${staffItems.find((s) => s.id === viewingItem.headId)
                    ?.firstName} ${
                    staffItems.find((s) => s.id === viewingItem.headId)
                      ?.lastName
                  }`
                : viewingItem.headId || "None"}
            </Descriptions.Item>
            <Descriptions.Item label="Page ID">
              {viewingItem.pageId}
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {viewingItem.description}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default DepartmentsPage
