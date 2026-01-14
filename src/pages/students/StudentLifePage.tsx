import { useEffect, useState } from "react"
import { Card, Form, Input, Button, Statistic, Row, Col, message, Spin, Descriptions } from "antd"
import { UserOutlined, TeamOutlined, TrophyOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchStudentLife, updateStudentLife } from "@/store/slices/studentSlice"
import { usePermissions } from "@/hooks/usePermissions"

const { TextArea } = Input

const StudentLifePage = () => {
  const dispatch = useAppDispatch()
  const { studentLife } = useAppSelector((state) => state.students)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const { canUpdate } = usePermissions()
  const canEdit = canUpdate("studentlife")

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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    )
  }

  const studentLifeData = studentLife.data

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1200px] mx-auto">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-1">Student Life</h1>
          <p className="text-sm text-gray-500">Highlights, stats and short descriptions of student activities</p>
        </div>
        </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Compact stat cards */}
        <div className="flex gap-4 w-full">
          <Card className="flex-1 rounded-lg shadow-sm p-4 bg-white">
            <div className="flex items-center gap-3">
              <TeamOutlined className="text-2xl text-blue-500" />
              <div>
                <div className="text-sm text-gray-500">Clubs</div>
                <div className="text-xl font-semibold text-gray-800">{studentLifeData.statClubs || '0'}</div>
              </div>
            </div>
          </Card>
          <Card className="flex-1 rounded-lg shadow-sm p-4 bg-white">
            <div className="flex items-center gap-3">
              <TrophyOutlined className="text-2xl text-green-500" />
              <div>
                <div className="text-sm text-gray-500">Internships</div>
                <div className="text-xl font-semibold text-gray-800">{studentLifeData.statInternships || '0'}</div>
              </div>
            </div>
          </Card>
          <Card className="flex-1 rounded-lg shadow-sm p-4 bg-white">
            <div className="flex items-center gap-3">
              <UserOutlined className="text-2xl text-purple-600" />
              <div>
                <div className="text-sm text-gray-500">Alumni</div>
                <div className="text-xl font-semibold text-gray-800">{studentLifeData.statAlumni || '0'}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {isEditing ? (
        <Card title="Edit Student Life Information" className="transition-shadow hover:shadow-lg" extra={canEdit ? (
          <Button size="small" onClick={() => setIsEditing(false)}>Cancel</Button>
        ) : null}>
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
        ) : (
        <Card title="Overview" className="transition-shadow hover:shadow-lg" extra={canEdit && !isEditing ? (
          <Button size="small" type="link" onClick={() => setIsEditing(true)}>Edit</Button>
        ) : null}>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Heading"><div className="break-words whitespace-normal">{studentLifeData.heading || '—'}</div></Descriptions.Item>
              <Descriptions.Item label="Description"><div className="break-words whitespace-normal">{studentLifeData.description || '—'}</div></Descriptions.Item>
              <Descriptions.Item label="Clubs Heading"><div className="break-words whitespace-normal">{studentLifeData.clubsHeading || '—'}</div></Descriptions.Item>
              <Descriptions.Item label="Clubs Description"><div className="break-words whitespace-normal">{studentLifeData.clubsDescription || '—'}</div></Descriptions.Item>
              <Descriptions.Item label="Career Heading"><div className="break-words whitespace-normal">{studentLifeData.careerHeading || '—'}</div></Descriptions.Item>
              <Descriptions.Item label="Career Description"><div className="break-words whitespace-normal">{studentLifeData.careerDescription || '—'}</div></Descriptions.Item>
            </Descriptions>
          </Card>
      )}
    </div>
  )
}

export default StudentLifePage