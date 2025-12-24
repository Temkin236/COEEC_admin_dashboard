import { useEffect, useState } from "react"
import { Card, Table, Button, Modal, Form, Input, Space, message, Popconfirm, Tag } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined, LinkOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchClubs, createClub, updateClub, deleteClub, type Club } from "@/store/slices/studentSlice"

const { TextArea } = Input

const ClubsPage = () => {
  const dispatch = useAppDispatch()
  const { clubs } = useAppSelector((state) => state.students)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClub, setEditingClub] = useState<Club | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(fetchClubs() as any)
  }, [dispatch])

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string) => (
        <span className="font-medium text-blue-600">{name}</span>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (description: string) => (
        <span className="text-gray-600">{description?.substring(0, 100)}...</span>
      ),
    },
    {
      title: "Website",
      dataIndex: "websiteUrl",
      key: "websiteUrl",
      render: (url: string) => url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500">
          <LinkOutlined /> Visit
        </a>
      ) : (
        <span className="text-gray-400">No website</span>
      ),
    },
    {
      title: "Order",
      dataIndex: "order",
      key: "order",
      width: 80,
      render: (order: number) => <Tag color="blue">{order}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_: any, record: Club) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="text-blue-600"
          />
          <Popconfirm
            title="Are you sure you want to delete this club?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              className="text-red-600"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const handleAdd = () => {
    setEditingClub(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (club: Club) => {
    setEditingClub(club)
    form.setFieldsValue(club)
    setIsModalOpen(true)
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
        images: values.images || []
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <TeamOutlined className="text-blue-600" />
            Student Clubs Management
          </h1>
          <p className="text-gray-600 mt-1">Manage student clubs and organizations</p>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAdd}
          size="large"
        >
          Add Club
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={clubsArray}
          rowKey="id"
          loading={clubs.loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} clubs`,
          }}
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
    </div>
  )
}

export default ClubsPage