import { Card, Tabs, Table, Button, Space, Tag } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons"

const { TabPane } = Tabs

const AcademicPage = () => {
  const programColumns = [
    { title: "Program Name", dataIndex: "name", key: "name" },
    { title: "Level", dataIndex: "level", key: "level", render: (level: string) => <Tag color="blue">{level}</Tag> },
    { title: "Duration", dataIndex: "duration", key: "duration" },
    { title: "Credits", dataIndex: "credits", key: "credits" },
    {
      title: "Actions",
      key: "actions",
      render: () => (
        <Space>
          <Button type="text" icon={<EditOutlined />} />
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Space>
      ),
    },
  ]

  const courseColumns = [
    { title: "Course Code", dataIndex: "code", key: "code" },
    { title: "Course Name", dataIndex: "name", key: "name" },
    { title: "Credits", dataIndex: "credits", key: "credits" },
    { title: "Level", dataIndex: "level", key: "level" },
    {
      title: "Actions",
      key: "actions",
      render: () => (
        <Space>
          <Button type="text" icon={<EditOutlined />} />
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Space>
      ),
    },
  ]

  const mockPrograms = [
    { id: 1, name: "BSc in Computer Science", level: "Undergraduate", duration: "4 years", credits: 120 },
    { id: 2, name: "MSc in Computer Science", level: "Graduate", duration: "2 years", credits: 60 },
  ]

  const mockCourses = [
    { id: 1, code: "CS101", name: "Introduction to Programming", credits: 3, level: "1st Year" },
    { id: 2, code: "CS202", name: "Data Structures", credits: 4, level: "2nd Year" },
  ]

  return (
    <div className="space-y-4">
      <Card title="Academic Information">
        <Tabs defaultActiveKey="1">
          <TabPane tab="Programs" key="1">
            <div className="mb-4">
              <Button type="primary" icon={<PlusOutlined />}>Add Program</Button>
            </div>
            <Table columns={programColumns as any} dataSource={mockPrograms} rowKey="id" pagination={false} />
          </TabPane>

          <TabPane tab="Courses" key="2">
            <div className="mb-4">
              <Button type="primary" icon={<PlusOutlined />}>Add Course</Button>
            </div>
            <Table columns={courseColumns as any} dataSource={mockCourses} rowKey="id" pagination={{ pageSize: 10 }} />
          </TabPane>

          <TabPane tab="Academic Calendar" key="3">
            <div className="p-4 text-center text-gray-500">Academic calendar management coming soon...</div>
          </TabPane>

          <TabPane tab="Announcements" key="4">
            <div className="p-4 text-center text-gray-500">Announcements management coming soon...</div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  )
}

export default AcademicPage
