"use client"

import { useEffect, useState } from "react"
import { Card, Button, Table, Space, Tag, Modal, Form, Input, Select, message, Descriptions } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchContent, createContent, updateContent, deleteContent } from "@/store/slices/contentSlice"

const { TextArea } = Input

const DepartmentsPage = () => {
  const dispatch = useAppDispatch()
  const { departments } = useAppSelector((state) => state.content)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [viewingItem, setViewingItem] = useState<any>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(fetchContent({ type: "departments" }) as any)
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

  const handleDelete = async (id: string | number) => {
    Modal.confirm({
      title: "Delete Department",
      content: "Are you sure you want to delete this department information?",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        await dispatch(deleteContent({ type: "departments", id }) as any)
        message.success("Department deleted successfully")
      },
    })
  }

  const handleSubmit = async (values: any) => {
    try {
      if (editingItem) {
        await dispatch(updateContent({ type: "departments", id: editingItem.id, data: values }) as any).unwrap()
        message.success("Department updated successfully")
      } else {
        await dispatch(createContent({ type: "departments", data: values }) as any).unwrap()
        message.success("Department created successfully")
      }

      setIsModalOpen(false)
      form.resetFields()
    } catch (error) {
      message.error("Operation failed")
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
          <div className="text-xs text-gray-500">{record.code}</div>
        </div>
      ),
    },
    { title: "Head", dataIndex: "head", key: "head" },
    {
      title: "Programs",
      dataIndex: "programs",
      key: "programs",
      render: (programs: string[]) => (
        <div className="space-x-1">
          {programs?.slice(0, 2).map((program, idx) => (
            <Tag key={idx} color="blue">
              {program}
            </Tag>
          ))}
          {programs?.length > 2 && <Tag>+{programs.length - 2} more</Tag>}
        </div>
      ),
    },
    { title: "Staff Count", dataIndex: "staffCount", key: "staffCount", width: 120 },
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
          dataSource={Array.isArray(departments.items) ? departments.items : []}
          loading={departments.loading as any}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingItem ? "Edit Department" : "Add Department"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        width={800}
        okText={editingItem ? "Update" : "Create"}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
          <Form.Item name="name" label="Department Name" rules={[{ required: true, message: "Please enter department name" }]}>
            <Input placeholder="e.g., Computer Science and Engineering" />
          </Form.Item>
          <Form.Item name="code" label="Department Code" rules={[{ required: true, message: "Please enter department code" }]}>
            <Input placeholder="e.g., CSE" />
          </Form.Item>
          <Form.Item name="head" label="Department Head">
            <Input placeholder="Enter department head name" />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true, message: "Please enter description" }]}>
            <TextArea rows={4} placeholder="Enter department description" />
          </Form.Item>
          <Form.Item name="programs" label="Programs" tooltip="Enter programs separated by commas">
            <Select mode="tags" placeholder="e.g., BSc, MSc, PhD" />
          </Form.Item>
          <Form.Item name="researchAreas" label="Research Areas">
            <Select mode="tags" placeholder="Enter research areas" />
          </Form.Item>
          <Form.Item name="staffCount" label="Staff Count">
            <Input type="number" placeholder="0" />
          </Form.Item>
          <Form.Item name="email" label="Contact Email">
            <Input placeholder="department@astu.edu.et" />
          </Form.Item>
          <Form.Item name="phone" label="Contact Phone">
            <Input placeholder="+251-XXX-XXXXXX" />
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
        width={800}
      >
        {viewingItem && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Name">{viewingItem.name}</Descriptions.Item>
            <Descriptions.Item label="Code">{viewingItem.code}</Descriptions.Item>
            <Descriptions.Item label="Head">{viewingItem.head}</Descriptions.Item>
            <Descriptions.Item label="Description">{viewingItem.description}</Descriptions.Item>
            <Descriptions.Item label="Programs">
              {viewingItem.programs?.map((p: string, i: number) => (
                <Tag key={i} color="blue">
                  {p}
                </Tag>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label="Research Areas">
              {viewingItem.researchAreas?.map((r: string, i: number) => (
                <Tag key={i} color="green">
                  {r}
                </Tag>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label="Staff Count">{viewingItem.staffCount}</Descriptions.Item>
            <Descriptions.Item label="Email">{viewingItem.email}</Descriptions.Item>
            <Descriptions.Item label="Phone">{viewingItem.phone}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default DepartmentsPage
