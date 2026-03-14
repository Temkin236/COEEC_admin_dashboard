import React from 'react'
import { Tabs } from "antd"
import ProgramsTab from "./components/ProgramsTab"
import CoursesTab from "./components/CoursesTab"
import CalendarTab from "./components/CalendarTab"
import OptionListManager from "@/components/common/OptionListManager"

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
        <TabPane tab="Program Subprograms" key="4">
          <OptionListManager
            title="Program Subprograms"
            type="program-subprograms"
            addButtonLabel="Add Subprogram"
          />
        </TabPane>
        <TabPane tab="Program Types" key="5">
          <OptionListManager
            title="Program Types"
            type="program-types"
            addButtonLabel="Add Program Type"
          />
        </TabPane>
        <TabPane tab="Course Categories" key="6">
          <OptionListManager
            title="Course Categories"
            type="course-categories"
            addButtonLabel="Add Course Category"
          />
        </TabPane>
      </Tabs>
    </div>
  )
}

export default AcademicPage
