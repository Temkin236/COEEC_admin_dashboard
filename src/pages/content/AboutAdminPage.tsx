
import React, { useEffect, useState } from "react";
import { Card, Button, Tabs, Form, Input, Select, message, Space, Upload, List, Avatar, Modal, Descriptions } from "antd";
import { SaveOutlined, PlusOutlined, DeleteOutlined, TrophyOutlined, TeamOutlined, CheckCircleOutlined, StarOutlined, SafetyCertificateOutlined, SmileOutlined, HeartOutlined, AimOutlined, EyeOutlined, BulbOutlined, ThunderboltOutlined, CodeOutlined, LaptopOutlined, RocketOutlined, LoadingOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchContent, updateContent, createContent, addAboutTimelineItem, updateAboutTimelineItem, deleteAboutTimelineItem } from "@/store/slices/contentSlice";
import AboutHistorySection from "@/components/AboutHistorySection";
import MissionVisionSection from "@/components/MissionVisionSection";
import DeanMessageSection from "@/components/DeanMessageSection";
import { LANGUAGE_LABELS } from "@/utils/constants";
import axiosInstance from "@/utils/axios";

const { TextArea } = Input;
const { TabPane } = Tabs as any;

const AboutAdminPage = () => {
  // Dummy state to force re-render for live preview
  const [previewKey, setPreviewKey] = useState(0);
  const dispatch = useAppDispatch();
  const { about } = useAppSelector((state) => state.content);
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [form] = Form.useForm();
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [fileList, setFileList] = useState<any[]>([]);
  // Fix: Add activeHistoryIndex for timeline circle border
  const [activeHistoryIndex, setActiveHistoryIndex] = useState(-1);
  const [coreValues, setCoreValues] = useState<any[]>([
    { icon: 'TrophyOutlined', title: 'Excellence', description: 'Striving for the highest standards in teaching and research.' },
    { icon: 'TeamOutlined', title: 'Inclusivity', description: 'Fostering a diverse and welcoming academic environment.' },
    { icon: 'CheckCircleOutlined', title: 'Integrity', description: 'Upholding honesty, ethics, and accountability in all actions.' }
  ]);

  // Image Upload Handling
  const [imageIds, setImageIds] = useState<Record<string, string>>({});
  const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({});

  const handleImageUpload = async (file: File, fieldName: string) => {
    setUploadingState(prev => ({ ...prev, [fieldName]: true }));
    try {
        const fieldNames = ["file", "files", "upload", "media", "document"];
        let uploadedData = null;
        
        for (const name of fieldNames) {
             try {
                const fd = new FormData();
                fd.append(name, file);
                fd.append("visibility", "PUBLIC");
                const res = await axiosInstance.post("/media/upload", fd, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                uploadedData = res.data;
                break;
             } catch (e) { continue; }
        }

        if (uploadedData) {
             const fileData = uploadedData.data || uploadedData;
             const id = fileData.id || (Array.isArray(fileData) ? fileData[0]?.id : null);
             const url = fileData.url || (Array.isArray(fileData) ? fileData[0]?.url : null) || URL.createObjectURL(file);
             
             if (id) {
                 setImageIds(prev => ({ ...prev, [fieldName]: id }));
                 form.setFieldsValue({ [fieldName]: url });
                 message.success("Image uploaded successfully");
             }
        } else {
             message.error("Upload failed: No data returned");
        }
    } catch (error) {
        console.error(error);
        message.error("Upload failed");
    } finally {
        setUploadingState(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  // Administration section state and handlers
  const [admins, setAdmins] = useState<any[]>([
    { image: '', name: '', title: '', subtitle: '' }
  ]);

  const addAdmin = () => {
    setAdmins([...admins, { image: '', name: '', title: '', subtitle: '' }]);
  };

  const removeAdmin = (idx: number) => {
    if (admins.length > 1) {
      setAdmins(admins.filter((_, i) => i !== idx));
    }
  };

  const handleAdminChange = (idx: number, field: string, value: any) => {
    const updated = [...admins];
    updated[idx] = { ...updated[idx], [field]: value };
    setAdmins(updated);
  };

  const handleAdminImage = async (idx: number, file: any) => {
    if (file && file.originFileObj) {
      const base64 = await getBase64(file.originFileObj);
      setAdmins(prevAdmins => {
        const updated = [...prevAdmins];
        updated[idx] = { ...updated[idx], image: base64 };
        return updated;
      });
      setPreviewKey(prev => prev + 1); // Force re-render
    }
    return false;
  };
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
        ...data, // Map all matching fields
        history: data.history,
        mission: data.mission,
        vision: data.vision,
        deanName: data.deanName,
        deanMessage: data.deanMessage,
        deanImage: data.deanImage,
        values: data.values,
        goals: data.goals
      })
      setHistoryItems(data.timeline || data.historyItems || [])
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
      // Robustly check for ID from loaded items
      const currentItem = about.items.length > 0 ? about.items[0] : null;
      const aboutId = currentItem?.id || currentItem?._id;

      // 1. Save Main Content
      const mainData: any = { 
          ...values, 
          language: currentLanguage,
          imageId: imageIds['historySectionImage'],
          deanImageId: imageIds['deanImage'],
          deanSignatureId: imageIds['deanSignature'],
      };
      
      // Clean up undefined IDs and remove timeline arrays
      if (!mainData.imageId) delete mainData.imageId;
      if (!mainData.deanImageId) delete mainData.deanImageId;
      if (!mainData.deanSignatureId) delete mainData.deanSignatureId;

      delete mainData.historyItems;
      delete mainData.timeline;

      let savedAbout;
      if (aboutId) {
        // Update existing (PUT)
        savedAbout = await dispatch(updateContent({ type: "about", id: aboutId, data: mainData }) as any).unwrap();
      } else {
        // Create new (POST)
        savedAbout = await dispatch(createContent({ type: "about", data: mainData }) as any).unwrap();
      }
      
      // Get the real ID
      const realAboutId = savedAbout.data?.id || aboutId;

      // 2. Handle Timeline Items
      if (realAboutId) {
        const originalItems = about.items[0]?.timeline || about.items[0]?.historyItems || [];
        const originalIds = new Set(originalItems.map((item: any) => item.id));
        const currentIds = new Set(historyItems.map((item: any) => item.id).filter(Boolean));

        // Delete removed items
        for (const item of originalItems) {
            if (item.id && !currentIds.has(item.id)) {
                await dispatch(deleteAboutTimelineItem({ aboutId: realAboutId, itemId: item.id }) as any);
            }
        }

        // Add or Update items
        for (const item of historyItems) {
            if (item.id && originalIds.has(item.id)) {
                // Update existing
                await dispatch(updateAboutTimelineItem({ aboutId: realAboutId, itemId: item.id, data: item }) as any);
            } else {
                // Add new
                const { id, ...itemData } = item; // remove temp/empty ID
                await dispatch(addAboutTimelineItem({ aboutId: realAboutId, data: itemData }) as any);
            }
        }
      }

      // Re-fetch to sync state with backend
      dispatch(fetchContent({ type: "about", language: currentLanguage }) as any);

      setLastSavedData(mainData);
      setShowSummary(true);
      setSaveSuccess(true);
      message.success("About page updated successfully");
    } catch (error) {
      console.error(error);
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
                            handleImageUpload(fileList[0].originFileObj, 'historySectionImage');
                          } else if (fileList.length === 0) {
                            form.setFieldsValue({ historySectionImage: '' });
                            setImageIds(prev => ({ ...prev, historySectionImage: '' }));
                          }
                        }}
                        beforeUpload={() => false}
                        maxCount={1}
                        accept="image/*"
                      >
                        {form.getFieldValue('historySectionImage') ? null : (
                          <div style={{ width: 220, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                            {uploadingState['historySectionImage'] ? <LoadingOutlined /> : <PlusOutlined />}
                            <div style={{ marginTop: 8, color: '#6b7280' }}>Upload Image</div>
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
                        handleImageUpload(fileList[0].originFileObj, 'deanImage');
                      } else if (fileList.length === 0) {
                        form.setFieldsValue({ deanImage: '' });
                        setImageIds(prev => ({ ...prev, deanImage: '' }));
                      }
                    }}
                    beforeUpload={() => false}
                    maxCount={1}
                    accept="image/*"
                  >
                    {form.getFieldValue('deanImage') ? null : (
                      <div style={{ width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                        {uploadingState['deanImage'] ? <LoadingOutlined /> : <PlusOutlined />}
                        <div style={{ marginTop: 8, color: '#6b7280' }}>Upload Photo</div>
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
                        handleImageUpload(fileList[0].originFileObj, 'deanSignature');
                      } else if (fileList.length === 0) {
                        form.setFieldsValue({ deanSignature: '' });
                        setImageIds(prev => ({ ...prev, deanSignature: '' }));
                      }
                    }}
                    beforeUpload={() => false}
                    maxCount={1}
                    accept="image/*"
                  >
                    {form.getFieldValue('deanSignature') ? null : (
                      <div style={{ width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                         {uploadingState['deanSignature'] ? <LoadingOutlined /> : <PlusOutlined />}
                        <div style={{ marginTop: 8, color: '#6b7280' }}>Upload Signature</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </TabPane>
              
              <TabPane tab="Values & Goals" key="4">
                <div className="mb-6">
                  <div className="flex flex-wrap gap-6">
                    {coreValues.map((value, idx) => (
                      <div key={idx} className="bg-white rounded-2xl shadow p-6 w-full md:w-1/3 flex flex-col items-start relative border border-gray-100">
                        <Select
                          value={value.icon}
                          style={{
                            width: 72,
                            height: 72,
                            marginBottom: 16,
                            border: '1.5px solid #e5e7eb',
                            borderRadius: 16,
                            background: '#fafbfc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 40,
                            boxShadow: '0 2px 8px 0 rgba(60,60,60,0.07)',
                            padding: 8
                          }}
                          dropdownStyle={{ borderRadius: 16, padding: 8 }}
                          onChange={icon => {
                            const updated = [...coreValues];
                            updated[idx].icon = icon;
                            setCoreValues(updated);
                          }}
                        >
                          <Select.Option value="TrophyOutlined"><TrophyOutlined style={{ color: '#FF4B2B', fontSize: 40, verticalAlign: 'middle' }} /> Excellence</Select.Option>
                          <Select.Option value="TeamOutlined"><TeamOutlined style={{ color: '#FF4B2B', fontSize: 40, verticalAlign: 'middle' }} /> Inclusivity</Select.Option>
                          <Select.Option value="CheckCircleOutlined"><CheckCircleOutlined style={{ color: '#FF4B2B', fontSize: 40, verticalAlign: 'middle' }} /> Integrity</Select.Option>
                          <Select.Option value="StarOutlined"><StarOutlined style={{ color: '#FF4B2B', fontSize: 40, verticalAlign: 'middle' }} /> Achievement</Select.Option>
                          <Select.Option value="SafetyCertificateOutlined"><SafetyCertificateOutlined style={{ color: '#FF4B2B', fontSize: 40, verticalAlign: 'middle' }} /> Safety</Select.Option>
                          <Select.Option value="SmileOutlined"><SmileOutlined style={{ color: '#FF4B2B', fontSize: 40, verticalAlign: 'middle' }} /> Positivity</Select.Option>
                          <Select.Option value="HeartOutlined"><HeartOutlined style={{ color: '#FF4B2B', fontSize: 40, verticalAlign: 'middle' }} /> Compassion</Select.Option>
                        </Select>
                        <Input
                          value={value.title}
                          onChange={e => {
                            const updated = [...coreValues];
                            updated[idx].title = e.target.value;
                            setCoreValues(updated);
                          }}
                          placeholder="Value Title"
                          className="font-bold text-xl mb-2"
                        />
                        <TextArea
                          value={value.description}
                          onChange={e => {
                            const updated = [...coreValues];
                            updated[idx].description = e.target.value;
                            setCoreValues(updated);
                          }}
                          placeholder="Value Description"
                          autoSize={{ minRows: 2, maxRows: 4 }}
                        />
                        <Button
                          type="text"
                          icon={<DeleteOutlined />}
                          danger
                          style={{ position: 'absolute', top: 8, right: 8 }}
                          onClick={() => setCoreValues(coreValues.filter((_, i) => i !== idx))}
                        />
                      </div>
                    ))}
                    <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      style={{ height: 120, minWidth: 180, alignSelf: 'center' }}
                      onClick={() => setCoreValues([...coreValues, { icon: 'TrophyOutlined', title: '', description: '' }])}
                    >
                      Add Value
                    </Button>
                  </div>
                </div>
                <Form.Item name="goals" label="Strategic Goals">
                  <TextArea rows={6} placeholder="Enter strategic goals..." />
                </Form.Item>
              </TabPane>
              <TabPane tab="Administration" key="5">
                <div className="mb-6">
                  <div className="flex flex-wrap gap-6">
                    {admins.map((admin, idx) => (
                      <div key={idx} className="bg-white rounded-2xl shadow p-6 w-full md:w-1/4 flex flex-col items-center relative border border-gray-100">
                        <Upload
                          showUploadList={false}
                          accept="image/*"
                          beforeUpload={file => {
                            const reader = new FileReader();
                            reader.onload = e => {
                              const base64 = e.target?.result as string;
                              setAdmins(prev => {
                                const updated = [...prev];
                                updated[idx] = { ...updated[idx], image: base64 };
                                return updated;
                              });
                            };
                            reader.readAsDataURL(file);
                            return false;
                          }}
                        >
                          <div
                            style={{
                              width: 120,
                              height: 120,
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
                            {admin.image ? (
                              <img src={admin.image} alt={admin.name} style={{ width: 120, height: 120, objectFit: "cover" }} />
                            ) : (
                              <div style={{ fontSize: 14, color: '#9ca3af' }}>Upload</div>
                            )}
                          </div>
                        </Upload>
                        <Input
                          value={admin.name}
                          onChange={e => handleAdminChange(idx, "name", e.target.value)}
                          placeholder="Full Name"
                          className="text-center text-lg font-bold mb-2"
                          style={{ fontWeight: 700, fontSize: 20, textAlign: "center" }}
                        />
                        <Select
                          showSearch
                          value={admin.title}
                          onChange={value => handleAdminChange(idx, "title", value)}
                          placeholder="Select or type role (e.g., DEAN)"
                          className="text-center text-base mb-1"
                          style={{ fontWeight: 600, color: "#1e293b", textAlign: "center", width: '100%' }}
                          optionFilterProp="children"
                          filterOption={(input, option) => {
                            const label = typeof option?.children === 'string' ? option.children : Array.isArray(option?.children) ? option.children.join(' ') : '';
                            return label.toLowerCase().includes(input.toLowerCase());
                          }}
                          dropdownStyle={{ minWidth: 200 }}
                          allowClear
                          onInputKeyDown={e => {
                            // Allow typing custom value and pressing Enter
                            if (e.key === 'Enter') {
                              const target = e.target as HTMLInputElement;
                              handleAdminChange(idx, "title", target.value);
                            }
                          }}
                        >
                          <Select.Option value="DEAN">DEAN</Select.Option>
                          <Select.Option value="VICE DEAN, ACADEMICS">VICE DEAN, ACADEMICS</Select.Option>
                          <Select.Option value="VICE DEAN, RESEARCH">VICE DEAN, RESEARCH</Select.Option>
                          <Select.Option value="HEAD, ADMINISTRATION">HEAD, ADMINISTRATION</Select.Option>
                          <Select.Option value="HEAD, DEPARTMENT">HEAD, DEPARTMENT</Select.Option>
                          <Select.Option value="COORDINATOR">COORDINATOR</Select.Option>
                        </Select>
                        <Input
                          value={admin.subtitle}
                          onChange={e => handleAdminChange(idx, "subtitle", e.target.value)}
                          placeholder="Subtitle (optional)"
                          className="text-center text-xs mb-2"
                          style={{ color: "#64748b", textAlign: "center" }}
                        />
                        <Button
                          type="text"
                          icon={<DeleteOutlined />}
                          danger
                          style={{ position: "absolute", top: 8, right: 8 }}
                          onClick={() => removeAdmin(idx)}
                          disabled={admins.length <= 1}
                        />
                      </div>
                    ))}
                    <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      style={{ height: 120, minWidth: 180, alignSelf: "center" }}
                      onClick={addAdmin}
                    >
                      Add Admin
                    </Button>
                  </div>
                </div>
              </TabPane>
            </Tabs>
          </Form>
        </Card>

        <div className="flex justify-end p-4 bg-white shadow rounded-lg mb-8">
           <Button type="primary" size="large" icon={<SaveOutlined />} loading={saving} onClick={form.submit}>
             Save & Publish Changes
           </Button>
        </div>

        <h2 className="text-2xl font-bold mb-4 text-blue-900 border-t pt-8">Live Preview</h2>

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
        {activeTab === "4" && (
          <>{/* Core Values Preview */}
            <div className="flex flex-wrap gap-8 mt-8">
              {coreValues.map((value, idx) => {
                const iconMap = {
                  TrophyOutlined: <TrophyOutlined style={{ color: '#FF4B2B', fontSize: 40 }} />,
                  TeamOutlined: <TeamOutlined style={{ color: '#FF4B2B', fontSize: 40 }} />,
                  CheckCircleOutlined: <CheckCircleOutlined style={{ color: '#FF4B2B', fontSize: 40 }} />,
                  StarOutlined: <StarOutlined style={{ color: '#FF4B2B', fontSize: 40 }} />,
                  SafetyCertificateOutlined: <SafetyCertificateOutlined style={{ color: '#FF4B2B', fontSize: 40 }} />,
                  SmileOutlined: <SmileOutlined style={{ color: '#FF4B2B', fontSize: 40 }} />,
                  HeartOutlined: <HeartOutlined style={{ color: '#FF4B2B', fontSize: 40 }} />,
                };
                return (
                  <div key={idx} className="bg-white rounded-2xl shadow p-8 w-full md:w-1/3 flex flex-col items-start border border-gray-100">
                    <div className="mb-4">{iconMap[value.icon]}</div>
                    <div className="text-2xl font-bold mb-2 text-gray-900">{value.title}</div>
                    <div className="text-lg text-gray-500">{value.description}</div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        {activeTab === "5" && (
          <div className="flex flex-wrap justify-center gap-8 mt-8" key={previewKey}>
            {admins.map((admin, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow p-8 w-full md:w-1/4 flex flex-col items-center border border-gray-100">
                <div
                  style={{
                    width: 120,
                    height: 120,
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
                  {admin.image ? (
                    <img src={admin.image} alt={admin.name} style={{ width: 120, height: 120, objectFit: "cover" }} />
                  ) : (
                    <div style={{ fontSize: 14, color: '#9ca3af' }}>Upload</div>
                  )}
                </div>
                <div
                  className="mb-1 text-center"
                  style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}
                >
                  {admin.name}
                </div>
                <div
                  className="mb-1 text-center"
                  style={{ fontSize: 18, fontWeight: 600, color: '#2b4362', letterSpacing: 0.5 }}
                >
                  {admin.title}
                </div>
                <div
                  className="text-center"
                  style={{ fontSize: 16, fontWeight: 500, color: '#3b5b8c', letterSpacing: 0.5 }}
                >
                  {admin.subtitle}
                </div>
              </div>
            ))}
          </div>
        )}
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