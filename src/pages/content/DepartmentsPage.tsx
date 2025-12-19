"use client"

import { useEffect, useState } from "react"
import { Card, Button, Table, Space, Tag, Modal, Form, Input, Select, message, Descriptions } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment } from "@/store/slices/departmentSlice"
import { fetchStaff } from "@/store/slices/staffSlice"

const { TextArea } = Input

const DepartmentsPage = () => {
  const dispatch = useAppDispatch()
  const { items, loading } = useAppSelector((state) => state.departments)
  const { items: staffItems } = useAppSelector((state) => state.staff)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [viewingItem, setViewingItem] = useState<any>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(fetchDepartments())
    dispatch(fetchStaff({ limit: 100 }))
  }, [dispatch])

  const handleCreate = () => {
    setEditingItem(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (record: any) => {
    setEditingItem(record)
    form.setFieldsValue(record)
    setIsModalOpen(true)
  }

  const handleView = (record: any) => {
    setViewingItem(record)
    setViewModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: "Delete Department",
      content: "Are you sure you want to delete this department?",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await dispatch(deleteDepartment(id)).unwrap()
          message.success("Department deleted successfully")
        } catch (error: any) {
          console.error("Delete failed:", error)
          const errorMsg = typeof error === 'string' ? error : (error?.message || "Failed to delete department");
          message.error(errorMsg)
        }
      },
    })
  }

  const handleSubmit = async (values: any) => {
    try {
      // Clean up values: remove fields that are not valid CUIDs
      const cleanedValues = { ...values };
      
      const cuidRegex = /^[cC][^\s-]{8,}$/;
      
      if (!cleanedValues.headId || !cuidRegex.test(cleanedValues.headId)) {
        delete cleanedValues.headId;
      }
      
      if (!cleanedValues.pageId || !cuidRegex.test(cleanedValues.pageId)) {
        delete cleanedValues.pageId;
      }

      if (editingItem) {
        await dispatch(updateDepartment({ id: editingItem.id, data: cleanedValues })).unwrap()
        message.success("Department updated successfully")
      } else {
        await dispatch(createDepartment(cleanedValues)).unwrap()
        message.success("Department created successfully")
      }

      setIsModalOpen(false)
      form.resetFields()
    } catch (error: any) {
      console.error("Operation failed:", error)
      let errorMsg = "Operation failed";
      if (typeof error === 'string') {
        errorMsg = error;
      } else if (error?.message) {
        try {
          // Try to parse Zod error messages if they are stringified JSON
          const parsed = JSON.parse(error.message);
          if (Array.isArray(parsed)) {
            errorMsg = parsed.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
          } else {
            errorMsg = error.message;
          }
        } catch {
          errorMsg = error.message;
        }
      }
      message.error(errorMsg)
    }
  }

  const columns = [
    {
      title: "Department",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: any) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-gray-500">{record.slug}</div>
        </div>
      ),
    },
    { 
      title: "Head", 
      dataIndex: "headId", 
      key: "headId",
      render: (headId: string) => {
        const staff = staffItems.find(s => s.id === headId)
        return staff ? `${staff.firstName} ${staff.lastName}` : headId || "N/A"
      }
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="text" icon={<EyeOutlined />} onClick={() => handleView(record)} />
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <Card
        title="Departments"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Add Department
          </Button>
        }
      >
        <Table
          columns={columns as any}
          dataSource={items}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingItem ? "Edit Department" : "Add Department"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        width={600}
        okText={editingItem ? "Update" : "Create"}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
          <Form.Item name="name" label="Department Name" rules={[{ required: true, message: "Please enter department name" }]}> 
            <Input placeholder="e.g., Computer Science" />
          </Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{ required: true, message: "Please enter slug" }]}>
            <Input placeholder="e.g., computer-science" />
          </Form.Item>
          <Form.Item name="headId" label="Department Head">
            <Select
              placeholder="Select department head"
              showSearch
              allowClear
              optionFilterProp="children"
              options={staffItems.map(s => ({ value: s.id, label: `${s.firstName} ${s.lastName}` }))}
            />
          </Form.Item>
          <Form.Item name="pageId" label="Page ID">
            <Input placeholder="Enter page UUID" />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true, message: "Please enter description" }]}>
            <TextArea rows={4} placeholder="Enter department description" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Department Details"
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalOpen(false)}>
            Close
          </Button>,
        ]}
        width={600}
      >
        {viewingItem && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Name">{viewingItem.name}</Descriptions.Item>
            <Descriptions.Item label="Slug">{viewingItem.slug}</Descriptions.Item>
            <Descriptions.Item label="Head">
              {staffItems.find(s => s.id === viewingItem.headId)?.firstName} {staffItems.find(s => s.id === viewingItem.headId)?.lastName || viewingItem.headId}
            </Descriptions.Item>
            <Descriptions.Item label="Page ID">{viewingItem.pageId}</Descriptions.Item>
            <Descriptions.Item label="Description">{viewingItem.description}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default DepartmentsPage
