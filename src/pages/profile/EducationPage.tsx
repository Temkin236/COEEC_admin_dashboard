"use client"

import { useState, useEffect } from "react"
import { getMyEducation } from "@/store/slices/profileSlice"
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons"
import { Card, Form, Input, Button, Row, Col, Modal } from "antd"
import Loading from "@/components/common/Loading"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchProfile, fetchEducationByStaff, addEducation as addEducationThunk, updateEducation, deleteEducation } from "@/store/slices/profileSlice"

interface EducationEntry {
  id: string
  degree: string
  institution: string
  year?: number
  yearCompleted?: number
  description?: string
}

export default function EducationPage() {
  const dispatch = useAppDispatch()
  const { data: storedphoto, loading, educationLoading } = useAppSelector((s) => s.profile)
  const [education, setEducation] = useState<EducationEntry[]>([])
  const [pendingEducationList, setPendingEducationList] = useState<Array<Omit<EducationEntry, "id">>>([])

  const [newEducation, setNewEducation] = useState<Omit<EducationEntry, "id">>({
    degree: "",
    institution: "",
    year: new Date().getFullYear(),
    description: "",
  })

  const photo = (storedphoto as any)?.id ?? (storedphoto as any)?._id 

  useEffect(() => {
    if (photo) {
      dispatch(fetchProfile(photo))
      dispatch(fetchEducationByStaff(photo))
    }
  }, [dispatch, photo])

  useEffect(() => {
    if (storedphoto) {
      if (Array.isArray(storedphoto.education)) setEducation(storedphoto.education)
    }
  }, [storedphoto])

  // Attempt to fetch education from dev backend and populate preview/placeholders
  // Fetch education via profile slice (uses axiosInstance and token)
  useEffect(() => {
    dispatch(getMyEducation())
  }, [dispatch])

  const handlePostEducation = () => {
    if (!newEducation.degree || !newEducation.institution) return
    
    // Always add new education from the form
    const payload = { ...newEducation, yearCompleted: (newEducation as any).year }
    delete (payload as any).year
    dispatch(addEducationThunk({ staffId: photo, data: payload }))
    
    setNewEducation({ degree: "", institution: "", year: new Date().getFullYear(), description: "" })
  }

  const addLocalEducation = () => {
    if (!newEducation.degree || !newEducation.institution) return
    setPendingEducationList((prev) => [...prev, { ...newEducation }])
    setNewEducation({ degree: "", institution: "", year: new Date().getFullYear(), description: "" })
  }

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Delete Education",
      content: "Are you sure you want to delete this education entry?",
      okType: "danger",
      onOk: () => {
        // delete persisted education entry by id
        dispatch(deleteEducation(id))
      }
    })
  }

  const discardPendingEducation = (index: number) => {
    Modal.confirm({
      title: "Discard Draft",
      content: "Are you sure you want to discard this education draft?",
      okType: "danger",
      onOk: () => {
        setPendingEducationList((prev) => prev.filter((_, i) => i !== index))
      }
    })
  } 

  const previewEducation = [
    ...pendingEducationList.map((pe, idx) => ({ id: `preview-${idx}`, ...pe })),
    ...(education || []),
  ]

  if (loading || educationLoading) {
    return <Loading />
  }

  return (
    <div className="p-4 lg:p-8 min-h-screen bg-[#fafcfd]">
      <Row gutter={32}>
        <Col xs={24} md={14}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.03)", padding: 0 }}>
            <div className="p-8">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h2 className="font-bold text-lg" style={{ color: '#18485e', margin: 0 }}>Edit Education</h2>
                <Button htmlType="button" size="small" style={{ background: '#17A2B8', color: '#fff', borderRadius: 6 }} onClick={addLocalEducation}>Preview</Button>
              </div>



              {education && education.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
                  {education.map((ed) => (
                    <div key={ed.id} style={{ position: 'relative', background: '#f6f7f8', padding: 16, borderRadius: 8 }}>
                      <div style={{ position: 'absolute', right: 12, top: 12, cursor: 'pointer' }} onClick={() => handleDelete(ed.id)}>
                        <DeleteOutlined style={{ color: '#e11d48' }} />
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{ed.degree}</div>
                      <div style={{ fontSize: 13, color: '#18485e', fontWeight: 500 }}>{ed.institution}</div>
                      <div style={{ fontSize: 12, color: '#17A2B8', marginTop: 6 }}>{(ed as any).year ?? (ed as any).yearCompleted}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* pending preview moved to right-side Preview column */}

              <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
                <Form.Item label="Degree Title">
                  <Input value={newEducation.degree} placeholder={education[0]?.degree || ''} onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })} />
                </Form.Item>
                <Form.Item label="Institution">
                  <Input value={newEducation.institution} placeholder={education[0]?.institution || ''} onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })} />
                </Form.Item>
                <Form.Item label="Year Completed">
                  <Input type="number" value={newEducation.year} placeholder={education[0]?.year?.toString() || ''} onChange={(e) => setNewEducation({ ...newEducation, year: Number.parseInt(e.target.value || '0') })} />
                </Form.Item>
                <Form.Item label="Description (optional)">
                  <Input.TextArea rows={2} value={newEducation.description} placeholder={(education[0] as any)?.description || ''} onChange={(e) => setNewEducation({ ...newEducation, description: e.target.value })} />
                </Form.Item>
                <div style={{ marginTop: 12 }}>
                  <Button htmlType="button" disabled={!newEducation.degree || !newEducation.institution} block style={{ background: '#17A2B8', color: '#fff', borderRadius: 8, height: 48 }} icon={<PlusOutlined />} onClick={handlePostEducation}>Save Education</Button>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={10}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.03)", padding: 0 }}>
            <div className="p-8">
              <h2 className="font-bold text-lg mb-6" style={{ color: '#18485e' }}>Preview</h2>
              <div style={{ background: '#eaf4f7', borderRadius: 12, minHeight: 140, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: 24 }}>
                <h3 style={{ marginTop: 0, marginBottom: 18, color: '#18485e', fontWeight: 700, fontSize: 20 }}>Education</h3>
                <div style={{ position: 'relative', paddingLeft: 36, width: '100%' }}>
                  <div style={{ position: 'absolute', left: 20, top: 8, bottom: 8, width: 2, background: '#dbeff1' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 0 }}>
                    {previewEducation.map((edu) => {
                      const isPreview = typeof edu.id === 'string' && edu.id.startsWith('preview-')
                      const pendingIndex = isPreview ? Number((edu.id as string).split('preview-')[1]) : -1
                      return (
                        <div key={edu.id} style={{ display: 'flex', gap: 12 }}>
                          <div style={{ width: 24, display: 'flex', justifyContent: 'center' }}>
                            <div style={{ width: 12, height: 12, borderRadius: 9999, background: '#17A2B8', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }} />
                          </div>
                          <div style={{ flex: 1, background: '#eaf4f7', padding: 16, borderRadius: 8, position: 'relative' }}>
                            {isPreview && (
                              <div style={{ position: 'absolute', right: 12, top: 8 }}>
                                <a onClick={() => discardPendingEducation(pendingIndex)} style={{ color: '#e11d48', cursor: 'pointer' }}>Discard</a>
                              </div>
                            )}
                            <div style={{ fontWeight: 700, fontSize: 15 }}>{edu.degree}</div>
                            <div style={{ fontSize: 13, color: '#18485e', fontWeight: 500 }}>{edu.institution}</div>
                            <div style={{ fontSize: 12, color: '#17A2B8', marginTop: 2 }}>{(edu as any).year ?? (edu as any).yearCompleted}</div>
                            {edu.description && <div style={{ marginTop: 6, color: '#374151', fontSize: 13 }}>{edu.description}</div>}
                          </div>
                        </div>
                      )
                    })}
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
