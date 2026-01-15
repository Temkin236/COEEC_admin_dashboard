"use client"

import { useEffect, useState } from "react"
import {
  Card, Button, Table, Space, Tag, Modal, Form,
  Input, Select, DatePicker, message, Descriptions, Typography, Switch,
  Divider, Tabs, Upload
} from "antd"
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  EyeOutlined, ExclamationCircleOutlined, CheckCircleOutlined,
  GlobalOutlined, EnvironmentOutlined, InboxOutlined
} from "@ant-design/icons"
import type { UploadFile, UploadProps } from 'antd/es/upload/interface'
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
import axiosInstance from "@/utils/axios"
import dayjs from "dayjs"

const { TextArea } = Input
const { confirm } = Modal

const generateSlug = (text: string) =>
  text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")

const languageOptions = [
  { key: 'EN', label: 'English' },
  { key: 'AM', label: 'Amharic' },
  { key: 'OM', label: 'Afaan Oromo' },
]

const EventsPage = () => {
  const dispatch = useAppDispatch()
  const { items, loading } = useAppSelector((state) => state.events)

  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("ALL")

  // For multi-language form management
  const [currentFormLang, setCurrentFormLang] = useState('EN')
  const [drafts, setDrafts] = useState<Record<string, any>>({})

  // For view modal language selection
  const [currentViewLang, setCurrentViewLang] = useState('EN')

  // Media upload state
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(fetchEvents({ page: 1, limit: 50, state: activeTab }))
  }, [dispatch, activeTab])

  const handleAdd = () => {
    setEditingEvent(null)
    setDrafts({})
    setCurrentFormLang('EN')
    setFileList([])
    form.resetFields()
    setIsFormModalOpen(true)
  }

  const handleEdit = (record: any) => {
    setEditingEvent(record)
    setCurrentFormLang('EN')

    // Prepare drafts for all available translations
    const initialDrafts: Record<string, any> = {}
    record.translations?.forEach((t: any) => {
      initialDrafts[t.language] = {
        title: t.title,
        slug: t.slug,
        description: t.description,
        location: t.location
      }
    })

    setDrafts(initialDrafts)

    // Set initial form values from English or first available translation
    const enData = initialDrafts['EN'] || Object.values(initialDrafts)[0] || {}

    form.setFieldsValue({
      ...record,
      ...enData,
      startAt: record.startAt ? dayjs(record.startAt) : null,
      endAt: record.endAt ? dayjs(record.endAt) : null,
    })

    if (record.featuredImage?.url) {
      setFileList([{
        uid: '-1',
        name: 'image.png',
        status: 'done',
        url: record.featuredImage.url,
      }])
    } else {
      setFileList([])
    }

    setIsFormModalOpen(true)
  }

  const handleFormLanguageChange = (newLang: string) => {
    // Save current fields to draft
    const currentValues = form.getFieldsValue(['title', 'slug', 'description', 'location'])
    setDrafts(prev => ({
      ...prev,
      [currentFormLang]: currentValues
    }))

    // Load new language data from draft
    const nextDraft = drafts[newLang] || {}
    form.setFieldsValue({
      title: nextDraft.title || '',
      slug: nextDraft.slug || '',
      description: nextDraft.description || '',
      location: nextDraft.location || ''
    })
    setCurrentFormLang(newLang)
  }

  const handleView = (record: any) => {
    setSelectedEvent(record)
    // Default to EN or whatever translation exists
    const availableLang = record.translations?.find((t: any) => t.language === 'EN') ? 'EN' :
      record.translations?.[0]?.language || 'EN'
    setCurrentViewLang(availableLang)
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

  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await axiosInstance.post('/media/upload', formData)
      onSuccess(res.data)
      form.setFieldValue('featuredImageId', res.data.id)
      message.success('Image uploaded successfully')
    } catch (err) {
      onError(err)
      message.error('Upload failed')
    }
  }

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList)
  }

  const handleSubmit = async (values: any) => {
    try {
      // Finalize the current language's draft
      const currentValues = form.getFieldsValue(['title', 'slug', 'description', 'location'])
      const finalDrafts = { ...drafts, [currentFormLang]: currentValues }

      const languages: Record<string, any> = {}

      Object.entries(finalDrafts).forEach(([lang, data]: [string, any]) => {
        if (data.title) {
          languages[lang] = {
            title: data.title,
            slug: data.slug || generateSlug(data.title),
            description: data.description,
            location: data.location
          }
        }
      })

      if (Object.keys(languages).length === 0 || !languages['EN']) {
        message.error("Please provide at least the English translation.")
        return
      }

      const payload = {
        languages,
        startAt: values.startAt?.toISOString(),
        endAt: values.endAt?.toISOString(),
        isOnline: !!values.isOnline,
        state: values.state,
        eventUrl: values.eventUrl,
        tags: values.tags,
        featuredImageId: fileList[0]?.response?.id || editingEvent?.featuredImageId,
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

  const getTranslation = (record: any, lang: string) => {
    return record.translations?.find((t: any) => t.language === lang) || record.translations?.[0]
  }

  const columns = [
    {
      title: "Event Title (EN)",
      key: "title_en",
      render: (_: any, record: any) => {
        const enTrans = record.translations?.find((t: any) => t.language === 'EN')
        return <Typography.Text strong>{enTrans?.title || record.title || "Untitled"}</Typography.Text>
      }
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
        <Tag icon={<GlobalOutlined />} color="cyan" className="rounded-full">Online</Tag> :
        <Tag icon={<EnvironmentOutlined />} color="geekblue" className="rounded-full">In-Person</Tag>
    },
    {
      title: "Status",
      dataIndex: "state",
      key: "state",
      render: (state: string) => {
        const colors: any = { PUBLISHED: "green", DRAFT: "orange", ARCHIVED: "red", NEEDS_REVIEW: "blue" }
        return <Tag color={colors[state]} className="rounded-md font-medium">{state}</Tag>
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 140,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)} />
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ]

  const viewContent = selectedEvent ? getTranslation(selectedEvent, currentViewLang) : null

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gray-50/30 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <Typography.Title level={2} className="!mb-1">Events Management</Typography.Title>
          <Typography.Text type="secondary">Organize, schedule, and promote upcoming events and activities.</Typography.Text>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          className="rounded-xl shadow-md px-6 h-12 flex items-center gap-2"
        >
          Create New Event
        </Button>
      </div>

      <Card className="shadow-sm border-gray-100 rounded-2xl overflow-hidden" bodyStyle={{ padding: 0 }}>
        <div className="px-6 pt-4 border-b border-gray-100 bg-white">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            className="events-filter-tabs"
            items={[
              { key: "ALL", label: "All Events" },
              { key: "PUBLISHED", label: "Published" },
              { key: "DRAFT", label: "Drafts" },
              { key: "NEEDS_REVIEW", label: "Needs Review" },
              { key: "ARCHIVED", label: "Archived" },
            ]}
          />
        </div>
        <div className="p-4 bg-white">
          <DataTable
            columns={columns}
            dataSource={items}
            loading={loading}
            rowKey="id"
            onRow={(record) => ({
              onClick: () => handleView(record),
              className: "cursor-pointer group hover:bg-blue-50/30 transition-colors"
            })}
            scroll={{ x: 800 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} events`,
            }}
          />
        </div>
      </Card>

      {/* CREATE / EDIT MODAL */}
      <Modal
        title={
          <div className="flex items-center gap-2 py-1">
            <Typography.Title level={4} style={{ margin: 0 }}>
              {editingEvent ? "Edit Event Details" : "Create New Event"}
            </Typography.Title>
          </div>
        }
        open={isFormModalOpen}
        onCancel={() => setIsFormModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
        width={1000}
        centered
        className="news-modal" // Reusing styling
        okText={editingEvent ? "Update Event" : "Create Event"}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-6">
          <Form.Item name="featuredImageId" hidden><Input /></Form.Item>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                <div className="bg-gray-50/50 px-4 py-2 border-b border-gray-100">
                  <Tabs
                    activeKey={currentFormLang}
                    onChange={handleFormLanguageChange}
                    type="line"
                    size="small"
                    items={languageOptions.map(opt => ({
                      key: opt.key,
                      label: (
                        <span className="flex items-center gap-2">
                          <GlobalOutlined className="text-xs" />
                          {opt.label}
                        </span>
                      )
                    }))}
                  />
                </div>

                <div className="p-5 space-y-5">
                  <Form.Item
                    name="title"
                    label={<span className="font-semibold text-gray-700">Event Title ({currentFormLang})</span>}
                    rules={[{ required: currentFormLang === "EN", message: 'Please enter a title' }]}
                  >
                    <Input
                      size="large"
                      placeholder={`Enter the ${currentFormLang} event title...`}
                      className="rounded-lg"
                      onChange={(e) => {
                        if (!editingEvent && currentFormLang === 'EN') {
                          form.setFieldValue('slug', generateSlug(e.target.value))
                        }
                      }}
                    />
                  </Form.Item>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                      name="slug"
                      label={<span className="font-semibold text-gray-700">URL Slug</span>}
                      rules={[{ required: currentFormLang === "EN" }]}
                      extra="The unique path for this event page"
                    >
                      <Input placeholder="e.g. annual-gathering-2024" className="rounded-lg" />
                    </Form.Item>

                    <Form.Item
                      name="location"
                      label={<span className="font-semibold text-gray-700">Venue / Location</span>}
                    >
                      <Input prefix={<EnvironmentOutlined className="text-gray-400" />} placeholder="e.g. Conference Hall or Zoom Link" className="rounded-lg" />
                    </Form.Item>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                      name="startAt"
                      label={<span className="font-semibold text-gray-700">Start Date & Time</span>}
                      rules={[{ required: true }]}
                    >
                      <DatePicker className="w-full rounded-lg" showTime placeholder="Choose start time" />
                    </Form.Item>

                    <Form.Item
                      name="endAt"
                      label={<span className="font-semibold text-gray-700">End Date & Time</span>}
                    >
                      <DatePicker className="w-full rounded-lg" showTime placeholder="Choose end time (optional)" />
                    </Form.Item>
                  </div>

                  <Form.Item
                    name="description"
                    label={<span className="font-semibold text-gray-700">Event Description</span>}
                    rules={[{ required: currentFormLang === "EN" }]}
                  >
                    <TextArea
                      rows={10}
                      className="rounded-lg"
                      placeholder="Detail the event's purpose, agenda, and speakers..."
                    />
                  </Form.Item>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Card
                size="small"
                title={<span className="text-gray-800 font-bold">Event Banner</span>}
                className="shadow-sm border-gray-100 rounded-xl overflow-hidden"
              >
                <div className="flex justify-center py-2">
                  <Upload
                    customRequest={handleUpload}
                    onChange={handleChange}
                    fileList={fileList}
                    listType="picture-card"
                    maxCount={1}
                    className="avatar-uploader"
                  >
                    {fileList.length < 1 && (
                      <div className="upload-box">
                        <div className="flex flex-col items-center">
                          <PlusOutlined className="text-xl mb-2 text-primary-500" />
                          <div className="text-xs font-medium">Select Image</div>
                        </div>
                      </div>
                    )}
                  </Upload>
                </div>
                <div className="text-[10px] text-center text-gray-400 mt-2 px-2 italic">
                  Suggested: 16:9 aspect ratio (e.g. 1920x1080px).
                </div>
              </Card>

              <Card
                size="small"
                title={<span className="text-gray-800 font-bold">Event Config</span>}
                className="shadow-sm border-gray-100 rounded-xl overflow-hidden"
              >
                <Form.Item name="isOnline" valuePropName="checked" className="mb-4">
                  <div className="flex items-center justify-between bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Online Event?</span>
                    <Switch size="small" />
                  </div>
                </Form.Item>

                <Form.Item
                  name="state"
                  label={<span className="text-xs font-bold uppercase text-gray-500 tracking-wider">Publication State</span>}
                  initialValue="DRAFT"
                >
                  <Select className="w-full rounded-lg">
                    <Select.Option value="DRAFT">Draft</Select.Option>
                    <Select.Option value="NEEDS_REVIEW">Needs Review</Select.Option>
                    <Select.Option value="PUBLISHED">Published</Select.Option>
                    <Select.Option value="ARCHIVED">Archived</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="eventUrl"
                  label={<span className="text-xs font-bold uppercase text-gray-500 tracking-wider">External Link</span>}
                >
                  <Input placeholder="Registration URL..." className="rounded-lg" />
                </Form.Item>

                <Form.Item
                  name="tags"
                  label={<span className="text-xs font-bold uppercase text-gray-500 tracking-wider">Categorization</span>}
                >
                  <Select mode="tags" placeholder="Add keywords..." className="w-full rounded-lg" />
                </Form.Item>
              </Card>

              <div className="px-2">
                <Typography.Text type="secondary" className="text-[11px] block italic leading-tight">
                  Events are shared across specialized calendars based on categorization tags.
                </Typography.Text>
              </div>
            </div>
          </div>
        </Form>
      </Modal>

      {/* VIEW MODAL */}
      <Modal
        title={
          <div className="flex items-center gap-2 py-1">
            <CheckCircleOutlined className="text-primary-500" />
            <Typography.Title level={4} style={{ margin: 0 }}>Event Preview</Typography.Title>
          </div>
        }
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsViewModalOpen(false)} className="rounded-lg px-8 h-10">
            Close Preview
          </Button>
        ]}
        width={850}
        centered
        className="preview-modal"
      >
        {selectedEvent && (
          <div className="space-y-6 pt-4">
            <div className="bg-gray-50/80 p-1 rounded-xl border border-gray-100">
              <Tabs
                activeKey={currentViewLang}
                onChange={setCurrentViewLang}
                type="card"
                className="language-selector-tabs"
                items={languageOptions.map(opt => ({
                  key: opt.key,
                  label: opt.label,
                  disabled: !selectedEvent.translations?.some((t: any) => t.language === opt.key)
                }))}
              />
            </div>

            {viewContent ? (
              <div className="space-y-8 animate-in fade-in duration-300">
                <header className="space-y-4">
                  <Typography.Title level={2} className="text-blue-900 !mb-2 leading-tight">
                    {viewContent.title}
                  </Typography.Title>
                  <Space size="middle" split={<Divider type="vertical" />} className="flex-wrap">
                    <Tag color={
                      selectedEvent.state === 'PUBLISHED' ? "green" :
                        selectedEvent.state === 'DRAFT' ? "orange" :
                          selectedEvent.state === 'ARCHIVED' ? "red" : "blue"
                    } className="rounded-full px-3 m-0 font-medium">
                      {selectedEvent.state}
                    </Tag>
                    <Space size={4}>
                      <GlobalOutlined className="text-gray-400" />
                      <Typography.Text strong className="text-primary-600">{currentViewLang}</Typography.Text>
                    </Space>
                    <Typography.Text type="secondary">
                      {selectedEvent.isOnline ? 'Online Activity' : 'Physical Location'}
                    </Typography.Text>
                  </Space>
                </header>

                <Card size="small" className="bg-blue-50/30 border-blue-100 rounded-2xl shadow-sm">
                  <Descriptions column={2} className="p-2 custom-descriptions" bordered>
                    <Descriptions.Item label="Schedule" span={2}>
                      <div className="flex flex-col gap-1">
                        <div className="text-blue-900 font-semibold">
                          Starts: {formatDate(selectedEvent.startAt, "LLL")}
                        </div>
                        {selectedEvent.endAt && (
                          <div className="text-gray-500 text-xs italic">
                            Ends: {formatDate(selectedEvent.endAt, "LLL")}
                          </div>
                        )}
                      </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Location" span={2}>
                      <div className="flex items-start gap-2">
                        <EnvironmentOutlined className="mt-1 text-primary-500" />
                        <span className="text-gray-700">{viewContent.location || selectedEvent.location || 'N/A'}</span>
                      </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="URL Slug" span={1}>
                      <code className="bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-700 text-xs">
                        {viewContent.slug}
                      </code>
                    </Descriptions.Item>
                    <Descriptions.Item label="Keywords" span={1}>
                      <Space wrap>
                        {selectedEvent.tags?.map((tag: string) => (
                          <Tag key={tag} className="bg-white border-blue-100 text-blue-600 rounded-md m-0">
                            #{tag}
                          </Tag>
                        ))}
                      </Space>
                    </Descriptions.Item>
                    {selectedEvent.eventUrl && (
                      <Descriptions.Item label="External Link" span={2}>
                        <a href={selectedEvent.eventUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                          Open Registration/Event Page
                        </a>
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>

                <div className="px-2 pb-6">
                  <Typography.Title level={5} className="flex items-center gap-2 border-b pb-2 mb-4 text-gray-400 uppercase tracking-widest text-[10px] font-bold">
                    Additional Context / Description
                  </Typography.Title>
                  <div className="text-gray-800 text-lg leading-loose font-serif whitespace-pre-wrap">
                    {viewContent.description || 'No detailed description available for this translation.'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center space-y-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <InboxOutlined className="text-5xl text-gray-300" />
                <div>
                  <Typography.Text type="secondary" className="block text-lg">
                    No translation available for {languageOptions.find(o => o.key === currentViewLang)?.label}
                  </Typography.Text>
                  <Typography.Text type="secondary" className="text-sm">
                    Switch to another language or edit this event to add details.
                  </Typography.Text>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default EventsPage

