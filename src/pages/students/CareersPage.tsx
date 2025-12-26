import { useEffect, useState } from "react"
import { Card, Table, Button, Modal, Form, Input, Space, message, Popconfirm, Tag } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, BankOutlined, LinkOutlined } from "@ant-design/icons"
import { usePermissions } from "@/hooks/usePermissions"
import TableActions from "@/components/common/TableActions"
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

  const { canCreate, canView, canUpdate, canDelete } = usePermissions()
  const hasCareerView = canView("careers")
  const hasCareerCreate = canCreate("careers")
  const hasCareerUpdate = canUpdate("careers")
  const hasCareerDelete = canDelete("careers")
  const hasAnyAction = hasCareerView || hasCareerUpdate || hasCareerDelete

  const columns = [
    {
      title: "Opportunity Title",
      dataIndex: "title",
      key: "title",
      width: 250,
      render: (title: string) => (
        <div className="font-medium text-green-600">{title}</div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: {
        showTitle: true,
      },
      render: (description: string) => (
        <div className="max-w-xs text-gray-600">{description}</div>
      ),
    },
    {
      title: "Link",
      dataIndex: "link",
      key: "link",
      width: 150,
      render: (link: string) => link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
          <LinkOutlined /> View
        </a>
      ) : (
        <span className="text-gray-400 text-xs">No link</span>
      ),
    },
    {
      title: "Order",
      dataIndex: "order",
      key: "order",
      width: 100,
      render: (order: number) => <Tag color="green" className="font-medium">{order}</Tag>,
    },
    ...(hasAnyAction ? [{
      title: "Actions",
      key: "actions",
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: Career) => (
        <TableActions
          resource="careers"
          onView={() => handleEdit(record)}
          onEdit={() => handleEdit(record)}
          onDelete={() => handleDelete(record.id)}
          deleteConfirmTitle="Delete Career?"
          deleteConfirmDescription={`Are you sure you want to delete ${record.title}?`}
          record={record}
        />
      ),
    }] : []),
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
    <div className="p-4 md:p-6 space-y-6">
      <Card
        title={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BankOutlined className="text-green-600" />
              <div>
                <span className="text-lg font-semibold">Career Opportunities Management</span>
                <div className="text-sm text-gray-500">Manage career opportunities and job postings for students</div>
              </div>
            </div>
            {hasCareerCreate && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleAdd}
                className="min-w-fit"
              >
                <span className="hidden sm:inline">Add Career Opportunity</span>
                <span className="sm:hidden">Add</span>
              </Button>
            )}
          </div>
        }
      >
        <Table
          columns={columns as any}
          dataSource={careersArray}
          rowKey="id"
          loading={careers.loading}
          scroll={{ x: 800 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} opportunities`,
          }}
          className="border-0"
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