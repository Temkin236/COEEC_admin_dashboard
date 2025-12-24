"use client"

import { useState, useEffect } from "react"
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons"
import { Card, Form, Input, Button, Row, Col, Checkbox, Divider } from "antd"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchProfile } from "@/store/slices/profileSlice"

interface ExperienceEntry {
  id: string
  position: string
  organization: string
  startYear: number
  endYear: number | null
  isPresent: boolean
  description: string
}

interface EducationEntry {
  id: string
  degree: string
  institution: string
  year: number
}

export default function ExperienceEducation() {
  const dispatch = useAppDispatch()
  const { data: storedProfile } = useAppSelector((s) => s.profile)
  const [experiences, setExperiences] = useState<ExperienceEntry[]>([])
  const [education, setEducation] = useState<EducationEntry[]>([])

  const [newExperience, setNewExperience] = useState<Omit<ExperienceEntry, "id">>({
    position: "",
    organization: "",
    startYear: new Date().getFullYear(),
    endYear: null,
    isPresent: false,
    description: "",
  })

  const [newEducation, setNewEducation] = useState<Omit<EducationEntry, "id">>({
    degree: "",
    institution: "",
    year: new Date().getFullYear(),
  })

  const addExperience = () => {
    if (newExperience.position && newExperience.organization) {
      setExperiences([...experiences, { ...newExperience, id: Date.now().toString() }])
      setNewExperience({
        position: "",
        organization: "",
        startYear: new Date().getFullYear(),
        endYear: null,
        isPresent: false,
        description: "",
      })
    }
  }

  const deleteExperience = (id: string) => {
    setExperiences(experiences.filter((e) => e.id !== id))
  }

  const addEducation = () => {
    if (newEducation.degree && newEducation.institution) {
      setEducation([...education, { ...newEducation, id: Date.now().toString() }])
      setNewEducation({
        degree: "",
        institution: "",
        year: new Date().getFullYear(),
      })
    }
  }

  const deleteEducation = (id: string) => {
    setEducation(education.filter((e) => e.id !== id))
  }

  useEffect(() => {
    dispatch(fetchProfile("https://coeec.onrender.com/api/staff/mjha85820014hq1q386by383"))
  }, [dispatch])

  useEffect(() => {
    if (storedProfile) {
      if (Array.isArray(storedProfile.experiences)) setExperiences(storedProfile.experiences)
      else if (Array.isArray(storedProfile.experience)) setExperiences(storedProfile.experience)
      if (Array.isArray(storedProfile.education)) setEducation(storedProfile.education)
    }
  }, [storedProfile])

  return (
    <div className="p-4 lg:p-8 min-h-screen bg-[#fafcfd]">
      <Row gutter={32}>
        <Col xs={24} md={14}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.03)", padding: 0 }}>
            <div className="p-8">
              <h2 className="font-bold text-lg mb-6" style={{ color: '#18485e' }}>Edit Experience & Education</h2>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Experience</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
                {experiences.map((exp) => (
                  <div key={exp.id} style={{ background: '#f4f8fa', padding: 16, borderRadius: 8, marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{exp.position}</div>
                        <div style={{ fontSize: 13, color: '#18485e', fontWeight: 500 }}>{exp.organization}</div>
                        <div style={{ fontSize: 12, color: '#17A2B8', marginTop: 2 }}>{exp.startYear} - {exp.isPresent ? 'Present' : exp.endYear}</div>
                        {exp.description && <div style={{ marginTop: 6, color: '#374151', fontSize: 13 }}>{exp.description}</div>}
                      </div>
                      <Button type="text" danger icon={<DeleteOutlined />} onClick={() => deleteExperience(exp.id)} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#fff', padding: 16, borderRadius: 8, marginBottom: 24 }}>
                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item label="Position Title">
                      <Input value={newExperience.position} onChange={(e) => setNewExperience({ ...newExperience, position: e.target.value })} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Organization">
                      <Input value={newExperience.organization} onChange={(e) => setNewExperience({ ...newExperience, organization: e.target.value })} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item label="Start Year">
                      <Input type="number" value={newExperience.startYear} onChange={(e) => setNewExperience({ ...newExperience, startYear: Number.parseInt(e.target.value || '0') })} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="End Year">
                      <Input type="number" disabled={newExperience.isPresent} value={newExperience.endYear || ''} onChange={(e) => setNewExperience({ ...newExperience, endYear: e.target.value ? Number.parseInt(e.target.value) : null })} />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item>
                  <Checkbox checked={newExperience.isPresent} onChange={(e) => setNewExperience({ ...newExperience, isPresent: e.target.checked })}>Currently working here</Checkbox>
                </Form.Item>
                <Form.Item label="Description">
                  <Input.TextArea rows={3} value={newExperience.description} onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })} />
                </Form.Item>
                <Button type="primary" block icon={<PlusOutlined />} style={{ background: '#17A2B8', borderRadius: 6, fontWeight: 500 }} onClick={addExperience}>Add Experience</Button>
              </div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12, marginTop: 32 }}>Education</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
                {education.map((edu) => (
                  <div key={edu.id} style={{ background: '#fef6f6', padding: 16, borderRadius: 8, marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{edu.degree}</div>
                        <div style={{ fontSize: 13, color: '#18485e', fontWeight: 500 }}>{edu.institution}</div>
                        <div style={{ fontSize: 12, color: '#e67c73', marginTop: 2 }}>{edu.year}</div>
                      </div>
                      <Button type="text" danger icon={<DeleteOutlined />} onClick={() => deleteEducation(edu.id)} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
                <Form.Item label="Degree Title">
                  <Input value={newEducation.degree} onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })} />
                </Form.Item>
                <Form.Item label="Institution">
                  <Input value={newEducation.institution} onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })} />
                </Form.Item>
                <Form.Item label="Year Completed">
                  <Input type="number" value={newEducation.year} onChange={(e) => setNewEducation({ ...newEducation, year: Number.parseInt(e.target.value || '0') })} />
                </Form.Item>
                <Button type="primary" block icon={<PlusOutlined />} style={{ background: '#17A2B8', borderRadius: 6, fontWeight: 500 }} onClick={addEducation}>Add Education</Button>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={10}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.03)", padding: 0 }}>
            <div className="p-8">
              <h2 className="font-bold text-lg mb-6" style={{ color: '#18485e' }}>Timeline Preview</h2>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 10 }}>Experience</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                {experiences.map((exp) => (
                  <div key={exp.id} style={{ background: '#eaf4f7', padding: 16, borderRadius: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{exp.position}</div>
                    <div style={{ fontSize: 13, color: '#18485e', fontWeight: 500 }}>{exp.organization}</div>
                    <div style={{ fontSize: 12, color: '#17A2B8', marginTop: 2 }}>{exp.startYear} - {exp.isPresent ? 'Present' : exp.endYear}</div>
                    {exp.description && <div style={{ marginTop: 6, color: '#374151', fontSize: 13 }}>{exp.description}</div>}
                  </div>
                ))}
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 10 }}>Education</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {education.map((edu) => (
                  <div key={edu.id} style={{ background: '#fef6f6', padding: 16, borderRadius: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{edu.degree}</div>
                    <div style={{ fontSize: 13, color: '#18485e', fontWeight: 500 }}>{edu.institution}</div>
                    <div style={{ fontSize: 12, color: '#e67c73', marginTop: 2 }}>{edu.year}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}


