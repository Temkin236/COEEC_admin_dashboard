"use client"

import { useState, useEffect } from "react"
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons"
import { Card, Form, Input, Button, Row, Col, Checkbox, Modal } from "antd"
import Loading from "@/components/common/Loading"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchProfile, fetchExperiences, addExperience as addExperienceThunk, updateExperience, deleteExperience } from "@/store/slices/profileSlice"

interface ExperienceEntry {
  id: string
  position: string
  organization: string
  startYear: number
  endYear: number | null
  isPresent: boolean
  description: string
}

export default function ExperiencePage() {
  const dispatch = useAppDispatch()
  const { data: storedphoto, loading, experiencesLoading } = useAppSelector((s) => s.profile)
  const [experiences, setExperiences] = useState<ExperienceEntry[]>([])
  const [pendingExperienceList, setPendingExperienceList] = useState<Array<Omit<ExperienceEntry, "id">>>([])

  const [newExperience, setNewExperience] = useState<Omit<ExperienceEntry, "id">>({
    position: "",
    organization: "",
    startYear: new Date().getFullYear(),
    endYear: null,
    isPresent: false,
    description: "",
  })

  const storedAuthRaw = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null
  const parsedAuth = storedAuthRaw ? JSON.parse(storedAuthRaw) : null
  const authStaffId = parsedAuth ? (parsedAuth.staffId || parsedAuth.staff_id || parsedAuth.id) : null
  const legacyStaffKey = typeof window !== 'undefined' ? (localStorage.getItem('staffId') || localStorage.getItem('staff_id')) : null
  const photo = (storedphoto as any)?.id || (storedphoto as any)?._id || authStaffId || legacyStaffKey || null

  useEffect(() => {
    if (photo) {
      dispatch(fetchProfile(photo))
      dispatch(fetchExperiences(photo))
    }
  }, [dispatch, photo])

  useEffect(() => {
    if (storedphoto) {
      if (Array.isArray(storedphoto.experiences)) setExperiences(storedphoto.experiences)
      else if (Array.isArray(storedphoto.experience)) setExperiences(storedphoto.experience)
    }
  }, [storedphoto])

  const handlePostExperience = () => {
    if (!newExperience.position || !newExperience.organization) return
    const payload = {
      title: newExperience.position,
      organization: newExperience.organization,
      startYear: newExperience.startYear,
      endYear: newExperience.endYear ?? 0,
      isCurrent: !!newExperience.isPresent,
      description: newExperience.description || "",
      order: experiences?.length ? experiences.length : 0,
    }

    // Always add new experience from the form
    dispatch(addExperienceThunk({ staffId: photo, data: payload }))
    
    setNewExperience({ position: "", organization: "", startYear: new Date().getFullYear(), endYear: null, isPresent: false, description: "" })
  }

  const handleDelete = (id: string) => dispatch(deleteExperience(id))

  const addLocalExperience = () => {
    if (!newExperience.position || !newExperience.organization) return
    setPendingExperienceList((prev) => [...prev, { ...newExperience }])
    setNewExperience({ position: "", organization: "", startYear: new Date().getFullYear(), endYear: null, isPresent: false, description: "" })
  }

  const removeExperience = (id: string) => {
    Modal.confirm({
      title: 'Delete Experience',
      content: 'Are you sure you want to delete this experience entry?',
      okType: 'danger',
      onOk: () => {
        // if preview pending item
        if (typeof id === 'string' && id.startsWith('preview-')) {
          const idx = Number(id.split('preview-')[1])
          setPendingExperienceList((prev) => prev.filter((_, i) => i !== idx))
          return
        }
        // delete persisted entry
        dispatch(deleteExperience(id))
      }
    })
  }

  const discardPending = (index: number) => setPendingExperienceList((prev) => prev.filter((_, i) => i !== index))

  const previewExperiences = [
    ...pendingExperienceList.map((pe, idx) => ({ id: `preview-${idx}`, ...pe })),
    ...(experiences || []),
  ]

  if (loading || experiencesLoading) {
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h2 className="font-bold text-lg" style={{ color: '#18485e', margin: 0 }}>Edit Experience</h2>
                <Button htmlType="button" size="small" style={{ background: '#17A2B8', color: '#fff', borderRadius: 6 }} onClick={addLocalExperience}>Preview</Button>
              </div>



              {/* top preview removed: timeline preview remains on the right side */}

              <div style={{ background: '#fff', padding: 16, borderRadius: 8, marginBottom: 24 }}>
                <Row gutter={12}>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Position Title">
                      <Input value={newExperience.position} placeholder={experiences[0]?.position || ''} onChange={(e) => setNewExperience({ ...newExperience, position: e.target.value })} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Organization">
                      <Input value={newExperience.organization} placeholder={experiences[0]?.organization || ''} onChange={(e) => setNewExperience({ ...newExperience, organization: e.target.value })} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={12}>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Start Year">
                      <Input type="number" value={newExperience.startYear} placeholder={experiences[0]?.startYear?.toString() || ''} onChange={(e) => setNewExperience({ ...newExperience, startYear: Number.parseInt(e.target.value || '0') })} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="End Year">
                      <Input type="number" disabled={newExperience.isPresent} value={newExperience.endYear || ''} placeholder={experiences[0]?.endYear?.toString() || ''} onChange={(e) => setNewExperience({ ...newExperience, endYear: e.target.value ? Number.parseInt(e.target.value) : null })} />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item>
                  <Checkbox checked={newExperience.isPresent} onChange={(e) => setNewExperience({ ...newExperience, isPresent: e.target.checked })}>Currently working here</Checkbox>
                </Form.Item>
                <Form.Item label="Description">
                  <Input.TextArea rows={3} value={newExperience.description} placeholder={experiences[0]?.description || ''} onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })} />
                </Form.Item>
                <div style={{ marginTop: 12 }}>
                  <Button htmlType="button" disabled={!newExperience.position || !newExperience.organization} block style={{ background: '#17A2B8', color: '#fff', borderRadius: 8, height: 48 }} icon={<PlusOutlined />} onClick={handlePostExperience}>Save Experience</Button>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={10}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.03)", padding: 0 }}>
            <div className="p-8">
              <h2 className="font-bold text-lg mb-6" style={{ color: '#18485e' }}>Timeline Preview</h2>
              <div style={{ background: '#ffffff', borderRadius: 12, minHeight: 140, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: 24 }}>
                <h3 style={{ marginTop: 0, marginBottom: 18, color: '#18485e', fontWeight: 700, fontSize: 20 }}>Experience</h3>
                <div style={{ position: 'relative', paddingLeft: 36, width: '100%' }}>
                  <div style={{ position: 'absolute', left: 20, top: 8, bottom: 8, width: 2, background: '#dbeff1' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 0 }}>
                    {previewExperiences.map((exp) => (
                      <div key={exp.id} style={{ display: 'flex', gap: 12, position: 'relative' }}>
                        <div style={{ width: 24, display: 'flex', justifyContent: 'center' }}>
                          <div style={{ width: 12, height: 12, borderRadius: 9999, background: '#17A2B8', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }} />
                        </div>
                        <div style={{ flex: 1, background: '#f6f7f8', padding: 16, borderRadius: 8, position: 'relative' }}>
                          <div style={{ position: 'absolute', right: 12, top: 12, cursor: 'pointer' }} onClick={() => removeExperience(exp.id)}>
                            <DeleteOutlined style={{ color: '#e11d48' }} />
                          </div>
                          <div style={{ fontWeight: 700, fontSize: 15 }}>{(exp as any).position || (exp as any).title}</div>
                          <div style={{ fontSize: 13, color: '#18485e', fontWeight: 500 }}>{exp.organization}</div>
                          <div style={{ fontSize: 12, color: '#17A2B8', marginTop: 2 }}>{(exp as any).startYear} - {((exp as any).isPresent ?? (exp as any).isCurrent) ? 'Present' : (exp as any).endYear}</div>
                          {(exp as any).description && <div style={{ marginTop: 6, color: '#374151', fontSize: 13 }}>{(exp as any).description}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
