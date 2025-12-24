import { useEffect, useState } from "react"
import { Card, Table, Button, Modal, Form, Input, Space, message, Popconfirm, Tag } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, BankOutlined, LinkOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchCareers, createCareer, updateCareer, deleteCareer, type Career } from "@/store/slices/studentSlice"

const { TextArea } = Input

const CareersPage = () => {
  const dispatch = useAppDispatch()
  const { careers } = useAppSelector((state) => state.students)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCareer, setEditingCareer] = useState<Career | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(fetchCareers() as any)
  }, [dispatch])

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (title: string) => (
        <span className="font-medium text-green-600">{title}</span>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (description: string) => (
        <span className="text-gray-600">{description?.substring(0, 120)}...</span>
      ),
    },
    {
      title: "Link",
      dataIndex: "link",
      key: "link",
      render: (link: string) => link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500">
          <LinkOutlined /> View Opportunity
        </a>
      ) : (
        <span className="text-gray-400">No link</span>
      ),
    },
    {
      title: "Order",
      dataIndex: "order",
      key: "order",
      width: 80,
      render: (order: number) => <Tag color="green">{order}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_: any, record: Career) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="text-blue-600"
          />
          <Popconfirm
            title="Are you sure you want to delete this career opportunity?"
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
    setEditingCareer(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (career: Career) => {
    setEditingCareer(career)
    form.setFieldsValue(career)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteCareer(id) as any)
      message.success("Career opportunity deleted successfully!")
    } catch (error) {
      message.error("Failed to delete career opportunity")
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      // Process the form values
      const processedValues = {
        ...values,
        order: parseInt(values.order) || 0,
        link: values.link?.trim() || ''
      }

      // Remove link if empty to avoid validation issues
      if (!processedValues.link) {
        delete processedValues.link
      }

      if (editingCareer) {
        await dispatch(updateCareer({ id: editingCareer.id, data: processedValues }) as any)
        message.success("Career opportunity updated successfully!")
      } else {
        await dispatch(createCareer(processedValues) as any)
        message.success("Career opportunity created successfully!")
      }
      setIsModalOpen(false)
      form.resetFields()
    } catch (error) {
      message.error(`Failed to ${editingCareer ? 'update' : 'create'} career opportunity`)
    }
  }

  const careersArray = careers.data || []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BankOutlined className="text-green-600" />
            Career Opportunities Management
          </h1>
          <p className="text-gray-600 mt-1">Manage career opportunities and job postings for students</p>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAdd}
          size="large"
        >
          Add Career Opportunity
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={careersArray}
          rowKey="id"
          loading={careers.loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} opportunities`,
          }}
        />
      </Card>

      <Modal
        title={editingCareer ? "Edit Career Opportunity" : "Add New Career Opportunity"}
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
            label="Opportunity Title"
            name="title"
            rules={[{ required: true, message: 'Please enter the opportunity title' }]}
          >
            <Input placeholder="e.g., Software Developer Internship" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter the opportunity description' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Describe the career opportunity, requirements, and benefits"
            />
          </Form.Item>

          <Form.Item
            label="Application/Details Link"
            name="link"
            rules={[
              {
                type: 'url',
                message: 'Please enter a valid URL',
              },
            ]}
          >
            <Input placeholder="https://company.com/careers/job-posting" />
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
              {editingCareer ? "Update" : "Create"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default CareersPage