"use client"

import React from "react";
import { useEffect, useState, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Card, Form, Input, Select, Button, Upload, message, Tabs, Typography, Divider, Avatar } from "antd"
import { SaveOutlined, UploadOutlined, UserOutlined, ArrowLeftOutlined } from "@ant-design/icons"
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

  return (
    <div>
      <Card variant="outlined" className="max-w-5xl mx-auto mt-8 shadow-lg">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
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
                    <Form.Item
                      name="googleScholar"
                      label="Google Scholar URL"
                      rules={[{ type: "url", message: "Please enter a valid URL" }]}
                    >
                      <Input placeholder="https://scholar.google.com/..." />
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
                    <Form.Item
                      name="researchGate"
                      label="ResearchGate URL"
                      rules={[{ type: "url", message: "Please enter a valid URL" }]}
                    >
                      <Input placeholder="https://www.researchgate.net/..." />
                    </Form.Item>
                    <Form.Item
                      name="orcid"
                      label="ORCID ID"
                      rules={[{ pattern: /^\d{4}-\d{4}-\d{4}-\d{4}$/, message: "Please enter a valid ORCID ID (0000-0000-0000-0000)" }]}
                    >
                      <Input placeholder="0000-0000-0000-0000" />
                    </Form.Item>
                    <Form.Item name="photo" label="Photo" valuePropName="fileList" getValueFromEvent={e => Array.isArray(e) ? e : e && e.fileList}>
                      <Upload
                        accept="image/*"
                        showUploadList={false}
                        beforeUpload={handlePhotoChange}
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
                    <Form.Item name="googleScholarUrl" label="Google Scholar URL">
                      <Input placeholder="https://scholar.google.com/..." />
                    </Form.Item>
                    <Form.Item name="researchGateUrl" label="ResearchGate URL">
                      <Input placeholder="https://www.researchgate.net/..." />
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
                    <Form.Item name="linkedinUrl" label="LinkedIn Profile">
                      <Input placeholder="https://www.linkedin.com/in/..." />
                    </Form.Item>
                    <Form.Item name="websiteUrl" label="Personal Website">
                      <Input placeholder="https://..." />
                    </Form.Item>
                  </>
                ),
              },
            ]}
          />
        {/* Live Preview Section - visually separated and always visible */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-blue-900">Live Preview</h2>
          <div className="flex flex-wrap gap-8">
            <div className="bg-white rounded-2xl shadow p-8 w-full md:w-1/3 flex flex-col items-center border border-gray-100">
              {activeTab === "1" && (
                <>
                  {/* Photo */}
                  <div
                    style={{
                      width: 220,
                      height: 180,
                      borderRadius: 18,
                      background: "#f3f4f6",
                      overflow: "hidden",
                      marginBottom: 18,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 8px 0 rgba(60,60,60,0.07)"
                    }}
                  >
                    {photoPreview ? (
                      <img src={photoPreview} alt="Staff" style={{ width: 220, height: 180, objectFit: "cover" }} />
                    ) : (
                      <UserOutlined style={{ fontSize: 80, color: "#bbb" }} />
                    )}
                  </div>
                  {/* Academic Rank */}
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', marginBottom: 4, letterSpacing: 1 }}>
                    {Array.isArray(previewValues.academicRank) ? previewValues.academicRank[0] : (previewValues.academicRank || 'PROFESSIONAL TITLE')}
                  </div>
                  {/* Name */}
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 2 }}>
                    {previewValues.title ? `${previewValues.title} ` : ''}
                    {previewValues.firstName || 'Full Name'} {previewValues.lastName || ''}
                  </div>
                  {/* Highest Degree */}
                  <div style={{ fontSize: 17, color: '#888', marginBottom: 10 }}>
                    {previewValues.education && previewValues.education.length > 0
                      ? (Array.isArray(previewValues.education) ? previewValues.education[0] : previewValues.education)
                      : 'Highest Degree'}
                  </div>
                  {/* Position/Role */}
                  <div style={{ fontSize: 15, color: '#64748b', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: 17, marginRight: 4 }}><i className="anticon anticon-idcard" /></span>
                      {previewValues.bio || 'Position/Role'}
                    </span>
                  </div>
                  {/* Department */}
                  <div style={{ fontSize: 15, color: '#64748b', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: 17, marginRight: 4 }}><i className="anticon anticon-bank" /></span>
                      {previewValues.department ? DEPARTMENTS.find(d => d.code === previewValues.department)?.name : 'Department'}
                    </span>
                  </div>
                  {/* Expertise */}
                  <div style={{ fontSize: 13, color: '#888', marginTop: 10, marginBottom: 4, fontWeight: 600, letterSpacing: 1 }}>EXPERTISE</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 2 }}>
                    {previewValues.expertise && Array.isArray(previewValues.expertise) && previewValues.expertise.length > 0 ? (
                      <>
                        {previewValues.expertise.slice(0, 2).map((exp: string, idx: number) => (
                          <span key={idx} style={{ background: '#e0e7ff', color: '#2563eb', borderRadius: 8, padding: '3px 12px', fontSize: 13, fontWeight: 500 }}>{exp}</span>
                        ))}
                        {previewValues.expertise.length > 2 && (
                          <span style={{ color: '#2563eb', fontSize: 13, fontWeight: 500 }}>+ {previewValues.expertise.length - 2} more</span>
                        )}
                      </>
                    ) : (
                      <span style={{ color: '#bbb', fontSize: 13 }}>No expertise listed</span>
                    )}
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
        </Form>
      </Card>
    </div>
  );
}

export default StaffFormPage;

