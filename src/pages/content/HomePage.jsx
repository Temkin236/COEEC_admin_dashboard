"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Card, Button, Table, Space, Tag, Modal, Form, Input, Select, message } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons"
import { fetchContent, createContent, updateContent, deleteContent } from "@/store/slices/contentSlice"
import { getStatusColor } from "@/utils/helpers"
import { APPROVAL_STATUS, LANGUAGE_LABELS } from "@/utils/constants"

const { TextArea } = Input

const HomePage = () => {
  const dispatch = useDispatch()
  const { homepage } = useSelector((state) => state.content)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [currentLanguage, setCurrentLanguage] = useState("en")
  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(fetchContent({ type: "homepage", language: currentLanguage }))
  }, [dispatch, currentLanguage])

  const handleCreate = () => {
    setEditingItem(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (record) => {
    setEditingItem(record)
    form.setFieldsValue(record)
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Delete Content",
      content: "Are you sure you want to delete this item?",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        await dispatch(deleteContent({ type: "homepage", id }))
        message.success("Content deleted successfully")
      },
    })
  }

  const handleSubmit = async (values) => {
    try {
      const data = {
        ...values,
        language: currentLanguage,
        status: APPROVAL_STATUS.DRAFT,
      }

      if (editingItem) {
        await dispatch(updateContent({ type: "homepage", id: editingItem.id, data })).unwrap()
        message.success("Content updated successfully")
      } else {
        await dispatch(createContent({ type: "homepage", data })).unwrap()
        message.success("Content created successfully")
      }

      setIsModalOpen(false)
      form.resetFields()
    } catch (error) {
      message.error("Operation failed")
    }
  }

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: "Language",
      dataIndex: "language",
      key: "language",
      render: (lang) => LANGUAGE_LABELS[lang],
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button type="text" icon={<EyeOutlined />} onClick={() => handleEdit(record)} />
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ]

  return (
    <div className="space-y-4 p-2 md:p-4">
      <Card
        title="Homepage Content"
        extra={
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <Select value={currentLanguage} onChange={setCurrentLanguage} className="w-full sm:w-40">
              {Object.entries(LANGUAGE_LABELS).map(([key, label]) => (
                <Select.Option key={key} value={key}>
                  {label}
                </Select.Option>
              ))}
            </Select>
            <Button className="w-full sm:w-auto" type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              Add Content
            </Button>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={Array.isArray(homepage.items) ? homepage.items : []}
            loading={homepage.loading}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </div>
      </Card>

      <Modal
        title={editingItem ? "Edit Content" : "Create Content"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        width={800}
        okText={editingItem ? "Update" : "Create"}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
          <Form.Item
            name="type"
            label="Content Type"
            rules={[{ required: true, message: "Please select content type" }]}
          >
            <Select placeholder="Select type">
              <Select.Option value="hero">Hero Section</Select.Option>
              <Select.Option value="news">News</Select.Option>
              <Select.Option value="event">Event</Select.Option>
              <Select.Option value="announcement">Announcement</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="title" label="Title" rules={[{ required: true, message: "Please enter title" }]}>
            <Input placeholder="Enter title" />
          </Form.Item>

          <Form.Item name="subtitle" label="Subtitle">
            <Input placeholder="Enter subtitle" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <TextArea rows={4} placeholder="Enter description" />
          </Form.Item>

          <Form.Item name="image" label="Image URL">
            <Input placeholder="Enter image URL or upload" />
          </Form.Item>

          <Form.Item name="link" label="Link (Optional)">
            <Input placeholder="Enter link URL" />
          </Form.Item>

          <Form.Item name="order" label="Display Order">
            <Input type="number" placeholder="0" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default HomePage
