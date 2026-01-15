"use client"

import { useEffect, useState } from "react"
import {
  Card, Button, Table, Space, Tag, Modal, Form,
  Input, Select, DatePicker, message, Descriptions, Typography, Switch
} from "antd"
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  EyeOutlined, ExclamationCircleOutlined, CheckCircleOutlined,
  GlobalOutlined, EnvironmentOutlined
} from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import DataTable from "@/components/common/DataTable"
import {
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  publishEvent
} from "@/store/slices/eventsSlice"
import { formatDate } from "@/utils/helpers"
import dayjs from "dayjs"

const { TextArea } = Input
const { confirm } = Modal

const generateSlug = (text: string) =>
  text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")

const extractTextFromDoc = (doc: any): string => {
  if (!doc) return ''
  if (typeof doc === 'string') return doc
  if (typeof doc === 'object' && doc.content) {
    return doc.content.map((node: any) => {
      if (node.text) return node.text
      if (node.content) return extractTextFromDoc(node)
      return ''
    }).join(' ')
  }
  return ''
}

const EventsPage = () => {
  const dispatch = useAppDispatch()
  const { items, loading } = useAppSelector((state) => state.events)

  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)

  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(fetchEvents({ page: 1, limit: 50 }))
  }, [dispatch])

  const handleAdd = () => {
    setEditingEvent(null)
    form.resetFields()
    setIsFormModalOpen(true)
  }

  const handleEdit = (record: any) => {
    setEditingEvent(record)
    form.setFieldsValue({
      ...record,
      startAt: record.startAt ? dayjs(record.startAt) : null,
      endAt: record.endAt ? dayjs(record.endAt) : null,
    })
    setIsFormModalOpen(true)
  }

  const handleView = (record: any) => {
    setSelectedEvent(record)
    setIsViewModalOpen(true)
  }

  const handlePublish = async (id: string) => {
    try {
      await dispatch(publishEvent(id)).unwrap()
      message.success("Event published successfully")
    } catch (error) {
      message.error("Failed to publish event")
    }
  }

  const handleDelete = (id: string) => {
    confirm({
      title: 'Delete Event?',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete this event? This cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await dispatch(deleteEvent(id)).unwrap()
          message.success("Event deleted")
        } catch (error) {
          message.error("Delete failed")
        }
      },
    })
  }

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        slug: values.slug || generateSlug(values.title),
        startAt: values.startAt?.toISOString(),
        endAt: values.endAt?.toISOString(),
        isOnline: !!values.isOnline
      }

      if (editingEvent) {
        await dispatch(updateEvent({ id: editingEvent.id, data: payload })).unwrap()
        message.success("Event updated")
      } else {
        await dispatch(createEvent(payload)).unwrap()
        message.success("Event created")
      }
      setIsFormModalOpen(false)
    } catch (error) {
      message.error("Action failed")
    }
  }

  const columns = [
    {
      title: "Event Title",
      dataIndex: "title",
      key: "title",
      render: (text: string) => <Typography.Text strong>{text}</Typography.Text>
    },
    {
      title: "Date & Time",
      dataIndex: "startAt",
      key: "startAt",
      render: (date: string) => formatDate(date, "MMM DD, YYYY HH:mm")
    },
    {
      title: "Type",
      dataIndex: "isOnline",
      key: "isOnline",
      render: (online: boolean) => online ?
        <Tag icon={<GlobalOutlined />} color="cyan">Online</Tag> :
        <Tag icon={<EnvironmentOutlined />} color="geekblue">In-Person</Tag>
    },
    {
      title: "Status",
      dataIndex: "state",
      key: "state",
      render: (state: string) => {
        const colors: any = { PUBLISHED: "green", DRAFT: "orange", ARCHIVED: "red" }
        return <Tag color={colors[state]}>{state}</Tag>
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="text" icon={<EyeOutlined />} onClick={() => handleView(record)} />
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          {record.state === "DRAFT" && (
            <Button
              type="text"
              className="text-green-600"
              icon={<CheckCircleOutlined />}
              onClick={() => handlePublish(record.id)}
            />
          )}
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ]

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card
        title={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-lg font-semibold">Events Management</span>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              className="min-w-fit"
            >
              <span className="hidden sm:inline">Add Event</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        }
      >
        <DataTable
          columns={columns}
          dataSource={items}
          loading={loading}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => handleView(record),
            style: { cursor: 'pointer' }
          })}
          scroll={{ x: 800 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} events`,
          }}
          className="border-0"
          rowClassName={() => 'cursor-pointer hover:bg-gray-50'}
        />
      </Card>

      {/* CREATE / EDIT MODAL */}
      <Modal
        title={editingEvent ? "Edit Event" : "Create New Event"}
        open={isFormModalOpen}
        onCancel={() => setIsFormModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
        width={750}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="title" label="Event Title" rules={[{ required: true }]}>
              <Input onChange={(e) => {
                if (!editingEvent) form.setFieldValue('slug', generateSlug(e.target.value))
              }} />
            </Form.Item>
            <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="startAt" label="Start Date & Time" rules={[{ required: true }]}>
              <DatePicker className="w-full" showTime />
            </Form.Item>
            <Form.Item name="endAt" label="End Date & Time">
              <DatePicker className="w-full" showTime />
            </Form.Item>
          </div>

          <div className="grid grid-cols-3 gap-4 items-center">
            <Form.Item name="isOnline" label="Is Online?" valuePropName="checked" initialValue={false}>
              <Switch />
            </Form.Item>
            <Form.Item name="state" label="Status" initialValue="DRAFT" className="col-span-2">
              <Select>
                <Select.Option value="DRAFT">Draft</Select.Option>
                <Select.Option value="PUBLISHED">Published</Select.Option>
                <Select.Option value="ARCHIVED">Archived</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="location" label="Location / Venue (or Platform if Online)">
            <Input placeholder="e.g. Main Hall or Zoom Link" />
          </Form.Item>

          <Form.Item name="eventUrl" label="External Event URL (Optional)">
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item name="tags" label="Tags">
            <Select mode="tags" placeholder="Add keywords" />
          </Form.Item>
        </Form>
      </Modal>

      {/* VIEW MODAL */}
      <Modal
        title="Event Details"
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={[<Button key="close" onClick={() => setIsViewModalOpen(false)}>Close</Button>]}
        width={750}
      >
        {selectedEvent && (
          <Descriptions bordered column={2} className="mt-4">
            <Descriptions.Item label="Event Title" span={2}>{selectedEvent.title}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color="blue">{selectedEvent.state}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Type">
              {selectedEvent.isOnline ? "Online Event" : "Physical Venue"}
            </Descriptions.Item>
            <Descriptions.Item label="Starts">{formatDate(selectedEvent.startAt, "LLL")}</Descriptions.Item>
            <Descriptions.Item label="Ends">{selectedEvent.endAt ? formatDate(selectedEvent.endAt, "LLL") : "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Location" span={2}>{selectedEvent.location || "N/A"}</Descriptions.Item>
            {selectedEvent.eventUrl && (
              <Descriptions.Item label="Link" span={2}>
                <a href={selectedEvent.eventUrl} target="_blank" rel="noreferrer">{selectedEvent.eventUrl}</a>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Description" span={2}>
              <div className="whitespace-pre-wrap">
                {extractTextFromDoc(selectedEvent.description) || 'No description'}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Tags" span={2}>
              {selectedEvent.tags && Array.isArray(selectedEvent.tags) && selectedEvent.tags.length > 0 ? (
                selectedEvent.tags.map((t: any, idx: number) => {
                  if (typeof t === 'string') {
                    return <Tag key={idx}>{t}</Tag>
                  } else if (typeof t === 'object' && t !== null) {
                    const tagText = t.content || t.name || t.label || JSON.stringify(t)
                    return <Tag key={idx}>{tagText}</Tag>
                  }
                  return <Tag key={idx}>{String(t)}</Tag>
                })
              ) : (
                <span className="text-gray-400">No tags</span>
              )}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default EventsPage

