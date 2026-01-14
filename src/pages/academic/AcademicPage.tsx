import React from 'react'
import { Tabs } from "antd"
import ProgramsTab from "./components/ProgramsTab"
import CoursesTab from "./components/CoursesTab"
import CalendarTab from "./components/CalendarTab"

const { TabPane } = Tabs

const AcademicPage = () => {
  const handleDownloadPdf = () => {
    window.print()
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Academic Management</h1>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Programs" key="1">
          <ProgramsTab />
        </TabPane>
        <TabPane tab="Courses" key="2">
          <CoursesTab />
        </TabPane>
        <TabPane tab="Calendar & Events" key="3">
          <CalendarTab handleDownloadPdf={handleDownloadPdf} />
        </TabPane>
      </Tabs>
    </div>
  )
}

export default AcademicPage
