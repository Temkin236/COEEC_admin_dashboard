import React, { useState, useEffect } from 'react'
import { Button, Modal, Form, Input, Select, message, Tag, Space, Descriptions, Card, Radio } from 'antd'
import { PlusOutlined, FilterOutlined } from '@ant-design/icons'
import DataTable from "@/components/common/DataTable"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { createProgram, deleteProgram, fetchPrograms, publishProgram, updateProgram } from "@/store/slices/programsSlice"
import { fetchDepartments } from "@/store/slices/departmentSlice"
import { usePermissions } from "@/hooks/usePermissions"
import { ProgramType, ProgramLevel } from "@/types/academic.types"
import TableActions from "@/components/common/TableActions"
import dayjs from 'dayjs'

const ProgramsTab = () => {
  const dispatch = useAppDispatch()
  const { items: programs, loading } = useAppSelector((state) => state.programs)
  const { items: departments, loading: departmentsLoading } = useAppSelector((state) => state.departments)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form] = Form.useForm()
  const [viewProgram, setViewProgram] = useState<any | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [programNameOptions, setProgramNameOptions] = useState<string[]>([])
  
  // Filters state removed as we will use column filters
  // const [typeFilter, setTypeFilter] = useState<ProgramType | 'ALL'>('ALL')
  // const [levelFilter, setLevelFilter] = useState<ProgramLevel | 'ALL'>('ALL')
  // const [filteredPrograms, setFilteredPrograms] = useState<any[]>([])

  const { canView, canCreate, canUpdate, canDelete, can } = usePermissions()
  const hasProgramsView = canView("programs")
  const hasProgramsCreate = canCreate("programs")
  const hasProgramsUpdate = canUpdate("programs")
  const hasProgramsDelete = canDelete("programs")

  useEffect(() => {
    dispatch(fetchPrograms())
    dispatch(fetchDepartments())
  }, [dispatch])

  useEffect(() => {
    setProgramNameOptions(programs.map(p => p.name || p.title || ''))
  }, [programs])

  // Removed custom filtering effect
  // useEffect(() => {
  //   let result = [...programs]
  //   
  //   if (typeFilter !== 'ALL') {
  //     result = result.filter(p => p.type === typeFilter)
  //   }
  //   
  //   if (levelFilter !== 'ALL') {
  //     result = result.filter(p => p.level === levelFilter)
  //   }
  //   
  //   setFilteredPrograms(result)
  // }, [programs, typeFilter, levelFilter])

  const openAdd = () => {
    setEditing(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const openEdit = (record: any) => {
    setEditing(record)
    // Map existing record.level into form field `subProgram` so the select shows correctly
    form.setFieldsValue({ ...record, subProgram: record.level })
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

  const handlePublishProgram = async (id: string | number) => {
    try {
      await dispatch(publishProgram(id)).unwrap()
      message.success("Program published successfully!")
      dispatch(fetchPrograms())
    } catch (err: any) {
      message.error(err?.message || "Failed to publish program")
    }
  }

  const handleSubmit = async (values: any) => {
    if (values.name && !programNameOptions.includes(values.name)) {
      setProgramNameOptions(prev => [...prev, values.name])
    }
    
    if (!values.departmentId) {
      message.error('Please select a department')
      return
    }
    
    if (!editing) {
      const isDuplicateCode = programs.some(p => p.code?.toLowerCase() === values.code?.toLowerCase())
      if (isDuplicateCode) {
        message.error(`Program code "${values.code}" already exists. Please use a unique code.`)
        return
      }
    }
    
    const payload = {
      departmentId: values.departmentId,
      code: values.code.trim(),
      slug: values.slug || values.name?.toLowerCase().replace(/\s+/g, '-'),
      title: values.title || values.name,
      // Accept form field `subProgram` but keep payload property `level` for backend compatibility
      level: values.subProgram ?? values.level,
      type: values.type,
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
      dispatch(fetchPrograms())
    } catch (err: any) {
      let errorMessage = err?.message || "Failed to save program"
      if (errorMessage.includes('Unique constraint') || errorMessage.includes('code')) {
        errorMessage = `Program code "${values.code}" already exists. Please use a unique code.`
      }
      message.error(errorMessage)
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
    { 
      title: "Sub Program", 
      dataIndex: "level", 
      key: "level", 
      filters: [
        { text: 'BSc (Bachelor)', value: 'BSC' },
        { text: 'MSc (Master)', value: 'MSC' },
        { text: 'PhD (Doctorate)', value: 'PHD' },
      ],
      onFilter: (value: any, record: any) => record.level === value,
      render: (level: string) => <Tag color="blue">{level}</Tag> 
    },
    { 
      title: "Type", 
      dataIndex: "type", 
      key: "type", 
      filters: [
        { text: 'Undergraduate', value: ProgramType.UNDERGRADUATE },
        { text: 'Postgraduate', value: ProgramType.POSTGRADUATE },
        { text: 'Extension', value: ProgramType.EXTENSION },
        { text: 'Weekend', value: ProgramType.WEEKEND },
      ],
      onFilter: (value: any, record: any) => record.type === value,
      render: (type: string) => <Tag color="purple">{type}</Tag> 
    },
    /*
    { 
      title: "Duration", 
      dataIndex: "duration", 
      key: "duration",
      render: (text: string, record: any) => {
        // Prefer explicit duration field from form, fallback to converted durationMonths
        if (text) return text
        if (record.durationMonths) return `${record.durationMonths} months`
        return 'N/A'
      }
    },
    { 
      title: "Credits", 
      dataIndex: "credits", 
      key: "credits",
      render: (credits: number) => credits || 'N/A'
    },
    */
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
      width: 200, // Added explicit width to prevent overflow
      render: (_: any, record: any) => {
        const currentState = record.state || record.status || 'DRAFT'
        return (
          <Space size="small">
            <TableActions
              resource="programs"
              onView={() => openView(record)}
              forceView={true}
              onEdit={() => openEdit(record)}
              onDelete={() => handleDelete(record.id)}
              record={record}
              allowEditIfOwner={false}
              hasUpdate={hasProgramsUpdate}
              hasDelete={hasProgramsDelete}
            />
            {currentState !== 'PUBLISHED' && can('programs', 'publish') && (
              <Button 
                type="primary" 
                size="small"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  handlePublishProgram(record.id); 
                }}
                className="bg-green-600 hover:bg-green-500 border-green-600 hover:border-green-500"
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
      <Card
        title={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-lg font-semibold">Academic Programs</span>
            {hasProgramsCreate && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openAdd}
                className="min-w-fit"
              >
                <span className="hidden sm:inline">Add Program</span>
                <span className="sm:hidden">Add</span>
              </Button>
            )}
          </div>
        }
      >
        <DataTable
          columns={programColumns as any}
          dataSource={programs}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} programs`,
          }}
          loading={loading}
          rowClassName={() => 'cursor-pointer hover:bg-gray-50'}
          onRow={(record) => ({
            onClick: () => {
              if (hasProgramsView) {
                openView(record)
              }
            },
          })}
          scroll={{ x: 800 }}
          className="border-0"
        />
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
            <Descriptions.Item label="Sub Program">{viewProgram.level}</Descriptions.Item>
            <Descriptions.Item label="Type">{viewProgram.type}</Descriptions.Item>
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
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ subProgram: 'BSC', type: ProgramType.UNDERGRADUATE, duration: '4 years', credits: 0 }}>
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
              loading={departmentsLoading}
              options={departments.map(d => ({ 
                value: d.id, 
                label: d.name 
              }))}
            />
          </Form.Item>
          
          <Form.Item name="subProgram" label="Sub Program" rules={[{ required: true, message: 'Select level' }]}>
            <Select
              options={[
                { value: 'BSC', label: 'BSC (Bachelor)' },
                { value: 'MSC', label: 'MSc (Master)' },
                { value: 'PHD', label: 'PHD (Doctorate)' },
              ]}
            />
          </Form.Item>

          <Form.Item name="type" label="Program Type" rules={[{ required: true, message: 'Select program type' }]}>
            <Select
              options={[
                { value: ProgramType.UNDERGRADUATE, label: 'Undergraduate' },
                { value: ProgramType.POSTGRADUATE, label: 'Postgraduate' },
                { value: ProgramType.EXTENSION, label: 'Extension' },
                { value: ProgramType.WEEKEND, label: 'Weekend' },
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
    </div>
  )
}

export default ProgramsTab
