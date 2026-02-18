import React, { useState, useEffect } from 'react'
import { Button, Modal, Form, Input, Select, message, Tag, Space, Descriptions, Card } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import DataTable from "@/components/common/DataTable"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { createCourse, deleteCourse, fetchCoursesByProgram, publishCourse, updateCourse } from "@/store/slices/academicSlice"
import { fetchDepartments } from "@/store/slices/departmentSlice"
import { usePermissions } from "@/hooks/usePermissions"
import TableActions from "@/components/common/TableActions"

const CoursesTab = () => {
  const dispatch = useAppDispatch()
  const { items: programs } = useAppSelector((state) => state.programs)
  const { items: departments } = useAppSelector((state) => state.departments)
  const academic = useAppSelector((state) => state.academic)
  
  const [courseModalOpen, setCourseModalOpen] = useState(false)
  const [courseEditing, setCourseEditing] = useState<any | null>(null)
  const [courseForm] = Form.useForm()
  const [courseView, setCourseView] = useState<any | null>(null)
  const [courseViewModalOpen, setCourseViewModalOpen] = useState(false)
  
  const selectedProgramId = programs.length ? programs[0].id : null
  const courses = selectedProgramId ? (academic.coursesByProgram[String(selectedProgramId)] || []) : []
  const loading = academic.loading

  const { canView, canCreate, canUpdate, canDelete, can } = usePermissions()
  const hasCoursesView = canView("courses")
  const hasCoursesCreate = canCreate("courses")
  const hasCoursesUpdate = canUpdate("courses")
  const hasCoursesDelete = canDelete("courses")

  useEffect(() => {
    if (selectedProgramId) {
      dispatch(fetchCoursesByProgram(selectedProgramId))
    }
  }, [dispatch, selectedProgramId])

  const openAddCourse = () => {
    setCourseEditing(null)
    courseForm.resetFields()
    setCourseModalOpen(true)
  }

  const openEditCourse = (record: any) => {
    setCourseEditing(record)
    // Ensure all numeric fields are set properly for the form
    courseForm.setFieldsValue({
      ...record,
      programId: record.programId || selectedProgramId,
      department: record.departmentId || (departments.length > 0 ? departments[0].id : undefined)
    })
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

  const handlePublishCourse = async (id: string | number) => {
    try {
      await dispatch(publishCourse(id)).unwrap()
      message.success("Course published successfully!")
      if (selectedProgramId) {
        dispatch(fetchCoursesByProgram(selectedProgramId))
      }
    } catch (err: any) {
      message.error(err?.message || "Failed to publish course")
    }
  }

  const handleCourseSubmit = (values: any) => {
    const payloadValues = { 
      ...values, 
      title: values.title ?? values.name,
      credits: values.credits ? Number(values.credits) : 0,
      semester: values.semester ? Number(values.semester) : undefined,
      year: values.year ? Number(values.year) : undefined
    }
    const programIdToUse = payloadValues.programId ?? selectedProgramId
    if (!programIdToUse) {
      message.error('Please select a program for this course')
      return
    }
    const bodyPayload = { ...payloadValues }
    delete (bodyPayload as any).programId
    
    const perform = async () => {
      try {
        if (courseEditing) {
          await dispatch(updateCourse({ id: courseEditing.id, payload: payloadValues })).unwrap()
          message.success('Course updated')
        } else if (selectedProgramId) {
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
      fixed: 'right' as const,
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
              hasUpdate={hasCoursesUpdate}
              hasDelete={hasCoursesDelete}
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

  // Filter programs by selected department if one is selected, or use all programs
  const programOptions = programs.map(p => ({ value: p.id, label: p.name || p.title || String(p.id) }))

  return (
    <div>
      <Card
        title={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-lg font-semibold">Courses</span>
            {hasCoursesCreate && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openAddCourse}
                className="min-w-fit"
              >
                <span className="hidden sm:inline">Add Course</span>
                <span className="sm:hidden">Add</span>
              </Button>
            )}
          </div>
        }
      >
        <DataTable
          columns={courseColumns as any}
          dataSource={courses}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} courses`,
          }}
          loading={loading}
          rowClassName={() => 'cursor-pointer hover:bg-gray-50'}
          onRow={(record) => ({ onClick: () => {
            if (hasCoursesView) {
              openViewCourse(record)
            }
          } })}
          scroll={{ x: 800 }}
          className="border-0"
        />
      </Card>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item name="code" label="Course Code" rules={[{ required: true, message: 'Enter course code' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="credits" label="Credits" rules={[{ required: true, message: 'Enter credits' }]}>
              <Input type="number" min={0} />
            </Form.Item>
          </div>
          <Form.Item name="name" label="Course Name" rules={[{ required: true, message: 'Enter course name' }]}>
            <Input />
          </Form.Item>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <Form.Item name="semester" label="Semester" initialValue={1}>
                <Input type="number" min={1} max={8} />
             </Form.Item>
             <Form.Item name="year" label="Year" initialValue={1}>
                <Input type="number" min={1} max={5} />
             </Form.Item>
          </div>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Course Details"
        open={courseViewModalOpen}
        onCancel={() => setCourseViewModalOpen(false)}
        footer={[<Button key="close" onClick={() => setCourseViewModalOpen(false)}>Close</Button>]}
        width={800}
      >
        {courseView && (
          <Descriptions bordered column={2} className="mt-4">
            <Descriptions.Item label="Course Code">{courseView.code || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Course Name">{courseView.name || courseView.title || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Credits">{courseView.credits || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Department">{courseView.department || 'N/A'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default CoursesTab
