import React from 'react';
import { Card, Button, Form, Input, Select, Upload } from 'antd';
import { 
  PlusOutlined, TrophyOutlined, TeamOutlined, CheckCircleOutlined, 
  StarOutlined, SafetyCertificateOutlined, SmileOutlined, HeartOutlined, DeleteOutlined
} from '@ant-design/icons';

const { TextArea } = Input;

interface ValuesTabProps {
  coreValues: any[];
  setCoreValues: (values: any[]) => void;
}

const ValuesTab: React.FC<ValuesTabProps> = ({ coreValues, setCoreValues }) => {
  return (
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
      <Form.Item name="goals" label="Strategic Goals" style={{ marginTop: 24 }}>
        <TextArea rows={6} placeholder="Enter strategic goals..." />
      </Form.Item>
    </div>
  );
};

export default ValuesTab;
