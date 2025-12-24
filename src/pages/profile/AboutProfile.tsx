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
    <div className="p-4 lg:p-8">
      <Row gutter={24}>
        <Col xs={24} md={14}>
          <Card title="About" extra={<Button type="primary" onClick={() => console.log('Save')}>Save</Button>} bordered className="shadow-sm">
            <Form layout="vertical">
              <Form.Item label="About Description">
                <Input.TextArea rows={10} value={formData.description} onChange={(e) => handleChange(e.target.value)} />
              </Form.Item>
              {/* Save moved to Card header */}
            </Form>
          </Card>
        </Col>

        <Col xs={24} md={10}>
          <Card title="Preview" bordered className="shadow-sm">
            <div style={{ background: "#ECF6F8", padding: 20, borderRadius: 6 }}>
              <h3 style={{ color: "#17A2B8" }}>About</h3>
              <div style={{ color: "#1A1A1A", whiteSpace: "pre-wrap" }}>{formData.description}</div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
