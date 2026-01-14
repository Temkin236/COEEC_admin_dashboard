"use client"

import { useEffect, useState } from "react"
import { Card, Button, Space, Tag, Upload, Modal, Form, Input, Select, message } from "antd"
import DataTable from "@/components/common/DataTable"
import { UploadOutlined, DownloadOutlined, DeleteOutlined, FileOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchDownloads, uploadFile, removeDownload, incrementDownloadCount } from "@/store/slices/downloadSlice"
import { formatRelativeTime } from "@/utils/helpers"
import { usePermissions } from "@/hooks/usePermissions"

const { TextArea } = Input

const DownloadsPage = () => {
  const dispatch = useAppDispatch()
  const { items, loading } = useAppSelector((state) => state.downloads)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [fileToUpload, setFileToUpload] = useState<any>(null)
  const [form] = Form.useForm()
  const { canCreate, canDelete, canView } = usePermissions()

  const hasDownloadsCreate = canCreate("downloads")
  const hasDownloadsDelete = canDelete("downloads")
  const hasDownloadsView = canView("downloads")

  useEffect(() => {
    dispatch(fetchDownloads({ page: 1, limit: 10 }) as any)
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

  const onDownload = (record: any) => {
    const url = record?.url
    if (!url || url === "#") {
      message.warning("No file URL available")
      return
    }
    try {
      window.open(url, "_blank")
      dispatch(incrementDownloadCount(record.id) as any)
    } catch (e) {
      message.error("Failed to open file")
    }
  }

  const onDelete = (record: any) => {
    Modal.confirm({
      title: "Delete file",
      content: `Remove "${record.title}" from downloads?`,
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: () => {
        dispatch(removeDownload(record.id) as any)
        message.success("Removed")
      },
    })
  }

  const columns = [
    {
      title: "File Name",
      dataIndex: "title",
      key: "title",
      render: (title: string) => (
        <Space>
          <FileOutlined className="text-primary-600" />
          <span>{title}</span>
        </Space>
      ),
    },
    { title: "Category", dataIndex: "category", key: "category", render: (category: string) => <Tag color="processing">{category}</Tag> },
    { title: "Size", dataIndex: "size", key: "size", render: (size: number) => `${(size / 1024).toFixed(2)} KB`, responsive: ["md"] },
    { title: "Uploaded", dataIndex: "createdAt", key: "createdAt", render: (date: string | Date) => formatRelativeTime(date), responsive: ["md"] },
    { title: "Downloads", dataIndex: "downloadCount", key: "downloads", responsive: ["sm"] },
    ...((hasDownloadsView || hasDownloadsDelete) ? [{
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          {hasDownloadsView && (
            <Button type="link" size="small" icon={<DownloadOutlined />} onClick={() => onDownload(record)}>
              Download
            </Button>
          )}
          {hasDownloadsDelete && (
            <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => onDelete(record)} />
          )}
        </Space>
      ),
    }] : []),
  ]

  const mockData = [
    { id: 1, title: "Admission Form 2024", category: "Forms", size: 2048000, createdAt: new Date("2024-01-15"), downloadCount: 156, url: "" },
    { id: 2, title: "Course Syllabus - CS101", category: "Academic", size: 512000, createdAt: new Date("2024-02-01"), downloadCount: 89, url: "" },
  ]

  return (
    <div className="space-y-4 p-2 sm:p-4">
      <Card 
        title="Download Center" 
        extra={
          hasDownloadsCreate && (
            <Button type="primary" icon={<UploadOutlined />} onClick={() => setIsModalOpen(true)}>
              Upload File
            </Button>
          )
        }
      >
        <div className="overflow-x-auto">
          <DataTable
            columns={columns as any}
            dataSource={Array.isArray(items) && items.length ? items : mockData}
            loading={!!loading}
            rowKey="id"
            pagination={{ pageSize: 10, responsive: true }}
            scroll={{ x: 700 }}
            size="small"
          />
        </div>
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
