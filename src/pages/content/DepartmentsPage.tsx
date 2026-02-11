"use client"

import { useEffect, useState } from "react"
import {
  Card,
  Button,
  Table,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Descriptions,
  Tabs,
  Upload,
} from "antd"
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  InboxOutlined,
  ReloadOutlined,
  LoadingOutlined,
} from "@ant-design/icons"
import { usePermissions } from "@/hooks/usePermissions"
import TableActions from "@/components/common/TableActions"
import DataTable from "@/components/common/DataTable"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import axiosInstance from "@/utils/axios"
import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "@/store/slices/departmentSlice"
import { fetchStaff } from "@/store/slices/staffSlice"

const { TextArea } = Input

const DepartmentsPage = () => {
  const dispatch = useAppDispatch()

  // ✅ SAFE DEFAULTS — THIS IS THE KEY FIX
  const { items = [], loading } = useAppSelector(
    (state) => state.departments
  )
  const { items: staffItems = [] } = useAppSelector(
    (state) => state.staff
  )

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [viewingItem, setViewingItem] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [form] = Form.useForm()

  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Filter departments based on active tab
  const filteredItems = items.filter(item => {
    if (activeTab === "active") return !item.isDisabled
    if (activeTab === "archived") return item.isDisabled
    return true
  })

  useEffect(() => {
    dispatch(fetchDepartments())
    dispatch(fetchStaff({ limit: 100 }))
  }, [dispatch])

  const { permissions: userPermissions, canView, canCreate, canUpdate, canDelete } = usePermissions()
  const hasDeptView = canView("departments")
  const hasDeptCreate = canCreate("departments")
  const hasDeptUpdate = canUpdate("departments")
  const hasDeptDelete = canDelete("departments")

  const cuidRegex = /^[cC][^\s-]{8,}$/

  const handleCreate = () => {
    setEditingItem(null)
    setImageUrl(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (record: any) => {
    setEditingItem(record)

    const initialValues = { ...record }

    if (record.featuredImage) {
        setImageUrl(record.featuredImage.url)
        initialValues.featuredImageId = record.featuredImage.id
    } else if (record.featuredImageId) {
        // If image ID exists but object not fully loaded, try to use it (though URL might be missing)
        initialValues.featuredImageId = record.featuredImageId
        setImageUrl(null)
    } else {
        setImageUrl(null)
    }

    if (initialValues.headId && !cuidRegex.test(initialValues.headId)) {
      initialValues.headId = undefined
    }

    if (initialValues.pageId && !cuidRegex.test(initialValues.pageId)) {
      initialValues.pageId = undefined
    }

    form.setFieldsValue(initialValues)
    setIsModalOpen(true)
  }

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("visibility", "PUBLIC");
      const res = await axiosInstance.post("/media/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" }
      });
      const data = res.data.data || res.data;
      const id = data.id || (Array.isArray(data) ? data[0]?.id : null);
      const url = data.url || (Array.isArray(data) ? data[0]?.url : null);
      
      if (id) {
          form.setFieldsValue({ featuredImageId: id });
          setImageUrl(url); // For preview
          message.success("Image uploaded successfully");
      }
    } catch (error) {
       console.error(error);
       message.error("Upload failed");
    } finally {
       setUploading(false);
    }
    return false; // Stop auto upload
  };

  const handleView = (record: any) => {
    setViewingItem(record)
    setViewModalOpen(true)
  }

  const handleDeactivate = (record: any) => {
    const isCurrentlyDisabled = record.isDisabled
    const action = isCurrentlyDisabled ? "reactivate" : "deactivate"
    const actionPast = isCurrentlyDisabled ? "reactivated" : "deactivated"
    
    Modal.confirm({
      title: `${isCurrentlyDisabled ? 'Reactivate' : 'Deactivate'} Department`,
      content: `Are you sure you want to ${action} "${record.name}"?`,
      okText: isCurrentlyDisabled ? 'Reactivate' : 'Deactivate',
      okType: isCurrentlyDisabled ? 'primary' : 'danger',
      onOk: async () => {
        try {
          await dispatch(updateDepartment({ 
            id: record.id, 
            data: { ...record, isDisabled: !isCurrentlyDisabled } 
          })).unwrap()
          message.success(`Department ${actionPast} successfully`)
          dispatch(fetchDepartments())
        } catch (error: any) {
          message.error(error?.message || `Failed to ${action} department`)
        }
      },
    })
  }

  const handleSubmit = async (values: any) => {
    try {
      const cleanedValues = { ...values }

      if (!cleanedValues.headId || !cuidRegex.test(cleanedValues.headId)) {
        delete cleanedValues.headId
      }

      if (!cleanedValues.pageId || !cuidRegex.test(cleanedValues.pageId)) {
        delete cleanedValues.pageId
      }

      if (editingItem) {
        await dispatch(
          updateDepartment({ id: editingItem.id, data: cleanedValues })
        ).unwrap()
        message.success("Department updated successfully")
      } else {
        await dispatch(createDepartment(cleanedValues)).unwrap()
        message.success("Department created successfully")
      }

      dispatch(fetchDepartments())
      setIsModalOpen(false)
      form.resetFields()
    } catch (error: any) {
      message.error(error?.message || "Operation failed")
    }
  }

  const columns = [
    {
      title: "Department",
      dataIndex: "name",
      key: "name",
      width: 250,
      render: (name: string, record: any) => (
        <div className={record.isDisabled ? "opacity-60" : ""}>
          <div className="font-medium flex items-center gap-2 mb-1">
            {name}
            {record.isDisabled && <Tag color="orange" size="small">Archived</Tag>}
          </div>
          <div className="text-xs text-gray-500">{record.slug}</div>
        </div>
      ),
    },
    {
      title: "Head",
      dataIndex: "headId",
      key: "headId",
      width: 200,
      render: (headId: string, record: any) => {
        const content = (() => {
          if (!headId) return <Tag size="small">No Head Assigned</Tag>

          const staff = staffItems.find((s) => s.id === headId)
          if (staff) {
            const name = staff.displayName || `${staff.firstName || ""} ${staff.lastName || ""}`.trim()
            return (
              <div className="font-medium">{name || "Unnamed"}</div>
            )
          }

          if (!cuidRegex.test(headId)) {
            return <Tag color="warning" size="small">Demo: {headId}</Tag>
          }

          return headId
        })()
        
        return <div className={record.isDisabled ? "opacity-60" : ""}>{content}</div>
      },
    },
    {
      title: "Status",
      dataIndex: "isDisabled",
      key: "status",
      width: 100,
      render: (isDisabled: boolean) => (
        <Tag color={isDisabled ? "orange" : "green"} className="font-medium">
          {isDisabled ? "Archived" : "Active"}
        </Tag>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: {
        showTitle: true,
      },
      render: (text: string, record: any) => (
        <div className={`${record.isDisabled ? "opacity-60" : ""} max-w-xs`}>
          {text}
        </div>
      ),
    },
    ...(hasDeptView || hasDeptUpdate || hasDeptDelete ? [{
      title: "Actions",
      key: "actions",
      width: 140,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small" className="flex-nowrap">
          {/* View button shown only if user can view */}
          <TableActions
            resource="departments"
            onView={() => handleView(record)}
            onEdit={() => handleEdit(record)}
            onDelete={() => {
              // If user can delete globally, use delete flow; otherwise don't show delete
              if (hasDeptDelete) {
                // confirm then delete
                Modal.confirm({
                  title: "Delete Department",
                  content: `Remove "${record.name}" permanently?`,
                  okText: "Delete",
                  okButtonProps: { danger: true },
                  onOk: async () => {
                    try {
                      await dispatch(deleteDepartment(record.id)).unwrap()
                      message.success("Department deleted")
                      dispatch(fetchDepartments())
                    } catch (err: any) {
                      message.error(err?.message || "Failed to delete")
                    }
                  },
                })
              }
            }}
            record={record}
            allowEditIfOwner={false}
            ownerIdField={"createdById"}
          />

          {/* Archive/reactivate - treat as update permission */}
          {hasDeptUpdate && (
            <Button
              type="text"
              danger={!record.isDisabled}
              icon={record.isDisabled ? <ReloadOutlined /> : <InboxOutlined />}
              onClick={() => handleDeactivate(record)}
              title={record.isDisabled ? "Reactivate Department" : "Archive Department"}
              size="small"
            />
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
            <span className="text-lg font-semibold">Departments</span>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              className="min-w-fit"
            >
              <span className="hidden sm:inline">Add Department</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: "all", label: "All Departments" },
            { key: "active", label: "Active" },
            { key: "archived", label: "Archived" },
          ]}
          className="mb-4"
        />
        <DataTable
          columns={columns as any}
          dataSource={filteredItems}
          loading={loading}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => handleView(record),
            style: { cursor: 'pointer' }
          })}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} departments`
          }}
          rowClassName={(record) => 
            record.isDisabled ? "bg-gray-50" : ""
          }
          scroll={{ x: 800 }}
          className="border-0"
        />
      </Card>

      <Modal
        title={editingItem ? "Edit Department" : "Add Department"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        width={"90%"}
        style={{ maxWidth: 600 }}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Department Name"
            rules={[{ required: true }]}
          >
            <Input onChange={(e) => {
               // Auto-generate slug if slug is empty
               const val = e.target.value;
               const currentSlug = form.getFieldValue('slug');
               if (!currentSlug && !editingItem) {
                 form.setFieldsValue({ 
                   slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') 
                 });
               }
            }} />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Slug (URL Identifier)"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Cover Image">
             <Form.Item name="featuredImageId" hidden>
                <Input />
             </Form.Item>
             <div className="flex flex-col gap-3">
                 {imageUrl && (
                    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                      <img 
                        src={imageUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                 )}
                 <Upload
                    beforeUpload={(file) => {
                        handleImageUpload(file);
                        return false;
                    }}
                    showUploadList={false}
                    accept="image/*"
                 >
                    <Button icon={uploading ? <LoadingOutlined /> : <PlusOutlined />} loading={uploading}>
                        {imageUrl ? "Replace Cover Image" : "Upload Cover Image"}
                    </Button>
                 </Upload>
             </div>
          </Form.Item>

          <Form.Item name="headId" label="Department Head (Staff Member)">
            <Select
              allowClear
              showSearch
              placeholder="Select department head"
              options={[
                { value: "", label: "--- None ---" },
                ...(staffItems || []).map((s) => {
                  const label = s.displayName || `${s.firstName || ""} ${s.lastName || ""}`.trim() || "Unnamed"
                  return { value: s.id, label }
                }),
              ]}
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item name="pageId" label="Page ID">
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true }]}
          >
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Department Details"
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={<Button onClick={() => setViewModalOpen(false)}>Close</Button>}
        width={"90%"}
        style={{ maxWidth: 600 }}
      >
        {viewingItem && (
          <Descriptions bordered column={1} layout="vertical">
             <Descriptions.Item label="Cover Image">
               {viewingItem.featuredImage ? (
                  <img 
                    src={viewingItem.featuredImage.url} 
                    alt={viewingItem.name} 
                    className="w-full h-48 object-cover rounded-lg border border-gray-200" 
                  />
               ) : (
                  <span className="text-gray-400 italic">No cover image set</span>
               )}
            </Descriptions.Item>
            <Descriptions.Item label="Name">
              {viewingItem.name}
            </Descriptions.Item>
            <Descriptions.Item label="Slug">
              {viewingItem.slug}
            </Descriptions.Item>
            <Descriptions.Item label="Head">
              {staffItems.find((s) => s.id === viewingItem.headId)
                ? `${staffItems.find((s) => s.id === viewingItem.headId)
                    ?.firstName} ${
                    staffItems.find((s) => s.id === viewingItem.headId)
                      ?.lastName
                  }`
                : viewingItem.headId || "None"}
            </Descriptions.Item>
            <Descriptions.Item label="Page ID">
              {viewingItem.pageId}
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {viewingItem.description}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default DepartmentsPage
