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
} from "antd"
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons"
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
  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(fetchDepartments())
    dispatch(fetchStaff({ limit: 100 }))
  }, [dispatch])

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

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Delete Department",
      content: "Are you sure you want to delete this department?",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await dispatch(deleteDepartment(id)).unwrap()
          message.success("Department deleted successfully")
          dispatch(fetchDepartments())
        } catch (error: any) {
          message.error(error?.message || "Failed to delete department")
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
        if (!headId) return <Tag>No Head Assigned</Tag>

        const staff = staffItems.find((s) => s.id === headId)
        if (staff) return `${staff.firstName} ${staff.lastName}`

        if (!cuidRegex.test(headId)) {
          return <Tag color="warning">Demo: {headId}</Tag>
        }

        return headId
      },
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
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <Card
        title="Departments"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
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
                ...(staffItems || []).map((s) => ({
                  value: s.id,
                  label: `${s.firstName} ${s.lastName}`,
                })),
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
