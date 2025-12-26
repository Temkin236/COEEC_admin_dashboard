"use client"

import React, { useEffect, useState } from "react"
import { Tabs, Modal, Button } from "antd"
import EditProfile from "@/pages/profile/EditProfile"
import ExperiencePage from "@/pages/profile/ExperiencePage"
import EducationPage from "@/pages/profile/EducationPage"
import ExpertisePage from "@/pages/profile/ExpertisePage"
import ConnectPage from "@/pages/profile/Connect"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import axiosInstance from "@/utils/axios"
import { setProfile } from "@/store/slices/profileSlice"

const { TabPane } = Tabs

export default function ProfileTabs() {
  const { user } = useAppSelector((s) => s.auth)
    // fallback to localStorage in case Redux isn't populated yet
    const storedAuthUser = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null
    const parsedAuthUser = storedAuthUser ? JSON.parse(storedAuthUser) : null
    const currentUser = user || parsedAuthUser
  const { data: storedProfile } = useAppSelector((s) => s.profile)
  const [activeKey, setActiveKey] = useState<string>("edit")
  const [showSetupModal, setShowSetupModal] = useState(false)
  const [setupAccepted, setSetupAccepted] = useState(false)

  useEffect(() => {
    // If user is logged in, try to fetch their profile from API. Show setup modal when 404 or required fields missing.
      console.log("ProfileTabs - current user id:", currentUser?.id)
      if (!currentUser) return
    const check = async () => {
      try {
          const res = await axiosInstance.get(`/staff/${currentUser.id}`)
        const prof = res.data
        // store profile in redux (so other parts can use it)
        dispatch(setProfile(prof))
        const required = [prof?.displayName, prof?.title, prof?.departmentId, prof?.email]
        const needsSetup = required.some((v) => !v || v === "")
        setShowSetupModal(needsSetup)
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setShowSetupModal(true)
        } else {
          console.error("Profile fetch error", err)
        }
      }
    }
    check()
  }, [user, storedProfile])
  return (
    <div className="p-4 lg:p-6">
      {(!showSetupModal || setupAccepted) && (
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
      )}

      <Modal
        open={showSetupModal}
        title={<div style={{ fontSize: 20, fontWeight: 700 }}>Set up your profile</div>}
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
          It looks like you don't have a profile yet. Create a profile now to appear in staff listings and enable your profile features.
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
            Set up profile
          </Button>
        </div>
      </Modal>
    </div>
  )
}
