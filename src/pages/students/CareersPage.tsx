import { useEffect, useState } from "react"
import { Card, Button, Modal, Form, Input, Space, message, Popconfirm, Tag, Descriptions } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, BankOutlined, LinkOutlined, EyeOutlined } from "@ant-design/icons"
import { usePermissions } from "@/hooks/usePermissions"
import TableActions from "@/components/common/TableActions"
import DataTable from "@/components/common/DataTable"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchCareers, createCareer, updateCareer, deleteCareer, type Career } from "@/store/slices/studentSlice"

const { TextArea } = Input

const CareersPage = () => {
  const dispatch = useAppDispatch()
  const { careers } = useAppSelector((state) => state.students)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editingCareer, setEditingCareer] = useState<Career | null>(null)
  const [viewingCareer, setViewingCareer] = useState<Career | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(fetchCareers() as any)
  }, [dispatch])

  const { canCreate, canView, canUpdate, canDelete } = usePermissions()
  
  const hasCareerView = canView("careers") || canView("studentlife")
  const hasCareerCreate = canCreate("careers") || canUpdate("studentlife")
  const hasCareerUpdate = canUpdate("careers") || canUpdate("studentlife")
  const hasCareerDelete = canDelete("careers") || canUpdate("studentlife")
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
        <Space size="small" className="flex-nowrap">
          {hasCareerView && (
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation()
                handleView(record)
              }}
              size="small"
              title="View Details"
            />
          )}
          {hasCareerUpdate && (
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation()
                handleEdit(record)
              }}
              size="small"
              title="Edit"
            />
          )}
          {hasCareerDelete && (
            <Popconfirm
              title="Delete Career?"
              description={`Are you sure you want to delete ${record.title}?`}
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
                title="Delete"
              />
            </Popconfirm>
          )}
        </Space>
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

  const handleView = (career: Career) => {
    setViewingCareer(career)
    setIsViewModalOpen(true)
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
        <DataTable
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
          rowClassName={() => 'cursor-pointer hover:bg-gray-50'}
          onRow={(record) => ({
            onClick: () => {
              if (hasCareerView) {
                handleView(record)
              }
            },
          })}
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

      {/* View Modal */}
      <Modal
        title="Career Opportunity Details"
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={[<Button key="close" onClick={() => setIsViewModalOpen(false)}>Close</Button>]}
        width={800}
      >
        {viewingCareer && (
          <Descriptions bordered column={2} className="mt-4">
            <Descriptions.Item label="Title" span={2}>{viewingCareer.title}</Descriptions.Item>
            <Descriptions.Item label="Application Link" span={2}>
              {viewingCareer.link ? (
                <a href={viewingCareer.link} target="_blank" rel="noopener noreferrer">
                  {viewingCareer.link}
                </a>
              ) : (
                <span className="text-gray-400">No link provided</span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
              <div className="max-h-60 overflow-auto whitespace-pre-wrap">
                {viewingCareer.description || 'No description'}
              </div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default CareersPage