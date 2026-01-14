"use client"

import { useEffect, useState } from "react"
import { Card, Button, Tabs, Form, Input, Upload, message, Modal, Space, Select } from "antd"
import DataTable from "@/components/common/DataTable"
import { SaveOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchContent, createContent, updateContent, deleteContent } from "@/store/slices/contentSlice"

const { TextArea } = Input
const { TabPane } = Tabs as any

const HomeAdminPage = () => {
  const dispatch = useAppDispatch()
  const { homepage } = useAppSelector((state) => state.content)
  const [form] = Form.useForm()
  // hero removed - homepage hero is no longer editable here
  const [newsModalOpen, setNewsModalOpen] = useState(false)
  const [editingNews, setEditingNews] = useState<any>(null)
  const [newsForm] = Form.useForm()
  const [newsFileList, setNewsFileList] = useState<any[]>([])
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)
  const [previewIframeOpen, setPreviewIframeOpen] = useState(false)
  const [previewIframeUrl, setPreviewIframeUrl] = useState<string | null>(null)

  const openLivePreview = async (result: any) => {
    // determine created/updated item
    const created = result && (result.data || result) && (result.data?.id ? result.data : result) || result
    const createdId = created?.id
    const createdTitle = created?.title || created?.heading || created?.campusName

    const maxAttempts = 6
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const fetched = await dispatch(fetchContent({ type: "homepage" }) as any).unwrap()
        const data = fetched?.data
        let items: any[] = []
        if (Array.isArray(data)) items = data
        else if (data && Array.isArray((data as any).items)) items = (data as any).items
        else if (data && typeof data === 'object') items = [data]

        const found = items.find((it: any) => (createdId && it.id === createdId) || (createdTitle && (it.title === createdTitle || it.heading === createdTitle || it.campusName === createdTitle)))
        if (found) {
          const previewUrl = window.location.origin + '/#/?_preview=' + Date.now()
          setPreviewIframeUrl(previewUrl)
          setPreviewIframeOpen(true)
          // also open in new tab for convenience
          try { window.open(previewUrl, '_blank') } catch (e) {}
          return
        }
      } catch (e) {
        // ignore and retry
      }
      // wait before retrying
      // eslint-disable-next-line no-await-in-loop
      await delay(1000)
    }

    // fallback: open anyway
    try {
      const previewUrl = window.location.origin + '/#/?_preview=' + Date.now()
      setPreviewIframeUrl(previewUrl)
      setPreviewIframeOpen(true)
      try { window.open(previewUrl, '_blank') } catch (e) {}
    } catch (e) {}
  }
  // Unified create/edit modal
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createForm] = Form.useForm()
  const [editingContent, setEditingContent] = useState<any>(null)
  const [createFileList, setCreateFileList] = useState<any[]>([])
  const [deptGalleryFileList, setDeptGalleryFileList] = useState<any[]>([])
  const [partnersFileList, setPartnersFileList] = useState<any[]>([])
  const [thumbnailFileList, setThumbnailFileList] = useState<any[]>([])

  const getBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (err) => reject(err)
    })

  useEffect(() => {
    dispatch(fetchContent({ type: "homepage" }) as any)
  }, [dispatch])

  useEffect(() => {
    // normalize homepage items for news previews if needed
  }, [homepage])

  // hero save removed

  const homepageItems = Array.isArray(homepage?.items) ? homepage.items : Array.isArray(homepage) ? homepage : []
  const newsItems = (homepageItems || []).filter((i: any) => i && i.type === "news")

  const openCreateNews = () => {
    setEditingNews(null)
    newsForm.resetFields()
    setNewsFileList([])
    setNewsModalOpen(true)
  }

  const openCreateContent = () => {
    setEditingContent(null)
    createForm.resetFields()
    setCreateFileList([])
    setCreateModalOpen(true)
  }

  const handleEditNews = (record: any) => {
    setEditingNews(record)
    newsForm.setFieldsValue(record)
    if (record?.image) setNewsFileList([{ uid: record.id || Date.now().toString(), name: record.title || 'img', url: record.image }])
    setNewsModalOpen(true)
  }

  const handleDeleteNews = async (id: string) => {
    Modal.confirm({
      title: "Delete News",
      content: "Are you sure you want to delete this news item?",
      onOk: async () => {
        await dispatch(deleteContent({ type: "homepage", id }) as any)
        message.success("News deleted")
      },
    })
  }

  const handleSubmitNews = async (values: any) => {
    try {
      const data = { ...values, type: "news" }
      let result: any = null
      if (editingNews) {
        result = await dispatch(updateContent({ type: "homepage", id: editingNews.id, data }) as any).unwrap()
        message.success("News updated")
      } else {
        result = await dispatch(createContent({ type: "homepage", data }) as any).unwrap()
        message.success("News created")
      }
      setNewsModalOpen(false)
      newsForm.resetFields()
      setPreviewData(result)
    } catch (e) {
      message.error("Failed to save news")
    }
  }

  const columns = [
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Type", dataIndex: "type", key: "type", width: 120, render: (t: string) => <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{t}</span> },
    { title: "Status", dataIndex: "status", key: "status", width: 120, render: (s: string) => <span className="px-2 py-1 bg-gray-100 rounded text-xs">{s || 'draft'}</span> },
    { title: "Language", dataIndex: "language", key: "language", width: 120 },
    { title: "Excerpt", dataIndex: "excerpt", key: "excerpt", render: (t: string) => <div className="text-sm text-gray-600">{t}</div> },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      render: (_: any, record: any) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} onClick={() => { setPreviewData(record); setPreviewOpen(true); }} />
            <Button type="text" icon={<EditOutlined />} onClick={() => {
            setEditingContent(record)
            // prefill form and filelist
            const prefill = { ...record }
            if (Array.isArray(prefill.programs)) prefill.programs = prefill.programs.join(',')
            createForm.setFieldsValue(prefill)
            if (record?.image) setCreateFileList([{ uid: record.id || Date.now().toString(), name: record.title || 'img', url: record.image }])
            if (record?.thumbnailImage) setThumbnailFileList([{ uid: record.id || Date.now().toString(), name: 'thumbnail', url: record.thumbnailImage }])
            setCreateModalOpen(true)
          }} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDeleteNews(record.id)} />
        </Space>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <Card title="Homepage Editor" extra={<Button type="default" onClick={() => { setPreviewIframeUrl(window.location.origin + '/'); setPreviewIframeOpen(true); }}>Preview Site</Button>}>
        <div className="flex justify-between mb-4">
          <div />
          <div className="flex items-center gap-3">
            <Select defaultValue="en" style={{ width: 140 }}>
              <Select.Option value="en">English</Select.Option>
            </Select>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateContent}>
              Add Content
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.isArray(homepage?.items) && homepage.items.map((item: any) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer" onClick={() => { setPreviewData(item); setPreviewOpen(true); }}>
              {item.image && <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />}
              <div className="p-6">
                <div className="text-xs text-blue-600 font-semibold mb-2">{item.type}</div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">{item.title}</h3>
                {item.excerpt && <p className="text-gray-700 mb-4">{item.excerpt}</p>}
                {item.description && <p className="text-gray-700 mb-4">{item.description}</p>}
                {item.content && <div className="text-gray-700 text-sm" dangerouslySetInnerHTML={{ __html: item.content.substring(0, 100) + '...' }} />}
                {item.date && <div className="text-gray-400 text-sm mt-2">{item.date}</div>}
                <div className="mt-4 flex justify-end">
                  <Button type="text" icon={<EyeOutlined />} onClick={(e) => { e.stopPropagation(); setPreviewData(item); setPreviewOpen(true); }} />
                  <Button type="text" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); setEditingContent(item); createForm.setFieldsValue(item); setCreateModalOpen(true); }} />
                  <Button type="text" danger icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); Modal.confirm({ title: "Delete", content: "Sure?", onOk: () => dispatch(deleteContent({ type: "homepage", id: item.id }) as any) }); }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal title={editingNews ? "Edit News" : "Add News"} open={newsModalOpen} onCancel={() => setNewsModalOpen(false)} onOk={() => newsForm.submit()}>
        <Form form={newsForm} layout="vertical" onFinish={handleSubmitNews}>
          <Form.Item name="title" label="Title" rules={[{ required: true, message: "Please enter title" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="excerpt" label="Excerpt">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item name="content" label="Content">
            <TextArea rows={6} />
          </Form.Item>
          <Form.Item name="date" label="Date">
            <Input placeholder="e.g., November 10, 2025" />
          </Form.Item>
          <Form.Item name="image" label="Image">
            <Upload
              accept="image/*"
              listType="picture"
              fileList={newsFileList}
              maxCount={1}
              beforeUpload={(file) => {
                const isImage = file.type.startsWith("image/")
                const isLt5M = file.size / 1024 / 1024 < 5
                if (!isImage) message.error("You can only upload image files")
                if (!isLt5M) message.error("Image must be smaller than 5MB")
                return false
              }}
              onRemove={() => {
                newsForm.setFieldsValue({ image: "" })
                setNewsFileList([])
              }}
              onChange={async (info) => {
                const latestFile = info.fileList[info.fileList.length - 1]
                const origin = latestFile && (latestFile.originFileObj as File | undefined)
                if (origin) {
                  const b64 = await getBase64(origin)
                  newsForm.setFieldsValue({ image: b64 })
                  setNewsFileList([{ uid: latestFile.uid, name: latestFile.name, url: b64 }])
                } else {
                  setNewsFileList(info.fileList.slice(-1))
                }
              }}
            >
              <Button>Upload Image</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Live Preview" open={previewIframeOpen} onCancel={() => { setPreviewIframeOpen(false); setPreviewIframeUrl(null) }} footer={null} width={1000} bodyStyle={{ height: '80vh', padding: 0 }}>
        {previewIframeUrl ? (
          // eslint-disable-next-line jsx-a11y/iframe-has-title
          <iframe src={previewIframeUrl} style={{ width: '100%', height: '100%', border: 'none' }} />
        ) : (
          <div className="p-6">Loading preview...</div>
        )}
      </Modal>

      {/* Unified Create Content Modal (matches screenshot) */}
      <Modal
        title={editingContent ? "Edit Content" : "Create Content"}
        open={createModalOpen}
        onCancel={() => { setCreateModalOpen(false); setEditingContent(null); }}
        onOk={() => createForm.submit()}
        width={800}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              const data = { ...values }
              let result: any = null
              if (editingContent) {
                result = await dispatch(updateContent({ type: "homepage", id: editingContent.id, data }) as any).unwrap()
                message.success('Content updated')
              } else {
                result = await dispatch(createContent({ type: "homepage", data }) as any).unwrap()
                message.success('Content created')
              }
              setCreateModalOpen(false)
              setEditingContent(null)
              createForm.resetFields()
              setPreviewData(result)
            } catch (e) {
              message.error(editingContent ? 'Failed to update content' : 'Failed to create content')
            }
          }}
        >
          {/* For homepage editor we only support Hero and News content types to match public site */}
          <Form.Item name="type" label="Content Type" rules={[{ required: true }]}>
            <Select placeholder="Select type">
              <Select.Option value="hero">Hero</Select.Option>
              <Select.Option value="news">News</Select.Option>
              <Select.Option value="campuslife">Campus Life</Select.Option>
              <Select.Option value="whatsnew">What's New</Select.Option>
              <Select.Option value="departments">Departments</Select.Option>
              <Select.Option value="events">Events</Select.Option>
              <Select.Option value="partners">Partners</Select.Option>
            </Select>
          </Form.Item>

          {/* Common fields */}
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Enter title' }]}>
            <Input placeholder="Enter title" />
          </Form.Item>
          <Form.Item name="image" label="Image Upload">
            <Upload
              accept="image/*"
              listType="picture"
              fileList={createFileList}
              maxCount={1}
              beforeUpload={(file) => {
                const isImage = file.type.startsWith("image/")
                const isLt5M = file.size / 1024 / 1024 < 5
                if (!isImage) message.error("You can only upload image files")
                if (!isLt5M) message.error("Image must be smaller than 5MB")
                return false
              }}
              onRemove={() => {
                createForm.setFieldsValue({ image: "" })
                setCreateFileList([])
              }}
              onChange={async (info) => {
                const latestFile = info.fileList[info.fileList.length - 1]
                const origin = latestFile && (latestFile.originFileObj as File | undefined)
                if (origin) {
                  const b64 = await getBase64(origin)
                  createForm.setFieldsValue({ image: b64 })
                  setCreateFileList([{ uid: latestFile.uid, name: latestFile.name, url: b64 }])
                } else {
                  setCreateFileList(info.fileList.slice(-1))
                }
              }}
            >
              <Button>Upload Image</Button>
            </Upload>
          </Form.Item>

          {/* Dynamic fields by content type */}
          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}>
            {() => {
              const type = createForm.getFieldValue('type')
              if (type === 'hero') {
                return (
                  <>
                    <Form.Item name="subtitle" label="Subtitle">
                      <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                      <Input.TextArea rows={3} />
                    </Form.Item>
                  </>
                )
              }
              if (type === 'news') {
                return (
                  <>
                    <Form.Item name="excerpt" label="Excerpt">
                      <Input.TextArea rows={2} />
                    </Form.Item>
                    <Form.Item name="date" label="Date">
                      <Input placeholder="e.g., November 10, 2025" />
                    </Form.Item>
                    <Form.Item name="content" label="Content">
                      <Input.TextArea rows={6} />
                    </Form.Item>
                  </>
                )
              }
              if (type === 'campuslife') {
                return (
                  <>
                    <Form.Item name="eyebrow" label="Tag / Eyebrow" help="Small label shown above the card (e.g. EVERY CAMPUS)">
                      <Input placeholder="e.g., EVERY CAMPUS" />
                    </Form.Item>
                    <Form.Item name="heading" label="Section Heading" help="Large heading shown on the right (e.g. CAMPUS LIFE)" rules={[{ required: true, message: 'Enter section heading' }]}>
                      <Input placeholder="CAMPUS LIFE" />
                    </Form.Item>
                    <Form.Item name="cardTitle" label="Card Title" help="Title inside the left card (e.g. Events and Activities)" rules={[{ required: true, message: 'Enter card title' }]}>
                      <Input placeholder="Events and Activities" />
                    </Form.Item>
                    <Form.Item name="cardSubtitle" label="Card Subtitle">
                      <Input placeholder="Short subtitle or tagline" />
                    </Form.Item>
                    <Form.Item name="description" label="Card Description">
                      <Input.TextArea rows={5} placeholder="Description shown inside the left card" />
                    </Form.Item>
                    <Form.Item name="ctaText" label="CTA Text" help="Text for the call-to-action button (e.g. View Gallery)">
                      <Input placeholder="View Gallery" />
                    </Form.Item>
                    <Form.Item name="ctaUrl" label="CTA URL">
                      <Input placeholder="/gallery or full URL" />
                    </Form.Item>
                  </>
                )
              }
              if (type === 'whatsnew') {
                return (
                  <>
                    <Form.Item name="excerpt" label="Excerpt">
                      <Input.TextArea rows={3} placeholder="Short excerpt shown next to title" />
                    </Form.Item>
                    <Form.Item name="date" label="Date">
                      <Input placeholder="e.g., November 10, 2025" />
                    </Form.Item>
                    <Form.Item name="content" label="Content">
                      <Input.TextArea rows={6} placeholder="Full content for the article" />
                    </Form.Item>
                    <Form.Item name="featuredImage" label="Featured Image">
                      <Upload
                        accept="image/*"
                        listType="picture"
                        fileList={createFileList}
                        maxCount={1}
                        beforeUpload={(file) => {
                          const isImage = file.type.startsWith("image/")
                          const isLt5M = file.size / 1024 / 1024 < 5
                          if (!isImage) message.error("You can only upload image files")
                          if (!isLt5M) message.error("Image must be smaller than 5MB")
                          return false
                        }}
                        onRemove={() => {
                          // clear only featuredImage field when removing in this context
                          createForm.setFieldsValue({ featuredImage: "" })
                          setCreateFileList([])
                        }}
                        onChange={async (info) => {
                          const latestFile = info.fileList[info.fileList.length - 1]
                          const origin = latestFile && (latestFile.originFileObj as File | undefined)
                          if (origin) {
                            const b64 = await getBase64(origin)
                            createForm.setFieldsValue({ featuredImage: b64 })
                            setCreateFileList([{ uid: latestFile.uid, name: latestFile.name, url: b64 }])
                          } else {
                            setCreateFileList(info.fileList.slice(-1))
                          }
                        }}
                      >
                        <Button>Upload Featured Image</Button>
                      </Upload>
                    </Form.Item>
                    <Form.Item name="thumbnailImage" label="Thumbnail Image (optional)">
                      <Upload
                        accept="image/*"
                        listType="picture"
                        fileList={thumbnailFileList}
                        maxCount={1}
                        beforeUpload={(file) => {
                          const isImage = file.type.startsWith("image/")
                          const isLt5M = file.size / 1024 / 1024 < 5
                          if (!isImage) message.error("You can only upload image files")
                          if (!isLt5M) message.error("Image must be smaller than 5MB")
                          return false
                        }}
                        onRemove={() => {
                          createForm.setFieldsValue({ thumbnailImage: "" })
                          setThumbnailFileList([])
                        }}
                        onChange={async (info) => {
                          const latestFile = info.fileList[info.fileList.length - 1]
                          const origin = latestFile && (latestFile.originFileObj as File | undefined)
                          if (origin) {
                            const b64 = await getBase64(origin)
                            createForm.setFieldsValue({ thumbnailImage: b64 })
                            setThumbnailFileList([{ uid: latestFile.uid, name: latestFile.name, url: b64 }])
                          } else {
                            setThumbnailFileList(info.fileList.slice(-1))
                          }
                        }}
                      >
                        <Button>Upload Thumbnail</Button>
                      </Upload>
                    </Form.Item>
                    <Form.Item name="isFeatured" label="Featured">
                      <Select>
                        <Select.Option value={true}>Yes (show as large featured)</Select.Option>
                        <Select.Option value={false}>No</Select.Option>
                      </Select>
                    </Form.Item>
                  </>
                )
              }
              if (type === 'departments') {
                return (
                  <>
                    <Form.Item name="eyebrow" label="Tag / Eyebrow" help="Small label shown above the heading (e.g. Campuses)">
                      <Input placeholder="Campuses" />
                    </Form.Item>
                    <Form.Item name="heading" label="Section Heading" help="Large heading (e.g. Explore our Departments)" rules={[{ required: true, message: 'Enter section heading' }]}>
                      <Input placeholder="Explore our Departments" />
                    </Form.Item>
                    <Form.Item name="campusName" label="Campus Name / Card Title" rules={[{ required: true, message: 'Enter campus name' }]}>
                      <Input placeholder="SEFERE SELAM CAMPUS" />
                    </Form.Item>
                    <Form.Item name="cardDescription" label="Card Description">
                      <Input.TextArea rows={4} placeholder="Description about the campus shown on the left" />
                    </Form.Item>
                    <Form.Item name="ctaText" label="CTA Text">
                      <Input placeholder="Explore this Campus" />
                    </Form.Item>
                    <Form.Item name="ctaUrl" label="CTA URL">
                      <Input placeholder="/campus/sefere-selam or full URL" />
                    </Form.Item>
                    <Form.Item name="galleryImages" label="Gallery Images (up to 3)">
                      <Upload
                        accept="image/*"
                        listType="picture"
                        fileList={deptGalleryFileList}
                        multiple
                        maxCount={3}
                        beforeUpload={(file) => {
                          const isImage = file.type.startsWith("image/")
                          const isLt5M = file.size / 1024 / 1024 < 5
                          if (!isImage) message.error("You can only upload image files")
                          if (!isLt5M) message.error("Image must be smaller than 5MB")
                          return false
                        }}
                        onRemove={() => {
                          createForm.setFieldsValue({ galleryImages: [] })
                          setDeptGalleryFileList([])
                        }}
                        onChange={async (info) => {
                          const files = info.fileList.slice(-3)
                          const results: string[] = []
                          for (const f of files) {
                            const origin = f.originFileObj as File | undefined
                            if (origin) {
                              // convert to base64 for preview and payload
                              // reuse getBase64 helper
                              // eslint-disable-next-line no-await-in-loop
                              const b64 = await getBase64(origin)
                              results.push(b64)
                            } else if (f.url) {
                              results.push(f.url as string)
                            }
                          }
                          setDeptGalleryFileList(files)
                          createForm.setFieldsValue({ galleryImages: results })
                        }}
                      >
                        <Button>Upload Gallery Images</Button>
                      </Upload>
                    </Form.Item>
                  </>
                )
              }
              if (type === 'events') {
                return (
                  <>
                    <Form.Item name="eventDate" label="Date" help="Example: Dec 01 - Dec 31, 2025">
                      <Input placeholder="e.g., Dec 01 - Dec 31, 2025" />
                    </Form.Item>
                    <Form.Item name="time" label="Time" help="Example: 10 AM - 4 PM">
                      <Input placeholder="e.g., 12 AM - Dec 31, 2025" />
                    </Form.Item>
                    <Form.Item name="location" label="Location">
                      <Input placeholder="Location or venue" />
                    </Form.Item>
                    <Form.Item name="excerpt" label="Excerpt">
                      <Input.TextArea rows={3} placeholder="Short excerpt for the event" />
                    </Form.Item>
                    <Form.Item name="content" label="Content">
                      <Input.TextArea rows={6} placeholder="Full event details" />
                    </Form.Item>
                    <Form.Item name="link" label="Event Link (optional)">
                      <Input placeholder="/events/slug or full URL" />
                    </Form.Item>
                  </>
                )
              }
              if (type === 'partners') {
                return (
                  <>
                    <Form.Item name="eyebrow" label="Tag / Eyebrow" help="Small label shown above the heading (e.g. FEATURED PARTNERS)">
                      <Input placeholder="FEATURED PARTNERS" />
                    </Form.Item>
                    <Form.Item name="heading" label="Section Heading" rules={[{ required: true, message: 'Enter section heading' }]}>
                      <Input placeholder="Featured Partners" />
                    </Form.Item>
                    <Form.Item name="description" label="Short Description">
                      <Input.TextArea rows={3} placeholder="Short blurb under the heading" />
                    </Form.Item>
                    <Form.Item name="partnerLogos" label="Partner Logos (multiple)">
                      <Upload
                        accept="image/*"
                        listType="picture"
                        fileList={partnersFileList}
                        multiple
                        beforeUpload={(file) => {
                          const isImage = file.type.startsWith("image/")
                          const isLt5M = file.size / 1024 / 1024 < 5
                          if (!isImage) message.error("You can only upload image files")
                          if (!isLt5M) message.error("Image must be smaller than 5MB")
                          return false
                        }}
                        onRemove={() => {
                          createForm.setFieldsValue({ partnerLogos: [] })
                          setPartnersFileList([])
                        }}
                        onChange={async (info) => {
                          const files = info.fileList
                          const results: string[] = []
                          for (const f of files) {
                            const origin = f.originFileObj as File | undefined
                            if (origin) {
                              // eslint-disable-next-line no-await-in-loop
                              const b64 = await getBase64(origin)
                              results.push(b64)
                            } else if (f.url) {
                              results.push(f.url as string)
                            }
                          }
                          setPartnersFileList(files)
                          createForm.setFieldsValue({ partnerLogos: results })
                        }}
                      >
                        <Button>Upload Partner Logos</Button>
                      </Upload>
                    </Form.Item>
                    <Form.Item name="featuredPartnerName" label="Featured Partner Name">
                      <Input placeholder="Africa Special NEP (RSAS)" />
                    </Form.Item>
                    <Form.Item name="featuredPartnerDescription" label="Featured Partner Description">
                      <Input.TextArea rows={3} placeholder="Short description for featured partner" />
                    </Form.Item>
                    <Form.Item name="viewAllUrl" label="View All URL">
                      <Input placeholder="/partners or full URL" />
                    </Form.Item>
                  </>
                )
              }
              return null
            }}</Form.Item>
          <Form.Item name="link" label="Link (Optional)">
            <Input placeholder="Enter link URL" />
          </Form.Item>
          <Form.Item name="order" label="Display Order">
            <Input type="number" placeholder="0" />
          </Form.Item>
          <Form.Item name="language" label="Language" initialValue="en">
            <Select>
              <Select.Option value="en">English</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="Status" initialValue="draft">
            <Select>
              <Select.Option value="draft">draft</Select.Option>
              <Select.Option value="published">published</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Preview Modal: shows a quick preview of the created/updated content */}
      <Modal title="Preview" open={previewOpen} onCancel={() => { setPreviewOpen(false); setPreviewData(null) }} footer={null} width={900}>
        {!previewData && <div>No preview available</div>}
        {previewData && (
          <div>
            {/* Show image if available */}
            {previewData.image && <img src={previewData.image} alt="preview" className="w-full h-64 object-cover rounded mb-4" />}
            {/* Basic rendering per content type */}
            {previewData.type === 'news' || previewData.type === 'whatsnew' ? (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">{previewData.title}</h2>
                {previewData.excerpt && <p className="text-gray-700">{previewData.excerpt}</p>}
                {previewData.date && <p className="text-sm text-gray-500">{previewData.date}</p>}
                {previewData.content && <div className="prose max-w-none mt-2" dangerouslySetInnerHTML={{ __html: previewData.content }} />}
              </div>
            ) : previewData.type === 'campuslife' ? (
              <div className="grid grid-cols-2 gap-6 items-center">
                <div className="bg-white p-6 rounded shadow">
                  {previewData.eyebrow && <div className="text-xs text-orange-500 font-semibold mb-2">{previewData.eyebrow}</div>}
                  <h3 className="text-xl font-bold">{previewData.cardTitle}</h3>
                  {previewData.cardSubtitle && <p className="text-sm text-gray-600">{previewData.cardSubtitle}</p>}
                  {previewData.description && <p className="mt-3 text-gray-700">{previewData.description}</p>}
                  {previewData.ctaText && <a href={previewData.ctaUrl || '#'} className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded">{previewData.ctaText}</a>}
                </div>
                <div>
                  <h1 className="text-4xl font-extrabold">{previewData.heading}</h1>
                </div>
              </div>
            ) : previewData.type === 'departments' ? (
              <div>
                <h2 className="text-3xl font-bold">{previewData.heading}</h2>
                <h3 className="text-xl text-orange-600 mt-2">{previewData.campusName}</h3>
                {previewData.cardDescription && <p className="mt-2 text-gray-700">{previewData.cardDescription}</p>}
                {Array.isArray(previewData.galleryImages) && previewData.galleryImages.length > 0 && (
                  <div className="flex gap-3 mt-4">
                    {previewData.galleryImages.map((g: string, i: number) => (
                      <img key={i} src={g} className="w-40 h-56 object-cover rounded" alt={`gallery-${i}`} />
                    ))}
                  </div>
                )}
              </div>
            ) : previewData.type === 'events' ? (
              <div>
                <h2 className="text-2xl font-bold">{previewData.title}</h2>
                {previewData.eventDate && <div className="text-sm text-gray-500">{previewData.eventDate} · {previewData.time}</div>}
                {previewData.location && <div className="text-sm text-gray-500">Location: {previewData.location}</div>}
                {previewData.excerpt && <p className="mt-2 text-gray-700">{previewData.excerpt}</p>}
                {previewData.content && <div className="prose max-w-none mt-2" dangerouslySetInnerHTML={{ __html: previewData.content }} />}
              </div>
            ) : previewData.type === 'partners' ? (
              <div>
                <h2 className="text-2xl font-bold">{previewData.heading}</h2>
                {previewData.description && <p className="text-gray-700 mt-2">{previewData.description}</p>}
                {Array.isArray(previewData.partnerLogos) && (
                  <div className="flex items-center gap-6 mt-4">
                    {previewData.partnerLogos.map((logo: string, i: number) => (
                      <img key={i} src={logo} alt={`partner-${i}`} className="w-28 h-28 object-contain rounded-full bg-white p-2" />
                    ))}
                  </div>
                )}
                {previewData.featuredPartnerName && (
                  <div className="mt-6 text-center">
                    <h3 className="text-xl font-semibold">{previewData.featuredPartnerName}</h3>
                    {previewData.featuredPartnerDescription && <p className="text-gray-600">{previewData.featuredPartnerDescription}</p>}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 className="font-bold">{previewData.title || 'Preview'}</h3>
                <pre className="text-xs mt-2 whitespace-pre-wrap">{JSON.stringify(previewData, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default HomeAdminPage
