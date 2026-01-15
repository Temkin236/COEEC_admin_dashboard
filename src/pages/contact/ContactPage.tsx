"use client"

import { useEffect, useState } from "react"
import { Card, Tag, Button, Space, Modal, Descriptions, Tabs, message, Tooltip } from "antd"
import DataTable from "@/components/common/DataTable"
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

  const { canView, canUpdate, canDelete } = usePermissions()

  const hasContactView = canView("contact")
  const hasContactUpdate = canUpdate("contact")
  const hasContactHandle = canUpdate("contact")
  const hasContactDelete = canDelete("contact")

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
    { title: "Name", dataIndex: "name", key: "name" },
    { 
      title: "Category", 
      dataIndex: "category", 
      key: "category",
      render: (category: string) => category ? (
        <Tag color="cyan">{category}</Tag>
      ) : null
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
          {hasContactView && (
            <Tooltip title="View">
              <Button type="text" icon={<EyeOutlined />} onClick={() => handleView(record)} />
            </Tooltip>
          )}

          {hasContactHandle && !record.handledAt ? (
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

          {hasContactDelete && (
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
          )}
        </Space>
      ),
    },
  ]

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card
        title={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-lg font-semibold">Contact & Feedback</span>
          </div>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k)}
          items={[
            { key: "new", label: `New (${newItems.length})` },
            { key: "handled", label: `Handled (${handledItems.length})` },
          ]}
          className="mb-4"
        />
        <DataTable
          columns={columns}
          dataSource={activeTab === "new" ? newItems : handledItems}
          loading={loading}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => handleView(record),
            style: { cursor: 'pointer' }
          })}
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
            key="handle"
            type="primary"
            disabled={!!selected?.handledAt}
            onClick={async () => {
              if (selected && !selected.handledAt) {
                await handleStatusUpdate(selected.id)
                setViewModalOpen(false)
              }
            }}
          >
            {selected?.handledAt ? 'Already Handled' : 'Mark as Handled'}
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
