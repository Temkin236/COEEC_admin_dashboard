import { useEffect, useState } from "react"
import { Card, Form, Input, Button, Statistic, Row, Col, message, Spin } from "antd"
import { UserOutlined, TeamOutlined, TrophyOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchStudentLife, updateStudentLife } from "@/store/slices/studentSlice"

const { TextArea } = Input

const StudentLifePage = () => {
  const dispatch = useAppDispatch()
  const { studentLife } = useAppSelector((state) => state.students)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    dispatch(fetchStudentLife() as any)
  }, [dispatch])

  useEffect(() => {
    if (studentLife.data) {
      form.setFieldsValue(studentLife.data)
    }
  }, [studentLife.data, form])

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      await dispatch(updateStudentLife(values) as any)
      message.success("Student life information updated successfully!")
    } catch (error) {
      message.error("Failed to update student life information")
    } finally {
      setLoading(false)
    }
  }

  if (!studentLife.data || studentLife.loading) {
    return <div className="flex justify-center py-8"><Spin size="large" /></div>
  }

  const studentLifeData = studentLife.data

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Student Life Management</h1>
        <p className="text-gray-600">Manage student life content, statistics, and information</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic 
              title="Clubs" 
              value={studentLifeData.statClubs || 0} 
              prefix={<TeamOutlined />} 
              valueStyle={{ color: '#1890ff' }} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic 
              title="Internships" 
              value={studentLifeData.statInternships || 0} 
              prefix={<TrophyOutlined />} 
              valueStyle={{ color: '#52c41a' }} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic 
              title="Alumni Network" 
              value={studentLifeData.statAlumni || 0} 
              prefix={<UserOutlined />} 
              valueStyle={{ color: '#722ed1' }} 
            />
          </Card>
        </Col>
      </Row>

      <Card title="Student Life Information">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={studentLifeData || {}}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Form.Item
                label="Main Heading"
                name="heading"
                rules={[{ required: true, message: 'Please enter the main heading' }]}
              >
                <Input placeholder="Student Life" />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item
                label="Main Description"
                name="description"
              >
                <TextArea rows={4} placeholder="Description of student life at the college" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Clubs Count"
                name="statClubs"
              >
                <Input placeholder="Number of active clubs" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Internships Count"
                name="statInternships"
              >
                <Input placeholder="Number of internships" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Alumni Count"
                name="statAlumni"
              >
                <Input placeholder="Number of alumni" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Form.Item
                label="Clubs Section Heading"
                name="clubsHeading"
              >
                <Input placeholder="Our Student Clubs" />
              </Form.Item>
              <Form.Item
                label="Clubs Section Description"
                name="clubsDescription"
              >
                <TextArea rows={3} placeholder="Description of student clubs and activities" />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item
                label="Career Section Heading"
                name="careerHeading"
              >
                <Input placeholder="Career Opportunities" />
              </Form.Item>
              <Form.Item
                label="Career Section Description"
                name="careerDescription"
              >
                <TextArea rows={3} placeholder="Description of career opportunities and support" />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end">
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              size="large"
            >
              Update Student Life Information
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default StudentLifePage