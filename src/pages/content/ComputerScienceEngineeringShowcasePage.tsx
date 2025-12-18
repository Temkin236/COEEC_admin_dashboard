import React from "react";
import { Card, Row, Col, Button, Typography, Tag, Divider, Breadcrumb } from "antd";

const { Title } = Typography;

const department = {
  name: "Computer Science & Engineering",
  banner: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  overview: `Focusing on software systems, AI, and cybersecurity to drive digital transformation. The department is committed to providing high-quality education and research opportunities. Our curriculum is designed to meet the evolving needs of the industry, fostering innovation and critical thinking.\n\nWe host state-of-the-art laboratories and maintain strong partnerships with leading technology firms. Students benefit from a blend of theoretical knowledge and practical application, ensuring they are job-ready upon graduation. The department is led by Dr. Sarah Ahmed, a distinguished scholar in the field.`,
  head: "Dr. Sarah Ahmed",
  established: "1995",
  students: "1,200+",
  faculty: "45",
  programs: [
    {
      name: "B.Sc. Computer Science",
      desc: "A comprehensive program designed to equip students with foundational knowledge and advanced skills.",
      link: "#"
    },
    {
      name: "M.Sc. Software Engineering",
      desc: "A comprehensive program designed to equip students with foundational knowledge and advanced skills.",
      link: "#"
    },
    {
      name: "PhD AI & Data Science",
      desc: "A comprehensive program designed to equip students with foundational knowledge and advanced skills.",
      link: "#"
    }
  ],
  news: [
    {
      type: "Research",
      date: "November 10, 2025",
      title: "COEEC Secures Grant for AI Research Lab",
      summary: "The college has received significant funding to establish a state-of-the-art Artificial Intelligence research center aimed at solving local agricultural...",
      link: "#"
    },
    {
      type: "Conference",
      date: "November 05, 2025",
      title: "ASTU Showcases Digital Transformation",
      summary: "The university demonstrated its latest strides in digital education at the World Conference on Engineering Education.",
      link: "#"
    },
    {
      type: "Faculty",
      date: "October 28, 2025",
      title: "Dr. Kebede Named Fellow of IEEE",
      summary: "In recognition of his contributions to renewable energy systems, Dr. Kebede has been elevated to the grade of IEEE Fellow.",
      link: "#"
    }
  ]
};

const ComputerScienceEngineeringShowcasePage = () => (
  <div style={{ background: '#f7f9fb' }}>
    {/* Banner */}
    <div style={{ position: 'relative', height: 340, background: `url(${department.banner}) center/cover no-repeat` }}>
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(32,74,116,0.82)' }} />
    <div style={{ position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto', padding: '64px 12px 0 12px' }}>
        <Breadcrumb style={{ color: '#fff', marginBottom: 16 }}>
          <Breadcrumb.Item><a href="/">Home</a></Breadcrumb.Item>
          <Breadcrumb.Item><a href="/departments">Departments</a></Breadcrumb.Item>
          <Breadcrumb.Item>Computer Science & Engineering</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{ color: '#ff7849', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>DEPARTMENT</div>
        <Title style={{ color: '#fff', fontWeight: 800, fontSize: 48, margin: 0 }}>Computer Science & Engineering</Title>
        <Button type="primary" size="large" style={{ marginTop: 32, fontWeight: 700 }}>Explore Programs</Button>
      </div>
    </div>
    {/* Overview & Quick Facts */}
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 12px 0 12px' }}>
      <Row gutter={32}>
        <Col xs={24} md={16}>
          <Title level={2} style={{ color: '#204a74', fontWeight: 800 }}>Overview</Title>
          <Divider style={{ margin: '8px 0 24px 0', borderColor: '#ff7849', width: 60 }} />
          <div style={{ fontSize: 18, color: '#222', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{department.overview}</div>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 2px 12px rgba(32,74,116,0.08)' }}>
            <Title level={4} style={{ marginBottom: 16 }}>Quick Facts</Title>
            <div style={{ fontSize: 16, marginBottom: 8 }}><b>Department Head</b> <span style={{ float: 'right' }}>{department.head}</span></div>
            <div style={{ fontSize: 16, marginBottom: 8 }}><b>Established</b> <span style={{ float: 'right' }}>{department.established}</span></div>
            <div style={{ fontSize: 16, marginBottom: 8 }}><b>Total Students</b> <span style={{ float: 'right' }}>{department.students}</span></div>
            <div style={{ fontSize: 16 }}><b>Faculty Members</b> <span style={{ float: 'right' }}>{department.faculty}</span></div>
          </Card>
        </Col>
      </Row>
    </div>
    {/* Academic Programs */}
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 12px 0 12px' }}>
      <Title level={2} style={{ color: '#204a74', fontWeight: 800, textAlign: 'center' }}>Academic Programs</Title>
      <Row gutter={32} justify="center">
        {department.programs.map((prog, idx) => (
          <Col xs={24} md={8} key={idx} style={{ marginBottom: 24 }}>
            <Card bordered={false} style={{ borderRadius: 16, minHeight: 180, boxShadow: '0 2px 12px rgba(32,74,116,0.08)' }}>
              <Title level={4} style={{ color: '#204a74', fontWeight: 700 }}>{prog.name}</Title>
              <div style={{ color: '#444', fontSize: 15, marginBottom: 12 }}>{prog.desc}</div>
              <a href={prog.link} style={{ color: '#1a73e8', fontWeight: 600 }}>View Curriculum &rarr;</a>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
    {/* Latest News */}
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 12px 48px 12px' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ color: '#8a99b3', fontWeight: 700, letterSpacing: 1 }}>LATEST NEWS</div>
        <Title level={2} style={{ color: '#204a74', fontWeight: 800, margin: 0 }}>Computer Science & Engineering in the News</Title>
      </div>
      <Row gutter={32} justify="center">
        {department.news.map((item, idx) => (
          <Col xs={24} md={8} key={idx} style={{ marginBottom: 24 }}>
            <Card bordered={false} style={{ borderRadius: 16, minHeight: 180, boxShadow: '0 2px 12px rgba(32,74,116,0.08)' }}>
              <Tag color={item.type === 'Research' ? 'blue' : item.type === 'Conference' ? 'orange' : 'green'} style={{ marginBottom: 8 }}>{item.type}</Tag>
              <div style={{ color: '#888', fontSize: 13, marginBottom: 4 }}>{item.date}</div>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{item.title}</div>
              <div style={{ color: '#444', fontSize: 15, marginBottom: 12 }}>{item.summary}</div>
              <a href={item.link} style={{ color: '#1a73e8', fontWeight: 600 }}>Read more</a>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  </div>
);

export default ComputerScienceEngineeringShowcasePage;
