"use client"

import { useEffect, useState } from "react"
import { Card, Tag, Button, Modal, Form, Input, InputNumber, message, Space, Upload, Progress, Spin } from "antd"
import { PlusOutlined, UploadOutlined, LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons"
import DataTable from "@/components/common/DataTable"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchMyPublications, createPublication, updatePublication, deletePublication, Publication } from "@/store/slices/publicationsSlice"
import { formatDate } from "@/utils/helpers"
import TableActions from "@/components/common/TableActions"
import { usePermissions } from "@/hooks/usePermissions"
import axiosInstance from "@/utils/axios"

const PublicationsPage = () => {
  const dispatch = useAppDispatch()
  const { items, loading } = useAppSelector((state: any) => state.publications)
  const { canView, canCreate, canUpdate, canDelete } = usePermissions()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Publication | null>(null)
  const [form] = Form.useForm()
  
  // PDF Upload states
  const [fileToUpload, setFileToUpload] = useState<File | null>(null)
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    dispatch(fetchMyPublications() as any)
  }, [dispatch])

  const handleAdd = () => { 
    setEditing(null)
    form.resetFields()
    setFileToUpload(null)
    setUploadedFileId(null)
    setUploadProgress(0)
    setModalOpen(true)
  }
  
  const handleEdit = (record: Publication) => { 
    setEditing(record)
    form.setFieldsValue(record)
    setFileToUpload(null)
    setUploadedFileId(record.pdfId || null)
    setUploadProgress(0)
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deletePublication(id)).unwrap()
      message.success('Publication deleted')
    } catch (err: any) {
      message.error(err?.message || 'Failed to delete publication')
    }
  }

  /* ---------------- PDF UPLOAD ---------------- */
  const handleFileSelect = async (file: File) => {
    setUploading(true)
    setFileToUpload(file)
    setUploadProgress(0)

    try {
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
          break
        } catch (err: any) {
          lastError = err
          const errorMsg = err?.response?.data?.message || err?.message || ""
          
          if (errorMsg.toLowerCase().includes("unexpected field")) {
            console.log(`Field name "${fieldName}" failed, trying next...`)
            continue
          }
          
          throw err
        }
      }

      if (!uploadedData) {
        throw lastError || new Error("Failed to upload file")
      }

      const fileData = uploadedData?.data || uploadedData
      const fileId = fileData?.id || (Array.isArray(fileData) ? fileData[0]?.id : null)

      if (!fileId) {
        throw new Error("No file ID returned from upload")
      }

      setUploadedFileId(fileId)
      form.setFieldValue('pdfId', fileId)
      setUploading(false)
      message.success("PDF uploaded successfully")
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Upload failed")
      setFileToUpload(null)
      setUploadProgress(0)
      setUploading(false)
    }

    return false
  }

  const handleRemoveUploadedFile = () => {
    setFileToUpload(null)
    setUploadedFileId(null)
    setUploadProgress(0)
    form.setFieldValue('pdfId', undefined)
  }

  const handleSubmit = async (values: any) => {
    try {
      // Normalize authors: accept comma-separated string or array
      let payload = { ...values }
      if (typeof payload.authors === 'string') {
        payload.authors = payload.authors.split(',').map((s: string) => s.trim()).filter(Boolean)
      }

      // Use uploaded file ID if available
      if (uploadedFileId) {
        payload.pdfId = uploadedFileId
      }

      // Validate pdfId if provided (backend expects a cuid-like id)
      if (payload.pdfId) {
        const cuidRe = /^[cC][^\s-]{8,}$/
        if (!cuidRe.test(String(payload.pdfId))) {
          message.error('PDF Id appears invalid (expected cuid format).')
          return
        }
      }

      // Validate URL if provided
      if (payload.url) {
        try {
          // eslint-disable-next-line no-new
          new URL(String(payload.url))
        } catch (e) {
          message.error('URL is invalid.')
          return
        }
      }

      // Clean empty values so backend doesn't receive empty strings/arrays
      const clean = (obj: any) => {
        const out: any = {}
        Object.entries(obj).forEach(([k, v]) => {
          if (v === undefined || v === null) return
          if (typeof v === 'string' && v.trim() === '') return
          if (Array.isArray(v) && v.length === 0) return
          if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) return
          out[k] = v
        })
        return out
      }

      payload = clean(payload)

      if (editing && editing.id) {
        await dispatch(updatePublication({ id: editing.id, data: payload })).unwrap()
        message.success('Publication updated')
      } else {
        await dispatch(createPublication(payload)).unwrap()
        message.success('Publication created')
      }
      setModalOpen(false)
      form.resetFields()
      setFileToUpload(null)
      setUploadedFileId(null)
      setUploadProgress(0)
    } catch (err: any) {
      message.error(err?.message || 'Failed to save publication')
    }
  }

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title', render: (t: string) => <span className="font-medium">{t}</span>, ellipsis: true },
    { title: 'Authors', dataIndex: 'authors', key: 'authors', render: (a: string[]) => (a || []).join(', ') },
    { title: 'Year', dataIndex: 'year', key: 'year' },
    { title: 'URL', dataIndex: 'url', key: 'url', render: (u: string) => u ? <a href={u} target="_blank" rel="noreferrer">Link</a> : 'N/A' },
    { title: 'Actions', key: 'actions', render: (_: any, record: Publication) => (
      <TableActions
        resource="publications"
        record={record}
        allowEditIfOwner={true}
        ownerIdField="createdById"
        onView={() => { /* nothing: view handled via edit/view modal */ handleEdit(record) }}
        onEdit={() => handleEdit(record)}
        onDelete={() => handleDelete(record.id as string)}
      />
    ) }
  ]

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card
        title={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-lg font-semibold">My Publications</span>
            {canCreate('publications') && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleAdd}
                className="min-w-fit"
              >
                <span className="hidden sm:inline">Add Publication</span>
                <span className="sm:hidden">Add</span>
              </Button>
            )}
          </div>
        }
      >
        <DataTable 
          columns={columns as any} 
          dataSource={items} 
          loading={loading} 
          rowKey="id" 
          onRow={(record) => ({
            onClick: () => handleEdit(record),
            style: { cursor: 'pointer' }
          })}
          pagination={{ pageSize: 10 }} 
        />
      </Card>

      <Modal title={editing ? 'Edit Publication' : 'Add Publication'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} okButtonProps={{ disabled: uploading }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ year: new Date().getFullYear() }}>
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Enter title' }]}><Input /></Form.Item>
          <Form.Item name="abstract" label="Abstract"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="authors" label="Authors" help="Comma-separated list">
            <Input onChange={(e) => { const v = e.target.value; form.setFieldValue('authors', v.split(',').map((s: string) => s.trim())) }} />
          </Form.Item>
          <Form.Item name="year" label="Year"><InputNumber style={{ width: '100%' }} /></Form.Item>
          
          <Form.Item name="pdfId" label="PDF Upload (Optional)">
            <Space direction="vertical" style={{ width: '100%' }}>
              {!uploadedFileId && !editing?.pdfId && !uploading && (
                <Upload 
                  beforeUpload={handleFileSelect} 
                  maxCount={1} 
                  showUploadList={false}
                  disabled={uploading}
                  accept=".pdf"
                >
                  <Button icon={<UploadOutlined />} size="small">
                    Choose PDF
                  </Button>
                </Upload>
              )}

              {uploading && (
                <Progress percent={uploadProgress} size="small" status="active" />
              )}

              {(uploadedFileId || editing?.pdfId) && !uploading && (
                <Space size="small">
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <span className="text-sm">{fileToUpload?.name || 'PDF attached'}</span>
                  <Button 
                    type="text" 
                    danger 
                    size="small" 
                    icon={<CloseCircleOutlined />} 
                    onClick={handleRemoveUploadedFile}
                  />
                </Space>
              )}
            </Space>
          </Form.Item>

          <Form.Item name="url" label="URL" rules={[{ type: 'url', message: 'Enter a valid URL' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default PublicationsPage
