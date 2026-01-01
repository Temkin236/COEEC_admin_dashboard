import React from 'react'
import { Card, Select, Button, Row, Col, Table } from 'antd'

const CalendarTab = ({ calendars, activeCalendar, setActiveCalendar, handleDownloadPdf, hasCalendarCreate, openAddAcademicCalendar, openAddCalendar, calendarsLoading, calendarEvents, calendarColumns, eventsLoading, openViewCalendar }: any) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="text-2xl font-bold text-blue-900 mb-2">Academic Calendar</div>
          {calendars.length > 0 ? (
            <Select
              style={{ width: 300 }}
              placeholder="Select academic calendar"
              value={activeCalendar?.id}
              onChange={(id) => {
                const selected = calendars.find((c: any) => c.id === id)
                setActiveCalendar(selected || null)
              }}
            >
              {calendars.map((cal: any) => (
                <Select.Option key={cal.id} value={cal.id}>
                  {cal.title} - {cal.academicYear} ({cal.semester})
                </Select.Option>
              ))}
            </Select>
          ) : (
            <div className="text-sm text-gray-500">No academic calendars available. Create one to get started.</div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <a className="text-blue-700 mr-4 cursor-pointer" onClick={() => handleDownloadPdf()}>Download PDF</a>
          {hasCalendarCreate && (
            <Button type="primary" onClick={() => openAddAcademicCalendar()}>New Academic Calendar</Button>
          )}
          {hasCalendarCreate && (
            <Button type="primary" onClick={() => openAddCalendar()}>Add Event</Button>
          )}
        </div>
      </div>

      <Row gutter={24}>
        <Col xs={24}>
          <Card title="Academic Calendars" className="mb-4">
            <Table
              columns={calendarColumns as any}
              dataSource={calendars}
              rowKey="id"
              pagination={false}
              loading={calendarsLoading}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col xs={24} md={16}>
          <Card title="Events">
            <Table
              columns={calendarColumns as any}
              dataSource={calendarEvents}
              rowKey="id"
              pagination={false}
              loading={eventsLoading}
              rowClassName={() => 'cursor-pointer hover:bg-gray-50'}
              onRow={(record) => ({ onClick: () => openViewCalendar(record) })}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default CalendarTab
