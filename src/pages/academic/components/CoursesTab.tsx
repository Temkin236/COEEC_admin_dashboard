import React from 'react'
import { Button, Table } from 'antd'

const CoursesTab = ({ courses, hasCoursesCreate, openAddCourse, courseColumns, hasCoursesView, openViewCourse }: any) => {
  return (
    <div>
      <div className="mb-4">
        {hasCoursesCreate && (
          <Button type="primary" onClick={openAddCourse}>Add Course</Button>
        )}
      </div>
      <Table
        columns={courseColumns as any}
        dataSource={courses}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        rowClassName={() => 'cursor-pointer hover:bg-gray-50'}
        onRow={(record) => ({ onClick: () => {
          if (hasCoursesView) {
            openViewCourse(record)
          }
        } })}
      />
    </div>
  )
}

export default CoursesTab
