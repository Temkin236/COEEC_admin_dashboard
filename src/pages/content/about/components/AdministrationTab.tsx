import React from 'react';
import { Button, Input, Select, Upload } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

interface AdministrationTabProps {
  admins: any[];
  setAdmins: (admins: any[]) => void;
  handleAdminChange: (index: number, field: string, value: any) => void;
  removeAdmin: (index: number) => void;
  addAdmin: () => void;
}

const AdministrationTab: React.FC<AdministrationTabProps> = ({ 
  admins, 
  setAdmins, 
  handleAdminChange, 
  removeAdmin, 
  addAdmin 
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-6">
        {admins.map((admin, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow p-6 w-full md:w-1/4 flex flex-col items-center relative border border-gray-100">
            <Upload
              showUploadList={false}
              accept="image/*"
              beforeUpload={(file) => {
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
  );
};

export default AdministrationTab;
