"use client"

import React, { useEffect, useState } from "react"
import { Tabs, Modal, Button } from "antd"
import EditProfile from "@/pages/profile/EditProfile"
import ExperiencePage from "@/pages/profile/ExperiencePage"
import EducationPage from "@/pages/profile/EducationPage"
import ExpertisePage from "@/pages/profile/ExpertisePage"
import ConnectPage from "@/pages/profile/Connect"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { fetchProfile } from "@/store/slices/profileSlice"

const { TabPane } = Tabs

export default function ProfileTabs() {
  const { user } = useAppSelector((s) => s.auth)
  const { data: storedProfile } = useAppSelector((s) => s.profile)
  const [activeKey, setActiveKey] = useState<string>("edit")
  const [showSetupModal, setShowSetupModal] = useState(false)

  useEffect(() => {
    // If user is logged in, try to fetch their profile; show modal when absent or incomplete
    if (!user) return
    const dispatch = useAppDispatch()
    // attempt to load profile for this user
    if (!storedProfile) dispatch(fetchProfile(user.id))
    const needsSetup = (() => {
      if (!storedProfile) return true
      const required = [
        (storedProfile as any)?.displayName,
        (storedProfile as any)?.title,
        (storedProfile as any)?.departmentId,
        (storedProfile as any)?.email,
      ]
      return required.some((v) => !v || v === "")
    })()
    if (needsSetup) setShowSetupModal(true)
  }, [user, storedProfile])
  return (
    <div className="p-4 lg:p-6">
      <Tabs activeKey={activeKey} onChange={(k) => setActiveKey(k)} type="line">
        <TabPane tab="Edit Profile" key="edit">
          <EditProfile />
        </TabPane>
        <TabPane tab="Experience" key="experience">
          <ExperiencePage />
        </TabPane>
        <TabPane tab="Education" key="education">
          <EducationPage />
        </TabPane>
        <TabPane tab="Expertise" key="expertise">
          <ExpertisePage />
        </TabPane>
        <TabPane tab="Connect" key="connect">
          <ConnectPage />
        </TabPane>
      </Tabs>

      <Modal
        open={showSetupModal}
        title={<div style={{ fontSize: 20, fontWeight: 700 }}>Set up your profile</div>}
        footer={null}
        centered
        width={720}
        onCancel={() => setShowSetupModal(false)}
      >
        <div style={{ marginBottom: 18, color: '#334155' }}>
          It looks like you don't have a profile yet. Create a profile now to appear in staff listings and enable your profile features.
        </div>
        <div style={{ textAlign: 'right' }}>
          <Button type="primary" onClick={() => { setShowSetupModal(false); setActiveKey('edit') }} style={{ background: '#17A2B8', borderColor: '#17A2B8' }}>
            Set up profile
          </Button>
        </div>
      </Modal>
    </div>
  )
}
