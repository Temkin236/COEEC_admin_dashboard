"use client"

import { useEffect, useState } from "react"
import { Card, Button, Tabs, Form, Input, Select, message, Space, Upload, List, Avatar, Modal, Descriptions } from "antd"
import { SaveOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchContent, updateContent, createContent } from "@/store/slices/contentSlice"

import AboutHistorySection from "@/components/AboutHistorySection";
import MissionVisionSection from "@/components/MissionVisionSection";
import DeanMessageSection from "@/components/DeanMessageSection";
import { AimOutlined, EyeOutlined, BulbOutlined, HeartOutlined, ThunderboltOutlined, CodeOutlined, LaptopOutlined, RocketOutlined } from "@ant-design/icons";
import { LANGUAGE_LABELS } from "@/utils/constants"

const { TextArea } = Input
const { TabPane } = Tabs as any

const AboutAdminPage = () => {
  const dispatch = useAppDispatch();
  const { about } = useAppSelector((state) => state.content);
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [form] = Form.useForm();
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [fileList, setFileList] = useState<any[]>([]);
  // Fix: Add activeHistoryIndex for timeline circle border
  const [activeHistoryIndex, setActiveHistoryIndex] = useState(-1);
  // Extract preview data for AboutHistorySection
  const aboutData = about.items[0] || {};
  const historySectionTitle = form.getFieldValue('historySectionTitle') || aboutData.historySectionTitle || "Three Decades of Growth";
  const historySectionDescription = form.getFieldValue('historySectionDescription') || aboutData.historySectionDescription || "From a small department to a leading college, our history is defined by resilience, expansion, and a relentless pursuit of academic quality.";
  const historySectionImage = form.getFieldValue('historySectionImage') || aboutData.historySectionImage || "https://picsum.photos/400/300?random=35";
  const timeline = historyItems.length > 0 ? historyItems : (Array.isArray(aboutData.historyItems) ? aboutData.historyItems : []);

  const getBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (err) => reject(err)
    })

  useEffect(() => {
    dispatch(fetchContent({ type: "about", language: currentLanguage }) as any)
  }, [dispatch, currentLanguage])

  useEffect(() => {
    if (about.items.length > 0) {
      const data = about.items[0]
      form.setFieldsValue({
        history: data.history,
        mission: data.mission,
        vision: data.vision,
        deanName: data.deanName,
        deanMessage: data.deanMessage,
        deanImage: data.deanImage,
        values: data.values,
        goals: data.goals
      })
      setHistoryItems(data.historyItems || [])
    }
  }, [about.items, form])



  const addHistoryItem = () => {
    setHistoryItems([...historyItems, { year: "", title: "", description: "" }])
  }

  const updateHistoryItem = async (index: number, field: string, value: any) => {
    const updated = [...historyItems]
    updated[index] = { ...updated[index], [field]: value }
    setHistoryItems(updated)
  }

  const removeHistoryItem = (index: number) => {
    setHistoryItems(historyItems.filter((_, i) => i !== index))
  }

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [lastSavedData, setLastSavedData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("1");
  const handleSubmit = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const values = form.getFieldsValue();
      const data = {
        ...values,
        language: currentLanguage,
        historyItems: historyItems
      };
      if (about.items.length > 0) {
        await dispatch(updateContent({ type: "about", id: about.items[0].id, data }) as any).unwrap();
      } else {
        await dispatch(createContent({ type: "about", data }) as any).unwrap();
      }
      setLastSavedData(data);
      setShowSummary(true);
      setSaveSuccess(true);
      message.success("About page updated successfully");
    } catch (error) {
      message.error("Failed to update about page");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <Card
          title="About the College - Admin Editor"
          extra={
            <Space>
              <Select value={currentLanguage} onChange={setCurrentLanguage} style={{ width: 150 }}>
                {Object.entries(LANGUAGE_LABELS).map(([key, label]) => (
                  <Select.Option key={key} value={key}>
                    {label}
                  </Select.Option>
                ))}
              </Select>
              <Button
                type="primary"
                icon={saveSuccess ? <span style={{color:'#52c41a'}}>&#10003;</span> : <SaveOutlined />}
                onClick={handleSubmit}
                loading={saving}
                style={{ minWidth: 160, fontWeight: 600, fontSize: 16, background: saveSuccess ? '#f6ffed' : undefined, borderColor: saveSuccess ? '#b7eb8f' : undefined, color: saveSuccess ? '#389e0d' : undefined }}
              >
                {saveSuccess ? 'Saved!' : 'Save Changes'}
              </Button>
            </Space>
          }
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Tabs defaultActiveKey="1" activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="History Section (Photo)" key="1">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Left: Section Info */}
                  <div className="md:w-1/2">
                    <Form.Item name="historySectionLabel" label="Section Label (e.g. Our Journey)" rules={[{ required: true, message: "Please enter section label" }]}> 
                      <Input placeholder="Enter section label..." />
                    </Form.Item>
                    <Form.Item name="historySectionTitle" label="Section Title" rules={[{ required: true, message: "Please enter section title" }]}> 
                      <Input placeholder="Enter section title..." />
                    </Form.Item>
                    <Form.Item name="historySectionDescription" label="Section Description" rules={[{ required: true, message: "Please enter section description" }]}> 
                      <TextArea rows={3} placeholder="Enter section description..." />
                    </Form.Item>
                    <Form.Item name="historySectionImage" label="Section Image" valuePropName="historySectionImage">
                      <Upload
                        listType="picture-card"
                        fileList={form.getFieldValue('historySectionImage') ? [{ uid: 'section', name: 'section-image', url: form.getFieldValue('historySectionImage') }] : []}
                        onChange={({ fileList }) => {
                          if (fileList.length > 0 && fileList[0].originFileObj) {
                            getBase64(fileList[0].originFileObj).then(base64 => {
                              form.setFieldsValue({ historySectionImage: base64 })
                            })
                          } else if (fileList.length === 0) {
                            form.setFieldsValue({ historySectionImage: '' })
                          }
                        }}
                        beforeUpload={() => false}
                        maxCount={1}
                        accept="image/*"
                      >
                        {form.getFieldValue('historySectionImage') ? null : (
                          <div>
                            <PlusOutlined />
                            <div style={{ marginTop: 8 }}>Upload Image</div>
                          </div>
                        )}
                      </Upload>
                    </Form.Item>
                  </div>
                  {/* Right: Timeline Editor */}
                  <div className="md:w-1/2">
                    <div className="mb-4">
                      <Button type="dashed" onClick={addHistoryItem} icon={<PlusOutlined />}>
                        Add Timeline Item
                      </Button>
                    </div>
                    <div className="relative">
                      {/* Vertical center line */}
                      <div className="absolute left-7 top-0 bottom-0 w-1 bg-blue-200 rounded-full" style={{ zIndex: 0 }} />
                      <ol className="relative z-10">
                        {historyItems.map((item, index) => (
                          <li key={index} className="mb-12 flex items-start relative group">
                            {/* Year in circle - visually matches public site */}
                            <span
                              className={`flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-md absolute -left-10 top-0 transition-all duration-200 ${activeHistoryIndex === index ? 'border-[6px] border-orange-500' : 'border-[2.5px] border-gray-300'}`}
                              style={{ zIndex: 10 }}
                            >
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]{4}"
                                maxLength={4}
                                className="text-center font-bold text-gray-700 bg-transparent border-none outline-none focus:ring-0 w-full h-full text-xl tracking-wide"
                                style={{
                                  width: 72,
                                  height: 72,
                                  background: 'transparent',
                                  boxShadow: 'none',
                                  letterSpacing: '1px',
                                  fontFamily: 'inherit',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: 0,
                                }}
                                placeholder="YYYY"
                                value={item.year}
                                onFocus={() => setActiveHistoryIndex(index)}
                                onBlur={() => setActiveHistoryIndex(-1)}
                                onChange={e => updateHistoryItem(index, 'year', e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                              />
                            </span>
                            {/* Timeline details to the right */}
                            <div className="ml-24 flex-1 bg-white rounded-xl shadow p-4 border border-blue-100">
                              <div className="flex items-center gap-2 mb-2">
                                <Input
                                  className="font-bold text-lg text-blue-900"
                                  placeholder="Title (e.g., Foundation)"
                                  value={item.title}
                                  onChange={e => updateHistoryItem(index, 'title', e.target.value)}
                                />
                                <Button
                                  type="text"
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={() => removeHistoryItem(index)}
                                  title="Remove timeline item"
                                />
                              </div>
                              <TextArea
                                className="text-base"
                                placeholder="Description"
                                value={item.description}
                                onChange={e => updateHistoryItem(index, 'description', e.target.value)}
                                rows={2}
                              />
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
                <div className="text-gray-500 text-xs mt-2">All fields above together create the history section/photo and timeline as shown on the public site.</div>
              </TabPane>
              
              <TabPane tab="Mission & Vision" key="2">
                <Form.Item name="missionTitle" label="Mission Title" rules={[{ required: true, message: "Please enter mission title" }]}> 
                  <Input placeholder="Enter mission title..." />
                </Form.Item>
                <Form.Item name="missionIcon" label="Mission Icon" rules={[{ required: true, message: "Please select a mission icon" }]}> 
                  <Select placeholder="Select icon">
                    <Select.Option value="AimOutlined"><AimOutlined /> Target</Select.Option>
                    <Select.Option value="BulbOutlined"><BulbOutlined /> Bulb</Select.Option>
                    <Select.Option value="HeartOutlined"><HeartOutlined /> Heart</Select.Option>
                    <Select.Option value="ThunderboltOutlined"><ThunderboltOutlined /> Thunderbolt</Select.Option>
                    <Select.Option value="CodeOutlined"><CodeOutlined /> Code</Select.Option>
                    <Select.Option value="LaptopOutlined"><LaptopOutlined /> Laptop</Select.Option>
                    <Select.Option value="RocketOutlined"><RocketOutlined /> Rocket</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item name="mission" label="Mission Statement" rules={[{ required: true, message: "Please enter mission statement" }]}> 
                  <TextArea rows={5} placeholder="Enter mission statement..." />
                </Form.Item>
                <Form.Item name="visionTitle" label="Vision Title" rules={[{ required: true, message: "Please enter vision title" }]}> 
                  <Input placeholder="Enter vision title..." />
                </Form.Item>
                <Form.Item name="visionIcon" label="Vision Icon" rules={[{ required: true, message: "Please select a vision icon" }]}> 
                  <Select placeholder="Select icon">
                    <Select.Option value="EyeOutlined"><EyeOutlined /> Eye</Select.Option>
                    <Select.Option value="BulbOutlined"><BulbOutlined /> Bulb</Select.Option>
                    <Select.Option value="HeartOutlined"><HeartOutlined /> Heart</Select.Option>
                    <Select.Option value="ThunderboltOutlined"><ThunderboltOutlined /> Thunderbolt</Select.Option>
                    <Select.Option value="CodeOutlined"><CodeOutlined /> Code</Select.Option>
                    <Select.Option value="LaptopOutlined"><LaptopOutlined /> Laptop</Select.Option>
                    <Select.Option value="RocketOutlined"><RocketOutlined /> Rocket</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item name="vision" label="Vision Statement" rules={[{ required: true, message: "Please enter vision statement" }]}> 
                  <TextArea rows={5} placeholder="Enter vision statement..." />
                </Form.Item>
              </TabPane>
              
              <TabPane tab="Dean's Message" key="3">
                <Form.Item name="deanLeadershipLabel" label="Leadership Label" rules={[{ required: true, message: "Please enter leadership label" }]}> 
                  <Input placeholder="Enter label (e.g., LEADERSHIP)" />
                </Form.Item>
                <Form.Item name="deanSectionTitle" label="Section Title" rules={[{ required: true, message: "Please enter section title" }]}> 
                  <Input placeholder="Enter section title (e.g., Building the Future of Engineering)" />
                </Form.Item>
                <Form.Item name="deanQuote" label="Dean's Quote" rules={[{ required: true, message: "Please enter dean's quote" }]}> 
                  <TextArea rows={3} placeholder="Enter quote..." />
                </Form.Item>
                <Form.Item name="deanDetail" label="Dean's Detail" rules={[{ required: true, message: "Please enter dean's detail" }]}> 
                  <TextArea rows={5} placeholder="Enter detail text..." />
                </Form.Item>
                <Form.Item name="deanName" label="Dean's Name" rules={[{ required: true, message: "Please enter dean's name" }]}> 
                  <Input placeholder="Enter dean's name" />
                </Form.Item>
                <Form.Item name="deanTitle" label="Dean's Title" rules={[{ required: true, message: "Please enter dean's title" }]}> 
                  <Input placeholder="Enter dean's title (e.g., DEAN, COEEC)" />
                </Form.Item>
                <Form.Item name="deanImage" label="Dean's Photo">
                  <Upload
                    listType="picture-card"
                    fileList={form.getFieldValue('deanImage') ? [{ uid: 'dean', name: 'dean-image', url: form.getFieldValue('deanImage') }] : []}
                    onChange={({ fileList }) => {
                      if (fileList.length > 0 && fileList[0].originFileObj) {
                        getBase64(fileList[0].originFileObj).then(base64 => {
                          form.setFieldsValue({ deanImage: base64 })
                        })
                      } else if (fileList.length === 0) {
                        form.setFieldsValue({ deanImage: '' })
                      }
                    }}
                    beforeUpload={() => false}
                    maxCount={1}
                    accept="image/*"
                  >
                    {form.getFieldValue('deanImage') ? null : (
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Upload Photo</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
                <Form.Item name="deanSignature" label="Dean's Signature">
                  <Upload
                    listType="picture-card"
                    fileList={form.getFieldValue('deanSignature') ? [{ uid: 'signature', name: 'signature-image', url: form.getFieldValue('deanSignature') }] : []}
                    onChange={({ fileList }) => {
                      if (fileList.length > 0 && fileList[0].originFileObj) {
                        getBase64(fileList[0].originFileObj).then(base64 => {
                          form.setFieldsValue({ deanSignature: base64 })
                        })
                      } else if (fileList.length === 0) {
                        form.setFieldsValue({ deanSignature: '' })
                      }
                    }}
                    beforeUpload={() => false}
                    maxCount={1}
                    accept="image/*"
                  >
                    {form.getFieldValue('deanSignature') ? null : (
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Upload Signature</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </TabPane>
              
              <TabPane tab="Values & Goals" key="4">
                <Form.Item name="values" label="Core Values">
                  <TextArea rows={6} placeholder="Enter core values (one per line)..." />
                </Form.Item>
                <Form.Item name="goals" label="Strategic Goals">
                  <TextArea rows={6} placeholder="Enter strategic goals..." />
                </Form.Item>
              </TabPane>
            </Tabs>
          </Form>
        </Card>
      </div>
      {/* Live Preview Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 text-blue-900">Live Preview</h2>
        {activeTab === "1" && (
          <AboutHistorySection
            sectionLabel={form.getFieldValue('historySectionLabel') || about.items[0]?.historySectionLabel || 'Our Journey'}
            sectionTitle={form.getFieldValue('historySectionTitle') || about.items[0]?.historySectionTitle || 'Three Decades of Growth'}
            sectionDescription={form.getFieldValue('historySectionDescription') || about.items[0]?.historySectionDescription || 'From a small department to a leading college, our history is defined by resilience, expansion, and a relentless pursuit of academic quality.'}
            sectionImage={form.getFieldValue('historySectionImage') || about.items[0]?.historySectionImage || 'https://picsum.photos/400/300?random=35'}
            timeline={historyItems.length > 0 ? historyItems : about.items[0]?.historyItems || []}
          />
        )}
        {activeTab === "2" && (
          <MissionVisionSection
            mission={form.getFieldValue('mission') || about.items[0]?.mission || ''}
            vision={form.getFieldValue('vision') || about.items[0]?.vision || ''}
            missionIcon={form.getFieldValue('missionIcon') || about.items[0]?.missionIcon || 'AimOutlined'}
            visionIcon={form.getFieldValue('visionIcon') || about.items[0]?.visionIcon || 'EyeOutlined'}
            missionTitle={form.getFieldValue('missionTitle') || about.items[0]?.missionTitle || 'Our Mission'}
            visionTitle={form.getFieldValue('visionTitle') || about.items[0]?.visionTitle || 'Our Vision'}
          />
        )}
        {activeTab === "3" && (
          <DeanMessageSection
            leadershipLabel={form.getFieldValue('deanLeadershipLabel') || about.items[0]?.deanLeadershipLabel || 'LEADERSHIP'}
            sectionTitle={form.getFieldValue('deanSectionTitle') || about.items[0]?.deanSectionTitle || 'Building the Future of Engineering'}
            quote={form.getFieldValue('deanQuote') || about.items[0]?.deanQuote || 'We are not just teaching engineering; we are cultivating the mindset of innovation that will drive Ethiopia\'s digital transformation. Our students are the architects of tomorrow.'}
            detail={form.getFieldValue('deanDetail') || about.items[0]?.deanDetail || 'Welcome to the College of Electrical Engineering and Computing (COEEC). For over three decades, we have been at the forefront of technological advancement in the region. Our curriculum balances rigorous theoretical foundations with hands-on practical experience, ensuring our graduates are industry-ready from day one.\nI invite you to explore our vibrant community, where cutting-edge research meets social impact.'}
            deanName={form.getFieldValue('deanName') || about.items[0]?.deanName || ''}
            deanTitle={form.getFieldValue('deanTitle') || about.items[0]?.deanTitle || ''}
            deanMessage={form.getFieldValue('deanMessage') || about.items[0]?.deanMessage || ''}
            deanImage={form.getFieldValue('deanImage') || about.items[0]?.deanImage || ''}
            signature={form.getFieldValue('deanSignature') || about.items[0]?.deanSignature || ''}
          />
        )}
        {/* Add similar preview for other tabs if needed */}
      </div>
      <Modal
        open={showSummary}
        onCancel={() => setShowSummary(false)}
        onOk={() => setShowSummary(false)}
        title="Summary of Changes"
        okText="Close"
      >
        {lastSavedData && (
          <Descriptions column={1} bordered size="small">
            {Object.entries(lastSavedData).map(([key, value]) => (
              <Descriptions.Item key={key} label={key}>
                {Array.isArray(value)
                  ? value.length === 0
                    ? <span style={{ color: '#aaa' }}>(empty)</span>
                    : <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{JSON.stringify(value, null, 2)}</pre>
                  : typeof value === 'string' && value.startsWith('data:image')
                    ? <img src={value} alt={key} style={{ maxWidth: 120, borderRadius: 8 }} />
                    : String(value)}
              </Descriptions.Item>
            ))}
          </Descriptions>
        )}
      </Modal>
    </>
  );
}

export default AboutAdminPage;