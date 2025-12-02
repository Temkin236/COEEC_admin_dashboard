"use client"

import { useEffect, useState } from "react"
import { Card, Button, Table, Space, Tag, Modal, Form, Input, Select, DatePicker, message } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, LinkOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchPublications, createPublication } from "@/store/slices/researchSlice"
import { formatDate } from "@/utils/helpers"

const { TextArea } = Input

const PublicationsPage = () => {
  const dispatch = useAppDispatch()
  const { publications } = useAppSelector((state) => state.research)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(fetchPublications({ page: 1, limit: 10 }) as any)
  }, [dispatch])

  const handleSubmit = async (values: any) => {
    try {
      await dispatch(createPublication({ ...values, publicationDate: values.publicationDate?.format("YYYY-MM-DD") }) as any).unwrap()
      message.success("Publication added successfully")
      setIsModalOpen(false)
      form.resetFields()
    } catch (error) {
      message.error("Failed to add publication")
    }
  }

  const columns = [
    { title: "Title", dataIndex: "title", key: "title", ellipsis: true, width: 300 },
    { title: "Authors", dataIndex: "authors", key: "authors", render: (authors: string[]) => authors?.join(", ") },
    { title: "Type", dataIndex: "type", key: "type", render: (type: string) => <Tag color="blue">{type}</Tag> },
    { title: "Venue", dataIndex: "venue", key: "venue" },
    { title: "Year", dataIndex: "publicationDate", key: "year", render: (date: string) => formatDate(date, "YYYY") },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_: any, record: any) => (
        <Space size="small">
          {record.url && <Button type="link" icon={<LinkOutlined />} onClick={() => window.open(record.url, "_blank")} />}
          <Button type="text" icon={<EditOutlined />} />
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Space>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <Card title="Publications" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>Add Publication</Button>}>
        <Table columns={columns as any} dataSource={Array.isArray(publications.items) ? publications.items : []} loading={publications.loading as any} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal title="Add Publication" open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={() => form.submit()} width={800}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
          <Form.Item name="title" label="Publication Title" rules={[{ required: true }]}>
            <Input placeholder="Enter publication title" />
          </Form.Item>
          <Form.Item name="authors" label="Authors" rules={[{ required: true }]}>
            <Select mode="tags" placeholder="Add authors in order" />
          </Form.Item>
          <Form.Item name="type" label="Publication Type" rules={[{ required: true }]}>
            <Select placeholder="Select type">
              <Select.Option value="Journal">Journal Article</Select.Option>
              <Select.Option value="Conference">Conference Paper</Select.Option>
              <Select.Option value="Book">Book</Select.Option>
              <Select.Option value="Book Chapter">Book Chapter</Select.Option>
              <Select.Option value="Technical Report">Technical Report</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="venue" label="Venue/Journal Name" rules={[{ required: true }]}>
            <Input placeholder="Journal or Conference name" />
          </Form.Item>
          <Form.Item name="abstract" label="Abstract">
            <TextArea rows={4} placeholder="Publication abstract" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="publicationDate" label="Publication Date">
              <DatePicker className="w-full" picker="month" />
            </Form.Item>
            <Form.Item name="doi" label="DOI">
              <Input placeholder="10.xxxx/xxxxx" />
            </Form.Item>
          </div>
          <Form.Item name="url" label="URL/Link">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="keywords" label="Keywords">
            <Select mode="tags" placeholder="Add keywords" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default PublicationsPage
