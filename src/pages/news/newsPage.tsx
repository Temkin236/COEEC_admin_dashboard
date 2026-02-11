"use client"

import { useEffect, useState } from "react"
import {
  Card, Button, Table, Space, Tag, Modal, Form,
  Input, Select, DatePicker, message, Descriptions, Typography,
  Radio, Tabs, Upload, Image, Spin,
  Divider
} from "antd"
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  EyeOutlined, ExclamationCircleOutlined, CheckCircleOutlined,
  UploadOutlined,
  FileTextOutlined,
  InboxOutlined,
  GlobalOutlined
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

  const [activeTab, setActiveTab] = useState<string>("ALL")
  const [currentFormLang, setCurrentFormLang] = useState<string>("EN")
  const [currentViewLang, setCurrentViewLang] = useState<string>("EN")
  const [drafts, setDrafts] = useState<Record<string, any>>({
    EN: { title: "", slug: "", excerpt: "", content: "" },
    AM: { title: "", slug: "", excerpt: "", content: "" },
    OM: { title: "", slug: "", excerpt: "", content: "" },
  })
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(fetchNews({ page: 1, limit: 50, state: activeTab }))
  }, [dispatch, activeTab])

  const handleAdd = () => {
    setEditingNews(null)
    setDrafts({
      EN: { title: "", slug: "", excerpt: "", content: "" },
      AM: { title: "", slug: "", excerpt: "", content: "" },
      OM: { title: "", slug: "", excerpt: "", content: "" },
    })
    setCurrentFormLang("EN")
    setFileList([])
    form.resetFields()
    setIsFormModalOpen(true)
  }

  const handleEdit = (record: any) => {
    setEditingNews(record)

    // Initialize drafts from translations if available, otherwise fallback to flattened record
    const newDrafts: Record<string, any> = {
      EN: { title: "", slug: "", excerpt: "", content: "" },
      AM: { title: "", slug: "", excerpt: "", content: "" },
      OM: { title: "", slug: "", excerpt: "", content: "" },
    }

    if (record.translations && record.translations.length > 0) {
      record.translations.forEach((t: any) => {
        if (newDrafts[t.language]) {
          newDrafts[t.language] = {
            title: t.title,
            slug: t.slug,
            excerpt: t.excerpt,
            content: typeof t.content === 'object' ? JSON.stringify(t.content, null, 2) : t.content,
          }
        }
      })
    } else {
      // Fallback for legacy data
      const lang = record.language || "EN"
      if (newDrafts[lang]) {
        newDrafts[lang] = {
          title: record.title,
          slug: record.slug,
          excerpt: record.excerpt,
          content: typeof record.content === 'object' ? JSON.stringify(record.content, null, 2) : record.content,
        }
      }
    }

    setDrafts(newDrafts)
    setCurrentFormLang("EN")

    form.setFieldsValue({
      ...record,
      publishAt: record.publishAt ? dayjs(record.publishAt) : null,
      ...newDrafts["EN"] // Initial form values for EN
    })

    if (record.featuredImageId) {
      setFileList([{ uid: '-1', name: 'image.png', status: 'done', url: '' }])
    } else {
      setFileList([])
    }

    setIsFormModalOpen(true)
  }

  const handleFormLanguageChange = (newLang: string) => {
    // Save current form values to draft
    const currentValues = form.getFieldsValue()
    setDrafts(prev => ({
      ...prev,
      [currentFormLang]: {
        ...prev[currentFormLang],
        title: currentValues.title,
        slug: currentValues.slug,
        content: currentValues.content,
        excerpt: currentValues.excerpt,
      }
    }))

    // Switch language
    setCurrentFormLang(newLang)

    // Load new language draft
    form.setFieldsValue({
      title: drafts[newLang]?.title || "",
      slug: drafts[newLang]?.slug || "",
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
    let newFileList = [...info.fileList].slice(-1)
    setFileList(newFileList)

    if (info.file.status === 'done' && info.file.response?.id) {
      form.setFieldValue('featuredImageId', info.file.response.id)
    }
  }

  const handleView = (record: any) => {
    setSelectedNews(record)
    setCurrentViewLang("EN") // Default view to English
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
      // Final save for current visible tab
      const finalDrafts = {
        ...drafts,
        [currentFormLang]: {
          title: values.title,
          slug: values.slug,
          excerpt: values.excerpt,
          content: values.content
        }
      }

      const languages: Record<string, any> = {}

      Object.entries(finalDrafts).forEach(([lang, data]) => {
        if (data.title) {
          let parsedContent = data.content
          try {
            // Try to parse as JSON if it's a string from the text area
            if (typeof data.content === 'string' && data.content.trim().startsWith('{')) {
              parsedContent = JSON.parse(data.content)
            } else if (typeof data.content === 'string') {
              // Wrap plain text in the expected document structure
              parsedContent = {
                type: "doc",
                content: [{ type: "paragraph", content: [{ type: "text", text: data.content }] }]
              }
            }
          } catch (e) {
            console.error(`Failed to parse content for ${lang}`, e)
          }

          languages[lang] = {
            title: data.title,
            slug: data.slug || generateSlug(data.title),
            excerpt: data.excerpt,
            content: parsedContent
          }
        }
      })

      const payload = {
        languages,
        tags: values.tags,
        state: values.state,
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
      render: (_: string, record: any) => {
        // 1. Try English Translation
        const enTrans = record.translations?.find((t: any) => t.language === 'EN');
        if (enTrans?.title) return <Typography.Text strong>{enTrans.title}</Typography.Text>;
        
        // 2. Try Root Title (legacy/flat)
        if (record.title && record.title.trim() !== "") return <Typography.Text strong>{record.title}</Typography.Text>;

        // 3. Try Any Other Language
        const otherTrans = record.translations?.find((t: any) => t.title);
        if (otherTrans?.title) {
           return (
             <Space>
               <Typography.Text strong>{otherTrans.title}</Typography.Text>
               <Tag size="small">{otherTrans.language}</Tag>
             </Space>
           );
        }

        // 4. Fallback to Tags or Date
        return (
          <div className="flex flex-col gap-1">
             <Typography.Text type="secondary" italic>Untitled Draft</Typography.Text>
             {record.tags && record.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                   {record.tags.map((tag: string) => <Tag key={tag} className="m-0 text-xs">{tag}</Tag>)}
                </div>
             ) : (
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                   Created: {formatDate(record.createdAt)}
                </Typography.Text>
             )}
          </div>
        );
      }
    },
    {
      title: "Status",
      dataIndex: "state",
      key: "state",
      render: (state: string) => {
        const colors: any = { PUBLISHED: "green", DRAFT: "orange", ARCHIVED: "red", NEEDS_REVIEW: "volcano" }
        return <Tag color={colors[state] || "default"}>{state}</Tag>
      },
      width: 120
    },
    {
      title: "Publish Date",
      dataIndex: "publishAt",
      key: "publishAt",
      render: (date: string) => date ? formatDate(date) : <Tag color="default">Not Scheduled</Tag>,
      width: 180
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="text" icon={<EyeOutlined />} onClick={(e) => { e.stopPropagation(); handleView(record); }} />
          <Button type="text" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); handleEdit(record); }} />
          {record.state === "DRAFT" && (
            <Button
              type="text"
              className="text-green-600"
              icon={<CheckCircleOutlined />}
              onClick={(e) => { e.stopPropagation(); handlePublish(record.id); }}
            />
          )}
          <Button type="text" danger icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); handleDelete(record.id); }} />
        </Space>
      ),
    },
  ]

  const languageOptions = [
    { key: "EN", label: "English" },
    { key: "AM", label: "Amharic" },
    { key: "OM", label: "Afaan Oromo" },
  ]

  const getViewContent = () => {
    if (!selectedNews) return null;
    const translation = selectedNews.translations?.find((t: any) => t.language === currentViewLang);
    if (translation) return translation;

    // Fallback to record itself if viewed language matches record's primary flattened language
    if (selectedNews.language === currentViewLang) return selectedNews;

    return null;
  }

  const viewContent = getViewContent();

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Typography.Title level={2} style={{ margin: 0 }}>News & Announcements</Typography.Title>
          <Typography.Text type="secondary">Manage multi-language news articles and announcements</Typography.Text>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          className="shadow-md"
        >
          Create News
        </Button>
      </div>

      <Card className="shadow-sm overflow-hidden" bodyStyle={{ padding: 0 }}>
        <div className="px-6 pt-4 border-b">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              { key: "ALL", label: "All News" },
              { key: "PUBLISHED", label: "Published" },
              { key: "DRAFT", label: "Drafts" },
              { key: "NEEDS_REVIEW", label: "Needs Review" },
              { key: "ARCHIVED", label: "Archived" },
            ]}
          />
        </div>
        <DataTable
          columns={columns}
          dataSource={items}
          loading={loading}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => handleView(record),
          })}
          scroll={{ x: 800 }}
          className="p-4"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} articles`,
          }}
        />
      </Card>

      {/* CREATE / EDIT MODAL */}
      <Modal
        title={
          <div className="flex items-center gap-2 py-1">
            <Typography.Title level={4} style={{ margin: 0 }}>
              {editingNews ? "Edit News Article" : "Create New Article"}
            </Typography.Title>
          </div>
        }
        open={isFormModalOpen}
        onCancel={() => setIsFormModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
        width={1000}
        centered
        className="news-modal"
        okText={editingNews ? "Update Article" : "Create Article"}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-6">
          <Form.Item name="featuredImageId" hidden><Input /></Form.Item>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                <div className="bg-gray-50/50 px-4 py-2 border-b border-gray-100">
                  <Tabs
                    activeKey={currentFormLang}
                    onChange={handleFormLanguageChange}
                    type="line"
                    size="small"
                    items={languageOptions.map(opt => ({
                      key: opt.key,
                      label: (
                        <span className="flex items-center gap-2">
                          <GlobalOutlined className="text-xs" />
                          {opt.label}
                        </span>
                      )
                    }))}
                  />
                </div>

                <div className="p-5 space-y-5">
                  <Form.Item
                    name="title"
                    label={<span className="font-semibold text-gray-700">Article Title ({currentFormLang})</span>}
                    rules={[{ required: currentFormLang === "EN", message: 'Please enter a title' }]}
                  >
                    <Input
                      size="large"
                      placeholder={`Enter the ${currentFormLang} title here...`}
                      className="rounded-lg"
                      onChange={(e) => {
                        if (!editingNews && currentFormLang === 'EN') {
                          form.setFieldValue('slug', generateSlug(e.target.value))
                        }
                      }}
                    />
                  </Form.Item>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                      name="slug"
                      label={<span className="font-semibold text-gray-700">URL Slug</span>}
                      rules={[{ required: currentFormLang === "EN" }]}
                      extra="The unique URL path for this news item"
                    >
                      <Input placeholder="e.g. major-breakthrough-ai" className="rounded-lg" />
                    </Form.Item>

                    <Form.Item
                      name="publishAt"
                      label={<span className="font-semibold text-gray-700">Schedule Release</span>}
                    >
                      <DatePicker className="w-full rounded-lg" showTime placeholder="Choose publish date/time" />
                    </Form.Item>
                  </div>

                  <Form.Item
                    name="excerpt"
                    label={<span className="font-semibold text-gray-700">Short Excerpt</span>}
                    extra="A brief summary shown in lists and social previews"
                  >
                    <TextArea rows={3} placeholder="Write a compelling summary..." className="rounded-lg" />
                  </Form.Item>

                  <Form.Item
                    name="content"
                    label={<span className="font-semibold text-gray-700">Article Content</span>}
                    rules={[{ required: currentFormLang === "EN" }]}
                  >
                    <TextArea
                      rows={12}
                      className="font-mono text-sm rounded-lg"
                      placeholder="Paste JSON document structure or write plain text article content here..."
                    />
                  </Form.Item>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Card
                size="small"
                title={<span className="text-gray-800 font-bold">Featured Image</span>}
                className="shadow-sm border-gray-100 rounded-xl overflow-hidden"
              >
                <div className="flex justify-center py-2">
                  <Upload
                    customRequest={handleUpload}
                    onChange={handleChange}
                    fileList={fileList}
                    listType="picture-card"
                    maxCount={1}
                    className="avatar-uploader"
                  >
                    {fileList.length < 1 && (
                      <div className="upload-box">
                        <div className="flex flex-col items-center">
                          <PlusOutlined className="text-xl mb-2 text-primary-500" />
                          <div className="text-xs font-medium">Select Image</div>
                        </div>
                      </div>
                    )}
                  </Upload>
                </div>
                <div className="text-[10px] text-center text-gray-400 mt-2 px-2">
                  Recommended size: 1200x630px. Max size: 2MB.
                </div>
              </Card>

              <Card
                size="small"
                title={<span className="text-gray-800 font-bold">Article Settings</span>}
                className="shadow-sm border-gray-100 rounded-xl overflow-hidden"
              >
                <Form.Item
                  name="state"
                  label={<span className="text-xs font-bold uppercase text-gray-500 tracking-wider">Publication State</span>}
                  initialValue="DRAFT"
                >
                  <Select className="w-full">
                    <Select.Option value="DRAFT">Draft</Select.Option>
                    <Select.Option value="NEEDS_REVIEW">Needs Review</Select.Option>
                    <Select.Option value="PUBLISHED">Published</Select.Option>
                    <Select.Option value="ARCHIVED">Archived</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="tags"
                  label={<span className="text-xs font-bold uppercase text-gray-500 tracking-wider">Tags & Categories</span>}
                >
                  <Select mode="tags" placeholder="Add relevant tags..." className="w-full" />
                </Form.Item>
              </Card>

              <div className="px-2">
                <Typography.Text type="secondary" className="text-[11px] block">
                  Created by: {editingNews?.author?.name || 'System Admin'}
                </Typography.Text>
                <Typography.Text type="secondary" className="text-[11px] block italic mt-1">
                  Last updated: {editingNews?.updatedAt ? formatDate(editingNews.updatedAt, "LLL") : 'Never'}
                </Typography.Text>
              </div>
            </div>
          </div>
        </Form>
      </Modal>

      {/* VIEW MODAL */}
      <Modal
        title={
          <div className="flex items-center gap-2 py-1">
            <EyeOutlined className="text-primary-500" />
            <Typography.Title level={4} style={{ margin: 0 }}>News Article Preview</Typography.Title>
          </div>
        }
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsViewModalOpen(false)} className="rounded-lg px-6">
            Close Preview
          </Button>
        ]}
        width={850}
        centered
        className="preview-modal"
      >
        {selectedNews && (
          <div className="space-y-6 pt-4">
            <div className="bg-gray-50/80 p-1 rounded-xl border border-gray-100">
              <Tabs
                activeKey={currentViewLang}
                onChange={setCurrentViewLang}
                type="card"
                className="language-selector-tabs"
                items={languageOptions.map(opt => ({
                  key: opt.key,
                  label: opt.label,
                  disabled: !selectedNews.translations?.some((t: any) => t.language === opt.key) && selectedNews.language !== opt.key
                }))}
              />
            </div>

            {viewContent ? (
              <div className="space-y-8 animate-in fade-in duration-300">
                <header className="space-y-4">
                  <Typography.Title level={2} className="text-blue-900 !mb-2 leading-tight">
                    {viewContent.title}
                  </Typography.Title>
                  <Space size="middle" split={<Divider type="vertical" />} className="flex-wrap">
                    <Tag color={
                      selectedNews.state === 'PUBLISHED' ? "green" :
                        selectedNews.state === 'DRAFT' ? "orange" :
                          selectedNews.state === 'ARCHIVED' ? "red" : "blue"
                    } className="rounded-full px-3 m-0 font-medium">
                      {selectedNews.state}
                    </Tag>
                    <Space size={4}>
                      <GlobalOutlined className="text-gray-400" />
                      <Typography.Text strong className="text-primary-600">{currentViewLang}</Typography.Text>
                    </Space>
                    <Typography.Text type="secondary">
                      {selectedNews.publishAt ? formatDate(selectedNews.publishAt, "LLL") : "Not Scheduled"}
                    </Typography.Text>
                  </Space>
                </header>

                <Card size="small" className="bg-blue-50/30 border-blue-100 rounded-2xl shadow-sm">
                  <Descriptions column={2} className="p-2 custom-descriptions" bordered>
                    <Descriptions.Item label="URL Slug" span={2}>
                      <code className="bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-700 text-xs">
                        {viewContent.slug}
                      </code>
                    </Descriptions.Item>
                    <Descriptions.Item label="Category Tags" span={2}>
                      <Space wrap>
                        {selectedNews.tags && selectedNews.tags.length > 0 ? (
                          selectedNews.tags.map((tag: string) => (
                            <Tag key={tag} className="bg-white border-blue-100 text-blue-600 rounded-md m-0">
                              #{tag}
                            </Tag>
                          ))
                        ) : (
                          <span className="text-gray-400 italic text-sm">No tags added</span>
                        )}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Article Excerpt" span={2}>
                      <div className="text-gray-600 italic leading-relaxed text-base">
                        "{viewContent.excerpt || 'No summary available for this translation.'}"
                      </div>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>


              </div>
            ) : (
              <div className="py-20 text-center space-y-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <InboxOutlined className="text-5xl text-gray-300" />
                <div>
                  <Typography.Text type="secondary" className="block text-lg">
                    No translation available for {languageOptions.find(o => o.key === currentViewLang)?.label}
                  </Typography.Text>
                  <Typography.Text type="secondary" className="text-sm">
                    Switch to another language or edit this article to add content.
                  </Typography.Text>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default NewsPage
