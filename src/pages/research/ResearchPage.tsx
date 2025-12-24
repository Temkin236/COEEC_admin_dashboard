import { useEffect, useState } from "react"
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Tag,
  Space,
  message,
} from "antd"
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  EyeOutlined,
} from "@ant-design/icons"
import dayjs from "dayjs"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  fetchResearchProjects,
  createResearchProject,
  updateResearchProject,
  deleteResearchProject,
  publishResearchProject,
  ResearchProject,
} from "@/store/slices/researchProjectsSlice"

const { RangePicker } = DatePicker

const ResearchPage = () => {
  const dispatch = useAppDispatch()
  const { items, loading } = useAppSelector((state) => state.researchProjects)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ResearchProject | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewingItem, setViewingItem] = useState<ResearchProject | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(fetchResearchProjects() as any)
  }, [dispatch])

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (record: ResearchProject) => {
    setEditingItem(record)
    form.setFieldsValue({
      ...record,
      dateRange: record.startDate && record.endDate ? [dayjs(record.startDate), dayjs(record.endDate)] : undefined,
      members: record.members?.map((m: any) => m.name || m).join(', '),
      documentIds: record.documentIds?.join(', '),
      summary: record.summary?.content || (typeof record.summary === 'string' ? record.summary : JSON.stringify(record.summary || "")),
    })
    setIsModalOpen(true)
  }

  const handleView = (record: ResearchProject) => {
    setViewingItem(record)
    setIsViewModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteResearchProject(id) as any)
      message.success("Project deleted successfully!")
    } catch (error) {
      message.error("Failed to delete project")
    }
  }

  const handlePublish = async (id: string) => {
    try {
      await dispatch(publishResearchProject(id) as any)
      message.success("Project published!")
      dispatch(fetchResearchProjects() as any)
    } catch (error) {
      message.error("Failed to publish project")
    }
  }

  const handleSubmit = async (values: any) => {
    const { dateRange, members, documentIds, summary, ...rest } = values
    
    // Transform members: comma separated string -> array of objects
    const formattedMembers = typeof members === 'string' 
      ? members.split(',').map((m: string) => ({ name: m.trim() })).filter((m: any) => m.name)
      : []

    // Transform documentIds: comma separated string -> array of strings
    const formattedDocIds = typeof documentIds === 'string'
      ? documentIds.split(',').map((d: string) => d.trim()).filter(Boolean)
      : []

    // Transform summary: string -> object
    const formattedSummary = typeof summary === 'string' ? { content: summary } : {}

    const data: Partial<ResearchProject> = {
      ...rest,
      startDate: dateRange?.[0]?.toISOString(),
      endDate: dateRange?.[1]?.toISOString(),
      members: formattedMembers,
      documentIds: formattedDocIds,
      summary: formattedSummary,
    }

    try {
      if (editingItem && editingItem.id) {
        await dispatch(updateResearchProject({ id: editingItem.id, data }) as any)
        message.success("Project updated successfully!")
      } else {
        await dispatch(createResearchProject(data) as any)
        message.success("Project created successfully!")
      }
      setIsModalOpen(false)
      form.resetFields()
      dispatch(fetchResearchProjects() as any)
    } catch (error) {
      message.error("Failed to save project")
    }
  }

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 250,
      render: (title: string) => <span className="font-medium text-blue-700">{title}</span>,
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      width: 180,
      render: (slug: string) => <span className="text-xs text-gray-500">{slug}</span>,
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      width: 120,
      render: (state: string) => (
        <Tag color={state === "PUBLISHED" ? "green" : "orange"} className="font-medium">
          {state}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 280,
      fixed: 'right' as const,
      render: (_: any, record: ResearchProject) => (
        <Space size="small" className="flex-nowrap">
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            title="View Details"
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Edit"
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id!)}
            title="Delete"
          />
          {record.state === "DRAFT" && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handlePublish(record.id!)}
              style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
            >
              Publish
            </Button>
          )}
          {record.state === "PUBLISHED" && (
            <Tag color="green" icon={<FileTextOutlined />} className="px-3 py-1 text-sm">
              Published
            </Tag>
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
            <span className="text-lg font-semibold">Research Projects Management</span>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAdd}
              className="min-w-fit"
            >
              <span className="hidden sm:inline">Add Project</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        }
      >
        <Table
          columns={columns as any}
          dataSource={items}
          rowKey="id"
          loading={loading}
          scroll={{ x: 800 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} projects`,
          }}
          className="border-0"
        />
      </Card>

      <Modal
        title={editingItem ? "Edit Project" : "Add New Project"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'Please enter the project title' }]}
          >
            <Input placeholder="Project Title" />
          </Form.Item>
          <Form.Item
            label="Slug"
            name="slug"
            rules={[{ required: true, message: 'Please enter the slug' }]}
          >
            <Input placeholder="project-slug" />
          </Form.Item>
          <Form.Item
            label="Summary"
            name="summary"
          >
            <Input.TextArea rows={3} placeholder="Project summary" />
          </Form.Item>
          <Form.Item
            label="Date Range"
            name="dateRange"
          >
            <RangePicker />
          </Form.Item>
          <Form.Item
            label="Members"
            name="members"
          >
            <Input placeholder="Comma separated member names" />
          </Form.Item>
          <Form.Item
            label="Document IDs"
            name="documentIds"
          >
            <Input placeholder="Comma separated document IDs" />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {editingItem ? "Update" : "Create"}
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title="Project Details"
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalOpen(false)}>
            Close
          </Button>
        ]}
        width={700}
      >
        {viewingItem && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Title</h3>
                <p className="text-base font-semibold">{viewingItem.title}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Slug</h3>
                <p className="text-base">{viewingItem.slug}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <Tag color={viewingItem.state === "PUBLISHED" ? "green" : "orange"}>
                  {viewingItem.state}
                </Tag>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                <p>
                  {viewingItem.startDate ? dayjs(viewingItem.startDate).format('MMM D, YYYY') : 'N/A'} 
                  {' - '} 
                  {viewingItem.endDate ? dayjs(viewingItem.endDate).format('MMM D, YYYY') : 'N/A'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Summary</h3>
              <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                {typeof viewingItem.summary === 'object' && viewingItem.summary?.content 
                  ? viewingItem.summary.content 
                  : (typeof viewingItem.summary === 'string' ? viewingItem.summary : 'No summary available')}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Members</h3>
              <div className="flex flex-wrap gap-2">
                {viewingItem.members && viewingItem.members.length > 0 ? (
                  viewingItem.members.map((member: any, index: number) => (
                    <Tag key={index} color="blue">{member.name || member}</Tag>
                  ))
                ) : (
                  <span className="text-gray-400 italic">No members listed</span>
                )}
              </div>
            </div>

            {viewingItem.documentIds && viewingItem.documentIds.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Documents</h3>
                <div className="flex flex-wrap gap-2">
                  {viewingItem.documentIds.map((docId: string, index: number) => (
                    <Tag key={index} icon={<FileTextOutlined />}>{docId}</Tag>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ResearchPage
