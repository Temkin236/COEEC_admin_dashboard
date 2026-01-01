import React from 'react'
import { Button, Table } from 'antd'

const ProgramsTab = ({ programs, hasProgramsCreate, openAdd, programColumns, hasProgramsView, openView }: any) => {
  return (
    <div>
      <div className="mb-4">
        {hasProgramsCreate && (
          <Button type="primary" onClick={openAdd}>Add Program</Button>
        )}
      </div>
      <Table
        columns={programColumns as any}
        dataSource={programs}
        rowKey="id"
        pagination={false}
        rowClassName={() => 'cursor-pointer hover:bg-gray-50'}
        onRow={(record) => ({
          onClick: () => {
            if (hasProgramsView) {
              openView(record)
            }
          },
        })}
      />
    </div>
  )
}

export default ProgramsTab
