import { useState } from "react"
import { Card, Tabs, Table, Button, Space, Tag, Modal, Form, Input, Select, message, AutoComplete, DatePicker, Row, Col, Divider, Descriptions } from "antd"
import dayjs from 'dayjs'
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons"

const { TabPane } = Tabs

const DEPARTMENTS = [
  "Software Engineering",
  "Computer Science Engineering",
  "Electronics and Communication Engineering",
  "Electrical Power Department",
]

const AcademicPage = () => {
  const [programs, setPrograms] = useState<any[]>([
    { id: 1, name: "BSc in Computer Science", level: "Undergraduate", duration: "4 years", credits: 120, department: "Computer Science Engineering" },
    { id: 2, name: "MSc in Computer Science", level: "Graduate", duration: "2 years", credits: 60, department: "Computer Science Engineering" },
  ])
  const [departments, setDepartments] = useState<string[]>(DEPARTMENTS)
  const [programNameOptions, setProgramNameOptions] = useState<string[]>(programs.map(p => p.name))
  const [newDeptInput, setNewDeptInput] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form] = Form.useForm()
  const [viewProgram, setViewProgram] = useState<any | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)

  // Calendar state
  const [calendarEntries, setCalendarEntries] = useState<any[]>([
    { id: 1, dateRange: [dayjs('2025-09-15'), dayjs('2025-09-16')], title: 'Registration for 2nd Year & Above', status: 'Completed' },
    { id: 2, dateRange: [dayjs('2025-09-20'), dayjs('2025-09-20')], title: 'Classes Begin', status: 'Completed' },
    { id: 3, dateRange: [dayjs('2025-11-10'), dayjs('2025-11-15')], title: 'Mid-Semester Examinations', status: 'Upcoming' },
  ])
  const [calendarModalOpen, setCalendarModalOpen] = useState(false)
  const [calendarEditing, setCalendarEditing] = useState<any | null>(null)
  const [calendarForm] = Form.useForm()
  const [calendarView, setCalendarView] = useState<any | null>(null)
  const [calendarViewModalOpen, setCalendarViewModalOpen] = useState(false)

  const calendarColumns = [
    { title: 'Date', dataIndex: 'dateRange', key: 'dateRange', render: (range: any[]) => `${range && range[0] ? range[0].format('MMM D') : ''}${range && range[1] ? ' - ' + range[1].format('MMM D') : ''}` },
    { title: 'Event', dataIndex: 'title', key: 'title' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'Completed' ? 'green' : 'gold'}>{s}</Tag> },
    { title: 'Actions', key: 'actions', render: (_: any, record: any) => (
      <Space>
        <Button type="text" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); openEditCalendar(record) }} />
        <Button type="text" danger icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); handleDeleteCalendar(record.id) }} />
      </Space>
    ) }
  ]

  const openAddCalendar = () => { setCalendarEditing(null); calendarForm.resetFields(); setCalendarModalOpen(true) }
  const openEditCalendar = (record: any) => { setCalendarEditing(record); calendarForm.setFieldsValue({ ...record, dateRange: record.dateRange }); setCalendarModalOpen(true) }
  const handleDeleteCalendar = (id: number) => { Modal.confirm({ title: 'Delete Event', content: 'Delete this calendar event?', onOk() { setCalendarEntries(prev => prev.filter(c => c.id !== id)); message.success('Event deleted') } }) }
  const handleCalendarSubmit = (values: any) => {
    if (calendarEditing) {
      setCalendarEntries(prev => prev.map(c => c.id === calendarEditing.id ? { ...c, ...values } : c))
      message.success('Event updated')
    } else {
      const id = calendarEntries.length ? Math.max(...calendarEntries.map(c => c.id)) + 1 : 1
      setCalendarEntries(prev => [...prev, { id, ...values }])
      message.success('Event added')
    }
    setCalendarModalOpen(false)
    calendarForm.resetFields()
  }

  const handleDownloadPdf = () => {
    // simple print for now
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

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "Delete Program",
      content: "Are you sure you want to delete this program?",
      onOk() {
        setPrograms(prev => prev.filter(p => p.id !== id))
        message.success("Program deleted")
      }
    })
  }

  const handleSubmit = (values: any) => {
    // if program name is new, add to programNameOptions
    if (values.name && !programNameOptions.includes(values.name)) {
      setProgramNameOptions(prev => [...prev, values.name])
    }
    if (editing) {
      setPrograms(prev => prev.map(p => p.id === editing.id ? { ...p, ...values } : p))
      message.success("Program updated")
    } else {
      const id = programs.length ? Math.max(...programs.map(p => p.id)) + 1 : 1
      setPrograms(prev => [...prev, { id, ...values }])
      message.success("Program added")
    }
    setIsModalOpen(false)
    form.resetFields()
  }

  const programColumns = [
    { title: "Program Name", dataIndex: "name", key: "name", render: (name: string, record: any) => (
      <a onClick={(e) => { e.stopPropagation(); openView(record) }} style={{ cursor: 'pointer' }}>{name}</a>
    ) },
    { title: "Department", dataIndex: "department", key: "department" },
    { title: "Level", dataIndex: "level", key: "level", render: (level: string) => <Tag color="blue">{level}</Tag> },
    { title: "Duration", dataIndex: "duration", key: "duration" },
    { title: "Credits", dataIndex: "credits", key: "credits" },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); openEdit(record); }} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); handleDelete(record.id); }} />
        </Space>
      ),
    },
  ]

  const courseColumns = [
    { title: "Course Code", dataIndex: "code", key: "code" },
    { title: "Course Name", dataIndex: "name", key: "name" },
    { title: "Credits", dataIndex: "credits", key: "credits" },
    { title: "Level", dataIndex: "level", key: "level" },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); openEditCourse(record); }} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); handleDeleteCourse(record.id); }} />
        </Space>
      ),
    },
  ]

  const [courses, setCourses] = useState<any[]>([
    { id: 1, code: "CS101", name: "Introduction to Programming", credits: 3, level: "1st Year" },
    { id: 2, code: "CS202", name: "Data Structures", credits: 4, level: "2nd Year" },
  ])
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
      onOk() {
        setCourses(prev => prev.filter(c => c.id !== id))
        message.success('Course deleted')
      }
    })
  }

  const handleCourseSubmit = (values: any) => {
    if (courseEditing) {
      setCourses(prev => prev.map(c => c.id === courseEditing.id ? { ...c, ...values } : c))
      message.success('Course updated')
    } else {
      const id = courses.length ? Math.max(...courses.map(c => c.id)) + 1 : 1
      setCourses(prev => [...prev, { id, ...values }])
      message.success('Course added')
    }
    setCourseModalOpen(false)
    courseForm.resetFields()
  }

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
                    dataSource={calendarEntries}
                    rowKey="id"
                    pagination={false}
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
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Department">{viewProgram.department}</Descriptions.Item>
                  <Descriptions.Item label="Level">{viewProgram.level}</Descriptions.Item>
                  <Descriptions.Item label="Duration">{viewProgram.duration}</Descriptions.Item>
                  <Descriptions.Item label="Credits">{viewProgram.credits}</Descriptions.Item>
  
                </Descriptions>
              )}
            </Modal>

      {/* <Modal
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
      </Modal> */}

      <Modal
        title={editing ? "Edit Program" : "Add Program"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ level: 'Undergraduate', duration: '4 years', credits: 0, department: DEPARTMENTS[1] }}>
          <Form.Item name="name" label="Program Name" rules={[{ required: true, message: 'Please enter program name' }]}>
            <AutoComplete
              options={programNameOptions.map(n => ({ value: n }))}
              placeholder="Type or select program name (press Enter to add)"
              filterOption={(inputValue, option) => (option?.value as string).toLowerCase().includes(inputValue.toLowerCase())}
            />
          </Form.Item>
          <Form.Item name="department" label="Department" rules={[{ required: true, message: 'Select department' }]}>
            <Select
              options={departments.map(d => ({ value: d, label: d }))}
              dropdownRender={menu => (
                <div>
                  {menu}
                  <div style={{ display: 'flex', padding: 8, gap: 8 }}>
                    <Input
                      value={newDeptInput}
                      onChange={e => setNewDeptInput(e.target.value)}
                      placeholder="Add new department"
                    />
                              <Button
                                type="text"
                                onClick={() => {
                                  const v = newDeptInput && newDeptInput.trim()
                                  if (!v) {
                                    message.error('Department name required')
                                    return
                                  }
                                  if (departments.includes(v)) {
                                    message.info('Department already exists')
                                    form.setFieldsValue({ department: v })
                                    setNewDeptInput('')
                                    return
                                  }
                                  setDepartments(prev => [...prev, v])
                                  form.setFieldsValue({ department: v })
                                  setNewDeptInput('')
                                  message.success('Department added')
                                }}
                              >
                                Add
                              </Button>
                  </div>
                </div>
              )}
            />
          </Form.Item>
          <Form.Item name="duration" label="Duration">
            <Input />
          </Form.Item>
          <Form.Item name="credits" label="Credits">
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={courseEditing ? 'Edit Course' : 'Add Course'}
        open={courseModalOpen}
        onCancel={() => setCourseModalOpen(false)}
        onOk={() => courseForm.submit()}
      >
        <Form form={courseForm} layout="vertical" onFinish={handleCourseSubmit} initialValues={{ credits: 3, level: '1st Year', department: departments[0] }}>
          <Form.Item name="code" label="Course Code" rules={[{ required: true, message: 'Enter course code' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="Course Name" rules={[{ required: true, message: 'Enter course name' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="department" label="Department" rules={[{ required: true, message: 'Select department' }]}> 
            <Select
              options={departments.map(d => ({ value: d, label: d }))}
              dropdownRender={menu => (
                <div>
                  {menu}
                  <div style={{ display: 'flex', padding: 8, gap: 8 }}>
                    <Input
                      value={newDeptInput}
                      onChange={e => setNewDeptInput(e.target.value)}
                      placeholder="Add new department"
                    />
                    <Button
                      type="text"
                      onClick={() => {
                        const v = newDeptInput && newDeptInput.trim()
                        if (!v) {
                          message.error('Department name required')
                          return
                        }
                        if (departments.includes(v)) {
                          message.info('Department already exists')
                          courseForm.setFieldsValue({ department: v })
                          setNewDeptInput('')
                          return
                        }
                        setDepartments(prev => [...prev, v])
                        courseForm.setFieldsValue({ department: v })
                        setNewDeptInput('')
                        message.success('Department added')
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              )}
            />
          </Form.Item>
          <Form.Item name="credits" label="Credits" rules={[{ required: true, message: 'Enter credits' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="level" label="Level">
            <Input />
          </Form.Item>
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
            <div style={{ color: '#555', marginBottom: 6 }}><b>Level:</b> {courseView.level}</div>
          </div>
        )}
      </Modal>
      <Modal
        title={calendarEditing ? 'Edit Event' : 'Add Event'}
        open={calendarModalOpen}
        onCancel={() => setCalendarModalOpen(false)}
        onOk={() => calendarForm.submit()}
        width={600}
      >
        <Form form={calendarForm} layout="vertical" onFinish={handleCalendarSubmit} initialValues={{ status: 'Upcoming' }}>
          <Form.Item name="dateRange" label="Date Range" rules={[{ required: true, message: 'Select date range' }]}>
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="title" label="Event Name" rules={[{ required: true, message: 'Enter title' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select options={[{ value: 'Upcoming', label: 'Upcoming' }, { value: 'Completed', label: 'Completed' }]} />
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
