"use client"

import React from "react";
import { useEffect, useState, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Card, Form, Input, Select, Button, Upload, message, Typography, Divider, Avatar } from "antd"
import { SaveOutlined, UploadOutlined, UserOutlined, ArrowLeftOutlined, IdcardOutlined, BankOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchStaffById, createStaff, updateStaff, uploadCV } from "@/store/slices/staffSlice"
import { fetchDepartments } from "@/store/slices/departmentSlice"


const { TextArea } = Input
const { Title } = Typography

  const StaffFormPage: React.FC = () => {
    const photoInputRef = useRef<HTMLInputElement>(null);
    const { id } = useParams()
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { currentStaff, loading } = useAppSelector((state) => state.staff)
    const { items: departments } = useAppSelector((state) => state.departments)
    const [form] = Form.useForm()
    const [cvFile, setCvFile] = useState<any>(null)
    const [photoPreview, setPhotoPreview] = useState<string | null>(null)
    const [previewValues, setPreviewValues] = useState<any>({})
    const isEdit = !!id && id !== "new"

    const resolveImageUrl = (url?: string | null) => {
      if (!url) return null
      if (url.startsWith("data:") || url.startsWith("blob:")) return url
      if (url.startsWith("http")) return url
      const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, "") || ""
      return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`
    }

  useEffect(() => {
    dispatch(fetchDepartments() as any)
  }, [dispatch])

  useEffect(() => {
    if (isEdit) {
      dispatch((fetchStaffById as any)(id as string) as any)
    }
  }, [dispatch, id, isEdit])

  useEffect(() => {
    if (currentStaff && isEdit) {
      // Extract photo URL from photo object
      let photoUrl = null
      if (currentStaff.photo) {
        if (typeof currentStaff.photo === 'string') {
          photoUrl = currentStaff.photo
        } else if ((currentStaff.photo as any)?.url) {
          photoUrl = (currentStaff.photo as any).url
        }
      }
      
      // Extract biography text from biography object
      let biographyText = ''
      if (currentStaff.biography) {
        if (typeof currentStaff.biography === 'string') {
          biographyText = currentStaff.biography
        } else if (typeof currentStaff.biography === 'object') {
          biographyText = (currentStaff.biography as any)?.content || (currentStaff.biography as any)?.description || ''
        }
      }
      
      const formData = {
        displayName: currentStaff.displayName,
        title: currentStaff.title,
        email: currentStaff.email,
        phone: currentStaff.phone,
        officeLocation: currentStaff.officeLocation,
        researchAreas: currentStaff.researchAreas || [],
        biography: biographyText,
        departmentId: currentStaff.departmentId
      }
      form.setFieldsValue(formData)
      setPhotoPreview(resolveImageUrl(photoUrl))
      setPreviewValues(formData)
    }
  }, [currentStaff, form, isEdit])

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        displayName: values.displayName?.trim(),
        title: values.title?.trim(),
        email: values.email?.trim(),
        phone: values.phone?.trim(),
        officeLocation: values.officeLocation?.trim(),
        departmentId: values.departmentId,
        researchAreas: values.researchAreas || [],
        biography: values.biography?.trim() || '',
        photoId: values.photoId,
        cvId: values.cvId
      }

      if (isEdit) {
        await dispatch((updateStaff as any)({ id: id as string, data }))
        message.success("Staff updated successfully")
      } else {
        await dispatch((createStaff as any)(data))
        message.success("Staff created successfully")
      }
      navigate("/staff")
    } catch (error: any) {
      message.error(error?.message || "Failed to save staff member")
    }
  }


  const handleCVUpload = (info: any) => {
    const file = info.file.originFileObj || info.file
    setCvFile(file)
    return false
  }

  const handlePhotoChange = (info: any) => {
    const file = info.file.originFileObj || info.file;
    if (!file) {
      message.error("No file selected");
      return false;
    }
    console.log("Photo file selected:", file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = (e.target as any).result;
      console.log("FileReader result:", result);
      setPhotoPreview(result);
      form.setFieldsValue({ photo: result });
    }
    reader.onerror = (e) => {
      message.error("Failed to read image file");
      console.error("FileReader error:", e);
    };
    reader.readAsDataURL(file);
    return false;
  };

  // Loose URL validator: allows empty values or URLs without protocol (adds https:// for validation)
  const validateOptionalUrl = (_: any, value: any) => {
    if (!value) return Promise.resolve()
    try {
      const test = typeof value === 'string' && value.trim().length > 0 ? (value.startsWith('http') ? value : `https://${value}`) : ''
      // If still empty, treat as valid
      if (!test) return Promise.resolve()
      // Use URL constructor to validate
      // eslint-disable-next-line no-new
      new URL(test)
      return Promise.resolve()
    } catch (e) {
      return Promise.reject(new Error('Please enter a valid URL'))
    }
  }

  // Update preview values when form fields change
  const handleFormChange = (changedValues: any, allValues: any) => {
    setPreviewValues((prev: any) => ({ ...prev, ...allValues }))
  }

  // Keep previewValues.photo in sync with photoPreview (from Upload)
  useEffect(() => {
    if (photoPreview) {
      setPreviewValues((prev: any) => ({ ...prev, photo: photoPreview }))
    }
  }, [photoPreview])

  // Initialize preview values from form on mount
  useEffect(() => {
    setPreviewValues(form.getFieldsValue())
  }, [])

  return (
    <div>
      <Card variant="outlined" className="w-full mt-4 shadow-sm p-4">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={handleFormChange}
          initialValues={{ status: "active" }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <div className="space-y-4">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Staff Information</h2>
                <div className="space-y-4">
                  <Form.Item 
                    name="displayName" 
                    label="Full Name" 
                    rules={[
                      { required: true, message: "Please enter full name" },
                      { min: 2, message: "Name must be at least 2 characters" }
                    ]}
                  >
                    <Input placeholder="e.g., Dr. John Doe" />
                  </Form.Item>
                  <Form.Item 
                    name="title" 
                    label="Title" 
                    rules={[
                      { required: true, message: "Please enter title" },
                      { min: 2, message: "Title must be at least 2 characters" }
                    ]}
                  >
                    <Input placeholder="e.g., Associate Professor, Lecturer" />
                  </Form.Item>
                  <Form.Item 
                    name="email" 
                    label="Email" 
                    rules={[
                      { required: true, message: "Please enter email" },
                      { type: "email", message: "Please enter a valid email" }
                    ]}
                  >
                    <Input placeholder="example@astu.edu.et" />
                  </Form.Item>
                  <Form.Item name="phone" label="Phone">
                    <Input placeholder="+251911234567" />
                  </Form.Item>
                  <Form.Item name="officeLocation" label="Office Location">
                    <Input placeholder="e.g., B-504 R-12" />
                  </Form.Item>
                  <Form.Item name="departmentId" label="Department">
                    <Select placeholder="Select Department" allowClear>
                      {departments.map((d) => (
                        <Select.Option key={d.id} value={d.id}>{d.name}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item name="researchAreas" label="Research Areas">
                    <Select mode="tags" placeholder="Add research areas" tokenSeparators={[","]} />
                  </Form.Item>
                  <Form.Item name="biography" label="Biography">
                    <TextArea rows={4} placeholder="Brief professional biography" />
                  </Form.Item>
                  <Form.Item label="Photo">
                    <Upload
                      accept="image/*"
                      showUploadList={false}
                      beforeUpload={() => false}
                      onChange={handlePhotoChange}
                    >
                      <Button icon={<UploadOutlined />}>Upload Photo</Button>
                    </Upload>
                    {photoPreview && (
                      <div style={{ marginTop: 12, textAlign: 'center' }}>
                        <img src={photoPreview} alt="Preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: '50%', border: '1px solid #eee' }} />
                      </div>
                    )}
                  </Form.Item>
                  <Form.Item label="Curriculum Vitae (CV)" tooltip="Upload PDF format (max 5MB)">
                    <Upload accept=".pdf" maxCount={1} beforeUpload={handleCVUpload}>
                      <Button icon={<UploadOutlined />}>Upload CV (PDF)</Button>
                    </Upload>
                    {currentStaff && (currentStaff as any).cvUrl && (
                      <div className="mt-2">
                        <a href={(currentStaff as any).cvUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                          View Current CV
                        </a>
                      </div>
                    )}
                  </Form.Item>
                </div>
              </div>
            </div>

            {/* Right Column - Preview */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Live Preview</h2>
              <div className="bg-white rounded-2xl shadow p-0 w-full border border-gray-100 overflow-hidden">
                {/* Top image */}
                <div style={{ width: '100%', height: 220, overflow: 'hidden' }}>
                  {photoPreview ? (
                    <img src={photoPreview} alt="Staff" style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{ width: '100%', height: 220, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <UserOutlined style={{ fontSize: 72, color: '#bbb' }} />
                    </div>
                  )}
                </div>
                <div className="p-6 w-full">
                  <div className="text-xs font-semibold text-primary-600 uppercase mb-2">{previewValues.title || 'TITLE'}</div>
                  <div className="text-2xl font-extrabold text-gray-900 mb-1">{previewValues.displayName || 'Full Name'}</div>
                  <div className="text-sm text-gray-500 mb-4">{previewValues.email || 'email@example.com'}</div>

                  <div className="flex flex-col gap-3 text-gray-600 mb-4">
                    <div className="flex items-center gap-3"><IdcardOutlined className="text-gray-400" /> <span>{previewValues.title || 'Position/Role'}</span></div>
                    <div className="flex items-center gap-3"><BankOutlined className="text-gray-400" /> <span>{previewValues.departmentId ? departments.find(d => d.id === previewValues.departmentId)?.name : 'Department'}</span></div>
                  </div>

                  {previewValues.biography && (
                    <div className="text-sm text-gray-700 mb-4">
                      {typeof previewValues.biography === 'object' 
                        ? previewValues.biography?.description || '' 
                        : previewValues.biography}
                    </div>
                  )}

                  <Divider className="my-2" />

                  <div className="text-xs font-semibold text-gray-500 mt-3 mb-2">RESEARCH AREAS</div>
                  <div className="flex flex-wrap gap-2">
                    {previewValues.researchAreas && Array.isArray(previewValues.researchAreas) && previewValues.researchAreas.length > 0 ? (
                      previewValues.researchAreas.map((area: string, idx: number) => (
                        <span key={idx} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">{area}</span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400">No research areas listed</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        <div className="mt-4 flex justify-end gap-3">
          <Button onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={loading}
            onClick={async () => {
              try {
                await form.validateFields()
                form.submit()
              } catch (err) {
                // validation failed; AntD will show errors
              }
            }}
          >
            Save
          </Button>
        </div>
        </Form>
      </Card>
    </div>
  );
}

export default StaffFormPage;

