"use client"

import React, { useEffect, useState } from "react"
import { Tabs, Modal, Button, Card } from "antd"
import Loading from "@/components/common/Loading"
import Editphoto from "@/pages/profile/EditProfile"
import ExperiencePage from "@/pages/profile/ExperiencePage"
import EducationPage from "@/pages/profile/EducationPage"
import ConnectPage from "@/pages/profile/Connect"
import { useAppSelector } from "@/store/hooks"
import { staffApi } from "@/api/staffApi"

const { TabPane } = Tabs

function profileTabs() {
  const { user } = useAppSelector((s) => s.auth)
  const profileData = useAppSelector((s) => s.profile?.data)
  const storedAuthUser = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null
  const parsedAuthUser = storedAuthUser ? JSON.parse(storedAuthUser) : null
  const currentUser = user || parsedAuthUser
  
  const [activeKey, setActiveKey] = useState<string>("edit")
  const [showSetupModal, setShowSetupModal] = useState(false)
  const [setupAccepted, setSetupAccepted] = useState(false)
  const [checkingProfile, setCheckingProfile] = useState(true)

  useEffect(() => {
    const checkProfileExists = async () => {
      try {
        // Get staffId from token first (primary source)
        const staffIdFromToken = parsedAuthUser?.staffId || parsedAuthUser?.staff_id
        const staffIdFromStorage = localStorage.getItem('staffId') || localStorage.getItem('staff_id')
        const staffId = staffIdFromToken || staffIdFromStorage
        
        if (staffId) {
          // We have a staff ID - verify the profile exists in backend
          try {
            const data = await staffApi.fetchStaffById(staffId)
            if (data) {
              console.log('Profile exists for staffId:', staffId)
              // Profile exists! Don't show setup modal
              setShowSetupModal(false)
              // Store staff ID for future use
              if (staffIdFromToken && typeof window !== 'undefined') {
                localStorage.setItem('staffId', staffId)
                localStorage.setItem('staff_id', staffId)
              }
            }
          } catch (error: any) {
            console.log('Profile check error:', error?.response?.status)
            // Profile doesn't exist in backend (404), show setup modal
            if (error?.response?.status === 404) {
              setShowSetupModal(true)
            } else {
              // Other error, don't block user
              setShowSetupModal(false)
            }
          }
        } else {
          // No staff ID in token at all, definitely need to set up
          setShowSetupModal(true)
        }
      } catch (error) {
        // On any error, don't show modal to avoid blocking user
        setShowSetupModal(false)
      } finally {
        setCheckingProfile(false)
      }
    }
    
    checkProfileExists()
  }, [])

  if (checkingProfile) {
    return <Loading />
  }

  return (
    <div className="p-4 lg:p-6">
      {(!showSetupModal || setupAccepted) ? (
        <Card className="shadow-sm">
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
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-lg" style={{ border: '2px dashed #d1d5db', backgroundColor: '#f9fafb' }}>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: '#1e293b' }}>Set up your photo</div>
          <div style={{ marginBottom: 24, color: '#64748b', maxWidth: 500, fontSize: 16 }}>
            It looks like you don't have a profile yet. Create a photo now to appear in staff listings and enable your profile features.
          </div>
          <Button
            type="primary"
            size="large"
            onClick={() => {
              setSetupAccepted(true)
              setShowSetupModal(false)
              setActiveKey("edit")
            }}
            style={{ background: '#17A2B8', borderColor: '#17A2B8', paddingLeft: 32, paddingRight: 32 }}
          >
            Set up photo
          </Button>
        </div>
      )}
    </div>
  )
}

export default profileTabs
