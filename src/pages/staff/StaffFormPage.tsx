"use client"

import React from "react";
import { useEffect, useState, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Card, Form, Input, Select, Button, Upload, message, Tabs, Typography, Divider, Avatar } from "antd"
import { SaveOutlined, UploadOutlined, UserOutlined, ArrowLeftOutlined, IdcardOutlined, BankOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchStaffById, createStaff, updateStaff, uploadCV } from "@/store/slices/staffSlice"
const DEPARTMENTS = [
  { code: "software", name: "Software Engineering" },
  { code: "cs", name: "Computer Science Engineering" },
  { code: "ece", name: "Electronics and Communication Engineering" },
  { code: "ep", name: "Electrical Power Department" }
];

const { TextArea } = Input
const { Title } = Typography

  const StaffFormPage: React.FC = () => {
    const photoInputRef = useRef<HTMLInputElement>(null);
    const { id } = useParams()
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { currentStaff, loading } = useAppSelector((state) => state.staff)
    const [form] = Form.useForm()
    const [cvFile, setCvFile] = useState<any>(null)
    const [photoPreview, setPhotoPreview] = useState<string | null>(null)
    const [previewValues, setPreviewValues] = useState<any>({})
    const [activeTab, setActiveTab] = useState<string>("1");
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
      setPreviewValues(currentStaff as any)
    }
  }, [currentStaff, form, isEdit])

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        researchAreas: values.researchAreas || [],
        publications: values.publications || [],
        photo: photoPreview || values.photo || ""
      }
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

      // Fallback: If backend fails, show photo in UI for demo/testing
      if (!savedStaff.photo && photoPreview) {
        savedStaff.photo = photoPreview
      }

      navigate("/staff")
    } catch (error) {
      // Fallback: Show photo in UI for demo/testing
      if (photoPreview) {
        setPreviewValues((prev: any) => ({ ...prev, photo: photoPreview }))
      }
      message.error("Operation failed")
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
          <Tabs
            defaultActiveKey="1"
            type="card"
            onChange={setActiveTab}
            items={[
              {
                key: "1",
                label: "Basic Info",
                children: (
                  <>
                    <Form.Item name="title" label="Title" rules={[{ required: true, message: "Please enter a title" }]}> 
                      <Input placeholder="e.g., Dr., Prof., Mr., Ms." />
                    </Form.Item>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Form.Item name="firstName" label="First Name" rules={[{ required: true, message: "Enter first name" }]}>
                        <Input placeholder="First name" />
                      </Form.Item>
                      <Form.Item name="lastName" label="Last Name">
                        <Input placeholder="Last name" />
                      </Form.Item>
                    </div>
                    <Form.Item
                      name="googleScholar"
                      label="Google Scholar URL"
                      rules={[{ validator: validateOptionalUrl }]}
                    >
                      <Input placeholder="example or example.com or https://scholar.google.com/..." />
                    </Form.Item>
                    <Form.Item name="academicRank" label="Academic Rank">
                      <Select
                        mode="tags"
                        placeholder="Add or select academic ranks (e.g., Assistant Professor, Lecturer)"
                        tokenSeparators={[","]}
                        allowClear
                      >
                        <Select.Option value="Professor">Professor</Select.Option>
                        <Select.Option value="Associate Professor">Associate Professor</Select.Option>
                        <Select.Option value="Assistant Professor">Assistant Professor</Select.Option>
                        <Select.Option value="Lecturer">Lecturer</Select.Option>
                        <Select.Option value="Instructor">Instructor</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item name="department" label="Department">
                      <Select placeholder="Select department" allowClear>
                        {DEPARTMENTS.map(d => (
                          <Select.Option key={d.code} value={d.code}>{d.name}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item name="expertise" label="Expertise">
                      <Select mode="tags" placeholder="Add expertise (e.g., Machine Learning)" tokenSeparators={[',']} />
                    </Form.Item>
                    <Form.Item
                      name="researchGate"
                      label="ResearchGate URL"
                      rules={[{ validator: validateOptionalUrl }]}
                    >
                      <Input placeholder="example or example.com or https://www.researchgate.net/..." />
                    </Form.Item>
                    <Form.Item
                      name="orcid"
                      label="ORCID ID"
                      rules={[{ pattern: /^\d{4}-\d{4}-\d{4}-\d{4}$/, message: "Please enter a valid ORCID ID (0000-0000-0000-0000)" }]}
                    >
                      <Input placeholder="0000-0000-0000-0000" />
                    </Form.Item>
                    <Form.Item name="photo" label="Photo">
                      <Upload
                        accept="image/*"
                        showUploadList={false}
                        // prevent automatic upload; handle file reading in onChange
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
                    <Form.Item name="bio" label="Biography">
                      <TextArea rows={4} placeholder="Brief professional biography, e.g. Dean of COEEC, Computer Science & Engineering" />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: "2",
                label: "Academic Background",
                children: (
                  <>
                    <Form.Item name="education" label="Education" tooltip="List degrees in reverse chronological order">
                      <Select
                        mode="tags"
                        placeholder="Add or select degrees (e.g., PhD in Computer Science - Stanford University (2015))"
                        tokenSeparators={[","]}
                        allowClear
                      >
                        <Select.Option value="PhD in Computer Science - Stanford University (2015)">PhD in Computer Science - Stanford University (2015)</Select.Option>
                        <Select.Option value="MSc in Software Engineering - MIT (2010)">MSc in Software Engineering - MIT (2010)</Select.Option>
                        <Select.Option value="BSc in Computer Science - ASTU (2008)">BSc in Computer Science - ASTU (2008)</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item name="researchAreas" label="Research Areas">
                      <Select mode="tags" placeholder="Add research areas" tokenSeparators={[","]} />
                    </Form.Item>
                    <Form.Item name="specialization" label="Specialization">
                      <Select
                        mode="tags"
                        placeholder="Add or select specializations (e.g., Machine Learning, Artificial Intelligence)"
                        tokenSeparators={[","]}
                        allowClear
                      >
                        <Select.Option value="Machine Learning">Machine Learning</Select.Option>
                        <Select.Option value="Artificial Intelligence">Artificial Intelligence</Select.Option>
                        <Select.Option value="Data Science">Data Science</Select.Option>
                        <Select.Option value="Software Engineering">Software Engineering</Select.Option>
                        <Select.Option value="Networks">Networks</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item name="teachingAreas" label="Teaching Areas">
                      <Select mode="tags" placeholder="Add teaching areas" tokenSeparators={[","]} />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: "3",
                label: "Publications & Research",
                children: (
                  <>
                    <Form.Item name="publications" label="Publications" tooltip="List publications in citation format">
                      <Select
                        mode="tags"
                        placeholder="Add or select publications (e.g., Author A., Author B. (2024). Paper Title. Journal Name, Vol(Issue), pages.)"
                        tokenSeparators={[","]}
                        allowClear
                      >
                        <Select.Option value="Author A., Author B. (2024). Paper Title. Journal Name, Vol(Issue), pages.">Author A., Author B. (2024). Paper Title. Journal Name, Vol(Issue), pages.</Select.Option>
                        <Select.Option value="Author C., Author D. (2023). Another Paper Title. Conference Name, Location.">Author C., Author D. (2023). Another Paper Title. Conference Name, Location.</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item name="researchProjects" label="Research Projects">
                      <TextArea rows={6} placeholder="List current and past research projects..." />
                    </Form.Item>
                    <Form.Item name="googleScholarUrl" label="Google Scholar URL" rules={[{ validator: validateOptionalUrl }]}>
                      <Input placeholder="example or example.com or https://scholar.google.com/..." />
                    </Form.Item>
                    <Form.Item name="researchGateUrl" label="ResearchGate URL" rules={[{ validator: validateOptionalUrl }]}>
                      <Input placeholder="example or example.com or https://www.researchgate.net/..." />
                    </Form.Item>
                    <Form.Item name="orcidId" label="ORCID ID">
                      <Input placeholder="0000-0000-0000-0000" />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: "4",
                label: "Documents",
                children: (
                  <>
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
                    <Form.Item name="linkedinUrl" label="LinkedIn Profile" rules={[{ validator: validateOptionalUrl }]}>
                      <Input placeholder="example or linkedin.com/in/username or https://www.linkedin.com/in/..." />
                    </Form.Item>
                    <Form.Item name="websiteUrl" label="Personal Website" rules={[{ validator: validateOptionalUrl }]}>
                      <Input placeholder="example.com or https://..." />
                    </Form.Item>
                  </>
                ),
              },
            ]}
          />
        {/* Live Preview Section - visually separated and always visible */}
          <div className="mt-6">
          <h2 className="text-2xl font-bold mb-4 text-blue-900">Live Preview</h2>
          <div className="flex flex-wrap gap-8">
            <div className="bg-white rounded-2xl shadow p-0 w-full md:w-1/3 border border-gray-100 overflow-hidden">
              {activeTab === "1" && (
                <>
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
                    <div className="text-xs font-semibold text-primary-600 uppercase mb-2">{Array.isArray(previewValues.academicRank) ? previewValues.academicRank[0] : (previewValues.academicRank || 'PROFESSOR')}</div>
                    <div className="text-2xl font-extrabold text-gray-900 mb-1">{previewValues.title ? `${previewValues.title} ` : ''}{previewValues.firstName || 'Full Name'} {previewValues.lastName || ''}</div>
                    <div className="text-sm text-gray-500 mb-4">{previewValues.education && previewValues.education.length > 0 ? (Array.isArray(previewValues.education) ? previewValues.education[0] : previewValues.education) : 'PhD in Computer Engineering'}</div>

                    <div className="flex flex-col gap-3 text-gray-600 mb-4">
                      <div className="flex items-center gap-3"><IdcardOutlined className="text-gray-400" /> <span>{previewValues.bio || 'Position/Role'}</span></div>
                      <div className="flex items-center gap-3"><BankOutlined className="text-gray-400" /> <span>{previewValues.department ? DEPARTMENTS.find(d => d.code === previewValues.department)?.name : 'Department'}</span></div>
                    </div>

                    <Divider className="my-2" />

                    <div className="text-xs font-semibold text-gray-500 mt-3 mb-2">EXPERTISE</div>
                    <div className="flex flex-wrap gap-2">
                      {previewValues.expertise && Array.isArray(previewValues.expertise) && previewValues.expertise.length > 0 ? (
                        previewValues.expertise.map((exp: string, idx: number) => (
                          <span key={idx} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">{exp}</span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-400">No expertise listed</span>
                      )}
                    </div>
                  </div>
                </>
              )}
              {activeTab === "2" && (
                <>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#2b4362', marginBottom: 4 }}>Academic Background</div>
                  <div style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
                    {previewValues.education && previewValues.education.length > 0 && (
                      <span><b>Education:</b> {Array.isArray(previewValues.education) ? previewValues.education.join(', ') : previewValues.education}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
                    {previewValues.researchAreas && previewValues.researchAreas.length > 0 && (
                      <span><b>Research Areas:</b> {Array.isArray(previewValues.researchAreas) ? previewValues.researchAreas.join(', ') : previewValues.researchAreas}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
                    {previewValues.specialization && previewValues.specialization.length > 0 && (
                      <span><b>Specialization:</b> {Array.isArray(previewValues.specialization) ? previewValues.specialization.join(', ') : previewValues.specialization}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
                    {previewValues.teachingAreas && previewValues.teachingAreas.length > 0 && (
                      <span><b>Teaching Areas:</b> {Array.isArray(previewValues.teachingAreas) ? previewValues.teachingAreas.join(', ') : previewValues.teachingAreas}</span>
                    )}
                  </div>
                </>
              )}
              {activeTab === "3" && (
                <>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#2b4362', marginBottom: 4 }}>Publications & Research</div>
                  <div style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
                    {previewValues.publications && previewValues.publications.length > 0 && (
                      <span><b>Publications:</b> {Array.isArray(previewValues.publications) ? previewValues.publications.join(', ') : previewValues.publications}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
                    {previewValues.researchProjects && (
                      <span><b>Research Projects:</b> {previewValues.researchProjects}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
                    {previewValues.googleScholarUrl && (
                      <span><b>Google Scholar:</b> {previewValues.googleScholarUrl}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
                    {previewValues.researchGateUrl && (
                      <span><b>ResearchGate:</b> {previewValues.researchGateUrl}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
                    {previewValues.orcidId && (
                      <span><b>ORCID:</b> {previewValues.orcidId}</span>
                    )}
                  </div>
                </>
              )}
              {activeTab === "4" && (
                <>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#2b4362', marginBottom: 4 }}>Documents</div>
                  <div style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
                    {currentStaff && (currentStaff as any).cvUrl && (
                      <span><b>CV:</b> <a href={(currentStaff as any).cvUrl} target="_blank" rel="noopener noreferrer">View Current CV</a></span>
                    )}
                  </div>
                  <div style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
                    {previewValues.linkedinUrl && (
                      <span><b>LinkedIn:</b> {previewValues.linkedinUrl}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
                    {previewValues.websiteUrl && (
                      <span><b>Website:</b> {previewValues.websiteUrl}</span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div> {/* End Live Preview Section */}
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

