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
  Tabs,
  Descriptions,
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
import { usePermissions } from "@/hooks/usePermissions"
import TableActions from "@/components/common/TableActions"

const { RangePicker } = DatePicker

const ResearchPage = () => {
  const dispatch = useAppDispatch()
  const { items, loading } = useAppSelector((state) => state.researchProjects)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ResearchProject | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewingItem, setViewingItem] = useState<ResearchProject | null>(null)
  const [activeState, setActiveState] = useState<string | 'ALL'>('ALL')
  const [form] = Form.useForm()
  const { canCreate, canView, canUpdate, canDelete, can } = usePermissions()

  const hasResearchView = canView("research")
  const hasResearchCreate = canCreate("research")
  const hasResearchUpdate = canUpdate("research")
  const hasResearchDelete = canDelete("research")
  const hasResearchPublish = can("research", "publish")
  const hasAnyAction = hasResearchView || hasResearchUpdate || hasResearchDelete || hasResearchPublish

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

    // Remove empty/undefined relation fields so backend doesn't try to connect missing records
    const clean = (obj: any) => {
      const out: any = {}
      Object.entries(obj).forEach(([k, v]) => {
        if (v === undefined || v === null) return
        if (Array.isArray(v) && v.length === 0) return
        if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) return
        out[k] = v
      })
      return out
    }

    const payload = clean(data)

    try {
      if (editingItem && editingItem.id) {
        await dispatch(updateResearchProject({ id: editingItem.id, data: payload }) as any)
        message.success("Project updated successfully!")
      } else {
        await dispatch(createResearchProject(payload) as any)
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
    ...(hasAnyAction ? [{
      title: "Actions",
      key: "actions",
      width: 250,
      fixed: 'right' as const,
      render: (_: any, record: ResearchProject) => (
        <Space size="small" className="flex-nowrap">
          <TableActions
            resource="research"
            onView={() => handleView(record)}
            onEdit={() => handleEdit(record)}
            onDelete={() => handleDelete(record.id!)}
            deleteConfirmTitle="Delete Research Project?"
            deleteConfirmDescription={`Are you sure you want to delete "${record.title}"?`}
            record={record}
            allowEditIfOwner={true}
            ownerIdField="createdById"
          />
          {hasResearchPublish && record.state === "DRAFT" && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handlePublish(record.id!)}
              size="small"
              style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
            >
              Publish
            </Button>
          )}
          {record.state === "PUBLISHED" && (
            <Tag color="green" icon={<FileTextOutlined />} className="px-2 py-1 text-xs">
              Published
            </Tag>
          )}
        </Space>
      ),
    }] : []),
  ]

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card
        title={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-lg font-semibold">Research Projects Management</span>
            {hasResearchCreate && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleAdd}
                className="min-w-fit"
              >
                <span className="hidden sm:inline">Add Project</span>
                <span className="sm:hidden">Add</span>
              </Button>
            )}
          </div>
        }
      >
        <Tabs
          activeKey={activeState}
          onChange={(k) => setActiveState(k)}
          items={[
            { key: "ALL", label: `All Projects (${items.length})` },
            { key: "PUBLISHED", label: `Published (${items.filter((i) => i.state === "PUBLISHED").length})` },
            { key: "DRAFT", label: `Drafts (${items.filter((i) => i.state === "DRAFT").length})` },
          ]}
          className="mb-4"
        />
        <Table
          columns={columns as any}
          dataSource={activeState === 'ALL' ? items : items.filter((it: any) => it.state === activeState)}
          rowKey="id"
          loading={loading}
          onRow={(record) => ({
            onClick: () => handleView(record),
            style: { cursor: 'pointer' }
          })}
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

        {/* Render Publications inline if the publications tab is selected (simple client-side switch) */}
        {/* For now, keep Projects view as default; when user wants Publications by default, we can switch */}

      <Modal
        title={editingItem ? "Edit Project" : "Add New Project"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
        destroyOnHidden
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
        width={800}
      >
        {viewingItem && (
          <Descriptions bordered column={2} className="mt-4">
            <Descriptions.Item label="Title" span={2}>{viewingItem.title}</Descriptions.Item>
            <Descriptions.Item label="Slug" span={2}><code>{viewingItem.slug}</code></Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={viewingItem.state === "PUBLISHED" ? "green" : "orange"}>
                {viewingItem.state}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Duration">
              {viewingItem.startDate ? dayjs(viewingItem.startDate).format('MMM D, YYYY') : 'N/A'}
              {' - '}
              {viewingItem.endDate ? dayjs(viewingItem.endDate).format('MMM D, YYYY') : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Summary" span={2}>
              <div className="max-h-60 overflow-auto whitespace-pre-wrap">
                {typeof viewingItem.summary === 'object' && viewingItem.summary?.content
                  ? viewingItem.summary.content
                  : (typeof viewingItem.summary === 'string' ? viewingItem.summary : 'No summary available')}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Members" span={2}>
              {viewingItem.members && viewingItem.members.length > 0 ? (
                viewingItem.members.map((member: any, index: number) => (
                  <Tag key={index} color="blue">{member.name || member}</Tag>
                ))
              ) : (
                <span className="text-gray-400 italic">No members listed</span>
              )}
            </Descriptions.Item>
            {viewingItem.documentIds && viewingItem.documentIds.length > 0 && (
              <Descriptions.Item label="Documents" span={2}>
                {viewingItem.documentIds.map((docId: string, index: number) => (
                  <Tag key={index} icon={<FileTextOutlined />}>{docId}</Tag>
                ))}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default ResearchPage
