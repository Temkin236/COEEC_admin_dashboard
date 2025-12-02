"use client"

import { useEffect, useState } from "react"
import { Card, Button, Table, Space, Tag, Modal, Form, Input, Select, DatePicker, message } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchResearch, createResearch } from "@/store/slices/researchSlice"
import { formatDate } from "@/utils/helpers"

const { TextArea } = Input

const ResearchPage = () => {
  const dispatch = useAppDispatch()
  const { projects } = useAppSelector((state) => state.research)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(fetchResearch({ page: 1, limit: 10 }) as any)
  }, [dispatch])

  const handleSubmit = async (values: any) => {
    try {
      await dispatch(createResearch({ ...values, startDate: values.startDate?.format("YYYY-MM-DD"), endDate: values.endDate?.format("YYYY-MM-DD") }) as any).unwrap()
      message.success("Research project created successfully")
      setIsModalOpen(false)
      form.resetFields()
    } catch (error) {
      message.error("Failed to create research project")
    }
  }

  const columns = [
    { title: "Title", dataIndex: "title", key: "title", ellipsis: true },
    { title: "Principal Investigator", dataIndex: "principalInvestigator", key: "pi" },
    { title: "Status", dataIndex: "status", key: "status", render: (status: string) => { const colors: any = { ongoing: "processing", completed: "success", planned: "default" }; return <Tag color={colors[status]}>{status}</Tag> } },
    { title: "Duration", key: "duration", render: (_: any, record: any) => <span>{formatDate(record.startDate, "MMM YYYY")} - {formatDate(record.endDate, "MMM YYYY")}</span> },
    { title: "Funding", dataIndex: "fundingAmount", key: "funding", render: (amount: number) => (amount ? `$${amount.toLocaleString()}` : "N/A") },
    { title: "Actions", key: "actions", width: 120, render: (_: any) => (<Space size="small"><Button type="text" icon={<EyeOutlined />} /><Button type="text" icon={<EditOutlined />} /><Button type="text" danger icon={<DeleteOutlined />} /></Space>) },
  ]

  return (
    <div className="space-y-4">
      <Card title="Research Projects" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>Add Project</Button>}>
        <Table columns={columns as any} dataSource={Array.isArray(projects.items) ? projects.items : []} loading={projects.loading as any} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal title="Add Research Project" open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={() => form.submit()} width={800}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
          <Form.Item name="title" label="Project Title" rules={[{ required: true, message: "Please enter project title" }]}>
            <Input placeholder="Enter research project title" />
          </Form.Item>
          <Form.Item name="principalInvestigator" label="Principal Investigator" rules={[{ required: true }]}>
            <Input placeholder="Enter PI name" />
          </Form.Item>
          <Form.Item name="coInvestigators" label="Co-Investigators">
            <Select mode="tags" placeholder="Add co-investigators" />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="Project description" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="startDate" label="Start Date"><DatePicker className="w-full" /></Form.Item>
            <Form.Item name="endDate" label="End Date"><DatePicker className="w-full" /></Form.Item>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="status" label="Status" initialValue="planned"><Select><Select.Option value="planned">Planned</Select.Option><Select.Option value="ongoing">Ongoing</Select.Option><Select.Option value="completed">Completed</Select.Option></Select></Form.Item>
            <Form.Item name="fundingAmount" label="Funding Amount ($)"><Input type="number" placeholder="0" /></Form.Item>
          </div>
          <Form.Item name="fundingSource" label="Funding Source"><Input placeholder="e.g., NSF, EU Horizon, Ministry of Science" /></Form.Item>
          <Form.Item name="researchArea" label="Research Area"><Select mode="tags" placeholder="Add research areas" /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ResearchPage
