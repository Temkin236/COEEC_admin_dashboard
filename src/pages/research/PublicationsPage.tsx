"use client"

import { useEffect, useState } from "react"
import { Card, Table, Tag, Button, Modal, Form, Input, InputNumber, message, Space } from "antd"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchMyPublications, createPublication, updatePublication, deletePublication, Publication } from "@/store/slices/publicationsSlice"
import { formatDate } from "@/utils/helpers"
import TableActions from "@/components/common/TableActions"
import { usePermissions } from "@/hooks/usePermissions"

const PublicationsPage = () => {
  const dispatch = useAppDispatch()
  const { items, loading } = useAppSelector((state: any) => state.publications)
  const { canView, canCreate, canUpdate, canDelete } = usePermissions()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Publication | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(fetchMyPublications() as any)
  }, [dispatch])

  const handleAdd = () => { setEditing(null); form.resetFields(); setModalOpen(true) }
  const handleEdit = (record: Publication) => { setEditing(record); form.setFieldsValue(record); setModalOpen(true) }

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deletePublication(id)).unwrap()
      message.success('Publication deleted')
    } catch (err: any) {
      message.error(err?.message || 'Failed to delete publication')
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      // Normalize authors: accept comma-separated string or array
      let payload = { ...values }
      if (typeof payload.authors === 'string') {
        payload.authors = payload.authors.split(',').map((s: string) => s.trim()).filter(Boolean)
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
    <div className="space-y-4">
      <Card title="My Publications" extra={canCreate('publications') ? <Button type="primary" onClick={handleAdd}>Add Publication</Button> : null}>
        <Table columns={columns as any} dataSource={items} loading={loading} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal title={editing ? 'Edit Publication' : 'Add Publication'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ year: new Date().getFullYear() }}>
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Enter title' }]}><Input /></Form.Item>
          <Form.Item name="abstract" label="Abstract"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="authors" label="Authors" help="Comma-separated list">
            <Input onChange={(e) => { const v = e.target.value; form.setFieldValue('authors', v.split(',').map((s: string) => s.trim())) }} />
          </Form.Item>
          <Form.Item name="year" label="Year"><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="pdfId" label="PDF Id" rules={[{ pattern: /^[cC][^\\s-]{8,}$/, message: 'PDF Id must be a valid cuid format' }]}>
            <Input />
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
