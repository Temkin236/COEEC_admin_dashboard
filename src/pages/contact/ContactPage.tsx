"use client"

import { useEffect, useState } from "react"
import { Card, Table, Tag, Button, Space, Modal, Descriptions, Select, message } from "antd"
import { EyeOutlined, CheckOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchContacts, updateContactStatus } from "@/store/slices/contactSlice"
import { formatDate, formatRelativeTime } from "@/utils/helpers"

const ContactPage = () => {
  const dispatch = useAppDispatch()
  const { items, loading } = useAppSelector((state) => state.contact)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState<string>("")

  useEffect(() => {
    dispatch(fetchContacts({ page: 1, limit: 10, status: statusFilter }) as any)
  }, [dispatch, statusFilter])

  const handleView = (record: any) => {
    setSelectedMessage(record)
    setViewModalOpen(true)
  }

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await dispatch(updateContactStatus({ id, status }) as any).unwrap()
      message.success(`Message marked as ${status}`)
    } catch (error) {
      message.error("Failed to update status")
    }
  }

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Subject", dataIndex: "subject", key: "subject", ellipsis: true },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colors: Record<string, any> = {
          new: "blue",
          read: "default",
          responded: "success",
          archived: "default",
        }
        return <Tag color={colors[status]}>{status}</Tag>
      },
    },
    { title: "Received", dataIndex: "createdAt", key: "createdAt", render: (date: string | Date) => formatRelativeTime(date) },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} onClick={() => handleView(record)} />
          {record.status === "new" && (
            <Button type="text" icon={<CheckOutlined />} onClick={() => handleStatusUpdate(record.id, "responded")} />
          )}
        </Space>
      ),
    },
  ]

  const mockData = [
    { id: 1, name: "John Doe", email: "john@example.com", subject: "Inquiry about admission", message: "I would like to know more about the admission process...", status: "new", createdAt: new Date("2024-01-20") },
    { id: 2, name: "Jane Smith", email: "jane@example.com", subject: "Research collaboration", message: "I am interested in collaborating on a research project...", status: "responded", createdAt: new Date("2024-01-18") },
  ]

  return (
    <div className="space-y-4">
      <Card
        title="Contact & Feedback"
        extra={
          <Select placeholder="Filter by status" style={{ width: 150 }} onChange={setStatusFilter} allowClear>
            <Select.Option value="new">New</Select.Option>
            <Select.Option value="read">Read</Select.Option>
            <Select.Option value="responded">Responded</Select.Option>
            <Select.Option value="archived">Archived</Select.Option>
          </Select>
        }
      >
        <Table columns={columns as any} dataSource={mockData} loading={!!loading} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title="Message Details"
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalOpen(false)}>
            Close
          </Button>,
          <Button key="respond" type="primary" onClick={() => message.info("Respond feature coming soon")}>
            Respond
          </Button>,
        ]}
        width={700}
      >
        {selectedMessage && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Name">{selectedMessage.name}</Descriptions.Item>
            <Descriptions.Item label="Email">{selectedMessage.email}</Descriptions.Item>
            <Descriptions.Item label="Subject">{selectedMessage.subject}</Descriptions.Item>
            <Descriptions.Item label="Message">{selectedMessage.message}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color="blue">{selectedMessage.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Received">{formatDate(selectedMessage.createdAt)}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default ContactPage
