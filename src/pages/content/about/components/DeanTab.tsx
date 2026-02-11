import React from 'react';
import { Form, Input, Upload } from 'antd';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';

const { TextArea } = Input;

interface DeanTabProps {
  form: any;
  uploadingState: Record<string, boolean>;
  handleImageUpload: (file: File, fieldName: string) => void;
}

const DeanTab: React.FC<DeanTabProps> = ({ form, uploadingState, handleImageUpload }) => {
  return (
    <>
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
      <Form.Item label="Dean's Photo">
         <Form.Item name="deanImage" noStyle>
            <Input hidden />
         </Form.Item>
         <Form.Item shouldUpdate={(prev, curr) => prev.deanImage !== curr.deanImage} noStyle>
          {() => (
            <Upload
              listType="picture-card"
              showUploadList={false}
              beforeUpload={(file) => {
                handleImageUpload(file as File, 'deanImage');
                return false; // Prevent default upload behavior
              }}
              maxCount={1}
              accept="image/*"
              fileList={[]}
            >
              {form.getFieldValue('deanImage') ? (
                 <div className="relative w-full h-full group">
                      <img 
                        src={form.getFieldValue('deanImage')} 
                        alt="Dean" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <PlusOutlined className="text-white text-xl" />
                      </div>
                </div>
              ) : (
                <div style={{ width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  {uploadingState['deanImage'] ? <LoadingOutlined /> : <PlusOutlined />}
                  <div style={{ marginTop: 8, color: '#6b7280' }}>Upload Photo</div>
                </div>
              )}
            </Upload>
          )}
        </Form.Item>
      </Form.Item>
      <Form.Item label="Dean's Signature">
        <Form.Item name="deanSignature" noStyle>
            <Input hidden />
        </Form.Item>
        <Form.Item shouldUpdate={(prev, curr) => prev.deanSignature !== curr.deanSignature} noStyle>
          {() => (
            <Upload
              listType="picture-card"
              showUploadList={false}
              beforeUpload={(file) => {
                handleImageUpload(file as File, 'deanSignature');
                return false; // Prevent default upload behavior
              }}
              maxCount={1}
              accept="image/*"
              fileList={[]}
            >
              {form.getFieldValue('deanSignature') ? (
                 <div className="relative w-full h-full group">
                      <img 
                        src={form.getFieldValue('deanSignature')} 
                        alt="Signature" 
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <PlusOutlined className="text-white text-xl" />
                      </div>
                </div>
              ) : (
                <div style={{ width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                   {uploadingState['deanSignature'] ? <LoadingOutlined /> : <PlusOutlined />}
                  <div style={{ marginTop: 8, color: '#6b7280' }}>Upload Signature</div>
                </div>
              )}
            </Upload>
          )}
        </Form.Item>
      </Form.Item>
    </>
  );
};

export default DeanTab;
