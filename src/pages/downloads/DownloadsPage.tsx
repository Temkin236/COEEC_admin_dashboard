"use client"

import { useEffect, useState } from "react"
import {
  Card,
  Button,
  Space,
  Tag,
  Upload,
  Modal,
  Form,
  Input,
  Select,
  message,
  Progress,
  Spin,
} from "antd"
import {
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileOutlined,
} from "@ant-design/icons"

import DataTable from "@/components/common/DataTable"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  fetchDownloads,
  removeDownload,
  incrementDownloadCount,
} from "@/store/slices/downloadSlice"
import { fetchDepartments } from "@/store/slices/departmentSlice"
import { formatRelativeTime } from "@/utils/helpers"
import { usePermissions } from "@/hooks/usePermissions"
import axiosInstance from "@/utils/axios"
import { hasScopedPermission } from "@/utils/helpers"

const { TextArea } = Input

const DownloadsPage = () => {
  const dispatch = useAppDispatch()
  const { items, loading } = useAppSelector((state) => state.downloads)
  const { items: departments } = useAppSelector((state) => state.departments)
  const authUser = useAppSelector((state) => state.auth.user)

  const { canCreate, canDelete, canView } = usePermissions()
  const hasDownloadsCreate = canCreate("downloads")
  const hasDownloadsDelete = canDelete("downloads")
  const hasDownloadsView = canView("downloads")
  const ownDepartmentId = authUser?.departmentId || ""
  const hasDownloadsViewGlobal = hasScopedPermission(authUser?.permissions, "downloads", "view")
  const hasDownloadsViewOwn = hasScopedPermission(authUser?.permissions, "downloads", "view_own")
  const hasDownloadsCreateGlobal = hasScopedPermission(authUser?.permissions, "downloads", "create")
  const hasDownloadsCreateOwn = hasScopedPermission(authUser?.permissions, "downloads", "create_own")
  const isOwnScopedViewOnly = !!ownDepartmentId && hasDownloadsViewOwn && !hasDownloadsViewGlobal
  const isOwnScopedCreateOnly = !!ownDepartmentId && hasDownloadsCreateOwn && !hasDownloadsCreateGlobal
  const shouldFilterByDepartment = !!ownDepartmentId

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [fileToUpload, setFileToUpload] = useState<File | null>(null)
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(fetchDownloads({ page: 1, limit: 10, departmentId: shouldFilterByDepartment ? ownDepartmentId : undefined }) as any)
  }, [dispatch, shouldFilterByDepartment, ownDepartmentId])

  useEffect(() => {
    dispatch(fetchDepartments() as any)
  }, [dispatch])

  const openUploadModal = () => {
    if (isOwnScopedCreateOnly && ownDepartmentId) {
      form.setFieldValue("departmentId", ownDepartmentId)
    }
    setIsModalOpen(true)
  }

  /* ---------------- FILE UPLOAD ---------------- */
  const handleFileSelect = async (file: File) => {
    setFileToUpload(file)
    setUploading(true)
    setUploadProgress(0)

    try {
      // Try different field names until one works (backend may expect different field names)
      const fieldNames = ["file", "files", "upload", "media", "document"]
      let uploadedData: any = null
      let lastError: any = null

      for (const fieldName of fieldNames) {
        try {
          const formData = new FormData()
          formData.append(fieldName, file)
          formData.append("visibility", "PUBLIC")

          const response = await axiosInstance.post("/media/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (e) => {
              if (e.total) {
                setUploadProgress(Math.round((e.loaded / e.total) * 100))
              }
            },
          })

          uploadedData = response.data
          break // Success - stop trying other field names
        } catch (err: any) {
          lastError = err
          const errorMsg = err?.response?.data?.message || err?.message || ""
          
          // If it's an "Unexpected field" error, try the next field name
          if (errorMsg.toLowerCase().includes("unexpected field")) {
            console.log(`Field name "${fieldName}" failed, trying next...`)
            continue
          }
          
          // For other errors, throw immediately
          throw err
        }
      }

      if (!uploadedData) {
        throw lastError || new Error("Failed to upload file with any field name")
      }

      const fileData = uploadedData?.data || uploadedData
      const fileId = fileData?.id || (Array.isArray(fileData) ? fileData[0]?.id : null)

      if (!fileId) {
        throw new Error("No file ID returned from upload")
      }

      setUploadedFileId(fileId)
      message.success("File uploaded successfully")
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Upload failed")
      setFileToUpload(null)
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }

    return false
  }

  /* ---------------- CREATE DOWNLOAD ---------------- */
  const handleUpload = async (values: any) => {
    if (!uploadedFileId) {
      message.error("Upload a file first")
      return
    }

    try {
      const departmentId = isOwnScopedCreateOnly ? ownDepartmentId : values.departmentId
      await axiosInstance.post("/downloads", {
        ...values,
        departmentId,
        fileId: uploadedFileId,
      })

      message.success("Download created")
      handleModalClose()
      dispatch(fetchDownloads({ page: 1, limit: 10, departmentId: shouldFilterByDepartment ? ownDepartmentId : undefined }) as any)
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Creation failed")
    }
  }
  const visibleItems = shouldFilterByDepartment
    ? (items || []).filter((item: any) => {
        const rowDepartmentId = item.departmentId || item.department?.id
        return !!rowDepartmentId && String(rowDepartmentId) === String(ownDepartmentId)
      })
    : (items || [])


  const handleModalClose = () => {
    setIsModalOpen(false)
    form.resetFields()
    setFileToUpload(null)
    setUploadedFileId(null)
    setUploadProgress(0)
    setUploading(false)
  }

  const handleRemoveUploadedFile = () => {
    setFileToUpload(null)
    setUploadedFileId(null)
    setUploadProgress(0)
  }

  /* ---------------- DOWNLOAD ---------------- */
  const onDownload = async (record: any) => {
    const url = record?.file?.url || record?.url
    const filename = record?.file?.originalName || record?.title || "download"

    if (!url) {
      message.warning("No file available")
      return
    }

    const hide = message.loading("Downloading...", 0)

    try {
      const res = await fetch(url)
      const blob = await res.blob()

      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(blobUrl)

      dispatch(incrementDownloadCount(record.id) as any)
      message.success("Download completed")
    } catch {
      message.error("Download failed")
    } finally {
      hide()
    }
  }

  /* ---------------- DELETE ---------------- */
  const onDelete = (record: any) => {
    Modal.confirm({
      title: "Delete File",
      content: `Are you sure you want to delete "${record.title}"?`,
      okType: "danger",
      onOk: async () => {
        await dispatch(removeDownload(record.id) as any)
        message.success("File removed")
      },
    })
  }

  /* ---------------- TABLE COLUMNS ---------------- */
  const columns = [
    { title: "Title", dataIndex: "title", key: "title" },
    {
      title: "Category",
      dataIndex: "category",
      render: (c: string) => <Tag color="processing">{c}</Tag>,
    },
    {
      title: "Size",
      dataIndex: ["file", "size"],
      render: (s: number) => (s ? `${(s / 1024).toFixed(2)} KB` : "-"),
    },
    {
      title: "Uploaded",
      dataIndex: "createdAt",
      render: (d: string) => formatRelativeTime(d),
    },
    // {
    //   title: "Downloads",
    //   dataIndex: "downloadCount",
    // },
    ...(hasDownloadsView || hasDownloadsDelete
      ? [
          {
            title: "Actions",
            render: (_: any, record: any) => (
              <Space>
                {hasDownloadsView && (
                  <Button
                    type="link"
                    icon={<DownloadOutlined />}
                    onClick={() => onDownload(record)}
                  >
                    Download
                  </Button>
                )}
                {hasDownloadsDelete && (
                  <Button
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => onDelete(record)}
                  />
                )}
              </Space>
            ),
          },
        ]
      : []),
  ]

  /* ---------------- UI ---------------- */
  return (
    <div className="p-4 space-y-4">
      <Card
        title="Download Center"
        extra={
          hasDownloadsCreate && (
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={openUploadModal}
            >
              Upload File
            </Button>
          )
        }
      >
        <DataTable
          columns={columns as any}
          dataSource={visibleItems}
          loading={loading}
          rowKey="id"
        />
      </Card>

      <Modal
        title="Upload File"
        open={isModalOpen}
        onCancel={handleModalClose}
        onOk={() => form.submit()}
        okText="Create Download"
        okButtonProps={{ disabled: uploading || !uploadedFileId }}
      >
        <Form layout="vertical" form={form} onFinish={handleUpload}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="Forms">Forms</Select.Option>
              <Select.Option value="Policies">Policies</Select.Option>
              <Select.Option value="Guides">Guides</Select.Option>
            </Select>
          </Form.Item>

          {!isOwnScopedCreateOnly && (
            <Form.Item name="departmentId" label="Department" rules={[{ required: true, message: "Please select department" }]}>
              <Select placeholder="Select department" showSearch optionFilterProp="children">
                {departments.map((dept: any) => (
                  <Select.Option key={dept.id} value={dept.id}>
                    {dept.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item name="description" label="Description">
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item label="File" required>
            {!uploadedFileId && (
              <Upload 
                beforeUpload={handleFileSelect} 
                maxCount={1} 
                showUploadList={false}
                disabled={uploading}
              >
                <Button icon={<UploadOutlined />} disabled={uploading} loading={uploading}>
                  {uploading ? 'Uploading...' : 'Select File'}
                </Button>
              </Upload>
            )}

            {uploading && (
              <div className="mt-3">
                <Progress 
                  percent={uploadProgress} 
                  status="active"
                  strokeColor={{
                    '0%': '#1890ff',
                    '100%': '#52c41a',
                  }}
                />
                <div className="flex items-center justify-center mt-2 text-gray-600">
                  <Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} />
                  <span className="ml-2 text-sm">Uploading file to server...</span>
                </div>
              </div>
            )}

            {uploadedFileId && !uploading && fileToUpload && (
              <div className="mt-3">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center flex-1">
                      <CheckCircleOutlined className="text-blue-600 text-xl mr-3" />
                      <div className="flex-1">
                        <div className="text-blue-900 font-medium">File uploaded successfully!</div>
                        <div className="text-blue-700 text-sm mt-1 break-all">{fileToUpload.name}</div>
                        <div className="text-blue-600 text-xs mt-1">
                          {(fileToUpload.size / 1024).toFixed(2)} KB
                        </div>
                      </div>
                    </div>
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<CloseCircleOutlined />}
                      onClick={handleRemoveUploadedFile}
                      className="ml-2"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default DownloadsPage
