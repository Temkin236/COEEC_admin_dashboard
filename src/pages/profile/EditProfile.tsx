"use client"

import React, { useState, useEffect } from "react"
import { Card, Form, Input, Select, Button, Upload, Row, Col, Spin } from "antd"
import { UploadOutlined, EnvironmentOutlined, MailOutlined, PhoneOutlined, UserOutlined, DownloadOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchphoto, createphoto, fetchExperiences } from "@/store/slices/profileSlice"
import { uploadCV, uploadPhoto, updateStaff } from "@/store/slices/staffSlice"
// Import directly to ensure the action is available immediately
import { fetchDepartments } from "@/store/slices/departmentSlice"

interface photoFormData {
  fullName: string
  title: string
  department: string
  role: string
  officeLocation: string
  email: string
  phone: string
  photo: string | null
  cv?: string | null
  about?: string
  researchAreas?: string[]
}

export default function photo() {
  const dispatch = useAppDispatch()
  
  // Access departments and loading state
  const { items: departments, loading: depsLoading } = useAppSelector((s) => s.departments)
  const { data: storedphoto, loading: photoLoading } = useAppSelector((s) => s.photo)
  const { user } = useAppSelector((s) => s.auth)

  const [formData, setFormData] = useState<photoFormData>({
    fullName: "",
    title: "",
    department: "",
    role: "",
    officeLocation: "",
    email: "",
    phone: "",
    photo: null,
    cv: null,
    about: "",
    researchAreas: [],
  })

  const [photoFile, setphotoFile] = useState<File | null>(null)
  const [cvFile, setCvFile] = useState<File | null>(null)

  const photo = (storedphoto as any)?.id ?? (storedphoto as any)?._id 
  const experiences = (storedphoto as any)?.experiences || []
  const lastAddedExperience = useAppSelector((s) => (s.photo as any)?.lastAddedExperience)

  // 1. Fetch Departments on mount
  useEffect(() => {
    dispatch(fetchDepartments())
  }, [dispatch])

  // 2. Fetch photo if ID exists
  useEffect(() => {
    if (photo) {
      dispatch(fetchphoto(photo))
      // fetch experiences for preview
      dispatch(fetchExperiences(photo))
    }
  }, [dispatch, photo])

  // 3. Sync form data when photo is loaded
  useEffect(() => {
    if (storedphoto) {
      setFormData({
        fullName: storedphoto.displayName || "",
        title: storedphoto.title || "",
        department: storedphoto.departmentId || "",
        role: storedphoto.role || "",
        email: storedphoto.email || "",
        phone: storedphoto.phone || "",
        officeLocation: storedphoto.officeLocation || "",
        // Normalize to only `photo` and `cv` fields (prefer URL, then raw value)
        photo: (storedphoto.photo as string) || (storedphoto.photo as string) || null,
        cv: (storedphoto.cv as string) || null,
        about: storedphoto.biography?.description || "",
        researchAreas: storedphoto.researchAreas || [],
      })
    }
  }, [storedphoto])

  const handleChange = (name: keyof photoFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (file: any) => {
    const f = file.originFileObj || file
    setphotoFile(f)
    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData((p) => ({ ...p, photo: reader.result as string }))
    }
    reader.readAsDataURL(f)
    return false
  }

  const handleCvUpload = async (file: any) => {
    const f = file.originFileObj || file
    setCvFile(f)
    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData((p) => ({ ...p, cv: reader.result as string }))
    }
    reader.readAsDataURL(f)
    return false
  }

  const handleSave = async () => {
    const payload: any = {
      displayName: formData.fullName,
      title: formData.title,
      departmentId: formData.department,
      email: formData.email,
      phone: formData.phone,
      officeLocation: formData.officeLocation,
      researchAreas: formData.researchAreas || [],
      biography: { description: formData.about || "" },
    }

    // Resolve staffId from stored photo or localStorage/auth_user payload
    const staffIdFromAuthRaw = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null
    const staffAuth = staffIdFromAuthRaw ? JSON.parse(staffIdFromAuthRaw) : null
    const staffIdFromAuth = staffAuth ? (staffAuth.staffId || staffAuth.staff_id || staffAuth.id) : null
    const staffIdKey = typeof window !== 'undefined' ? (localStorage.getItem('staffId') || localStorage.getItem('staff_id')) : null
    const staffId = (storedphoto as any)?.id || (storedphoto as any)?._id || staffIdFromAuth || staffIdKey || null

    try {
      if (staffId) {
        // For existing staff: upload files to that staff record first, then PUT update with ids only
        if (cvFile) {
          const res: any = await dispatch(uploadCV({ id: staffId, file: cvFile }) as any).unwrap()
          const cv = res?.id || res?.cv || null
          if (cv) payload.cv = cv
        }
        if (photoFile) {
          const res: any = await dispatch(uploadPhoto({ id: staffId, file: photoFile }) as any).unwrap()
          const photo = res?.id || res?.photoId || null
          if (photo) payload.photo = photo
        }
        // send only the allowed fields (no base64 photo/cv)
        await dispatch(updateStaff({ id: staffId, data: payload }))
      } else {
        // No staffId: create new photo (POST). Include userId in body.
        const userId = user?.id || ''
        const created: any = await dispatch(createphoto({ userId, data: payload }) as any).unwrap()
        const createdId = created?.id || created?._id
        if (createdId) {
          // store created id to localStorage for subsequent checks
          try { if (typeof window !== 'undefined') { localStorage.setItem('staffId', String(createdId)); localStorage.setItem('staff_id', String(createdId)) } } catch {}
          // upload files after creation and update photo with returned ids
          if (cvFile) {
            const res: any = await dispatch(uploadCV({ id: createdId, file: cvFile }) as any).unwrap()
            const cv = res?.id || res?.cv || null
            if (cv) await dispatch(updateStaff({ id: createdId, data: { cv } }))
          }
          if (photoFile) {
            const res: any = await dispatch(uploadPhoto({ id: createdId, file: photoFile }) as any).unwrap()
            const photo = res?.id || res?.photoId || null
            if (photo) await dispatch(updateStaff({ id: createdId, data: { photo } }))
          }
        }
      }
    } catch (e) {
      console.error("Save failed", e)
    }
  }

  return (
    <div className="p-4 lg:p-8 min-h-screen bg-[#fafcfd]">
      <Row gutter={32}>
        <Col xs={24} md={14}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-[#18485e] m-0">Edit photo</h2>
              <Button
                type="primary"
                loading={photoLoading}
                className="bg-[#17A2B8] rounded-md"
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </div>

            <Form layout="vertical">
              <Form.Item label="Full Name">
                <Input size="large" value={formData.fullName} onChange={(e) => handleChange("fullName", e.target.value)} />
              </Form.Item>

              <Form.Item label="Department">
                <Select
                  size="large"
                  loading={depsLoading}
                  value={formData.department || undefined}
                  placeholder="Select a department"
                  onChange={(v) => handleChange("department", v)}
                  showSearch
                  optionFilterProp="label"
                  options={departments.map(d => ({
                    value: d.id,
                    label: d.name
                  }))}
                />
              </Form.Item>

              <Form.Item label="Title Rank">
                <Input size="large" value={formData.title} onChange={(e) => handleChange("title", e.target.value)} />
              </Form.Item>

              <Form.Item label="Email">
                <Input size="large" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} />
              </Form.Item>

              <Form.Item label="Phone">
                <Input size="large" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
              </Form.Item>

              <Form.Item label="Office Location">
                <Input size="large" value={formData.officeLocation} onChange={(e) => handleChange("officeLocation", e.target.value)} />
              </Form.Item>

              <Form.Item label="Research Areas">
                <Select mode="tags" size="large" value={formData.researchAreas} placeholder="Add research areas" onChange={(v) => handleChange("researchAreas", v)} tokenSeparators={[","]} />
              </Form.Item>

              {/* Other form items... */}
              <Form.Item label="cvPdf">
                <Upload beforeUpload={handleCvUpload} showUploadList={false} accept=".pdf">
                  <div className="w-full border-2 border-dashed border-[#17A2B8] rounded-lg p-6 text-center bg-[#fafdfe] cursor-pointer">
                    <UploadOutlined className="text-2xl text-[#17A2B8]" />
                    <div className="mt-2 text-[#17A2B8] text-sm">Click to upload CV (PDF)</div>
                  </div>
                </Upload>
              </Form.Item>

              <Form.Item label="About">
                <Input.TextArea rows={4} value={formData.about} onChange={(e) => handleChange("about", e.target.value)} placeholder={storedphoto?.biography?.description || "Brief biography"} />
              </Form.Item>

              <Form.Item label="photo Image">
                <Upload beforeUpload={handleImageUpload} showUploadList={false} accept="image/*">
                  <div className="w-full border-2 border-dashed border-[#17A2B8] rounded-lg p-6 text-center bg-[#fafdfe] cursor-pointer">
                    <UploadOutlined className="text-2xl text-[#17A2B8]" />
                    <div className="mt-2 text-[#17A2B8] text-sm">Click to upload photo Image</div>
                  </div>
                </Upload>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} md={10}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
              <h2 className="font-bold text-lg mb-6 text-[#18485e]">Preview</h2>
              {lastAddedExperience && (
                <div className="mb-4">
                  <div className="font-semibold text-[#18485e] mb-2">Recent Experience</div>
                  <div className="space-y-2">
                    <div key={lastAddedExperience.id || lastAddedExperience._id} className="p-3 bg-white rounded shadow-sm">
                      <div className="font-medium">{lastAddedExperience.position || lastAddedExperience.title || lastAddedExperience.role || "Untitled"}</div>
                      <div className="text-sm text-gray-500">{lastAddedExperience.organization || lastAddedExperience.company || lastAddedExperience.institution || ""}</div>
                    </div>
                  </div>
                </div>
              )}
            <div className="flex flex-col items-center p-6 bg-[#eaf4f7] rounded-xl mb-6">
              {formData.photo ? (
                <img src={formData.photo} alt="Preview" className="w-24 h-24 rounded-full border-4 border-white object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#17A2B8] flex items-center justify-center">
                  <UserOutlined className="text-4xl text-white" />
                </div>
              )}
              <div className="mt-4 text-center">
                <div className="font-bold text-xl text-[#18485e]">{formData.fullName || "Your Name"}</div>
                <div className="text-gray-500">{formData.title}</div>
              </div>
            </div>
            
            <div className="space-y-3">
               {/* About appears before Department */}
               {formData.about ? (
                 <div className="text-sm text-[#374151]">{formData.about}</div>
               ) : null}

               <div className="font-semibold text-[#18485e]">
                 {departments.find(d => d.id === formData.department)?.name || "No Department Selected"}
               </div>

               {/* Office */}
               {formData.officeLocation ? (
                 <div className="flex items-center gap-2 text-[#18485e]">
                   <EnvironmentOutlined className="text-[#17A2B8]" />
                   <span>{formData.officeLocation}</span>
                 </div>
               ) : null}

               <div className="flex items-center gap-2 text-[#18485e]">
                 <MailOutlined className="text-[#17A2B8]" />
                 <span>{formData.email}</span>
               </div>
               <div className="flex items-center gap-2 text-[#18485e]">
                 <PhoneOutlined className="text-[#17A2B8]" />
                 <span>{formData.phone}</span>
               </div>

               {/* CV download centered */}
               {(formData.cv || (storedphoto as any)?.cvUrl) && (
                 <div className="mt-6 text-center">
                   <a
                     href={formData.cv || (storedphoto as any)?.cvUrl}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="inline-flex items-center gap-2 text-[#17A2B8]"
                   >
                     <DownloadOutlined />
                     <span>downloadCv</span>
                   </a>
                 </div>
               )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}