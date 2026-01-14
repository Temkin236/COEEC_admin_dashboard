import { useEffect, useState } from "react"
import { Card, Button, Modal, Form, Input, Space, message, Popconfirm, Tag, Descriptions } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined, LinkOutlined, EyeOutlined } from "@ant-design/icons"
import { usePermissions } from "@/hooks/usePermissions"
import TableActions from "@/components/common/TableActions"
import DataTable from "@/components/common/DataTable"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchClubs, createClub, updateClub, deleteClub, type Club } from "@/store/slices/studentSlice"

const { TextArea } = Input

const ClubsPage = () => {
  const dispatch = useAppDispatch()
  const { clubs } = useAppSelector((state) => state.students)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editingClub, setEditingClub] = useState<Club | null>(null)
  const [viewingClub, setViewingClub] = useState<Club | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(fetchClubs() as any)
  }, [dispatch])

  const { canCreate, canView, canUpdate, canDelete } = usePermissions()

  const hasClubView = canView("clubs") || canView("studentlife")
  const hasClubCreate = canCreate("clubs") || canUpdate("studentlife")
  const hasClubUpdate = canUpdate("clubs") || canUpdate("studentlife")
  const hasClubDelete = canDelete("clubs") || canUpdate("studentlife")

  const hasAnyAction = hasClubView || hasClubUpdate || hasClubDelete

  const columns = [
    {
      title: "Club Name",
      dataIndex: "name",
      key: "name",
      width: 250,
      render: (name: string) => (
        <div className="font-medium text-blue-600">{name}</div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: {
        showTitle: true,
      },
      render: (description: any) => {
        const text = description && typeof description === 'object' ? (description.content || '') : (description || '')
        return <div className="max-w-xs text-gray-600">{text}</div>
      },
    },
    {
      title: "Website",
      dataIndex: "websiteUrl",
      key: "websiteUrl",
      width: 150,
      render: (url: string) => url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
          <LinkOutlined /> Visit
        </a>
      ) : (
        <span className="text-gray-400 text-xs">No website</span>
      ),
    },
    {
      title: "Order",
      dataIndex: "order",
      key: "order",
      width: 100,
      render: (order: number) => <Tag color="blue" className="font-medium">{order}</Tag>,
    },
    ...(hasAnyAction ? [{
      title: "Actions",
      key: "actions",
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: Club) => (
        <Space size="small" className="flex-nowrap">
          {hasClubView && (
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation()
                handleView(record)
              }}
              size="small"
              title="View Club"
            />
          )}
          {hasClubUpdate && (
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation()
                handleEdit(record)
              }}
              size="small"
              title="Edit Club"
            />
          )}
          {hasClubDelete && (
            <Popconfirm
              title="Are you sure you want to delete this club?"
              onConfirm={(e) => {
                e?.stopPropagation()
                handleDelete(record.id)
              }}
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => e.stopPropagation()}
                size="small"
                title="Delete Club"
              />
            </Popconfirm>
          )}
        </Space>
      ),
    }] : []),
  ]

  const handleAdd = () => {
    setEditingClub(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (club: Club) => {
    setEditingClub(club)
    // normalize description for form (string expected)
    const desc = club?.description && typeof club.description === 'object' ? club.description.content : club?.description
    form.setFieldsValue({ ...club, description: desc })
    setIsModalOpen(true)
  }

  const handleView = (club: Club) => {
    setViewingClub(club)
    setIsViewModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteClub(id) as any)
      message.success("Club deleted successfully!")
    } catch (error) {
      message.error("Failed to delete club")
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      // Process the form values
      const processedValues = {
        ...values,
        order: parseInt(values.order) || 0,
        websiteUrl: values.websiteUrl?.trim() || '',
        images: values.images || [],
        // API expects description as an object { content: string }
        description: { content: values.description || '' },
      }

      // Remove websiteUrl if empty to avoid validation issues
      if (!processedValues.websiteUrl) {
        delete processedValues.websiteUrl
      }

      if (editingClub) {
        await dispatch(updateClub({ id: editingClub.id, data: processedValues }) as any)
        message.success("Club updated successfully!")
      } else {
        await dispatch(createClub(processedValues) as any)
        message.success("Club created successfully!")
      }
      setIsModalOpen(false)
      form.resetFields()
    } catch (error) {
      message.error(`Failed to ${editingClub ? 'update' : 'create'} club`)
    }
  }

  const clubsArray = clubs.data || []

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card
        title={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <TeamOutlined className="text-blue-600" />
              <div>
                <span className="text-lg font-semibold">Student Clubs Management</span>
                
              </div>
            </div>
            {hasClubCreate && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                className="min-w-fit"
              >
                <span className="hidden sm:inline">Add Club</span>
                <span className="sm:hidden">Add</span>
              </Button>
            )}
          </div>
        }
      >
        <DataTable
          columns={columns as any}
          dataSource={clubsArray}
          rowKey="id"
          loading={clubs.loading}
          scroll={{ x: 800 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} clubs`,
          }}
          className="border-0"
          rowClassName={() => 'cursor-pointer hover:bg-gray-50'}
          onRow={(record) => ({
            onClick: () => {
              if (hasClubView) {
                handleView(record)
              }
            },
          })}
        />
      </Card>

      <Modal
        title={editingClub ? "Edit Club" : "Add New Club"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            label="Club Name"
            name="name"
            rules={[{ required: true, message: 'Please enter the club name' }]}
          >
            <Input placeholder="e.g., Computer Science Club" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter the club description' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Describe the club's activities and purpose"
            />
          </Form.Item>

          <Form.Item
            label="Website URL"
            name="websiteUrl"
            rules={[
              {
                type: 'url',
                message: 'Please enter a valid URL',
              },
            ]}
          >
            <Input placeholder="https://club-website.com" />
          </Form.Item>

          <Form.Item
            label="Display Order"
            name="order"
            rules={[{ required: true, message: 'Please enter the display order' }]}
          >
            <Input 
              type="number" 
              placeholder="1" 
              min="0"
              onChange={(e) => {
                const value = e.target.value
                form.setFieldValue('order', value ? parseInt(value) : 0)
              }}
            />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {editingClub ? "Update" : "Create"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title="Club Details"
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={[<Button key="close" onClick={() => setIsViewModalOpen(false)}>Close</Button>]}
        width={800}
      >
        {viewingClub && (
          <Descriptions bordered column={2} className="mt-4">
            <Descriptions.Item label="Club Name" span={2}>{viewingClub.name}</Descriptions.Item>
            <Descriptions.Item label="Website" span={2}>
              {viewingClub.websiteUrl ? (
                <a href={viewingClub.websiteUrl} target="_blank" rel="noopener noreferrer">
                  {viewingClub.websiteUrl}
                </a>
              ) : (
                <span className="text-gray-400">No website</span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
              <div className="max-h-60 overflow-auto whitespace-pre-wrap">
                {viewingClub.description
                  ? (typeof viewingClub.description === 'object' && viewingClub.description?.content 
                    ? viewingClub.description.content 
                    : (typeof viewingClub.description === 'string' ? viewingClub.description : 'No description'))
                  : 'No description'}
              </div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default ClubsPage