import React from 'react';
import { Form, Input, Select } from 'antd';
import { 
  AimOutlined, BulbOutlined, HeartOutlined, ThunderboltOutlined, 
  CodeOutlined, LaptopOutlined, RocketOutlined, EyeOutlined 
} from '@ant-design/icons';

const { TextArea } = Input;

const MissionTab: React.FC = () => {
  return (
    <>
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
    </>
  );
};

export default MissionTab;
