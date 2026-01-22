"use client"

import { useState, useEffect } from "react"
import { LinkedinOutlined, GlobalOutlined, BookOutlined, MailOutlined, InstagramOutlined, TwitterOutlined, FacebookOutlined, YoutubeOutlined } from "@ant-design/icons"
import { Card, Button, Row, Col, Input, Select, message, Modal } from "antd"
import Loading from "@/components/common/Loading"
import type React from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchProfile } from "@/store/slices/profileSlice"
import { updateStaff } from "@/store/slices/staffSlice"

type PlatformKey = "linkedin" | "googleScholar" | "researchGate" | "personalWebsite" | "instagram" | "twitter" | "facebook" | "youtube"

const PLATFORM_OPTIONS: { key: PlatformKey; label: string }[] = [
  { key: "linkedin", label: "LinkedIn" },
  { key: "googleScholar", label: "Google Scholar" },
  { key: "researchGate", label: "ResearchGate" },
  { key: "personalWebsite", label: "Website" },
  { key: "instagram", label: "Instagram" },
  { key: "twitter", label: "Twitter" },
  { key: "facebook", label: "Facebook" },
  { key: "youtube", label: "YouTube" },
]

const PLATFORM_ICON: Record<PlatformKey, (props: any) => React.ReactNode> = {
  linkedin: (p) => {
    const { size, style, ...rest } = p || {}
    return <LinkedinOutlined {...rest} style={{ ...(style || {}), fontSize: size }} />
  },
  googleScholar: (p) => {
    const { size, style, ...rest } = p || {}
    return <BookOutlined {...rest} style={{ ...(style || {}), fontSize: size }} />
  },
  researchGate: (p) => {
    const { size, style, ...rest } = p || {}
    return <GlobalOutlined {...rest} style={{ ...(style || {}), fontSize: size }} />
  },
  personalWebsite: (p) => {
    const { size, style, ...rest } = p || {}
    return <MailOutlined {...rest} style={{ ...(style || {}), fontSize: size }} />
  },
  instagram: (p) => {
    const { size, style, ...rest } = p || {}
    return <InstagramOutlined {...rest} style={{ ...(style || {}), fontSize: size }} />
  },
  twitter: (p) => {
    const { size, style, ...rest } = p || {}
    return <TwitterOutlined {...rest} style={{ ...(style || {}), fontSize: size }} />
  },
  facebook: (p) => {
    const { size, style, ...rest } = p || {}
    return <FacebookOutlined {...rest} style={{ ...(style || {}), fontSize: size }} />
  },
  youtube: (p) => {
    const { size, style, ...rest } = p || {}
    return <YoutubeOutlined {...rest} style={{ ...(style || {}), fontSize: size }} />
  },
}

interface SocialLink { platform: PlatformKey; url: string }

export default function Connect() {
  const dispatch = useAppDispatch()
  const { data: profileData, loading } = useAppSelector((s) => s.profile)
  const { user } = useAppSelector((s) => s.auth)
  const currentUserStaffId = user?.staffId // Get staffId from Redux auth state
  const [links, setLinks] = useState<SocialLink[]>([])
  const [newPlatform, setNewPlatform] = useState<PlatformKey>("instagram")
  const [newUrl, setNewUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (profileData) {
      const social = profileData.socialLinks && profileData.socialLinks.length > 0
        ? profileData.socialLinks
        : (profileData.links || [])
      setLinks(social)
    }
  }, [profileData])

  const handlePostLink = () => {
    if (!newUrl) return
    
    if (!profileData?.id) {
      message.error("Profile not found")
      return
    }

    setIsSubmitting(true)
    const updatedLinks = [...links, { platform: newPlatform, url: newUrl }]
    
    // Save to backend immediately
    dispatch(updateStaff({ id: profileData.id, data: { socialLinks: updatedLinks } }))
      .unwrap()
      .then(() => {
         setLinks(updatedLinks)
         setNewUrl("")
         message.success("Link added successfully")
         dispatch(fetchProfile(profileData.id!))
      })
      .catch((err) => {
        console.error("Failed to save link", err)
        message.error("Failed to save link")
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const addPreviewLink = () => {
    if (!newUrl) return
    setLinks((prev) => [...prev, { platform: newPlatform, url: newUrl }])
    setNewUrl("")
    message.info("Link added to preview")
  }
  
  const deleteLink = (idx: number) => {
    Modal.confirm({
      title: "Remove Link",
      content: "Are you sure you want to remove this social link?",
      okType: "danger",
      onOk: () => {
        const updatedLinks = links.filter((_, i) => i !== idx)
        
        if (profileData?.id) {
           setIsSubmitting(true)
           dispatch(updateStaff({ id: profileData.id, data: { socialLinks: updatedLinks } }))
            .unwrap()
            .then(() => {
              setLinks(updatedLinks)
              message.success("Link removed")
            })
            .catch(() => {
              message.error("Failed to remove link")
            })
            .finally(() => {
              setIsSubmitting(false)
            })
        } else {
           setLinks(updatedLinks)
        }
      }
    })
  }

  if (loading && !profileData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 min-h-screen bg-[#fafcfd]">
      <Row gutter={32}>
        <Col xs={24} md={14}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.03)", padding: 0 }}>
            <div className="p-8">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 className="font-bold text-lg" style={{ color: '#18485e', margin: 0 }}>Edit Links</h2>
                <Button 
                  size="small" 
                  style={{ background: '#17A2B8', color: '#fff', borderRadius: 6 }} 
                  onClick={addPreviewLink}
                >
                  Preview
                </Button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Select 
                    value={newPlatform} 
                    onChange={(val) => setNewPlatform(val as PlatformKey)}
                    style={{ width: '100%' }}
                    options={PLATFORM_OPTIONS.map(opt => ({ value: opt.key, label: opt.label }))}
                  />
                  <Input 
                    value={newUrl} 
                    onChange={(e) => setNewUrl(e.target.value)} 
                    className="md:col-span-2" 
                    placeholder="https://..." 
                  />
                  <Button 
                    loading={isSubmitting}
                    style={{ background: '#17A2B8', color: '#fff', borderRadius: 6 }} 
                    className="w-full md:w-auto" 
                    onClick={handlePostLink}
                  >
                    Add Link
                  </Button>
                </div>

                <div className="space-y-3">
                  {links.map((l, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded border" style={{ borderColor: '#eef6f7' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm" style={{ color: '#17A2B8' }}>
                          {PLATFORM_ICON[l.platform]({ size: 18 })}
                        </div>
                        <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: '#18485e' }}>
                          {l.url}
                        </a>
                      </div>
                      <a onClick={() => deleteLink(idx)} style={{ color: '#17A2B8', cursor: 'pointer' }}>Remove</a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={10}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.03)", padding: 0 }}>
            <div className="p-8">
              <h2 className="font-bold text-lg mb-6" style={{ color: '#18485e' }}>Connect With Me</h2>
              <div className="rounded-lg p-8" style={{ background: '#eaf4f7' }}>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {links.map((l, idx) => (
                    <a key={idx} href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-12 h-12 rounded-full bg-white transition-colors shadow-lg" style={{ color: '#17A2B8' }}>
                      {PLATFORM_ICON[l.platform]({ size: 24 })}
                    </a>
                  ))}
                </div>

                <div className="mt-8 pt-8 space-y-2" style={{ borderTop: '1px solid #dbeff1' }}>
                  {links.map((l, idx) => (
                    <a key={idx} href={l.url} target="_blank" rel="noopener noreferrer" className="block text-sm truncate" style={{ color: '#18485e' }}>
                      {l.url}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
