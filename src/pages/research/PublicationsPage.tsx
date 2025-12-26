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
      if (editing && editing.id) {
        await dispatch(updatePublication({ id: editing.id, data: values })).unwrap()
        message.success('Publication updated')
      } else {
        await dispatch(createPublication(values)).unwrap()
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
          <Form.Item name="pdfId" label="PDF Id"><Input /></Form.Item>
          <Form.Item name="url" label="URL"><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default PublicationsPage
