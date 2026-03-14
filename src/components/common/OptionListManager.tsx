import { useEffect, useState } from "react"
import { Button, Card, Form, Input, Modal, Space, Table, message } from "antd"
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons"
import {
  OptionListItem,
  OptionListType,
  createOptionListItem,
  deleteOptionListItem,
  fetchOptionListItems,
  updateOptionListItem,
} from "@/api/optionListsApi"

interface OptionListManagerProps {
  title: string
  type: OptionListType
  addButtonLabel?: string
}

const OptionListManager = ({ title, type, addButtonLabel = "Add" }: OptionListManagerProps) => {
  const [items, setItems] = useState<OptionListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<OptionListItem | null>(null)
  const [form] = Form.useForm()

  const loadItems = async () => {
    try {
      setLoading(true)
      const response = await fetchOptionListItems(type)
      setItems(response)
    } catch (error: any) {
      message.error(error?.response?.data?.message || `Failed to load ${title.toLowerCase()}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [type])

  const openAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const openEdit = (record: OptionListItem) => {
    setEditingItem(record)
    form.setFieldsValue({ name: record.name })
    setIsModalOpen(true)
  }

  const handleDelete = (record: OptionListItem) => {
    Modal.confirm({
      title: `Delete ${title} item`,
      content: `Are you sure you want to delete \"${record.name}\"?`,
      okButtonProps: { danger: true },
      async onOk() {
        try {
          await deleteOptionListItem(type, record.id)
          message.success("Deleted successfully")
          await loadItems()
        } catch (error: any) {
          message.error(error?.response?.data?.message || "Failed to delete item")
        }
      },
    })
  }

  const handleSubmit = async (values: { name: string }) => {
    try {
      const trimmedName = values.name.trim()
      if (!trimmedName) {
        message.error("Name is required")
        return
      }

      if (editingItem) {
        await updateOptionListItem(type, editingItem.id, trimmedName)
        message.success("Updated successfully")
      } else {
        await createOptionListItem(type, trimmedName)
        message.success("Created successfully")
      }

      setIsModalOpen(false)
      form.resetFields()
      await loadItems()
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Failed to save item")
    }
  }

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 140,
      render: (_: any, record: OptionListItem) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card
        title={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-lg font-semibold">{title}</span>
            <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
              {addButtonLabel}
            </Button>
          </div>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={items}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingItem ? `Edit ${title}` : `Add ${title}`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter name" }]}
          >
            <Input placeholder="Enter name" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default OptionListManager
