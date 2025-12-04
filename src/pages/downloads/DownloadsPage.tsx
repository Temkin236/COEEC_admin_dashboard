"use client"

import { useEffect, useState } from "react"
import { Card, Table, Button, Space, Tag, Upload, Modal, Form, Input, Select, message } from "antd"
import { UploadOutlined, DownloadOutlined, DeleteOutlined, FileOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchDownloads, uploadFile } from "@/store/slices/downloadSlice"
import { formatRelativeTime } from "@/utils/helpers"

const { TextArea } = Input

const DownloadsPage = () => {
  const dispatch = useAppDispatch()
  const { items, loading } = useAppSelector((state) => state.downloads)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [fileToUpload, setFileToUpload] = useState<any>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(fetchDownloads() as any)
  }, [dispatch])

  const handleUpload = async (values: any) => {
    if (!fileToUpload) {
      message.error("Please select a file")
      return
    }
    try {
      await dispatch(uploadFile({ file: fileToUpload, ...values }) as any).unwrap()
      message.success("File uploaded successfully")
      setIsModalOpen(false)
      form.resetFields()
      setFileToUpload(null)
    } catch (error) {
      message.error("Failed to upload file")
    }
  }

  const columns = [
    {
      title: "File Name",
      dataIndex: "title",
      key: "title",
      render: (title: string) => (
        <Space>
          <FileOutlined className="text-blue-500" />
          <span>{title}</span>
        </Space>
      ),
    },
    { title: "Category", dataIndex: "category", key: "category", render: (category: string) => <Tag color="blue">{category}</Tag> },
    { title: "Size", dataIndex: "size", key: "size", render: (size: number) => `${(size / 1024).toFixed(2)} KB` },
    { title: "Uploaded", dataIndex: "createdAt", key: "createdAt", render: (date: string | Date) => formatRelativeTime(date) },
    { title: "Downloads", dataIndex: "downloadCount", key: "downloads" },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" icon={<DownloadOutlined />} onClick={() => window.open(record.url, "_blank")}>Download</Button>
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Space>
      ),
    },
  ]

  const mockData = [
    { id: 1, title: "Admission Form 2024", category: "Forms", size: 2048000, createdAt: new Date("2024-01-15"), downloadCount: 156, url: "#" },
    { id: 2, title: "Course Syllabus - CS101", category: "Academic", size: 512000, createdAt: new Date("2024-02-01"), downloadCount: 89, url: "#" },
  ]

  return (
    <div className="space-y-4">
      <Card title="Download Center" extra={<Button type="primary" icon={<UploadOutlined />} onClick={() => setIsModalOpen(true)}>Upload File</Button>}>
        <Table columns={columns as any} dataSource={Array.isArray(mockData) ? mockData : []} loading={!!loading} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal title="Upload File" open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={() => form.submit()}>
        <Form form={form} layout="vertical" onFinish={handleUpload} className="mt-4">
          <Form.Item name="title" label="File Title" rules={[{ required: true, message: "Please enter file title" }]}>
            <Input placeholder="Enter file title" />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}> 
            <Select placeholder="Select category">
              <Select.Option value="Forms">Forms</Select.Option>
              <Select.Option value="Policies">Policies</Select.Option>
              <Select.Option value="Templates">Templates</Select.Option>
              <Select.Option value="Academic">Academic</Select.Option>
              <Select.Option value="Guides">Guides</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Description"> 
            <TextArea rows={3} placeholder="Brief description of the file" />
          </Form.Item>
          <Form.Item label="File"> 
            <Upload maxCount={1} beforeUpload={(file) => { setFileToUpload(file); return false }} onRemove={() => setFileToUpload(null)}>
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default DownloadsPage
