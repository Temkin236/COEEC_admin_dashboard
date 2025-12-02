"use client"

import { useEffect, useState } from "react"
import { Card, Button, Tabs, Form, Input, Select, message, Space } from "antd"
import { SaveOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchContent, updateContent, createContent } from "@/store/slices/contentSlice"
import { LANGUAGE_LABELS } from "@/utils/constants"

const { TextArea } = Input
const { TabPane } = Tabs as any

const AboutPage = () => {
  const dispatch = useAppDispatch()
  const { about } = useAppSelector((state) => state.content)
  const [currentLanguage, setCurrentLanguage] = useState("en")
  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(fetchContent({ type: "about", language: currentLanguage }) as any)
  }, [dispatch, currentLanguage])

  useEffect(() => {
    if (about.items.length > 0) {
      form.setFieldsValue(about.items[0])
    }
  }, [about.items, form])

  const handleSubmit = async (values: any) => {
    try {
      const data = { ...values, language: currentLanguage }
      if (about.items.length > 0) {
        await dispatch(updateContent({ type: "about", id: about.items[0].id, data }) as any).unwrap()
      } else {
        await dispatch(createContent({ type: "about", data }) as any).unwrap()
      }
      message.success("About page updated successfully")
    } catch (error) {
      message.error("Failed to update about page")
    }
  }

  return (
    <div className="space-y-4">
      <Card
        title="About the College"
        extra={
          <Space>
            <Select value={currentLanguage} onChange={setCurrentLanguage} style={{ width: 150 }}>
              {Object.entries(LANGUAGE_LABELS).map(([key, label]) => (
                <Select.Option key={key} value={key}>
                  {label}
                </Select.Option>
              ))}
            </Select>
            <Button type="primary" icon={<SaveOutlined />} onClick={() => form.submit()} loading={about.loading}>
              Save Changes
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Tabs defaultActiveKey="1">
            <TabPane tab="History" key="1">
              <Form.Item name="history" label="College History" rules={[{ required: true, message: "Please enter college history" }]}>
                <TextArea rows={8} placeholder="Enter college history..." />
              </Form.Item>
            </TabPane>

            <TabPane tab="Mission & Vision" key="2">
              <Form.Item name="mission" label="Mission Statement" rules={[{ required: true, message: "Please enter mission statement" }]}>
                <TextArea rows={5} placeholder="Enter mission statement..." />
              </Form.Item>
              <Form.Item name="vision" label="Vision Statement" rules={[{ required: true, message: "Please enter vision statement" }]}>
                <TextArea rows={5} placeholder="Enter vision statement..." />
              </Form.Item>
            </TabPane>

            <TabPane tab="Dean's Message" key="3">
              <Form.Item name="deanName" label="Dean's Name" rules={[{ required: true, message: "Please enter dean's name" }]}>
                <Input placeholder="Enter dean's name" />
              </Form.Item>
              <Form.Item name="deanMessage" label="Dean's Message" rules={[{ required: true, message: "Please enter dean's message" }]}>
                <TextArea rows={10} placeholder="Enter dean's message..." />
              </Form.Item>
              <Form.Item name="deanImage" label="Dean's Photo URL">
                <Input placeholder="Enter photo URL" />
              </Form.Item>
            </TabPane>

            <TabPane tab="Values & Goals" key="4">
              <Form.Item name="values" label="Core Values">
                <TextArea rows={6} placeholder="Enter core values (one per line)..." />
              </Form.Item>
              <Form.Item name="goals" label="Strategic Goals">
                <TextArea rows={6} placeholder="Enter strategic goals..." />
              </Form.Item>
            </TabPane>
          </Tabs>
        </Form>
      </Card>
    </div>
  )
}

export default AboutPage
