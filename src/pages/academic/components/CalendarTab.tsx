import React, { useState, useEffect } from 'react'
import { Card, Select, Button, Row, Col, Modal, Form, Input, DatePicker, Tag, Space, message, Divider } from 'antd'
import DataTable from "@/components/common/DataTable"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { createCalendar, deleteCalendar, fetchCalendars, publishCalendar, updateCalendar } from "@/store/slices/calendarSlice"
import { createEvent, deleteEvent, fetchEvents, publishEvent, updateEvent } from "@/store/slices/eventsSlice"
import { usePermissions } from "@/hooks/usePermissions"
import TableActions from "@/components/common/TableActions"
import dayjs from 'dayjs'
import { DeleteOutlined, EditOutlined } from "@ant-design/icons"

const CalendarTab = ({ handleDownloadPdf }: { handleDownloadPdf: () => void }) => {
  const dispatch = useAppDispatch()
  const { calendars, loading: calendarsLoading } = useAppSelector((state) => state.calendar)
  const { items: events, loading: eventsLoading } = useAppSelector((state) => state.events)
  
  const [activeCalendar, setActiveCalendar] = useState<any | null>(null)
  const [calendarModalOpen, setCalendarModalOpen] = useState(false)
  const [calendarEditing, setCalendarEditing] = useState<any | null>(null)
  const [calendarForm] = Form.useForm()
  const [calendarView, setCalendarView] = useState<any | null>(null)
  const [calendarViewModalOpen, setCalendarViewModalOpen] = useState(false)
  
  const [academicCalendarModalOpen, setAcademicCalendarModalOpen] = useState(false)
  const [academicCalendarForm] = Form.useForm()
  const [editingAcademicCalendar, setEditingAcademicCalendar] = useState<any | null>(null)

  const { canView, canCreate, canUpdate, canDelete, can } = usePermissions()
  const hasCalendarCreate = canCreate("calendar")
  const hasCalendarUpdate = canUpdate("calendar")
  const hasCalendarDelete = canDelete("calendar")
  const hasNewsView = canView("news") || canView("announcements")
  const hasNewsUpdate = canUpdate("news")
  const hasNewsDelete = canDelete("news")

  // Announcements state (local for now as per original file)
  const [announcements, setAnnouncements] = useState<any[]>([
    { id: 1, title: 'Exam Schedule Change', createdAt: dayjs().subtract(2, 'hour'), body: 'The mid-term exam for ECE302 has been rescheduled to Nov 12.' },
    { id: 2, title: 'Library Hours Extended', createdAt: dayjs().subtract(1, 'day'), body: 'During exam week, the main library will remain open until midnight.' },
    { id: 3, title: 'Scholarship Deadline', createdAt: dayjs().subtract(3, 'day'), body: 'Applications for the DAAD scholarship are due by Friday.' },
  ])
  const [annModalOpen, setAnnModalOpen] = useState(false)
  const [annForm] = Form.useForm()
  const [annArchiveOpen, setAnnArchiveOpen] = useState(false)

  // Filter events based on active calendar
  const filteredEvents = activeCalendar
    ? events.filter((e: any) => e.academicCalendarId === activeCalendar.id || e.calendarId === activeCalendar.id)
    : []

  useEffect(() => {
    dispatch(fetchCalendars())
    dispatch(fetchEvents())
  }, [dispatch])

  useEffect(() => {
    if (calendars.length > 0 && !activeCalendar) {
      setActiveCalendar(calendars[0])
    }
  }, [calendars, activeCalendar])

  const openAddAcademicCalendar = () => {
    setEditingAcademicCalendar(null)
    academicCalendarForm.resetFields()
    setAcademicCalendarModalOpen(true)
  }

  const openEditAcademicCalendar = (record: any) => {
    setEditingAcademicCalendar(record)
    academicCalendarForm.setFieldsValue({
      title: record.title,
      academicYear: record.academicYear,
      semester: record.semester,
    })
    setAcademicCalendarModalOpen(true)
  }

  const handleAcademicCalendarSubmit = async (values: any) => {
    const payload = {
      title: values.title,
      academicYear: values.academicYear,
      semester: values.semester,
    }

    try {
      if (editingAcademicCalendar) {
        await dispatch(updateCalendar({ id: editingAcademicCalendar.id, data: payload })).unwrap()
        message.success("Academic calendar updated successfully!")
      } else {
        await dispatch(createCalendar(payload)).unwrap()
        message.success("Academic calendar created successfully!")
      }
      setAcademicCalendarModalOpen(false)
      academicCalendarForm.resetFields()
      setEditingAcademicCalendar(null)
      dispatch(fetchCalendars())
    } catch (err: any) {
      message.error(err?.message || 'Failed to save academic calendar')
    }
  }

  const handleDeleteAcademicCalendar = async (id: string | number) => {
    Modal.confirm({
      title: 'Delete Academic Calendar',
      content: 'Are you sure you want to delete this academic calendar? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await dispatch(deleteCalendar(id)).unwrap()
          message.success('Academic calendar deleted successfully!')
          dispatch(fetchCalendars())
          if (activeCalendar?.id === id) {
            setActiveCalendar(null)
          }
        } catch (err: any) {
          message.error(err?.message || 'Failed to delete academic calendar')
        }
      }
    })
  }

  const handlePublishCalendar = async (id?: string | number) => {
    const calendarId = id || activeCalendar?.id
    if (!calendarId) {
      message.error('No active calendar to publish')
      return
    }

    try {
      await dispatch(publishCalendar(calendarId)).unwrap()
      message.success('Calendar published successfully!')
      dispatch(fetchCalendars())
    } catch (err: any) {
      message.error(err?.message || 'Failed to publish calendar')
    }
  }

  const openAddCalendar = () => { 
    setCalendarEditing(null); 
    calendarForm.resetFields(); 
    setCalendarModalOpen(true) 
  }

  const openEditCalendar = (record: any) => { 
    setCalendarEditing(record); 
    calendarForm.setFieldsValue({
      title: record.title,
      slug: record.slug,
      description: record.description,
      startDate: record.startAt ? dayjs(record.startAt) : (record.startDate ? dayjs(record.startDate) : null),
      endDate: record.endAt ? dayjs(record.endAt) : (record.endDate ? dayjs(record.endDate) : null),
    }); 
    setCalendarModalOpen(true) 
  }

  const openViewCalendar = (record: any) => {
    setCalendarView(record)
    setCalendarViewModalOpen(true)
  }

  const handleDeleteCalendarEvent = (id: number | string) => { 
    Modal.confirm({ 
      title: 'Delete Event', 
      content: 'Delete this event?', 
      async onOk() { 
        try {
          await dispatch(deleteEvent(id)).unwrap()
          message.success('Event deleted')
          dispatch(fetchEvents())
        } catch (err: any) {
          message.error(err?.message || 'Failed to delete event')
        }
      } 
    }) 
  }

  const handleCalendarSubmit = async (values: any) => {
    const eventPayload = {
      title: values.title,
      slug: values.slug,
      startAt: values.startDate ? values.startDate.toDate() : new Date(),
      endAt: values.endDate ? values.endDate.toDate() : new Date(),
      description: values.description || '',
    }

    try {
      if (calendarEditing) {
        await dispatch(updateEvent({ id: calendarEditing.id, data: eventPayload })).unwrap()
        message.success('Event updated')
      } else {
        await dispatch(createEvent(eventPayload)).unwrap()
        message.success('Event added')
      }
      setCalendarModalOpen(false)
      setCalendarEditing(null)
      calendarForm.resetFields()
      dispatch(fetchEvents())
    } catch (err: any) {
      message.error(err?.message || 'Failed to save event')
    }
  }

  const handlePublishEvent = async (id: string | number) => {
    try {
      await dispatch(publishEvent(id)).unwrap()
      message.success("Event published successfully!")
      dispatch(fetchEvents())
    } catch (err: any) {
      message.error(err?.message || "Failed to publish event")
    }
  }

  const handleDeleteAnnouncement = (id: number) => {
    Modal.confirm({ title: 'Delete Announcement', content: 'Are you sure?', onOk() { setAnnouncements(prev => prev.filter(a => a.id !== id)); message.success('Announcement deleted') } })
  }

  const academicCalendarColumns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Academic Year', dataIndex: 'academicYear', key: 'academicYear' },
    { title: 'Semester', dataIndex: 'semester', key: 'semester' },
    { 
      title: 'Status', 
      dataIndex: 'state', 
      key: 'state', 
      render: (state: string) => (
        <Tag color={state === 'PUBLISHED' ? 'green' : 'orange'}>{state || 'DRAFT'}</Tag>
      )
    },
    { 
      title: 'Actions', 
      key: 'actions', 
      render: (_: any, record: any) => {
        const currentState = record.state || 'DRAFT'
        return (
          <Space>
            <TableActions
              resource="calendar"
              onView={() => { /* no view for academic calendar row */ }}
              onEdit={() => openEditAcademicCalendar(record)}
              onDelete={() => handleDeleteAcademicCalendar(record.id)}
              record={record}
              allowEditIfOwner={false}
            />
            {currentState !== 'PUBLISHED' && can('calendar', 'publish') && (
              <Button 
                type="primary" 
                size="small"
                onClick={() => handlePublishCalendar(record.id)}
              >
                Publish
              </Button>
            )}
          </Space>
        )
      }
    }
  ]

  const calendarColumns = [
    { 
      title: 'Start Date', 
      dataIndex: 'startAt', 
      key: 'startAt', 
      render: (date: string, record: any) => {
        const dateValue = date || record.startDate
        return dateValue ? dayjs(dateValue).format('MMM D, YYYY HH:mm') : 'N/A'
      }
    },
    { 
      title: 'End Date', 
      dataIndex: 'endAt', 
      key: 'endAt', 
      render: (date: string, record: any) => {
        const dateValue = date || record.endDate
        return dateValue ? dayjs(dateValue).format('MMM D, YYYY HH:mm') : 'N/A'
      }
    },
    { title: 'Event', dataIndex: 'title', key: 'title' },
    { 
      title: 'Status', 
      dataIndex: 'state', 
      key: 'state', 
      render: (state: string, record: any) => {
        const currentState = state || record.status || 'DRAFT'
        return <Tag color={currentState === 'PUBLISHED' ? 'green' : 'orange'}>{currentState}</Tag>
      } 
    },
    { 
      title: 'Actions', 
      key: 'actions', 
      render: (_: any, record: any) => {
        const currentState = record.state || record.status || 'DRAFT'
        return (
          <Space>
            <TableActions
              resource="events"
              onView={() => openViewCalendar(record)}
              onEdit={() => openEditCalendar(record)}
              onDelete={() => handleDeleteCalendarEvent(record.id)}
              record={record}
              allowEditIfOwner={false}
            />
            {currentState !== 'PUBLISHED' && can('events', 'publish') && (
              <Button 
                type="primary" 
                size="small"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  handlePublishEvent(record.id); 
                }}
              >
                Publish
              </Button>
            )}
          </Space>
        )
      },
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="text-2xl font-bold text-blue-900 mb-2">Academic Calendar</div>
          {calendars.length > 0 ? (
            <Select
              style={{ width: 300 }}
              placeholder="Select academic calendar"
              value={activeCalendar?.id}
              onChange={(id) => {
                const selected = calendars.find((c: any) => c.id === id)
                setActiveCalendar(selected || null)
              }}
            >
              {calendars.map((cal: any) => (
                <Select.Option key={cal.id} value={cal.id}>
                  {cal.title} - {cal.academicYear} ({cal.semester})
                </Select.Option>
              ))}
            </Select>
          ) : (
            <div className="text-sm text-gray-500">No academic calendars available. Create one to get started.</div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <a className="text-blue-700 mr-4 cursor-pointer" onClick={() => handleDownloadPdf()}>Download PDF</a>
          {hasCalendarCreate && (
            <Button type="primary" onClick={() => openAddAcademicCalendar()}>New Academic Calendar</Button>
          )}
          {hasCalendarCreate && (
            <Button type="primary" onClick={() => openAddCalendar()}>Add Event</Button>
          )}
        </div>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card title="Academic Calendars" className="mb-4">
            <DataTable
              columns={academicCalendarColumns as any}
              dataSource={calendars}
              rowKey="id"
              pagination={false}
              loading={calendarsLoading}
            />
          </Card>

          <Card title="Events" className="mb-4">
            <DataTable
              columns={calendarColumns as any}
              dataSource={filteredEvents}
              rowKey="id"
              pagination={false}
              loading={eventsLoading}
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card>
            <div className="text-xl font-semibold">Announcements</div>
            <Divider />
            <div className="text-sm text-gray-600 mb-4">
                {announcements.map((a) => (
                  <div key={a.id} className="mb-4 cursor-pointer hover:bg-gray-50 p-2 rounded" onClick={() => {
                    if (hasNewsView) {
                      annForm.setFieldsValue({ title: a.title, body: a.body });
                      setAnnModalOpen(true);
                    } else {
                      message.warning('You do not have permission to view announcements')
                    }
                  }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{a.title}</div>
                        <div className="text-xs text-gray-400">{a.createdAt.format('MMM D, YYYY HH:mm')}</div>
                      </div>
                      <div className="ml-4">
                        {hasNewsUpdate && (
                          <Button type="text" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); annForm.setFieldsValue({ title: a.title, body: a.body }); setAnnModalOpen(true); }} />
                        )}
                        {hasNewsDelete && (
                          <Button type="text" danger icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); handleDeleteAnnouncement(a.id) }} />
                        )}
                      </div>
                    </div>
                    <div className="mt-2 text-gray-600">{a.body}</div>
                  </div>
                ))}

              <div className="mt-4">
                <Button block onClick={() => setAnnArchiveOpen(true)}>View All Archives</Button>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Modals */}
      <Modal
        title={calendarEditing ? "Edit Event" : "Add Event"}
        open={calendarModalOpen}
        onCancel={() => setCalendarModalOpen(false)}
        onOk={() => calendarForm.submit()}
      >
        <Form form={calendarForm} layout="vertical" onFinish={handleCalendarSubmit}>
          <Form.Item name="title" label="Event Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="slug" label="Slug">
            <Input placeholder="auto-generated if empty" />
          </Form.Item>
          <Form.Item name="startDate" label="Start Date" rules={[{ required: true }]}>
            <DatePicker showTime className="w-full" />
          </Form.Item>
          <Form.Item name="endDate" label="End Date" rules={[{ required: true }]}>
            <DatePicker showTime className="w-full" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingAcademicCalendar ? "Edit Academic Calendar" : "New Academic Calendar"}
        open={academicCalendarModalOpen}
        onCancel={() => setAcademicCalendarModalOpen(false)}
        onOk={() => academicCalendarForm.submit()}
      >
        <Form form={academicCalendarForm} layout="vertical" onFinish={handleAcademicCalendarSubmit}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. 2023-2024 Academic Year" />
          </Form.Item>
          <Form.Item name="academicYear" label="Academic Year" rules={[{ required: true }]}>
            <Input placeholder="e.g. 2023-2024" />
          </Form.Item>
          <Form.Item name="semester" label="Semester" rules={[{ required: true }]}>
            <Select options={[
              { value: 'Fall', label: 'Fall' },
              { value: 'Spring', label: 'Spring' },
              { value: 'Summer', label: 'Summer' },
            ]} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Event Details"
        open={calendarViewModalOpen}
        onCancel={() => setCalendarViewModalOpen(false)}
        footer={[<Button key="close" onClick={() => setCalendarViewModalOpen(false)}>Close</Button>]}
      >
        {calendarView && (
          <div>
            <h3>{calendarView.title}</h3>
            <p>{calendarView.description}</p>
            <p>Start: {dayjs(calendarView.startAt || calendarView.startDate).format('MMM D, YYYY HH:mm')}</p>
            <p>End: {dayjs(calendarView.endAt || calendarView.endDate).format('MMM D, YYYY HH:mm')}</p>
          </div>
        )}
      </Modal>

      <Modal
        title="Announcement"
        open={annModalOpen}
        onCancel={() => setAnnModalOpen(false)}
        footer={null}
      >
        <Form form={annForm}>
           <Form.Item name="title" label="Title"><Input readOnly /></Form.Item>
           <Form.Item name="body" label="Body"><Input.TextArea readOnly /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default CalendarTab
