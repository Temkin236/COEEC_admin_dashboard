
import React, { useEffect, useState } from "react";
import { Card, Button, Tabs, Form, message, Modal, Descriptions } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchContent, updateContent, createContent, addAboutTimelineItem, updateAboutTimelineItem, deleteAboutTimelineItem } from "@/store/slices/contentSlice";
import axiosInstance from "@/utils/axios";

import { usePermissions } from "@/hooks/usePermissions";

// Components
import HistoryTab from "./components/HistoryTab";
import MissionTab from "./components/MissionTab";
import DeanTab from "./components/DeanTab";
import ValuesTab from "./components/ValuesTab";
import AdministrationTab from "./components/AdministrationTab";
import AboutPreview from "./components/AboutPreview";

const { TabPane } = Tabs;

const AboutPage = () => {
  const { can } = usePermissions();
  // Dummy state to force re-render for live preview
  const [previewKey, setPreviewKey] = useState(0);
  const dispatch = useAppDispatch();
  const { about } = useAppSelector((state) => state.content);
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [form] = Form.useForm();
  
  // State for different sections
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [activeHistoryIndex, setActiveHistoryIndex] = useState(-1);
  const [coreValues, setCoreValues] = useState<any[]>([
    { icon: 'TrophyOutlined', title: 'Excellence', description: 'Striving for the highest standards in teaching and research.' },
    { icon: 'TeamOutlined', title: 'Inclusivity', description: 'Fostering a diverse and welcoming academic environment.' },
    { icon: 'CheckCircleOutlined', title: 'Integrity', description: 'Upholding honesty, ethics, and accountability in all actions.' }
  ]);
  const [admins, setAdmins] = useState<any[]>([
    { image: '', name: '', title: '', subtitle: '' }
  ]);

  // Image Upload Handling
  const [imageIds, setImageIds] = useState<Record<string, string>>({});
  const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({});

  const handleImageUpload = async (file: File, fieldName: string) => {
    setUploadingState(prev => ({ ...prev, [fieldName]: true }));
    try {
        const fieldNames = ["file", "files", "upload", "media", "document"];
        let uploadedData = null;
        let lastError = null;
        
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
             } catch (e) { 
               lastError = e;
               continue; 
             }
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
             console.error("Upload failed with errors:", lastError);
             message.error("Upload failed: No data returned from server");
        }
    } catch (error) {
        console.error(error);
        message.error("Upload failed");
    } finally {
        setUploadingState(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  // Administration handlers
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

  // Helper to resolve image URL
  const getImageUrl = (img: any) => {
    if (!img) return '';
    const url = typeof img === 'object' ? img.url : img;
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    
    // Resolve relative paths
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || '';
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  useEffect(() => {
    dispatch(fetchContent({ type: "about", language: currentLanguage }) as any)
  }, [dispatch, currentLanguage])

  useEffect(() => {
    if (about.items.length > 0) {
      const data = about.items[0]
      console.log("Loaded About Data:", data); 

      const mappedData = {
        ...data,
        historySectionTitle: data.historySectionTitle || data.title,
        historySectionDescription: data.historySectionDescription || data.description,
        historySectionLabel: data.historySectionLabel || "Our Journey", 
        historySectionImage: getImageUrl(data.historySectionImage || data.image),
        mission: data.mission,
        vision: data.vision,
        deanName: data.deanName,
        deanMessage: data.deanMessage,
        deanImage: getImageUrl(data.deanImage),
        values: data.values,
        goals: data.goals
      };

      form.setFieldsValue(mappedData)
      setHistoryItems(data.timeline || data.historyItems || [])
      
      if (data.imageId) setImageIds(prev => ({ ...prev, historySectionImage: data.imageId }));
      if (data.deanImageId) setImageIds(prev => ({ ...prev, deanImage: data.deanImageId }));
      if (data.deanSignatureId) setImageIds(prev => ({ ...prev, deanSignature: data.deanSignatureId }));

      // Sort timeline items by year (Ascending: Oldest -> Newest)
      const rawTimeline = data.timeline || data.historyItems || [];
      
      const getSafeYear = (y: any) => {
         const parsed = parseInt(String(y || "0").replace(/[^0-9]/g, ''));
         return isNaN(parsed) ? 0 : parsed;
      };

      const sortedTimeline = [...rawTimeline].sort((a: any, b: any) => {
          return getSafeYear(a.year) - getSafeYear(b.year);
          // return getSafeYear(b.year) - getSafeYear(a.year); 
      });
      setHistoryItems(sortedTimeline);

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

  // Submit Handler
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
      const currentItem = about.items.length > 0 ? about.items[0] : null;
      const aboutId = currentItem?.id || currentItem?._id;

      // 1. Save Main Content
      const mainData: any = { 
          ...values,
          title: values.historySectionTitle || values.title,
          description: values.historySectionDescription || values.description,
          subtitle: values.historySectionLabel || values.subtitle,
          language: currentLanguage,
          imageId: imageIds['historySectionImage'],
          deanImageId: imageIds['deanImage'],
          deanSignatureId: imageIds['deanSignature'],
      };
      
      if (!mainData.imageId) delete mainData.imageId;
      if (!mainData.deanImageId) delete mainData.deanImageId;
      if (!mainData.deanSignatureId) delete mainData.deanSignatureId;

      delete mainData.historyItems;
      delete mainData.timeline;

      let savedAbout;
      if (aboutId) {
        savedAbout = await dispatch(updateContent({ type: "about", id: aboutId, data: mainData }) as any).unwrap();
      } else {
        savedAbout = await dispatch(createContent({ type: "about", data: mainData }) as any).unwrap();
      }
      
      const realAboutId = savedAbout.data?.id || aboutId;

      // 2. Handle Timeline Items
      if (realAboutId) {
        const originalItems = about.items[0]?.timeline || about.items[0]?.historyItems || [];
        const originalIds = new Set(originalItems.map((item: any) => item.id));
        const currentIds = new Set(historyItems.map((item: any) => item.id).filter(Boolean));

        for (const item of originalItems) {
            if (item.id && !currentIds.has(item.id)) {
                await dispatch(deleteAboutTimelineItem({ aboutId: realAboutId, itemId: item.id }) as any);
            }
        }

        for (const item of historyItems) {
            if (item.id && originalIds.has(item.id)) {
                await dispatch(updateAboutTimelineItem({ aboutId: realAboutId, itemId: item.id, data: item }) as any);
            } else {
                const { id, ...itemData } = item; 
                await dispatch(addAboutTimelineItem({ aboutId: realAboutId, data: itemData }) as any);
            }
        }
      }

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
        <Card title="About the College - Admin Editor">
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Tabs defaultActiveKey="1" activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="History Section (Photo)" key="1">
                <HistoryTab
                   form={form}
                   historyItems={historyItems}
                   activeHistoryIndex={activeHistoryIndex}
                   setActiveHistoryIndex={setActiveHistoryIndex}
                   uploadingState={uploadingState}
                   handleImageUpload={handleImageUpload}
                   addHistoryItem={addHistoryItem}
                   updateHistoryItem={updateHistoryItem}
                   removeHistoryItem={removeHistoryItem}
                   canCreate={can('about', 'create')}
                   canUpdate={can('about', 'update')}
                   canDelete={can('about', 'delete')}
                />
              </TabPane>
              
              {/* <TabPane tab="Mission & Vision" key="2">
                <MissionTab />
              </TabPane>
              
              <TabPane tab="Dean's Message" key="3">
                 <DeanTab 
                   form={form} 
                   uploadingState={uploadingState} 
                   handleImageUpload={handleImageUpload} 
                 />
              </TabPane>
              
              <TabPane tab="Values & Goals" key="4">
                <ValuesTab 
                  coreValues={coreValues} 
                  setCoreValues={setCoreValues} 
                />
              </TabPane>

              <TabPane tab="Administration" key="5">
                <AdministrationTab 
                  admins={admins} 
                  setAdmins={setAdmins} 
                  handleAdminChange={handleAdminChange}
                  removeAdmin={removeAdmin}
                  addAdmin={addAdmin}
                />
              </TabPane> */}
            </Tabs>
          </Form>
        </Card>

        <div className="flex justify-end p-4 bg-white shadow rounded-lg mb-8">
           <Button 
            type="primary" 
            size="large" 
            icon={<SaveOutlined />} 
            loading={saving} 
            onClick={form.submit}
            disabled={!can('about', 'update') && !can('about', 'create')}
           >
             Save & Publish Changes
           </Button>
        </div>

        <AboutPreview 
           activeTab={activeTab}
           form={form}
           about={about}
           historyItems={historyItems}
           coreValues={coreValues}
           admins={admins}
           previewKey={previewKey}
        />
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

export default AboutPage;
