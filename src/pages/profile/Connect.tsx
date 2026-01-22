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
                <span className="text-lg font-bold text-[#18485e]">Manage Connections</span>
                <Tag color="blue" className="rounded-full border-none px-3">
                  {connections.length} Active Links
                </Tag>
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
                        className="group flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:border-blue-200 hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-2"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#17A2B8] group-hover:bg-[#17A2B8] group-hover:text-white transition-colors duration-300">
                            {PLATFORM_ICON[c.icon] ? PLATFORM_ICON[c.icon]({ style: { fontSize: 22 } }) : <GlobalOutlined style={{ fontSize: 22 }} />}
                          </div>
                          <div>
                            <div className="font-bold text-[#18485e]">{c.name}</div>
                            <a
                              href={c.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-gray-400 hover:text-[#17A2B8] hover:underline transition-colors"
                            >
                              {c.link}
                            </a>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Tooltip title="Delete Connection">
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleDeleteLink(c.id || c._id, c.name)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                          </Tooltip>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={10}>
          <Card
            bordered={false}
            className="rounded-2xl shadow-lg border-none overflow-hidden sticky top-8"
            bodyStyle={{ padding: 0 }}
          >
            <div className="bg-[#18485e] p-6 text-white">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <EyeOutlined />
                Profile Preview
              </h2>
              <p className="text-blue-100 text-xs mt-1">How others see your professional links</p>
            </div>

            <div className="p-8 space-y-8 bg-white min-h-[400px]">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gray-100 mx-auto mb-4 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                  {profileData?.photo ? (
                    <img src={profileData.photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-gray-300">{profileData?.displayName?.[0] || 'U'}</span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-[#18485e]">{profileData?.displayName || 'Your Name'}</h3>
                <p className="text-gray-400 text-sm">{profileData?.title || 'Academic Title'}</p>
              </div>

              <div className="rounded-2xl p-6 bg-gradient-to-br from-[#18485e] to-[#2c3e50] shadow-inner">
                <div className="flex flex-wrap justify-center gap-4">
                  {connections.map((c: any) => (
                    <Tooltip key={c.id || c._id} title={c.name}>
                      <a
                        href={c.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white hover:text-[#18485e] text-white transition-all duration-300 shadow-lg backdrop-blur-sm scale-100 hover:scale-110"
                      >
                        {PLATFORM_ICON[c.icon] ? PLATFORM_ICON[c.icon]({ style: { fontSize: 24 } }) : <GlobalOutlined style={{ fontSize: 24 }} />}
                      </a>
                    </Tooltip>
                  ))}
                  {connections.length === 0 && (
                    <div className="py-8 text-center w-full">
                      <p className="text-blue-200/50 text-sm italic">No links linked yet</p>
                    </div>
                  )}
                </div>

                {connections.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
                    {connections.slice(0, 3).map((c: any) => (
                      <div key={c.id || c._id} className="flex items-center gap-3 text-white/80">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#17A2B8]" />
                        <span className="text-xs truncate">{c.link}</span>
                      </div>
                    ))}
                    {connections.length > 3 && (
                      <p className="text-[10px] text-white/40 text-center mt-2 italic">and {connections.length - 3} more links</p>
                    )}
                  </div>
                )}
              </div>

              <div className="text-center pt-4">
                <Button block className="rounded-full border-[#17A2B8] text-[#17A2B8] hover:bg-[#17A2B8] hover:text-white transition-all">
                  View Full Profile
                </Button>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
