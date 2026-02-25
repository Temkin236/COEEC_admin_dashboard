import React from 'react';
import { Form, Input, Button, Upload } from 'antd';
import { PlusOutlined, LoadingOutlined, DeleteOutlined } from '@ant-design/icons';

const { TextArea } = Input;

interface HistoryTabProps {
  form: any;
  historyItems: any[];
  activeHistoryIndex: number;
  setActiveHistoryIndex: (index: number) => void;
  uploadingState: Record<string, boolean>;
  handleImageUpload: (file: File, fieldName: string) => void;
  addHistoryItem: () => void;
  updateHistoryItem: (index: number, field: string, value: any) => void;
  removeHistoryItem: (index: number) => void;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

const HistoryTab: React.FC<HistoryTabProps> = ({
  form,
  historyItems,
  activeHistoryIndex,
  setActiveHistoryIndex,
  uploadingState,
  handleImageUpload,
  addHistoryItem,
  updateHistoryItem,
  removeHistoryItem,
  canCreate = true,
  canUpdate = true,
  canDelete = true,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Left: Section Info */}
      <div className="md:w-1/2">
        <Form.Item name="historySectionLabel" label="Section Label (e.g. Our Journey)" rules={[{ required: true, message: "Please enter section label" }]}> 
          <Input placeholder="Enter section label..." disabled={!canUpdate} />
        </Form.Item>
        <Form.Item name="historySectionTitle" label="Section Title" rules={[{ required: true, message: "Please enter section title" }]}> 
          <Input placeholder="Enter section title..." disabled={!canUpdate} />
        </Form.Item>
        <Form.Item name="historySectionDescription" label="Section Description" rules={[{ required: true, message: "Please enter section description" }]}> 
          <TextArea rows={3} placeholder="Enter section description..." disabled={!canUpdate} />
        </Form.Item>
        <Form.Item label="Section Image" required>
            <Form.Item name="historySectionImage" hidden>
                <Input />
            </Form.Item>
            
            <Form.Item shouldUpdate={(prev, curr) => prev.historySectionImage !== curr.historySectionImage} noStyle>
               {({ getFieldValue }) => {
                 const imageUrl = getFieldValue('historySectionImage');
                 return (
                   <div className="flex flex-col gap-2">
                     {/* Commented out image preview logic for brevity, assuming standard usage */}
                     {imageUrl ? (
                        <div className="relative w-full h-[250px] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group">
                           <img 
                              src={imageUrl} 
                              alt="History Section" 
                              className="w-full h-full object-cover"
                           />
                        </div>
                     ) : null}

                     <Upload
                        showUploadList={false}
                        beforeUpload={(file) => {
                           if (canUpdate) {
                               handleImageUpload(file as File, 'historySectionImage');
                           }
                           return false;
                        }}
                        accept="image/*"
                        maxCount={1}
                        disabled={!canUpdate}
                     >
                       <Button icon={uploadingState['historySectionImage'] ? <LoadingOutlined /> : <PlusOutlined />} disabled={!canUpdate}>
                          {imageUrl ? "Change Image" : "Upload Image"}
                       </Button>
                     </Upload>
                   </div>
                 );
               }}
            </Form.Item>
        </Form.Item>
      </div>
      {/* Right: Timeline Editor */}
      <div className="md:w-1/2">
        <div className="mb-4">
          <Button type="dashed" onClick={addHistoryItem} icon={<PlusOutlined />} disabled={!canCreate}>
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
                    disabled={!canUpdate}
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
                      disabled={!canUpdate}
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeHistoryItem(index)}
                      title="Remove timeline item"
                      disabled={!canDelete}
                    />
                  </div>
                  <TextArea
                    className="text-base"
                    placeholder="Description"
                    value={item.description}
                    onChange={e => updateHistoryItem(index, 'description', e.target.value)}
                    rows={2}
                    disabled={!canUpdate}
                  />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
      
    </div>
  );
};

export default HistoryTab;
