import React, { useState } from "react";
import { Card, Form, Input, Button, Select, Typography, Upload, message } from "antd";

const { Title } = Typography;
const { TextArea } = Input;

const DEPARTMENT_OPTIONS = [
  { value: "Software Engineering", label: "Software Engineering" },
  { value: "Computer Science Engineering", label: "Computer Science Engineering" },
  { value: "Electronics and Communication Engineering", label: "Electronics and Communication Engineering" },
  { value: "Electrical Power Department", label: "Electrical Power Department" }
];

const PROGRAM_OPTIONS = [
  "B.Sc. Computer Science",
  "M.Sc. Software Engineering",
  "PhD AI",
  "B.Sc. Electrical Engineering",
  "M.Sc. Communication Engineering",
  "B.Sc. Power Engineering",
  "M.Sc. Power Systems"
];

const RESEARCH_AREAS = [
  "Artificial Intelligence",
  "Cybersecurity",
  "Embedded Systems",
  "Power Systems",
  "Signal Processing",
  "Software Engineering",
  "Telecommunications",
  "Data Science",
  "Renewable Energy"
];

const DepartmentForm = ({ initialValues, onSubmit }) => {
  const [form] = Form.useForm();
  const [photoPreview, setPhotoPreview] = useState(initialValues?.photo || null);
    const [news, setNews] = useState(initialValues?.news || []);
    const [newsInput, setNewsInput] = useState({ title: '', date: '', summary: '', type: '', link: '' });
    const [programs, setPrograms] = useState(initialValues?.programs || []);
    const [programInput, setProgramInput] = useState({ name: '', desc: '', link: '' });

  const handlePhotoChange = (info) => {
    const file = info.file.originFileObj || info.file;
    if (!file) {
      message.error("No file selected");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target.result);
      form.setFieldsValue({ photo: e.target.result });
    };
    reader.onerror = () => {
      message.error("Failed to read image file");
    };
    reader.readAsDataURL(file);
  };

  const handleAddProgram = () => {
    if (!programInput.name) {
      message.error('Program name is required.');
      return;
    }
    setPrograms([...programs, { ...programInput }]);
    setProgramInput({ name: '', desc: '', link: '' });
  };

  const handleAddNews = () => {
    if (!newsInput.title || !newsInput.date) {
      message.error('Title and date are required for news.');
      return;
    }
    setNews([...news, { ...newsInput }]);
    setNewsInput({ title: '', date: '', summary: '', type: '', link: '' });
  };

  return (
    <div style={{ background: '#204a74', minHeight: '100vh', padding: '0 0 32px 0' }}>
      {/* Banner with department photo */}
      <div style={{ position: 'relative', height: 320, background: photoPreview ? `url(${photoPreview}) center/cover no-repeat` : '#204a74', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(32,74,116,0.7)' }} />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <Title level={1} style={{ color: '#fff', fontSize: 48, fontWeight: 800, marginBottom: 0 }}>{form.getFieldValue('name') || initialValues?.name || 'Department Name'}</Title>
          <div style={{ marginTop: 16 }}>
            <Upload accept="image/*" showUploadList={false} beforeUpload={handlePhotoChange}>
              <Button type="primary">Upload Department Photo</Button>
            </Upload>
          </div>
        </div>
      </div>
      {/* Main form card */}
      <Card style={{ maxWidth: 1100, margin: '0 auto', marginTop: -80, borderRadius: 16, boxShadow: '0 4px 24px rgba(32,74,116,0.08)' }}>
        <Form form={form} layout="vertical" initialValues={initialValues} onFinish={values => onSubmit({ ...values, news, photo: photoPreview })}>
            <Form form={form} layout="vertical" initialValues={initialValues} onFinish={values => onSubmit({ ...values, news, programs, photo: photoPreview })}>
          <Row gutter={32}>
            <Col xs={24} md={16}>
              <Form.Item name="name" label="Department Name" rules={[{ required: true, message: "Please select department name" }]}> 
                <Select options={DEPARTMENT_OPTIONS} placeholder="Select department" />
              </Form.Item>
              <Form.Item name="description" label="Overview" rules={[{ required: true, message: "Please enter department overview" }]}> <TextArea rows={4} /> </Form.Item>
              <Form.Item name="programs" label="Academic Programs" rules={[{ required: true, message: "Please select programs" }]}> <Select mode="tags" options={PROGRAM_OPTIONS.map(p => ({ value: p, label: p }))} /> </Form.Item>
                            <Divider orientation="left">Academic Programs</Divider>
                            <Row gutter={8} align="middle">
                              <Col xs={24} md={6}><Input placeholder="Program Name" value={programInput.name} onChange={e => setProgramInput(p => ({ ...p, name: e.target.value }))} style={{ marginBottom: 8 }} /></Col>
                              <Col xs={24} md={10}><Input placeholder="Description" value={programInput.desc} onChange={e => setProgramInput(p => ({ ...p, desc: e.target.value }))} style={{ marginBottom: 8 }} /></Col>
                              <Col xs={24} md={6}><Input placeholder="Link (optional)" value={programInput.link} onChange={e => setProgramInput(p => ({ ...p, link: e.target.value }))} style={{ marginBottom: 8 }} /></Col>
                              <Col xs={24} md={2}><Button onClick={handleAddProgram} type="primary">Add</Button></Col>
                            </Row>
                            <Row gutter={8} style={{ marginBottom: 16 }}>
                              {programs.map((prog, idx) => (
                                <Col xs={24} md={8} key={idx} style={{ marginBottom: 8 }}>
                                  <Card size="small" title={prog.name} extra={prog.link ? <a href={prog.link} target="_blank" rel="noopener noreferrer">View</a> : null}>
                                    <div style={{ color: '#555', fontSize: 14 }}>{prog.desc}</div>
                                  </Card>
                                </Col>
                              ))}
                            </Row>
              <Form.Item name="researchAreas" label="Research Areas" rules={[{ required: true, message: "Please select or add research areas" }]}> 
                <Select mode="tags" options={RESEARCH_AREAS.map(r => ({ value: r, label: r }))} placeholder="Select or add research areas" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Divider orientation="left">Quick Facts</Divider>
              <Form.Item name="head" label="Department Head" rules={[{ required: true, message: "Please enter head name" }]}> <Input /> </Form.Item>
              <Form.Item name="established" label="Established">
                <Input placeholder="e.g., 1995" />
              </Form.Item>
              <Form.Item name="students" label="Total Students">
                <Input placeholder="e.g., 1200+" />
              </Form.Item>
              <Form.Item name="faculty" label="Faculty Members">
                <Input placeholder="e.g., 45" />
              </Form.Item>
            </Col>
          </Row>
          <Divider orientation="left">Latest News</Divider>
          <Row gutter={8} align="middle">
            <Col xs={24} md={4}><Input placeholder="News Title" value={newsInput.title} onChange={e => setNewsInput(n => ({ ...n, title: e.target.value }))} style={{ marginBottom: 8 }} /></Col>
            <Col xs={24} md={3}><Input placeholder="Date (YYYY-MM-DD)" value={newsInput.date} onChange={e => setNewsInput(n => ({ ...n, date: e.target.value }))} style={{ marginBottom: 8 }} /></Col>
            <Col xs={24} md={3}><Select placeholder="Type" value={newsInput.type} onChange={v => setNewsInput(n => ({ ...n, type: v }))} style={{ width: '100%', marginBottom: 8 }} options={[
              { value: 'Research', label: 'Research' },
              { value: 'Conference', label: 'Conference' },
              { value: 'Faculty', label: 'Faculty' }
            ]} /></Col>
            <Col xs={24} md={8}><Input placeholder="Summary" value={newsInput.summary} onChange={e => setNewsInput(n => ({ ...n, summary: e.target.value }))} style={{ marginBottom: 8 }} /></Col>
            <Col xs={24} md={4}><Input placeholder="Link (optional)" value={newsInput.link} onChange={e => setNewsInput(n => ({ ...n, link: e.target.value }))} style={{ marginBottom: 8 }} /></Col>
            <Col xs={24} md={2}><Button onClick={handleAddNews} type="primary">Add News</Button></Col>
          </Row>
          <Row gutter={8} style={{ marginBottom: 24 }}>
            {news.map((item, idx) => (
              <Col xs={24} md={8} key={idx}>
                <Card size="small" title={item.type || 'News'} extra={item.date} style={{ marginBottom: 8 }}>
                  <b>{item.title}</b>
                  <div style={{ color: '#555', fontSize: 14 }}>{item.summary}</div>
                  {item.link && <div><a href={item.link} target="_blank" rel="noopener noreferrer">Read more</a></div>}
                </Card>
              </Col>
            ))}
          </Row>
          <Form.Item>
            <Button type="primary" htmlType="submit">Save</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default DepartmentForm;
