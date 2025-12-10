"use client"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Card, Form, Input, Select, Button, Upload, message, Tabs, Typography, Divider, Avatar } from "antd"
import { SaveOutlined, UploadOutlined, UserOutlined, ArrowLeftOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchStaffById, createStaff, updateStaff, uploadCV } from "@/store/slices/staffSlice"
import { DEPARTMENTS } from "@/utils/constants"

const { TextArea } = Input
const { TabPane } = Tabs as any
const { Title } = Typography

const StaffFormPage = () => {
  const { id } = useParams()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { currentStaff, loading } = useAppSelector((state) => state.staff)
  const [form] = Form.useForm()
  const [cvFile, setCvFile] = useState<any>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const isEdit = !!id && id !== "new"

  useEffect(() => {
    if (isEdit) {
      dispatch((fetchStaffById as any)(id as string) as any)
    }
  }, [dispatch, id, isEdit])

  useEffect(() => {
    if (currentStaff && isEdit) {
      form.setFieldsValue(currentStaff as any)
      setPhotoPreview((currentStaff as any).photo)
    }
  }, [currentStaff, form, isEdit])

  const handleSubmit = async (values: any) => {
    try {
      const data = { ...values, researchAreas: values.researchAreas || [], publications: values.publications || [] }
      let savedStaff: any
      if (isEdit) {
        savedStaff = await dispatch((updateStaff as any)({ id, data }) as any).unwrap()
        message.success("Staff updated successfully")
      } else {
        savedStaff = await dispatch(createStaff(data) as any).unwrap()
        message.success("Staff created successfully")
      }

      if (cvFile && savedStaff.id) {
        await dispatch((uploadCV as any)({ id: savedStaff.id, file: cvFile }) as any).unwrap()
        message.success("CV uploaded successfully")
      }

      navigate("/staff")
    } catch (error) {
      message.error("Operation failed")
    }
  }

  const handleCVUpload = (info: any) => {
    const file = info.file.originFileObj || info.file
    setCvFile(file)
    return false
  }

  const handlePhotoChange = (info: any) => {
    const file = info.file.originFileObj || info.file
    const reader = new FileReader()
    reader.onload = (e) => setPhotoPreview((e.target as any).result)
    reader.readAsDataURL(file)
    return false
  }

  return (
    <div className="space-y-4">
      <Card>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/staff")} className="mb-4">
          Back to Staff List
        </Button>

        <div className="flex items-center justify-between mb-6">
          <Title level={2}>{isEdit ? "Edit Staff Profile" : "Add New Staff"}</Title>
          <Button type="primary" icon={<SaveOutlined />} onClick={() => form.submit()} loading={!!loading} size="large">
            {isEdit ? "Update" : "Create"} Staff
          </Button>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Tabs defaultActiveKey="1">
            <TabPane tab="Basic Information" key="1">
              <div className="max-w-4xl">
                <div className="flex gap-6 mb-6">
                  <div>
                    <Avatar size={120} src={photoPreview || undefined} icon={<UserOutlined />} style={{ backgroundColor: "#1e3a5f" }} />
                    <Upload accept="image/*" showUploadList={false} beforeUpload={handlePhotoChange} className="mt-2">
                      <Button size="small">Change Photo</Button>
                    </Upload>
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <Form.Item name="firstName" label="First Name" rules={[{ required: true, message: "Please enter first name" }]}>
                      <Input placeholder="First name" />
                    </Form.Item>
                    <Form.Item name="lastName" label="Last Name" rules={[{ required: true, message: "Please enter last name" }]}>
                      <Input placeholder="Last name" />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, message: "Please enter email" }, { type: "email", message: "Please enter valid email" }]}>
                      <Input placeholder="email@astu.edu.et" />
                    </Form.Item>
                    <Form.Item name="phone" label="Phone">
                      <Input placeholder="+251-XXX-XXXXXX" />
                    </Form.Item>
                  </div>
                </div>

                <Divider />

                <div className="grid grid-cols-2 gap-4">
                  <Form.Item name="title" label="Title" rules={[{ required: true, message: "Please select title" }]}> 
                    <Select placeholder="Select title">
                      <Select.Option value="Professor">Professor</Select.Option>
                      <Select.Option value="Associate Professor">Associate Professor</Select.Option>
                      <Select.Option value="Assistant Professor">Assistant Professor</Select.Option>
                      <Select.Option value="Lecturer">Lecturer</Select.Option>
                      <Select.Option value="Administrator">Administrator</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name="academicRank" label="Academic Rank" rules={[{ required: true, message: "Please select academic rank" }]}> 
                    <Select placeholder="Select academic rank">
                      <Select.Option value="Professor">Professor</Select.Option>
                      <Select.Option value="Associate Professor">Associate Professor</Select.Option>
                      <Select.Option value="Assistant Professor">Assistant Professor</Select.Option>
                      <Select.Option value="Lecturer">Lecturer</Select.Option>
                      <Select.Option value="Administrator">Administrator</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name="department" label="Department" rules={[{ required: true, message: "Please select department" }]}> 
                    <Select placeholder="Select department">
                      {DEPARTMENTS.map((dept) => (
                        <Select.Option key={dept.code} value={dept.code}>
                          {dept.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item name="expertise" label="Expertise">
                    <Select mode="tags" placeholder="Add expertise (e.g., Machine Learning, Cybersecurity)" tokenSeparators={[","]} />
                  </Form.Item>
                  <Form.Item name="office" label="Office Location">
                    <Input placeholder="Building, Room number" />
                  </Form.Item>
                  <Form.Item name="status" label="Status" initialValue="active">
                    <Select>
                      <Select.Option value="active">Active</Select.Option>
                      <Select.Option value="on_leave">On Leave</Select.Option>
                      <Select.Option value="inactive">Inactive</Select.Option>
                    </Select>
                  </Form.Item>
                </div>

                <Form.Item name="bio" label="Biography">
                  <TextArea rows={4} placeholder="Brief professional biography, e.g. Dean of COEEC, Computer Science & Engineering" />
                </Form.Item>
              </div>
            </TabPane>

            <TabPane tab="Academic Background" key="2">
              <div className="max-w-4xl space-y-4">
                <Form.Item name="education" label="Education" tooltip="List degrees in reverse chronological order">
                  <TextArea rows={6} placeholder={"PhD in Computer Science - Stanford University (2015)\nMSc in Software Engineering - MIT (2010)\nBSc in Computer Science - ASTU (2008)"} />
                </Form.Item>
                <Form.Item name="researchAreas" label="Research Areas">
                  <Select mode="tags" placeholder="Add research areas" tokenSeparators={[","]} />
                </Form.Item>
                <Form.Item name="specialization" label="Specialization">
                  <Input placeholder="e.g., Machine Learning, Artificial Intelligence" />
                </Form.Item>
                <Form.Item name="teachingAreas" label="Teaching Areas">
                  <Select mode="tags" placeholder="Add teaching areas" tokenSeparators={[","]} />
                </Form.Item>
              </div>
            </TabPane>

            <TabPane tab="Publications & Research" key="3">
              <div className="max-w-4xl space-y-4">
                <Form.Item name="publications" label="Publications" tooltip="List publications in citation format">
                  <TextArea rows={10} placeholder={"1. Author A., Author B. (2024). Paper Title. Journal Name, Vol(Issue), pages.\n2. Author C., Author D. (2023). Another Paper Title. Conference Name, Location."} />
                </Form.Item>
                <Form.Item name="researchProjects" label="Research Projects">
                  <TextArea rows={6} placeholder="List current and past research projects..." />
                </Form.Item>
                <Form.Item name="googleScholarUrl" label="Google Scholar URL">
                  <Input placeholder="https://scholar.google.com/..." />
                </Form.Item>
                <Form.Item name="researchGateUrl" label="ResearchGate URL">
                  <Input placeholder="https://www.researchgate.net/..." />
                </Form.Item>
                <Form.Item name="orcidId" label="ORCID ID">
                  <Input placeholder="0000-0000-0000-0000" />
                </Form.Item>
              </div>
            </TabPane>

            <TabPane tab="Documents" key="4">
              <div className="max-w-4xl space-y-4">
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
                <Form.Item name="linkedinUrl" label="LinkedIn Profile">
                  <Input placeholder="https://www.linkedin.com/in/..." />
                </Form.Item>
                <Form.Item name="websiteUrl" label="Personal Website">
                  <Input placeholder="https://..." />
                </Form.Item>
              </div>
            </TabPane>
          </Tabs>
        </Form>

      {/* Live Preview Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 text-blue-900">Live Preview</h2>
        <div className="flex flex-wrap gap-8">
          <div className="bg-white rounded-2xl shadow p-8 w-full md:w-1/4 flex flex-col items-center border border-gray-100">
            <div
              style={{
                width: 160,
                height: 160,
                borderRadius: "50%",
                background: "#f3f4f6",
                overflow: "hidden",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px 0 rgba(60,60,60,0.07)"
              }}
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Staff" style={{ width: 160, height: 160, objectFit: "cover" }} />
              ) : (
                <UserOutlined style={{ fontSize: 64, color: "#bbb" }} />
              )}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#2b4362', textTransform: 'uppercase', marginBottom: 4 }}>
              {form.getFieldValue('title') || 'TITLE'}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
              {form.getFieldValue('firstName') || ''} {form.getFieldValue('lastName') || ''}
            </div>
            <div style={{ fontSize: 16, color: '#3b5b8c', marginBottom: 4 }}>
              {form.getFieldValue('academicRank') || ''}
            </div>
            <div style={{ fontSize: 15, color: '#555', marginBottom: 4 }}>
              {form.getFieldValue('bio') || ''}
            </div>
            <div style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
              {form.getFieldValue('department') ? DEPARTMENTS.find(d => d.code === form.getFieldValue('department'))?.name : ''}
            </div>
            <div style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
              {form.getFieldValue('expertise') && form.getFieldValue('expertise').length > 0 && (
                <span>
                  <b>Expertise:</b> {form.getFieldValue('expertise').join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StaffFormPage
