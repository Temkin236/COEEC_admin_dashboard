"use client"

import React, { useState, useEffect } from "react"
import { Card, Form, Input, Select, Button, Upload, Row, Col } from "antd"
import { UploadOutlined, DownloadOutlined, EnvironmentOutlined, MailOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { saveProfile, fetchProfile } from "@/store/slices/profileSlice"

interface ProfileFormData {
  fullName: string
  title: string
  department: string
  role: string
  officeLocation: string
  email: string
  phone: string
  profileImage: string | null
  cv: string | null
  description?: string
}

export default function Profile() {
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: "",
    title: "",
    department: "",
    role: "",
    officeLocation: "",
    email: "",
    phone: "",
    profileImage: null,
    cv: null,
    description: "",
  })
  const handleChange = (name: keyof ProfileFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const dispatch = useAppDispatch()
  const { data: storedProfile } = useAppSelector((s) => s.profile)

  useEffect(() => {
    const url = "https://coeec.onrender.com/api/staff/mjha85820014hq1q386by383"
    dispatch(fetchProfile(url))
  }, [dispatch])

  useEffect(() => {
    if (storedProfile) {
      setFormData((prev) => ({
        ...prev,
        fullName: storedProfile.displayName || "",
        title: storedProfile.title || "",
        department: storedProfile.departmentId || "",
        role: storedProfile.role || prev.role || "",
        email: storedProfile.email || "",
        phone: storedProfile.phone || "",
        officeLocation: storedProfile.officeLocation || "",
        profileImage: (storedProfile.photoUrl as string) || prev.profileImage || null,
        cv: (storedProfile.cvUrl as string) || prev.cv || null,
        description: storedProfile.biography?.description || "",
      }))
    }
  }, [storedProfile])
  const handleImageUpload = ({ file }: any) => {
    const f = file.originFileObj || file
    const reader = new FileReader()
    reader.onloadend = () => setFormData((p) => ({ ...p, profileImage: reader.result as string }))
    reader.readAsDataURL(f)
    return false
  }

  const handleCvUpload = ({ file }: any) => {
    const f = file.originFileObj || file
    setFormData((p) => ({ ...p, cv: f.name }))
    return false
  }

  return (
    <div className="p-4 lg:p-8 min-h-screen bg-[#fafcfd]">
      <Row gutter={32}>
        <Col xs={24} md={14}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.03)", padding: 0 }}>
            <div className="p-8">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <h2 className="font-bold text-base" style={{ color: '#18485e', margin: 0, fontWeight: 600, letterSpacing: 0.2 }}>Edit Profile</h2>
                <div>
                  <Button
                    type="primary"
                    size="small"
                    style={{ background: '#17A2B8', borderRadius: 6, fontWeight: 500 }}
                    onClick={() => {
                      const payload = {
                        displayName: formData.fullName,
                        title: formData.title,
                        departmentId: formData.department,
                        email: formData.email,
                        phone: formData.phone,
                        officeLocation: formData.officeLocation,
                        researchAreas: [],
                        biography: { description: formData.description || "" },
                        photoId: null,
                        cvId: null,
                      }
                      dispatch(saveProfile(payload))
                    }}
                  >
                    Save
                  </Button>
                </div>
              </div>
              <Form layout="vertical">
                <Form.Item label="Full Name">
                  <Input size="large" value={formData.fullName} onChange={(e) => handleChange("fullName", e.target.value)} />
                </Form.Item>
                <Form.Item label="Title Rank">
                  <Input size="large" value={formData.title} onChange={(e) => handleChange("title", e.target.value)} />
                </Form.Item>
                <Form.Item label="Department">
                  <Select size="large" value={formData.department} onChange={(v) => handleChange("department", v)}>
                    <Select.Option value="Electrical Engineering">Electrical Engineering</Select.Option>
                    <Select.Option value="Computer Engineering">Computer Engineering</Select.Option>
                    <Select.Option value="Software Engineering">Software Engineering</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item label="Role">
                  <Input size="large" value={formData.role} onChange={(e) => handleChange("role", e.target.value)} />
                </Form.Item>
                <Form.Item label="Office Location">
                  <Input size="large" value={formData.officeLocation} onChange={(e) => handleChange("officeLocation", e.target.value)} />
                </Form.Item>
                <Form.Item label="Email">
                  <Input size="large" type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} />
                </Form.Item>
                <Form.Item label="Phone">
                  <Input size="large" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
                </Form.Item>
                <Form.Item label="Profile Image">
                  <Upload beforeUpload={handleImageUpload} showUploadList={false} accept="image/*">
                    <div style={{ border: '1.5px dashed #17A2B8', borderRadius: 8, padding: 24, textAlign: 'center', background: '#fafdfe', cursor: 'pointer' }}>
                      <UploadOutlined style={{ fontSize: 28, color: '#17A2B8' }} />
                      <div className="mt-2 text-[#17A2B8] text-sm">clickToUploadProfileImage</div>
                    </div>
                  </Upload>
                </Form.Item>
                <Form.Item label="cvPdf">
                  <Upload beforeUpload={handleCvUpload} showUploadList={false} accept=".pdf">
                    <div style={{ border: '1.5px dashed #17A2B8', borderRadius: 8, padding: 24, textAlign: 'center', background: '#fafdfe', cursor: 'pointer' }}>
                      <UploadOutlined style={{ fontSize: 28, color: '#17A2B8' }} />
                      <div className="mt-2 text-[#17A2B8] text-sm">clickToUploadCV</div>
                    </div>
                  </Upload>
                </Form.Item>
              </Form>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={10}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.03)", padding: 0 }}>
            <div className="p-8">
              <h2 className="font-bold text-lg mb-6" style={{ color: '#18485e' }}>Preview</h2>
              <div style={{ background: '#eaf4f7', borderRadius: 12, minHeight: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
                <div style={{ marginTop: 24, marginBottom: 24 }}>
                  {formData.profileImage ? (
                    <img src={formData.profileImage} alt="Profile" style={{ width: 88, height: 88, borderRadius: '50%', border: '4px solid #fff' }} />
                  ) : (
                    <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#17A2B8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <UserOutlined style={{ fontSize: 48, color: '#fff' }} />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-semibold" style={{ color: '#18485e' }}>Department</div>
                <div className="font-semibold" style={{ color: '#18485e' }}>Role</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#18485e', marginTop: 16 }}>
                  <EnvironmentOutlined style={{ color: '#17A2B8' }} />
                  <span>office</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#18485e', marginTop: 8 }}>
                  <MailOutlined style={{ color: '#17A2B8' }} />
                  <span>Email</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#18485e', marginTop: 8 }}>
                  <PhoneOutlined style={{ color: '#17A2B8' }} />
                  <span>Phone</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
