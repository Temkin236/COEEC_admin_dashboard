"use client"

import React, { useEffect, useState } from "react"
import { Tabs, Modal, Button } from "antd"
import Editphoto from "@/pages/profile/EditProfile"
import ExperiencePage from "@/pages/profile/ExperiencePage"
import EducationPage from "@/pages/profile/EducationPage"
import ConnectPage from "@/pages/profile/Connect"
import { useAppSelector } from "@/store/hooks"

const { TabPane } = Tabs

function profileTabs() {
  const { user } = useAppSelector((s) => s.auth)
    // fallback to localStorage in case Redux isn't populated yet
    const storedAuthUser = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null
    const parsedAuthUser = storedAuthUser ? JSON.parse(storedAuthUser) : null
    const currentUser = user || parsedAuthUser
  const [activeKey, setActiveKey] = useState<string>("edit")
  const [showSetupModal, setShowSetupModal] = useState(false)
  const [setupAccepted, setSetupAccepted] = useState(false)

  useEffect(() => {
    // Determine staff id from auth_user payload or legacy keys. If missing, ask user to set up photo.
    const stored = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null
    const parsed = stored ? JSON.parse(stored) : null
    const staffIdFromAuth = parsed ? (parsed.staffId || parsed.staff_id ) : null
   
    if (!staffIdFromAuth) setShowSetupModal(true)
    console.log("photoTabs - resolved staffId:", staffIdFromAuth)
  }, [])
  return (
    <div className="p-4 lg:p-6">
      {(!showSetupModal || setupAccepted) && (
        <Tabs activeKey={activeKey} onChange={(k) => setActiveKey(k)} type="line">
        <TabPane tab="Edit photo" key="edit">
          <Editphoto />
        </TabPane>
        <TabPane tab="Experience" key="experience">
          <ExperiencePage />
        </TabPane>
        <TabPane tab="Education" key="education">
          <EducationPage />
        </TabPane>
        <TabPane tab="Connect" key="connect">
          <ConnectPage />
        </TabPane>
        </Tabs>
      )}

      <Modal
        open={showSetupModal}
        title={<div style={{ fontSize: 20, fontWeight: 700 }}>Set up your photo</div>}
        footer={null}
        centered
        width={720}
        closable={false}
        maskClosable={false}
        mask={false}
        wrapClassName="allow-sidebar-click-wrap"
        className="allow-sidebar-click-modal"
      >
        <div style={{ marginBottom: 18, color: '#334155' }}>
          It looks like you don't have a profile yet. Create a photo now to appear in staff listings and enable your profile features.
        </div>
        <div style={{ textAlign: 'right' }}>
          <Button
            type="primary"
            onClick={() => {
              setSetupAccepted(true)
              setShowSetupModal(false)
              setActiveKey("edit")
            }}
            style={{ background: '#17A2B8', borderColor: '#17A2B8' }}
          >
            Set up photo
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default profileTabs
