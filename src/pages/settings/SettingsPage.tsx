import { Card, Tabs } from "antd"

const { TabPane } = Tabs

const SettingsPage = () => {
  return (
    <div className="space-y-4">
      <Card title="Settings">
        <Tabs defaultActiveKey="1">
          <TabPane tab="photo" key="1">
            <div className="p-4 text-gray-500">photo settings coming soon...</div>
          </TabPane>
          <TabPane tab="Security" key="2">
            <div className="p-4 text-gray-500">Security settings coming soon...</div>
          </TabPane>
          <TabPane tab="Notifications" key="3">
            <div className="p-4 text-gray-500">Notification preferences coming soon...</div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  )
}

export default SettingsPage
