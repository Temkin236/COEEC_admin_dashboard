import React, { useState } from "react";
import { Card, Input, Button, Upload, Form, Space } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const defaultAdmins = [
  { name: "Dr. Berhanu Bulcha", title: "DEAN", image: "", subtitle: "" },
  { name: "Dr. Sarah Ahmed", title: "VICE DEAN, ACADEMICS", image: "", subtitle: "" },
  { name: "Mr. Dawit Tadesse", title: "VICE DEAN, RESEARCH", image: "", subtitle: "" },
  { name: "Ms. Tigist Alemu", title: "HEAD, ADMINISTRATION", image: "", subtitle: "" },
];

const AdminsPage: React.FC = () => {
  const [admins, setAdmins] = useState(defaultAdmins);

  const handleChange = (idx: number, field: string, value: string) => {
    const updated = [...admins];
    updated[idx][field] = value;
    setAdmins(updated);
  };

  const handleImage = (idx: number, file: any) => {
    const reader = new FileReader();
    reader.onload = e => {
      handleChange(idx, "image", e.target?.result as string);
    };
    reader.readAsDataURL(file);
    return false;
  };

  const addAdmin = () => {
    setAdmins([...admins, { name: "", title: "", image: "", subtitle: "" }]);
  };

  const removeAdmin = (idx: number) => {
    setAdmins(admins.filter((_, i) => i !== idx));
  };

  return (
    <div className="p-8">
      <h1 className="text-4xl font-extrabold text-center mb-8">Administration</h1>
      <div className="flex flex-wrap justify-center gap-8">
        {admins.map((admin, idx) => (
          <Card
            key={idx}
            style={{ width: 300, borderRadius: 24, boxShadow: "0 4px 24px 0 rgba(60,60,60,0.10)", padding: 0 }}
            bodyStyle={{ padding: 0 }}
          >
            <div className="flex flex-col items-center p-6">
              <Upload
                showUploadList={false}
                beforeUpload={file => handleImage(idx, file)}
                accept="image/*"
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
                    <PlusOutlined style={{ fontSize: 32, color: "#bbb" }} />
                  )}
                </div>
              </Upload>
              <Input
                value={admin.name}
                onChange={e => handleChange(idx, "name", e.target.value)}
                placeholder="Full Name"
                className="text-center text-lg font-bold mb-2"
                style={{ fontWeight: 700, fontSize: 20, textAlign: "center" }}
              />
              <Input
                value={admin.title}
                onChange={e => handleChange(idx, "title", e.target.value)}
                placeholder="Title (e.g., DEAN)"
                className="text-center text-base mb-1"
                style={{ fontWeight: 600, color: "#1e293b", textAlign: "center" }}
              />
              <Input
                value={admin.subtitle}
                onChange={e => handleChange(idx, "subtitle", e.target.value)}
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
          </Card>
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

export default AdminsPage;
