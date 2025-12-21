import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons"
import { Button, Card, Col, DatePicker, Divider, Form, Input, Modal, Row, Select, Space, Table, Tabs, Tag, message } from "antd"
import dayjs from 'dayjs'
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "../../store"
import { createCourse, deleteCourse, fetchCoursesByProgram, updateCourse, publishCourse } from "../../store/slices/academicSlice"
import { fetchDepartments } from "../../store/slices/departmentSlice"
import { createProgram, deleteProgram, fetchPrograms, updateProgram, publishProgram } from "../../store/slices/programsSlice"
import { fetchCalendars, createCalendar, updateCalendar, deleteCalendar, publishCalendar, addEventToCalendar, updateCalendarEvent, deleteCalendarEvent } from "../../store/slices/calendarSlice"

const { TabPane } = Tabs

const DEPARTMENTS = [
  "Software Engineering",
  "Computer Science Engineering",
  "Electronics and Communication Engineering",
  "Electrical Power Department",
]

const AcademicPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const programsState = useSelector((s: RootState) => s.programs)
  const academic = useSelector((s: RootState) => s.academic)
  const departmentsState = useSelector((s: RootState) => s.departments)
  const calendarState = useSelector((s: RootState) => s.calendar)
  
  const programs = programsState.items
  const departments = departmentsState.items
  const calendars = calendarState.calendars
  const [programNameOptions, setProgramNameOptions] = useState<string[]>([])
  const [newDeptInput, setNewDeptInput] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form] = Form.useForm()
  const [viewProgram, setViewProgram] = useState<any | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)

  const [calendarModalOpen, setCalendarModalOpen] = useState(false)
  const [calendarEditing, setCalendarEditing] = useState<any | null>(null)
  const [calendarForm] = Form.useForm()
  const [calendarView, setCalendarView] = useState<any | null>(null)
  const [calendarViewModalOpen, setCalendarViewModalOpen] = useState(false)

  // Use first calendar as active, or show all events from all calendars
  const activeCalendar = calendars.length > 0 ? calendars[0] : null
  const calendarEvents = activeCalendar?.events || []

  const calendarColumns = [
    { 
      title: 'Start Date', 
      dataIndex: 'startDate', 
      key: 'startDate', 
      render: (date: string) => date ? dayjs(date).format('MMM D, YYYY') : 'N/A' 
    },
    { 
      title: 'End Date', 
      dataIndex: 'endDate', 
      key: 'endDate', 
      render: (date: string) => date ? dayjs(date).format('MMM D, YYYY') : 'N/A' 
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
      render: (_: any, record: any) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); openEditCalendar(record) }} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); handleDeleteCalendarEvent(record.id) }} />
        </Space>
      ) 
    }
  ]

  const openAddCalendar = () => { 
    setCalendarEditing(null); 
    calendarForm.resetFields(); 
    setCalendarModalOpen(true) 
  }

  const openEditCalendar = (record: any) => { 
    setCalendarEditing(record); 
    calendarForm.setFieldsValue({
      title: record.title,
      description: record.description,
      startDate: record.startDate ? dayjs(record.startDate) : null,
      endDate: record.endDate ? dayjs(record.endDate) : null,
    }); 
    setCalendarModalOpen(true) 
  }

  const handleDeleteCalendarEvent = (id: number | string) => { 
    Modal.confirm({ 
      title: 'Delete Event', 
      content: 'Delete this calendar event?', 
      async onOk() { 
        try {
          await dispatch(deleteCalendarEvent(id)).unwrap()
          message.success('Event deleted')
          // Refresh calendars to get updated events
          dispatch(fetchCalendars())
        } catch (err: any) {
          message.error(err?.message || 'Failed to delete event')
        }
      } 
    }) 
  }

  const handleCalendarSubmit = async (values: any) => {
    if (!activeCalendar) {
      message.error('No active calendar found. Please create a calendar first.')
      return
    }

    const eventPayload = {
      title: values.title,
      description: values.description || '',
      startDate: values.startDate ? values.startDate.toISOString() : new Date().toISOString(),
      endDate: values.endDate ? values.endDate.toISOString() : new Date().toISOString(),
    }

    try {
      if (calendarEditing) {
        await dispatch(updateCalendarEvent({ eventId: calendarEditing.id, data: eventPayload })).unwrap()
        message.success('Event updated')
      } else {
        await dispatch(addEventToCalendar({ calendarId: activeCalendar.id, event: eventPayload })).unwrap()
        message.success('Event added')
      }
      setCalendarModalOpen(false)
      calendarForm.resetFields()
      // Refresh calendars to get updated events
      dispatch(fetchCalendars())
    } catch (err: any) {
      message.error(err?.message || 'Failed to save event')
    }
  }

  const handlePublishCalendar = async () => {
    if (!activeCalendar) {
      message.error('No active calendar to publish')
      return
    }

    try {
      await dispatch(publishCalendar(activeCalendar.id)).unwrap()
      message.success('Calendar published successfully!')
      dispatch(fetchCalendars())
    } catch (err: any) {
      message.error(err?.message || 'Failed to publish calendar')
    }
  }

  const handleDownloadPdf = () => {
    window.print()
  }

  const openViewCalendar = (record: any) => {
    setCalendarView(record)
    setCalendarViewModalOpen(true)
  }

  // Announcements state
  const [announcements, setAnnouncements] = useState<any[]>([
    { id: 1, title: 'Exam Schedule Change', createdAt: dayjs().subtract(2, 'hour'), body: 'The mid-term exam for ECE302 has been rescheduled to Nov 12.' },
    { id: 2, title: 'Library Hours Extended', createdAt: dayjs().subtract(1, 'day'), body: 'During exam week, the main library will remain open until midnight.' },
    { id: 3, title: 'Scholarship Deadline', createdAt: dayjs().subtract(3, 'day'), body: 'Applications for the DAAD scholarship are due by Friday.' },
  ])
  const [annModalOpen, setAnnModalOpen] = useState(false)
  const [annForm] = Form.useForm()

  // Announcements archive state
  const [annArchiveOpen, setAnnArchiveOpen] = useState(false)
  const [annArchiveSearch, setAnnArchiveSearch] = useState('')

  const openAddAnnouncement = () => { annForm.resetFields(); setAnnModalOpen(true) }
  const handleAnnouncementSubmit = (values: any) => {
    const id = announcements.length ? Math.max(...announcements.map(a => a.id)) + 1 : 1
    setAnnouncements(prev => [{ id, ...values, createdAt: dayjs() }, ...prev])
    message.success('Announcement added')
    setAnnModalOpen(false)
    annForm.resetFields()
  }
  const handleDeleteAnnouncement = (id: number) => {
    Modal.confirm({ title: 'Delete Announcement', content: 'Are you sure?', onOk() { setAnnouncements(prev => prev.filter(a => a.id !== id)); message.success('Announcement deleted') } })
  }

  // Archive helpers
  const filteredAnnouncements = announcements.filter(a => {
    const s = annArchiveSearch.trim().toLowerCase()
    if (!s) return true
    return (a.title && a.title.toLowerCase().includes(s)) || (a.body && a.body.toLowerCase().includes(s))
  })

  const archiveColumns = [
    { title: 'Title', dataIndex: 'title', key: 'title', render: (t: string, r: any) => (<a onClick={() => { annForm.setFieldsValue({ title: r.title, body: r.body }); setAnnModalOpen(true); }}>{t}</a>) },
    { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', render: (d: any) => d ? d.format('MMM D, YYYY HH:mm') : '' },
    { title: 'Actions', key: 'actions', render: (_: any, r: any) => (
      <Space>
        <Button type="text" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); annForm.setFieldsValue({ title: r.title, body: r.body }); setAnnModalOpen(true); }} />
        <Button type="text" danger icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); handleDeleteAnnouncement(r.id); }} />
      </Space>
    ) }
  ]

  const openAdd = () => {
    setEditing(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const openEdit = (record: any) => {
    setEditing(record)
    form.setFieldsValue(record)
    setIsModalOpen(true)
  }

  const openView = (record: any) => {
    setViewProgram(record)
    setViewModalOpen(true)
  }

  const handleDelete = (id: number | string) => {
    Modal.confirm({
      title: "Delete Program",
      content: "Are you sure you want to delete this program?",
      async onOk() {
        try {
          await dispatch(deleteProgram(id)).unwrap()
          message.success("Program deleted")
        } catch (err: any) {
          message.error(err?.message || "Failed to delete program")
        }
      }
    })
  }

  const handleSubmit = async (values: any) => {
    if (values.name && !programNameOptions.includes(values.name)) {
      setProgramNameOptions(prev => [...prev, values.name])
    }
    
    // Validate departmentId is selected
    if (!values.departmentId) {
      message.error('Please select a department')
      return
    }
    
    // Map frontend fields to backend requirements
    const payload = {
      departmentId: values.departmentId, // Required by backend - must be valid ID
      code: values.code, // User must provide
      slug: values.slug || values.name?.toLowerCase().replace(/\s+/g, '-'), // Generate slug from name if not provided
      title: values.title || values.name, // Backend expects 'title'
      level: values.level, // BSC/MSC/PHD
      duration: values.duration,
      credits: Number(values.credits) || 0,
      description: values.description || '',
    }

    try {
      if (editing) {
        await dispatch(updateProgram({ id: editing.id, data: payload })).unwrap()
        message.success("Program updated")
      } else {
        await dispatch(createProgram(payload)).unwrap()
        message.success("Program added")
      }
      setIsModalOpen(false)
      form.resetFields()
      // Refresh programs list
      dispatch(fetchPrograms())
    } catch (err: any) {
      message.error(err?.message || "Failed to save program")
    }
  }

  const handlePublishProgram = async (id: string | number) => {
    try {
      await dispatch(publishProgram(id)).unwrap()
      message.success("Program published successfully!")
      // Refresh programs to get updated status
      dispatch(fetchPrograms())
    } catch (err: any) {
      message.error(err?.message || "Failed to publish program")
    }
  }

  const programColumns = [
    { 
      title: "Program Name", 
      dataIndex: "title", 
      key: "title", 
      render: (title: string, record: any) => (
        <a onClick={(e) => { e.stopPropagation(); openView(record) }} style={{ cursor: 'pointer' }}>
          {title || record.name || 'Untitled Program'}
        </a>
      ) 
    },
    { 
      title: "Code", 
      dataIndex: "code", 
      key: "code" 
    },
    { title: "Level", dataIndex: "level", key: "level", render: (level: string) => <Tag color="blue">{level}</Tag> },
    { 
      title: "Duration", 
      dataIndex: "durationMonths", 
      key: "durationMonths",
      render: (months: number | null, record: any) => months ? `${months} months` : (record.duration || 'N/A')
    },
    { title: "Credits", dataIndex: "credits", key: "credits" },
    { 
      title: "Status", 
      dataIndex: "state", 
      key: "state", 
      render: (state: string, record: any) => {
        const currentState = state || record.status || 'DRAFT'
        return (
          <Tag color={currentState === 'PUBLISHED' ? 'green' : 'orange'}>
            {currentState}
          </Tag>
        )
      }
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => {
        const currentState = record.state || record.status || 'DRAFT'
        return (
          <Space>
            <Button type="text" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); openEdit(record); }} />
            <Button type="text" danger icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); handleDelete(record.id); }} />
            {currentState !== 'PUBLISHED' && (
              <Button 
                type="primary" 
                size="small"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  handlePublishProgram(record.id); 
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

  // Removed Level from columns
  const handlePublishCourse = async (id: string | number) => {
    try {
      await dispatch(publishCourse(id)).unwrap()
      message.success("Course published successfully!")
      // Refresh courses for current program
      if (selectedProgramId) {
        dispatch(fetchCoursesByProgram(selectedProgramId))
      }
    } catch (err: any) {
      message.error(err?.message || "Failed to publish course")
    }
  }

  const courseColumns = [
    { title: "Course Code", dataIndex: "code", key: "code" },
    { title: "Course Name", dataIndex: "name", key: "name", render: (name: string, record: any) => name || record.title },
    { title: "Credits", dataIndex: "credits", key: "credits" },
    { 
      title: "Status", 
      dataIndex: "state", 
      key: "state", 
      render: (state: string, record: any) => {
        const currentState = state || record.status || 'DRAFT'
        return (
          <Tag color={currentState === 'PUBLISHED' ? 'green' : 'orange'}>
            {currentState}
          </Tag>
        )
      }
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => {
        const currentState = record.state || record.status || 'DRAFT'
        return (
          <Space>
            <Button type="text" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); openEditCourse(record); }} />
            <Button type="text" danger icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); handleDeleteCourse(record.id); }} />
            {currentState !== 'PUBLISHED' && (
              <Button 
                type="primary" 
                size="small"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  handlePublishCourse(record.id); 
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

  // Courses come from academic slice (per program)
  const selectedProgramId = programs.length ? programs[0].id : null
  const courses = selectedProgramId ? (academic.coursesByProgram[String(selectedProgramId)] || []) : []
  const [courseModalOpen, setCourseModalOpen] = useState(false)
  const [courseEditing, setCourseEditing] = useState<any | null>(null)
  const [courseForm] = Form.useForm()
  const [courseView, setCourseView] = useState<any | null>(null)
  const [courseViewModalOpen, setCourseViewModalOpen] = useState(false)

  const openAddCourse = () => {
    setCourseEditing(null)
    courseForm.resetFields()
    setCourseModalOpen(true)
  }

  const openEditCourse = (record: any) => {
    setCourseEditing(record)
    courseForm.setFieldsValue(record)
    setCourseModalOpen(true)
  }

  const openViewCourse = (record: any) => {
    setCourseView(record)
    setCourseViewModalOpen(true)
  }

  const handleDeleteCourse = (id: number) => {
    Modal.confirm({
      title: 'Delete Course',
      content: 'Are you sure you want to delete this course?',
      async onOk() {
        try {
          await dispatch(deleteCourse(id)).unwrap()
          message.success('Course deleted')
        } catch (err: any) {
          message.error(err?.message || 'Failed to delete course')
        }
      }
    })
  }

  const handleCourseSubmit = (values: any) => {
    // Normalize payload to match backend expectations: some endpoints expect `title`
    // while our form uses `name`. Map `name` -> `title` to avoid validation errors.
    const payloadValues = { ...values, title: values.title ?? values.name }
    // determine program id: prefer form programId (string|number), fall back to selectedProgramId
    const programIdToUse = payloadValues.programId ?? selectedProgramId
    if (!programIdToUse) {
      message.error('Please select a program for this course')
      return
    }
    // remove programId from payload body if present; the endpoint accepts programId in the URL
    const bodyPayload = { ...payloadValues }
    delete (bodyPayload as any).programId
    const payload = { payload: bodyPayload }
    const perform = async () => {
      try {
        if (courseEditing) {
          console.debug('Updating course payload:', { id: courseEditing.id, payload: payloadValues })
          await dispatch(updateCourse({ id: courseEditing.id, payload: payloadValues })).unwrap()
          message.success('Course updated')
        } else if (selectedProgramId) {
          console.debug('Creating course payload:', { programId: programIdToUse, payload: bodyPayload })
          await dispatch(createCourse({ programId: programIdToUse, payload: bodyPayload })).unwrap()
          message.success('Course added')
        } else {
          message.error('No program selected')
        }
      } catch (err: any) {
        message.error(err?.message || 'Failed to save course')
      } finally {
        setCourseModalOpen(false)
        courseForm.resetFields()
      }
    }
    perform()
  }

  useEffect(() => {
    if (selectedProgramId) {
      dispatch(fetchCoursesByProgram(selectedProgramId))
    }
  }, [dispatch, selectedProgramId])

  // Fetch programs on mount
  useEffect(() => {
    dispatch(fetchPrograms())
    dispatch(fetchDepartments())
    dispatch(fetchCalendars())
  }, [dispatch])

  // Update program name options when programs change
  useEffect(() => {
    setProgramNameOptions(programs.map(p => p.name || p.title || ''))
  }, [programs])

  return (
    <div className="space-y-4">
      <Card title="Academic Information">
        <Tabs defaultActiveKey="1">
          <TabPane tab="Programs" key="1">
            <div className="mb-4">
              <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>Add Program</Button>
            </div>
            <Table
              columns={programColumns as any}
              dataSource={programs}
              rowKey="id"
              pagination={false}
              rowClassName={() => 'cursor-pointer hover:bg-gray-50'}
              onRow={(record) => ({
                onClick: () => openView(record),
              })}
            />
          </TabPane>

          <TabPane tab="Courses" key="2">
              <div className="mb-4">
                <Button type="primary" icon={<PlusOutlined />} onClick={openAddCourse}>Add Course</Button>
              </div>
              <Table
                columns={courseColumns as any}
                dataSource={courses}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                rowClassName={() => 'cursor-pointer hover:bg-gray-50'}
                onRow={(record) => ({ onClick: () => openViewCourse(record) })}
              />
          </TabPane>

          <TabPane tab="Academic Calendar" key="3">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-2xl font-bold text-blue-900">Academic Calendar</div>
                <div className="text-sm text-gray-500">Semester I, 2025/2026 Academic Year</div>
              </div>
              <div className="flex items-center gap-3">
                <a className="text-blue-700 mr-4 cursor-pointer" onClick={() => handleDownloadPdf()}>Download PDF</a>
                <Button type="primary" onClick={() => openAddAnnouncement()}>Add Announcement</Button>
                <Button type="primary" onClick={() => openAddCalendar()}>Add Calendar</Button>
              </div>
            </div>
            <Row gutter={24}>
              <Col xs={24} md={16}>
                <Card>
                  <Table
                    columns={calendarColumns as any}
                    dataSource={calendarEvents}
                    rowKey="id"
                    pagination={false}
                    loading={calendarState.loading}
                    rowClassName={() => 'cursor-pointer hover:bg-gray-50'}
                    onRow={(record) => ({ onClick: () => openViewCalendar(record) })}
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card>
                  <div className="text-xl font-semibold">Announcements</div>
                  <Divider />
                  <div className="text-sm text-gray-600 mb-4">
                      {announcements.map((a) => (
                        <div key={a.id} className="mb-4 cursor-pointer hover:bg-gray-50 p-2 rounded" onClick={() => { annForm.setFieldsValue({ title: a.title, body: a.body }); setAnnModalOpen(true); }}>
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold">{a.title}</div>
                              <div className="text-xs text-gray-400">{a.createdAt.format('MMM D, YYYY HH:mm')}</div>
                            </div>
                            <div className="ml-4">
                              <Button type="text" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); annForm.setFieldsValue({ title: a.title, body: a.body }); setAnnModalOpen(true); }} />
                              <Button type="text" danger icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); handleDeleteAnnouncement(a.id) }} />
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
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title="Program Details"
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[<Button key="close" onClick={() => setViewModalOpen(false)}>Close</Button>]}
        width={600}
      >
        {viewProgram && (
          <div>
            <h3 style={{ marginBottom: 8 }}>{viewProgram.name}</h3>
            <div style={{ color: '#555', marginBottom: 6 }}><b>Department:</b> {viewProgram.department}</div>
            <div style={{ color: '#555', marginBottom: 6 }}><b>Level:</b> {viewProgram.level}</div>
            <div style={{ color: '#555', marginBottom: 6 }}><b>Duration:</b> {viewProgram.duration}</div>
            <div style={{ color: '#555', marginBottom: 6 }}><b>Credits:</b> {viewProgram.credits}</div>
          </div>
        )}
      </Modal>

      <Modal
        title={editing ? "Edit Program" : "Add Program"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ level: 'BSC', duration: '4 years', credits: 0 }}>
          <Form.Item name="name" label="Program Name" rules={[{ required: true, message: 'Please enter program name' }]}>
            <Input placeholder="e.g., BSc in Computer Science" />
          </Form.Item>
          
          <Form.Item name="code" label="Program Code" rules={[{ required: true, message: 'Enter program code' }]}>
            <Input placeholder="e.g., CS_BSC" />
          </Form.Item>
          
          <Form.Item name="departmentId" label="Department" rules={[{ required: true, message: 'Select department' }]}>
            <Select
              placeholder="Select department"
              loading={departmentsState.loading}
              options={departments.map(d => ({ 
                value: d.id, 
                label: d.name 
              }))}
            />
          </Form.Item>
          
          <Form.Item name="level" label="Level" rules={[{ required: true, message: 'Select level' }]}>
            <Select
              options={[
                { value: 'BSC', label: 'BSC (Bachelor)' },
                { value: 'MSC', label: 'MSC (Master)' },
                { value: 'PHD', label: 'PHD (Doctorate)' },
              ]}
            />
          </Form.Item>
          
          <Form.Item name="duration" label="Duration" rules={[{ required: true, message: 'Enter duration' }]}>
            <Input placeholder="e.g., 4 years" />
          </Form.Item>
          
          <Form.Item name="credits" label="Credits" rules={[{ required: true, message: 'Enter credits' }]}>
            <Input type="number" placeholder="e.g., 120" />
          </Form.Item>
          
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Optional description" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={courseEditing ? 'Edit Course' : 'Add Course'}
        open={courseModalOpen}
        onCancel={() => setCourseModalOpen(false)}
        onOk={() => courseForm.submit()}
      >
        <Form form={courseForm} layout="vertical" onFinish={handleCourseSubmit} initialValues={{ credits: 3, department: departments[0] }}>
            <Form.Item name="programId" label="Program" rules={[{ required: true, message: 'Select program' }]}> 
              <Select
                options={programs.map(p => ({ value: p.id, label: p.name || p.title || String(p.id) }))}
                placeholder="Select program"
              />
            </Form.Item>
          <Form.Item name="code" label="Course Code" rules={[{ required: true, message: 'Enter course code' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="Course Name" rules={[{ required: true, message: 'Enter course name' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="department" label="Department" rules={[{ required: true, message: 'Select department' }]}> 
            <Select
              options={departments.map(d => ({ value: d, label: d }))}
            />
          </Form.Item>
          <Form.Item name="credits" label="Credits" rules={[{ required: true, message: 'Enter credits' }]}>
            <Input type="number" />
          </Form.Item>
          {/* Level Field Removed From Here */}
        </Form>
      </Modal>

      <Modal
        title="Course Details"
        open={courseViewModalOpen}
        onCancel={() => setCourseViewModalOpen(false)}
        footer={[<Button key="close" onClick={() => setCourseViewModalOpen(false)}>Close</Button>]}
        width={600}
      >
        {courseView && (
          <div>
            <h3 style={{ marginBottom: 8 }}>{courseView.name}</h3>
            <div style={{ color: '#555', marginBottom: 6 }}><b>Course Code:</b> {courseView.code}</div>
            <div style={{ color: '#555', marginBottom: 6 }}><b>Department:</b> {courseView.department}</div>
            <div style={{ color: '#555', marginBottom: 6 }}><b>Credits:</b> {courseView.credits}</div>
            {/* Level Removed From Details */}
          </div>
        )}
      </Modal>

      {/* Calendar Modal */}
      <Modal
        title={calendarEditing ? 'Edit Event' : 'Add Event'}
        open={calendarModalOpen}
        onCancel={() => setCalendarModalOpen(false)}
        onOk={() => calendarForm.submit()}
        width={600}
      >
        <Form form={calendarForm} layout="vertical" onFinish={handleCalendarSubmit}>
          <Form.Item name="title" label="Event Title" rules={[{ required: true, message: 'Enter event title' }]}>
            <Input placeholder="e.g., Mid-Semester Examinations" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Event description (optional)" />
          </Form.Item>
          <Form.Item name="startDate" label="Start Date" rules={[{ required: true, message: 'Select start date' }]}>
            <DatePicker style={{ width: '100%' }} showTime />
          </Form.Item>
          <Form.Item name="endDate" label="End Date" rules={[{ required: true, message: 'Select end date' }]}>
            <DatePicker style={{ width: '100%' }} showTime />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Calendar Event Details"
        open={calendarViewModalOpen}
        onCancel={() => setCalendarViewModalOpen(false)}
        footer={[<Button key="close" onClick={() => setCalendarViewModalOpen(false)}>Close</Button>]}
        width={600}
      >
        {calendarView && (
          <div>
            <h3 style={{ marginBottom: 8 }}>{calendarView.title}</h3>
            <div style={{ color: '#555', marginBottom: 6 }}><b>Dates:</b> {calendarView.dateRange && calendarView.dateRange[0] ? `${calendarView.dateRange[0].format('MMM D')} - ${calendarView.dateRange[1] ? calendarView.dateRange[1].format('MMM D') : ''}` : ''}</div>
            <div style={{ color: '#555', marginBottom: 6 }}><b>Status:</b> {calendarView.status}</div>
          </div>
        )}
      </Modal>

      <Modal
        title="Add Announcement"
        open={annModalOpen}
        onCancel={() => setAnnModalOpen(false)}
        onOk={() => annForm.submit()}
        okButtonProps={{ type: 'primary' }}
        width={600}
      >
        <Form form={annForm} layout="vertical" onFinish={handleAnnouncementSubmit}>
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Enter a title' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="body" label="Message" rules={[{ required: true, message: 'Enter message' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Announcements Archive"
        open={annArchiveOpen}
        onCancel={() => setAnnArchiveOpen(false)}
        footer={null}
        width={800}
      >
        <div className="mb-4">
          <Input.Search placeholder="Search announcements" allowClear value={annArchiveSearch} onChange={(e) => setAnnArchiveSearch(e.target.value)} onSearch={(v) => setAnnArchiveSearch(v)} />
        </div>
        <Table columns={archiveColumns as any} dataSource={filteredAnnouncements} rowKey="id" pagination={{ pageSize: 6 }} />
      </Modal>
    </div>
  )
}

export default AcademicPage