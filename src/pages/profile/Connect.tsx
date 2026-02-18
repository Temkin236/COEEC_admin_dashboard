"use client"

import { useState, useEffect } from "react"
import {
  LinkedinOutlined, GlobalOutlined, BookOutlined,
  MailOutlined, InstagramOutlined, TwitterOutlined,
  FacebookOutlined, YoutubeOutlined, DeleteOutlined,
  PlusOutlined, EyeOutlined
} from "@ant-design/icons"
import { Card, Button, Row, Col, Input, Select, message, Modal, Tag, Tooltip } from "antd"
import Loading from "@/components/common/Loading"
import type React from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  getMyConnections,
  createConnection,
  deleteConnection
} from "@/store/slices/profileSlice"

type PlatformKey = "linkedin" | "googleScholar" | "researchGate" | "personalWebsite" | "instagram" | "twitter" | "facebook" | "youtube"

const PLATFORM_OPTIONS: { key: PlatformKey; label: string; icon: string }[] = [
  { key: "linkedin", label: "LinkedIn", icon: "linkedin" },
  { key: "googleScholar", label: "Google Scholar", icon: "book" },
  { key: "researchGate", label: "ResearchGate", icon: "global" },
  { key: "personalWebsite", label: "Website", icon: "mail" },
  { key: "instagram", label: "Instagram", icon: "instagram" },
  { key: "twitter", label: "Twitter", icon: "twitter" },
  { key: "facebook", label: "Facebook", icon: "facebook" },
  { key: "youtube", label: "YouTube", icon: "youtube" },
]

const PLATFORM_ICON: Record<string, (props: any) => React.ReactNode> = {
  linkedin: (p) => <LinkedinOutlined {...p} />,
  googleScholar: (p) => <BookOutlined {...p} />,
  researchGate: (p) => <GlobalOutlined {...p} />,
  personalWebsite: (p) => <MailOutlined {...p} />,
  instagram: (p) => <InstagramOutlined {...p} />,
  twitter: (p) => <TwitterOutlined {...p} />,
  facebook: (p) => <FacebookOutlined {...p} />,
  youtube: (p) => <YoutubeOutlined {...p} />,
}

export default function Connect() {
  const dispatch = useAppDispatch()
  const { data: profileData, connectionsLoading } = useAppSelector((s) => s.profile)
  const connections = profileData?.connections || []

  const [newPlatform, setNewPlatform] = useState<PlatformKey>("linkedin")
  const [newUrl, setNewUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    dispatch(getMyConnections())
  }, [dispatch])

  const handlePostLink = async () => {
    if (!newUrl) {
      message.warning("Please enter a URL")
      return
    }

    setIsSubmitting(true)
    const platform = PLATFORM_OPTIONS.find(p => p.key === newPlatform)

    const payload = {
      type: "social",
      name: platform?.label || newPlatform,
      link: newUrl,
      icon: newPlatform, // Use the key as the icon identifier
      isPublic: true,
      order: connections.length
    }

    try {
      await dispatch(createConnection(payload)).unwrap()
      setNewUrl("")
      message.success(`${payload.name} link added successfully`)
    } catch (err) {
      message.error("Failed to add link")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteLink = (id: string, name: string) => {
    Modal.confirm({
      title: "Remove Connection",
      icon: <DeleteOutlined className="text-red-500" />,
      content: `Are you sure you want to remove your ${name} link?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await dispatch(deleteConnection(id)).unwrap()
          message.success(`${name} link removed`)
        } catch (err) {
          message.error("Failed to remove link")
        }
      }
    })
  }

  if (connectionsLoading && connections.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 min-h-screen bg-[#fafcfd]">
      <Row gutter={[32, 32]}>
        <Col xs={24} md={14}>
          <Card
            bordered={false}
            className="rounded-2xl shadow-sm overflow-hidden"
            title={
              <div className="flex items-center justify-between py-2">
                    <span className="text-lg font-bold text-[#18485e]">Edit Links</span>
              </div>
            }
          >
            <div className="space-y-8">
              {/* Add New Link Section */}
              <div className="bg-blue-50/30 p-6 rounded-xl border border-blue-100/50">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Add Professional/Social Link</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-1">
                    <Select
                      size="large"
                      value={newPlatform}
                      onChange={(val) => setNewPlatform(val as PlatformKey)}
                      className="w-full"
                      options={PLATFORM_OPTIONS.map(opt => ({
                        value: opt.key,
                        label: (
                          <div className="flex items-center gap-2">
                            {PLATFORM_ICON[opt.key]({ className: "text-blue-500" })}
                            <span>{opt.label}</span>
                          </div>
                        )
                      }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      size="large"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      placeholder="https://your-profile-url.com"
                      className="rounded-lg shadow-sm"
                      prefix={<GlobalOutlined className="text-gray-400" />}
                    />
                  </div>
                  <Button
                    type="primary"
                    size="large"
                    loading={isSubmitting}
                    icon={<PlusOutlined />}
                    onClick={handlePostLink}
                    className="w-full bg-[#17A2B8] border-none hover:bg-[#138496] rounded-lg shadow-md"
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Connections List */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Your Active Connections</h3>
                {connections.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <div className="text-gray-400 mb-2 font-medium">No connections added yet</div>
                    <p className="text-xs text-gray-400">Add your professional links to help others reach you.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {connections.map((c: any) => (
                      <div
                        key={c.id || c._id}
                        className="flex items-start justify-between p-4 rounded-xl border border-gray-100 bg-white"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-[#17A2B8]">
                            {PLATFORM_ICON[c.icon] ? PLATFORM_ICON[c.icon]({ style: { fontSize: 20 } }) : <GlobalOutlined style={{ fontSize: 20 }} />}
                          </div>
                          <div>
                            <div className="font-medium text-[#18485e]">{c.name}</div>
                            <div className="text-xs text-gray-500 truncate max-w-xs">{c.link}</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <a onClick={() => handleDeleteLink(c.id || c._id, c.name)} className="text-sm text-[#17A2B8]">Remove</a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4">
                  <Button block className="bg-[#17A2B8] text-white rounded-lg h-12">Save Changes</Button>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={10}>
          <Card bordered={false} className="rounded-2xl shadow-sm border-none overflow-hidden sticky top-8" bodyStyle={{ padding: 0 }}>
            <div className="p-6 bg-white">
              <h3 className="text-lg font-bold text-[#18485e]">Connect With Me</h3>
            </div>
            <div className="p-6 bg-[#eaf6f8]">
              <div className="flex items-start gap-4">
                <div className="flex flex-wrap gap-3">
                  {connections.map((c: any) => (
                    <Tooltip key={c.id || c._id} title={c.name}>
                      <a href={c.link} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                        {PLATFORM_ICON[c.icon] ? PLATFORM_ICON[c.icon]({ style: { fontSize: 20, color: '#17A2B8' } }) : <GlobalOutlined style={{ fontSize: 20, color: '#17A2B8' }} />}
                      </a>
                    </Tooltip>
                  ))}
                </div>
              </div>

              <div className="mt-6 p-4 bg-white rounded-lg border border-white/40">
                <div className="space-y-2">
                  {connections.length === 0 ? (
                    <p className="text-gray-400 text-sm italic">No links added yet</p>
                  ) : (
                    connections.map((c: any) => (
                      <div key={c.id || c._id} className="text-sm text-gray-600">{c.link}</div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
