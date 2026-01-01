import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons"
import { Button, Card, Col, DatePicker, Divider, Form, Input, Modal, Row, Select, Space, Table, Tabs, Tag, message, Descriptions } from "antd"
import ProgramsTab from "./components/ProgramsTab"
import CoursesTab from "./components/CoursesTab"
import CalendarTab from "./components/CalendarTab"
import { usePermissions } from "@/hooks/usePermissions"
import TableActions from "@/components/common/TableActions"
import dayjs from 'dayjs'
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "../../store"
import { createCourse, deleteCourse, fetchCoursesByProgram, publishCourse, updateCourse } from "../../store/slices/academicSlice"
import { createCalendar, deleteCalendar, fetchCalendars, publishCalendar, updateCalendar } from "../../store/slices/calendarSlice"
import { fetchDepartments } from "../../store/slices/departmentSlice"
import { createEvent, deleteEvent, fetchEvents, publishEvent, updateEvent } from "../../store/slices/eventsSlice"
import { createProgram, deleteProgram, fetchPrograms, publishProgram, updateProgram } from "../../store/slices/programsSlice"

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
  const eventsState = useSelector((s: RootState) => s.events)
  
  const programs = programsState.items || []  // Ensure it's always an array
  const departments = departmentsState.items || []  // Ensure it's always an array
  const calendars = calendarState.calendars || []  // Ensure it's always an array
  const events = eventsState.items || []  // Ensure it's always an array
  const [programNameOptions, setProgramNameOptions] = useState<string[]>([])
  const [newDeptInput, setNewDeptInput] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form] = Form.useForm()
  const [viewProgram, setViewProgram] = useState<any | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)

  const { permissions: userPermissions, canView, canCreate, canUpdate, canDelete, can } = usePermissions()

  const hasProgramsView = canView("programs")
  const hasProgramsCreate = canCreate("programs")
  const hasProgramsUpdate = canUpdate("programs")
  const hasProgramsDelete = canDelete("programs")

  const hasCoursesView = canView("courses")
  const hasCoursesCreate = canCreate("courses")
  const hasCoursesUpdate = canUpdate("courses")
  const hasCoursesDelete = canDelete("courses")

  const hasCalendarView = canView("calendar") || canView("calendars")
  const hasCalendarCreate = canCreate("calendar")
  const hasCalendarUpdate = canUpdate("calendar")
  const hasCalendarDelete = canDelete("calendar")

  const hasNewsView = canView("news") || canView("announcements")
  const hasNewsCreate = canCreate("news")
  const hasNewsUpdate = canUpdate("news")
  const hasNewsDelete = canDelete("news")

  const [calendarModalOpen, setCalendarModalOpen] = useState(false)
  const [calendarEditing, setCalendarEditing] = useState<any | null>(null)
  const [calendarForm] = Form.useForm()
  const [calendarView, setCalendarView] = useState<any | null>(null)
  const [calendarViewModalOpen, setCalendarViewModalOpen] = useState(false)
  
  // Academic Calendar creation modal (name + year)
  const [academicCalendarModalOpen, setAcademicCalendarModalOpen] = useState(false)
  const [academicCalendarForm] = Form.useForm()
  const [editingAcademicCalendar, setEditingAcademicCalendar] = useState<any | null>(null)
  
  // Active calendar selection
  const [activeCalendar, setActiveCalendar] = useState<any | null>(null)
  
  const calendarEvents = Array.isArray(events) ? events : []  // Ensure it's always an array

  // Columns for academic calendars list
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
                onClick={() => handlePublishCalendar()}
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

  const handlePublishEvent = async (id: string | number) => {
    try {
      await dispatch(publishEvent(id)).unwrap()
      message.success("Event published successfully!")
      dispatch(fetchEvents())
    } catch (err: any) {
      message.error(err?.message || "Failed to publish event")
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

  const handleDeleteCalendarEvent = (id: number | string) => { 
    Modal.confirm({ 
      title: 'Delete Event', 
      content: 'Delete this event?', 
      async onOk() { 
        try {
          await dispatch(deleteEvent(id)).unwrap()
          message.success('Event deleted')
          // Refresh events list
          dispatch(fetchEvents())
        } catch (err: any) {
          message.error(err?.message || 'Failed to delete event')
        }
      } 
    }) 
  }

  const handleCalendarSubmit = async (values: any) => {
    // Backend expects: { title, slug, startAt (Date), endAt (Date), description }
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
      // Close modal and reset form
      setCalendarModalOpen(false)
      setCalendarEditing(null)
      calendarForm.resetFields()
      // Refresh events list
      dispatch(fetchEvents())
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

  // Handler for academic calendar creation (name + year)
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
    // Backend expects: { title, academicYear, semester }
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
        <TableActions
          resource="news"
          onView={() => { annForm.setFieldsValue({ title: r.title, body: r.body }); setAnnModalOpen(true); }}
          onEdit={() => { annForm.setFieldsValue({ title: r.title, body: r.body }); setAnnModalOpen(true); }}
          onDelete={() => handleDeleteAnnouncement(r.id)}
          record={r}
          allowEditIfOwner={false}
        />
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
    
    // Check for duplicate code when creating new program
    if (!editing) {
      const isDuplicateCode = programs.some(p => p.code?.toLowerCase() === values.code?.toLowerCase())
      if (isDuplicateCode) {
        message.error(`Program code "${values.code}" already exists. Please use a unique code.`)
        return
      }
    }
    
    // Map frontend fields to backend requirements
    const payload = {
      departmentId: values.departmentId, // Required by backend - must be valid ID
      code: values.code.trim(), // User must provide - must be unique
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
      // Handle specific error messages
      let errorMessage = err?.message || "Failed to save program"
      
      // Check for unique constraint violation
      if (errorMessage.includes('Unique constraint') || errorMessage.includes('code')) {
        errorMessage = `Program code "${values.code}" already exists. Please use a unique code.`
      }
      
      message.error(errorMessage)
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
            <TableActions
              resource="programs"
              onView={() => openView(record)}
              forceView={true}
              onEdit={() => openEdit(record)}
              onDelete={() => handleDelete(record.id)}
              record={record}
              allowEditIfOwner={false}
            />
            {currentState !== 'PUBLISHED' && can('programs', 'publish') && (
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
            <TableActions
              resource="courses"
              onView={() => openViewCourse(record)}
              forceView={true}
              onEdit={() => openEditCourse(record)}
              onDelete={() => handleDeleteCourse(record.id)}
              record={record}
              allowEditIfOwner={false}
            />
            {currentState !== 'PUBLISHED' && can('courses', 'publish') && (
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
    // Always fetch programs and departments so UI can display existing data
    dispatch(fetchPrograms())
    dispatch(fetchDepartments())

    if (hasCalendarView) {
      dispatch(fetchCalendars())
      dispatch(fetchEvents())
    }
  }, [dispatch, hasProgramsView, hasCalendarView])

  // Update program name options when programs change
  useEffect(() => {
    setProgramNameOptions(programs.map(p => p.name || p.title || ''))
  }, [programs])

  // Set active calendar when calendars are loaded
  useEffect(() => {
    if (calendars.length > 0 && !activeCalendar) {
      setActiveCalendar(calendars[0])
    }
  }, [calendars, activeCalendar])

  return (
    <div className="space-y-4">
      <Card title="Academic Information">
        <Tabs defaultActiveKey="1">
          {(hasProgramsView || programs.length > 0) && (
            <TabPane tab="Programs" key="1">
              <ProgramsTab
                programs={programs}
                hasProgramsCreate={hasProgramsCreate}
                openAdd={openAdd}
                programColumns={programColumns}
                hasProgramsView={hasProgramsView}
                openView={openView}
              />
            </TabPane>
          )}

          {(hasCoursesView || courses.length > 0) && (
            <TabPane tab="Courses" key="2">
              <CoursesTab
                courses={courses}
                hasCoursesCreate={hasCoursesCreate}
                openAddCourse={openAddCourse}
                courseColumns={courseColumns}
                hasCoursesView={hasCoursesView}
                openViewCourse={openViewCourse}
              />
            </TabPane>
          )}

          {(hasCalendarView || calendars.length > 0) && (
            <TabPane tab="Academic Calendar" key="3">
              <CalendarTab
                calendars={calendars}
                activeCalendar={activeCalendar}
                setActiveCalendar={setActiveCalendar}
                handleDownloadPdf={handleDownloadPdf}
                hasCalendarCreate={hasCalendarCreate}
                openAddAcademicCalendar={openAddAcademicCalendar}
                openAddCalendar={openAddCalendar}
                calendarsLoading={calendarState.loading}
                calendarEvents={calendarEvents}
                calendarColumns={calendarColumns}
                eventsLoading={eventsState.loading}
                openViewCalendar={openViewCalendar}
              />
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
            </TabPane>
          )}

        </Tabs>
      </Card>

      <Modal
        title="Program Details"
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[<Button key="close" onClick={() => setViewModalOpen(false)}>Close</Button>]}
        width={700}
      >
        {viewProgram && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Program Name">{viewProgram.title || viewProgram.name}</Descriptions.Item>
            <Descriptions.Item label="Code">{viewProgram.code}</Descriptions.Item>
            <Descriptions.Item label="Level">{viewProgram.level}</Descriptions.Item>
            <Descriptions.Item label="Duration">{viewProgram.durationMonths ?? viewProgram.duration ?? 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Credits">{viewProgram.credits ?? 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="State"><Tag color={viewProgram.state === 'PUBLISHED' ? 'green' : 'orange'}>{viewProgram.state || 'DRAFT'}</Tag></Descriptions.Item>
            {viewProgram.department && (
              <Descriptions.Item label="Department">
                <div style={{ fontWeight: 600 }}>{viewProgram.department.name}</div>
                <div style={{ color: '#666' }}>{viewProgram.department.slug}</div>
                {viewProgram.department.description && <div style={{ marginTop: 8 }}>{typeof viewProgram.department.description === 'string' ? viewProgram.department.description : JSON.stringify(viewProgram.department.description)}</div>}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Created At">{viewProgram.createdAt ? dayjs(viewProgram.createdAt).format('MMM D, YYYY HH:mm') : ''}</Descriptions.Item>
            <Descriptions.Item label="Updated At">{viewProgram.updatedAt ? dayjs(viewProgram.updatedAt).format('MMM D, YYYY HH:mm') : ''}</Descriptions.Item>
          </Descriptions>
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
          
          <Form.Item 
            name="code" 
            label="Program Code" 
            rules={[{ required: true, message: 'Enter program code' }]}
            extra="Must be unique. Example: CS_BSC, SE_MSC, EP_PHD"
          >
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
        <Form form={courseForm} layout="vertical" onFinish={handleCourseSubmit} initialValues={{ credits: 3, department: departments.length > 0 ? departments[0].id : undefined }}>
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
              options={departments.map(d => ({ value: d.id, label: d.name }))}
              placeholder="Select department"
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
    </div>
  )
}

export default AcademicPage