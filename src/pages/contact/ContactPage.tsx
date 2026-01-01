"use client"

import { useEffect, useState } from "react"
import { Card, Table, Tag, Button, Space, Modal, Descriptions, Tabs, message, Tooltip } from "antd"
import { EyeOutlined, CheckOutlined, DeleteOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchContacts, fetchContactById, deleteContact, handleContact } from "@/store/slices/contactSlice"
import { formatDate, formatRelativeTime } from "@/utils/helpers"
import { usePermissions } from "@/hooks/usePermissions"

const ContactPage = () => {
  const dispatch = useAppDispatch()
  const { items, loading, selected } = useAppSelector((state) => state.contact)

  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("new")

  const { canView, canUpdate, can } = usePermissions()

  const hasContactView = canView("contact")
  const hasContactUpdate = canUpdate("contact")
  const hasContactHandle = can && can("contact", "handle")
  const hasContactDelete = can && can("contact", "delete")

  useEffect(() => {
    dispatch(fetchContacts({ page: 1, limit: 10 }) as any)
  }, [dispatch])

  const newItems = Array.isArray(items) ? items.filter((i) => !i.handledAt) : []
  const handledItems = Array.isArray(items) ? items.filter((i) => !!i.handledAt) : []

  const handleView = async (record: any) => {
    await dispatch(fetchContactById(record.id) as any)
    setViewModalOpen(true)
  }

  const handleStatusUpdate = async (id: string | number) => {
    try {
      await dispatch(handleContact({ id }) as any).unwrap()
      message.success("Contact marked as handled")
      dispatch(fetchContacts({ page: 1, limit: 10 }) as any)
    } catch {
      message.error("Failed to update status")
    }
  }

  const handleDelete = async (id: string | number) => {
    Modal.confirm({
      title: "Delete Contact",
      content: "Are you sure you want to delete this message?",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        await dispatch(deleteContact(id) as any)
        message.success("Contact deleted")
      },
    })
  }

  const columns = [
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Subject", dataIndex: "subject", key: "subject", ellipsis: true },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colors: Record<string, string> = {
          new: "blue",
          read: "default",
          responded: "green",
          archived: "default",
        }
        return <Tag color={colors[status]}>{status}</Tag>
      },
    },
    {
      title: "Received",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => formatRelativeTime(date),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="View">
            <Button type="text" icon={<EyeOutlined />} onClick={() => handleView(record)} />
          </Tooltip>

          {!record.handledAt ? (
            <Tooltip title="Mark handled">
              <span>
                <Button
                  type="text"
                  icon={<CheckOutlined />}
                  onClick={() => handleStatusUpdate(record.id)}
                />
              </span>
            </Tooltip>
          ) : null}

          <Tooltip title="Delete">
            <span>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record.id)}
              />
            </span>
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <Card
        title="Contact & Feedback"
        extra={
          <Tabs activeKey={activeTab} onChange={(k) => setActiveTab(k)}>
            <Tabs.TabPane tab={`New (${newItems.length})`} key="new" />
            <Tabs.TabPane tab={`Handled (${handledItems.length})`} key="handled" />
          </Tabs>
        }
      >
        <Table
          columns={columns}
          dataSource={activeTab === "new" ? newItems : handledItems}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Message Details"
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setViewModalOpen(false)}>
            Close
          </Button>,
          <Button
            key="respond"
            type="primary"
            onClick={() => message.info("Respond feature coming soon")}
          >
            Respond
          </Button>,
        ]}
      >
        {selected && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Name">{selected.name}</Descriptions.Item>
            <Descriptions.Item label="Email">{selected.email}</Descriptions.Item>
            {selected.category && (
              <Descriptions.Item label="Category">{selected.category}</Descriptions.Item>
            )}
            <Descriptions.Item label="Message">{selected.message}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color="blue">{selected.status}</Tag>
            </Descriptions.Item>
            {selected.handledBy && (
              <Descriptions.Item label="Handled By">
                {selected.handledBy.displayName || selected.handledBy.id}
              </Descriptions.Item>
            )}
            {selected.handledAt && (
              <Descriptions.Item label="Handled At">
                {formatDate(selected.handledAt)}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Received">
              {formatDate(selected.createdAt)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default ContactPage
