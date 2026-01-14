"use client"

import React, { useState } from "react"
import { Card, Form, Input, Button, Row, Col } from "antd"

interface AboutFormData {
  description: string
}

export default function About() {
  const [formData, setFormData] = useState<AboutFormData>({
    description: `I am a dedicated academic professional with extensive experience in electrical engineering and computing. With a passion for education and research, I strive to foster innovation and excellence in my field. My work focuses on bridging the gap between theoretical knowledge and practical applications, preparing students for successful careers in the digital age.

Over the years, I have been involved in numerous research projects, mentored countless students, and contributed to the advancement of technology in our institution and beyond.`,
  })

  const handleChange = (value: string) => setFormData({ description: value })

  return (
    <div className="p-4 lg:p-8 min-h-screen bg-[#fafcfd]">
      <Row gutter={32}>
        <Col xs={24} md={14}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.03)", padding: 0 }}>
            <div className="p-8">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 className="font-bold text-lg" style={{ color: '#18485e', margin: 0 }}>Edit About</h2>
                <Button type="primary" size="small" style={{ background: '#17A2B8', borderRadius: 6 }} onClick={() => console.log('Save')}>Save</Button>
              </div>
              <Form layout="vertical">
                <Form.Item label="About Description">
                  <Input.TextArea rows={10} value={formData.description} onChange={(e) => handleChange(e.target.value)} />
                </Form.Item>
              </Form>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={10}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.03)", padding: 0 }}>
            <div className="p-8">
              <h2 className="font-bold text-lg mb-6" style={{ color: '#18485e' }}>Preview</h2>
              <div style={{ background: "#eaf4f7", padding: 24, borderRadius: 12 }}>
                <h3 style={{ color: "#18485e", marginTop: 0, fontWeight: 700 }}>About</h3>
                <div style={{ color: "#374151", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{formData.description}</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
