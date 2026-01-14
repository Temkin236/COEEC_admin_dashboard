"use client"

import React, { useState, useEffect } from "react"
import { Card, Form, Input, Select, Button, Upload, Row, Col, Spin, message } from "antd"
import { UploadOutlined, EnvironmentOutlined, MailOutlined, PhoneOutlined, UserOutlined, DownloadOutlined } from "@ant-design/icons"
import Loading from "@/components/common/Loading"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { staffApi } from "@/api/staffApi"
import axiosInstance from "@/utils/axios"
import { fetchProfile, createProfile, fetchExperiences, setProfile } from "@/store/slices/profileSlice"
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
  
  // Access departments and loading state (guard against undefined slices)
  const departmentsState = useAppSelector((s) => s.departments) || { items: [], loading: false }
  const departments = (departmentsState as any).items || []
  const depsLoading = (departmentsState as any).loading || false

  const photoState = useAppSelector((s) => s.profile) || { data: null, loading: false }
  const storedphoto = (photoState as any).data
  const photoLoading = (photoState as any).loading || false

  const authState = useAppSelector((s) => s.auth) || {}
  const user = (authState as any).user

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
  const lastAddedExperience = useAppSelector((s) => (s.profile as any)?.lastAddedExperience)

  // 1. Fetch Departments on mount
  useEffect(() => {
    dispatch(fetchDepartments())
  }, [dispatch])

  // 2. Fetch staff profile by ID from token on mount
  useEffect(() => {
    const fetchStaffProfile = async () => {
      try {
        // Extract staffId from JWT token (primary source)
        const authUser = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null
        const parsedAuth = authUser ? JSON.parse(authUser) : null
        const staffIdFromToken = parsedAuth?.staffId || parsedAuth?.staff_id
        const staffIdFromStorage = typeof window !== 'undefined' ? (localStorage.getItem('staffId') || localStorage.getItem('staff_id')) : null
        const staffIdToFetch = staffIdFromToken || staffIdFromStorage
        
        // Only fetch if we have a valid staff ID from token or storage
        if (!staffIdToFetch) {
          console.log('No staffId found in token or storage')
          return
        }
        
        console.log('Fetching staff profile for ID:', staffIdToFetch)
        
        // Make GET request to fetch staff by ID using staffApi
        const data = await staffApi.fetchStaffById(staffIdToFetch)
        if (data) {
          console.log('Staff profile fetched:', data)
          // Update Redux store with fetched profile data
          dispatch(setProfile(data))
          // Fetch experiences for this staff
          dispatch(fetchExperiences(staffIdToFetch))
          // Store staff ID in localStorage for future use
          if (typeof window !== 'undefined') {
            localStorage.setItem('staffId', String(staffIdToFetch))
            localStorage.setItem('staff_id', String(staffIdToFetch))
          }
        }
      } catch (err: any) {
        console.log('Staff profile fetch error:', err?.response?.status)
        // Staff profile doesn't exist yet - normal for new users setting up profile
        if (err?.response?.status === 404) {
          console.log('Staff profile not found - user needs to set up profile')
        }
      }
    }
    fetchStaffProfile()
  }, [dispatch])

  // 3. Sync form data when profile is loaded into Redux
  useEffect(() => {
    if (storedphoto && Object.keys(storedphoto).length > 0) {
      // Get photo URL - can be in photoUrl, photo.url, or direct URL string
      let photoUrl = (storedphoto as any).photoUrl || 
                     (storedphoto as any).photo?.url || 
                     (typeof (storedphoto as any).photo === 'string' ? (storedphoto as any).photo : null)
      
      // Get CV URL - can be in cvUrl, cv.url, or direct URL string
      let cvUrl = (storedphoto as any).cvUrl || 
                  (storedphoto as any).cv?.url || 
                  (typeof (storedphoto as any).cv === 'string' ? (storedphoto as any).cv : null)
      
      console.log('Original photo URL:', photoUrl, 'cv:', cvUrl)
      
      // Replace localhost URLs with backend base URL (uploads are served from root, not /api)
      if (photoUrl && (photoUrl.includes('localhost') || photoUrl.includes('127.0.0.1'))) {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
        if (apiBaseUrl) {
          // Remove /api suffix to get the root backend URL
          const backendBaseUrl = apiBaseUrl.replace(/\/api\/?$/, '')
          // Replace localhost with backend base URL
          photoUrl = photoUrl.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, backendBaseUrl)
          console.log('Converted photo URL:', photoUrl)
        }
      }
      
      if (cvUrl && (cvUrl.includes('localhost') || cvUrl.includes('127.0.0.1'))) {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
        if (apiBaseUrl) {
          // Remove /api suffix to get the root backend URL
          const backendBaseUrl = apiBaseUrl.replace(/\/api\/?$/, '')
          // Replace localhost with backend base URL
          cvUrl = cvUrl.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, backendBaseUrl)
          console.log('Converted CV URL:', cvUrl)
        }
      }
      
      setFormData({
        fullName: storedphoto.displayName || "",
        title: storedphoto.title || "",
        department: storedphoto.departmentId || "",
        role: storedphoto.role || "",
        email: storedphoto.email || "",
        phone: storedphoto.phone || "",
        officeLocation: storedphoto.officeLocation || "",
        photo: photoUrl,
        cv: cvUrl,
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
      // Check if we have a loaded profile in Redux (this means it was successfully fetched from backend)
      const hasLoadedProfile = !!(storedphoto && Object.keys(storedphoto).length > 0)
      
      let finalStaffId = staffId
      
      if (hasLoadedProfile && staffId) {
        // We have a profile loaded from backend - use PUT to update
        await dispatch(updateStaff({ id: staffId, data: payload })).unwrap()
        console.log('Profile updated successfully')
      } else {
        // No profile loaded (first time) - use POST to create
        const userId = user?.id || ''
        const created: any = await dispatch(createProfile({ userId, data: payload }) as any).unwrap()
        const createdId = created?.id || created?._id
        if (createdId) {
          finalStaffId = createdId
          try { 
            if (typeof window !== 'undefined') { 
              localStorage.setItem('staffId', String(createdId))
              localStorage.setItem('staff_id', String(createdId))
            }
          } catch {}
          console.log('Profile created successfully with ID:', createdId)
        }
      }
      
      // Upload photo if user selected one
      if (photoFile && finalStaffId) {
        console.log('Uploading photo...')
        await dispatch(uploadPhoto({ id: finalStaffId, file: photoFile })).unwrap()
        console.log('Photo uploaded successfully')
      }
      
      // Upload CV if user selected one
      if (cvFile && finalStaffId) {
        console.log('Uploading CV...')
        await dispatch(uploadCV({ id: finalStaffId, file: cvFile })).unwrap()
        console.log('CV uploaded successfully')
      }
      
      // Refresh the profile data to show the uploaded files
      if (finalStaffId) {
        const refreshedData = await staffApi.fetchStaffById(finalStaffId)
        if (refreshedData) {
          dispatch(setProfile(refreshedData))
        }
      }
      
      message.success('Profile saved successfully!')
    } catch (e: any) {
      console.error("Save failed", e)
      message.error(e?.message || 'Failed to save profile. Please try again.')
    }
  }

  if (photoLoading && !storedphoto) {
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
                    <div className="mt-2 text-[#17A2B8] text-sm">
                      {cvFile ? `Selected: ${cvFile.name}` : (formData.cv ? 'CV uploaded - Click to change' : 'Click to upload CV (PDF)')}
                    </div>
                  </div>
                </Upload>
                {formData.cv && !cvFile && (
                  <div className="mt-2 text-xs text-gray-500">Current CV is available for download in preview</div>
                )}
              </Form.Item>

              <Form.Item label="About">
                <Input.TextArea rows={4} value={formData.about} onChange={(e) => handleChange("about", e.target.value)} placeholder={storedphoto?.biography?.description || "Brief biography"} />
              </Form.Item>

              <Form.Item label="photo Image">
                <Upload beforeUpload={handleImageUpload} showUploadList={false} accept="image/*">
                  <div className="w-full border-2 border-dashed border-[#17A2B8] rounded-lg p-6 text-center bg-[#fafdfe] cursor-pointer">
                    <UploadOutlined className="text-2xl text-[#17A2B8]" />
                    <div className="mt-2 text-[#17A2B8] text-sm">
                      {photoFile ? `Selected: ${photoFile.name}` : (formData.photo ? 'Photo uploaded - Click to change' : 'Click to upload photo Image')}
                    </div>
                  </div>
                </Upload>
                {formData.photo && !photoFile && (
                  <div className="mt-2 text-xs text-gray-500">Current photo is displayed in preview</div>
                )}
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
                <img 
                  src={formData.photo} 
                  alt={formData.fullName || "Profile"}
                  className="w-24 h-24 rounded-full border-4 border-white object-cover" 
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.error('Failed to load photo:', formData.photo)
                    e.currentTarget.style.display = 'none'
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement
                    if (fallback) fallback.style.display = 'flex'
                  }}
                />
              ) : null}
              <div 
                className="w-24 h-24 rounded-full bg-[#17A2B8] flex items-center justify-center"
                style={{ display: formData.photo ? 'none' : 'flex' }}
              >
                <UserOutlined className="text-4xl text-white" />
              </div>
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