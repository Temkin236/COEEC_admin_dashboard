"use client"

import { useEffect, useState } from "react"
import {
  Card, Button, Table, Space, Tag, Modal, Form,
  Input, Select, DatePicker, message, Descriptions, Typography,
  Radio, Tabs, Upload, Image, Spin
} from "antd"
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  EyeOutlined, ExclamationCircleOutlined, CheckCircleOutlined,
  UploadOutlined
} from "@ant-design/icons"
import type { UploadFile, UploadProps } from 'antd/es/upload/interface'
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import DataTable from "@/components/common/DataTable"
import {
  fetchNews,
  createNews,
  updateNews,
  deleteNews,
  publishNews
} from "@/store/slices/newsSlice"
import { uploadMedia } from "@/store/slices/mediaSlice"
import { formatDate } from "@/utils/helpers"
import dayjs from "dayjs"

const { TextArea } = Input
const { confirm } = Modal

const generateSlug = (text: string) =>
  text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")

const NewsPage = () => {
  const dispatch = useAppDispatch()
  const { items, loading } = useAppSelector((state) => state.news)

  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editingNews, setEditingNews] = useState<any>(null)
  const [selectedNews, setSelectedNews] = useState<any>(null)

  const [currentLanguage, setCurrentLanguage] = useState<string>("EN")
  const [drafts, setDrafts] = useState<Record<string, any>>({
    EN: {},
    AM: {},
    AR: {},
  })
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(fetchNews({ page: 1, limit: 50 }))
  }, [dispatch])

  const handleAdd = () => {
    setEditingNews(null)
    setDrafts({ EN: {}, AM: {}, AR: {} })
    setCurrentLanguage("EN")
    setFileList([])
    form.resetFields()
    setIsFormModalOpen(true)
  }

  const handleEdit = (record: any) => {
    setEditingNews(record)
    // Assuming record has structure that supports multilingual or we just edit the current record's language
    // For now, let's load the record data into the current language draft
    const recordLanguage = record.language || "EN"
    setCurrentLanguage(recordLanguage)

    // Initialize drafts with the current record data for its language
    const initialDrafts = { EN: {}, AM: {}, AR: {} }
    // @ts-ignore
    initialDrafts[recordLanguage] = {
      title: record.title,
      content: record.content,
      excerpt: record.excerpt,
    }
    setDrafts(initialDrafts)

    form.setFieldsValue({
      ...record,
      publishAt: record.publishAt ? dayjs(record.publishAt) : null,
    })

    // Set file list if there is a featured image (mock logic for now if we don't have full media object)
    if (record.featuredImageId) {
      setFileList([
        {
          uid: '-1',
          name: 'image.png',
          status: 'done',
          url: '', // We would need the full URL here
        }
      ])
    } else {
      setFileList([])
    }

    setIsFormModalOpen(true)
  }

  const handleLanguageChange = (newLang: string) => {
    // Save current form values to draft
    const currentValues = form.getFieldsValue()
    setDrafts(prev => ({
      ...prev,
      [currentLanguage]: {
        ...prev[currentLanguage],
        title: currentValues.title,
        content: currentValues.content,
        excerpt: currentValues.excerpt,
      }
    }))

    // Switch language
    setCurrentLanguage(newLang)

    // Load new language draft
    form.setFieldsValue({
      title: drafts[newLang]?.title || "",
      content: drafts[newLang]?.content || "",
      excerpt: drafts[newLang]?.excerpt || "",
    })
  }

  const handleUpload: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    try {
      const result = await dispatch(uploadMedia(file as File)).unwrap()
      if (onSuccess) onSuccess(result)
      message.success(`${(file as File).name} uploaded successfully`)
    } catch (error) {
      if (onError) onError(error as Error)
      message.error(`${(file as File).name} upload failed.`)
    }
  }

  const handleChange: UploadProps['onChange'] = (info) => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-1); // Limit to 1 file
    setFileList(newFileList);

    if (info.file.status === 'done') {
      // Get the response from the upload
      const response = info.file.response;
      if (response && response.id) {
        // Store the ID in the form
        form.setFieldValue('featuredImageId', response.id)
      }
    }
  };

  const handleView = (record: any) => {
    setSelectedNews(record)
    setIsViewModalOpen(true)
  }

  const handlePublish = async (id: string) => {
    try {
      await dispatch(publishNews(id)).unwrap()
      message.success("News published successfully")
    } catch (error) {
      message.error("Failed to publish news")
    }
  }

  const handleDelete = (id: string) => {
    confirm({
      title: 'Are you sure you want to delete this news item?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await dispatch(deleteNews(id)).unwrap()
          message.success("News deleted successfully")
        } catch (error) {
          message.error("Failed to delete news")
        }
      },
    })
  }

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        language: currentLanguage, // Use the currently selected language
        slug: values.slug || generateSlug(values.title),
        publishAt: values.publishAt?.toISOString(),
        featuredImageId: fileList[0]?.response?.id || editingNews?.featuredImageId,
      }

      if (editingNews) {
        await dispatch(updateNews({ id: editingNews.id, data: payload })).unwrap()
        message.success("News updated successfully")
      } else {
        await dispatch(createNews(payload)).unwrap()
        message.success("News created successfully")
      }
      setIsFormModalOpen(false)
    } catch (error) {
      message.error("Action failed")
    }
  }

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text: string) => <Typography.Text strong>{text}</Typography.Text>
    },
    {
      title: "Language",
      dataIndex: "language",
      key: "language",
      render: (lang: string) => <Tag color="blue">{lang}</Tag>
    },
    {
      title: "Status",
      dataIndex: "state",
      key: "state",
      render: (state: string) => {
        const colors: any = { PUBLISHED: "green", DRAFT: "orange", ARCHIVED: "red" }
        return <Tag color={colors[state] || "default"}>{state}</Tag>
      },
    },
    {
      title: "Publish Date",
      dataIndex: "publishAt",
      key: "publishAt",
      render: (date: string) => date ? formatDate(date) : "Not set"
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="text" icon={<EyeOutlined />} onClick={() => handleView(record)} />
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          {record.state === "DRAFT" && (
            <Button
              type="text"
              className="text-green-600"
              icon={<CheckCircleOutlined />}
              onClick={() => handlePublish(record.id)}
            />
          )}
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ]

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card
        title={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-lg font-semibold">News & Announcements</span>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              className="min-w-fit"
            >
              <span className="hidden sm:inline">Create News</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        }
      >
        <DataTable
          columns={columns}
          dataSource={items}
          loading={loading && items.length > 0}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => handleView(record),
            style: { cursor: 'pointer' }
          })}
          scroll={{ x: 800 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} news items`,
          }}
          className="border-0"
          rowClassName={() => 'cursor-pointer hover:bg-gray-50'}
        />
      </Card>

      {/* CREATE / EDIT MODAL */}
      <Modal
        title={editingNews ? "Edit News" : "Create News"}
        open={isFormModalOpen}
        onCancel={() => setIsFormModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
        width={800}
      >
        <div className="mb-4">
          <Radio.Group
            value={currentLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="EN">English</Radio.Button>
            <Radio.Button value="AM">Amharic</Radio.Button>
            <Radio.Button value="AR">Arabic</Radio.Button>
          </Radio.Group>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
          <Form.Item name="featuredImageId" hidden>
            <Input />
          </Form.Item>

          <div className="grid grid-cols-[2fr_1fr] gap-4">
            <div className="space-y-4">
              <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                <Input onChange={(e) => {
                  if (!editingNews && currentLanguage === 'EN') {
                    form.setFieldValue('slug', generateSlug(e.target.value))
                  }
                }} />
              </Form.Item>
              <Form.Item name="excerpt" label="Excerpt (Brief Summary)">
                <TextArea rows={2} placeholder="Short summary for list views..." />
              </Form.Item>
            </div>
            <div>
              <Form.Item label="Featured Image">
                <Upload
                  customRequest={handleUpload}
                  onChange={handleChange}
                  fileList={fileList}
                  listType="picture-card"
                  maxCount={1}
                >
                  {fileList.length < 1 && (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="publishAt" label="Publish Date">
              <DatePicker className="w-full" showTime />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="state" label="State" initialValue="DRAFT">
              <Select>
                <Select.Option value="DRAFT">Draft</Select.Option>
                <Select.Option value="PUBLISHED">Published</Select.Option>
                <Select.Option value="ARCHIVED">Archived</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="tags" label="Tags">
              <Select mode="tags" placeholder="Press enter to add tags" />
            </Form.Item>
          </div>

          <Form.Item name="content" label="Content" rules={[{ required: true }]}>
            <TextArea rows={8} placeholder={`Write your news content in ${currentLanguage === 'EN' ? 'English' : currentLanguage === 'AM' ? 'Amharic' : 'Arabic'}...`} />
          </Form.Item>

        </Form>
      </Modal>

      {/* VIEW MODAL */}
      <Modal
        title="News Details"
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={[<Button key="close" onClick={() => setIsViewModalOpen(false)}>Close</Button>]}
        width={800}
      >
        {selectedNews && (
          <Descriptions bordered column={2} className="mt-4">
            <Descriptions.Item label="Title" span={2}>{selectedNews.title}</Descriptions.Item>
            <Descriptions.Item label="Slug" span={2}><code>{selectedNews.slug}</code></Descriptions.Item>
            <Descriptions.Item label="Language">{selectedNews.language}</Descriptions.Item>
            <Descriptions.Item label="Status"><Tag color="blue">{selectedNews.state}</Tag></Descriptions.Item>
            <Descriptions.Item label="Published Date" span={2}>{selectedNews.publishAt ? formatDate(selectedNews.publishAt, "LLL") : "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Tags" span={2}>
              {selectedNews.tags?.map((tag: string) => <Tag key={tag}>{tag}</Tag>)}
            </Descriptions.Item>
            <Descriptions.Item label="Excerpt" span={2}>{selectedNews.excerpt || "No excerpt provided."}</Descriptions.Item>
            <Descriptions.Item label="Full Content" span={2}>
              <div className="max-h-60 overflow-auto whitespace-pre-wrap p-2 bg-gray-50">
                {typeof selectedNews.content === 'string' ? selectedNews.content : JSON.stringify(selectedNews.content)}
              </div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default NewsPage
