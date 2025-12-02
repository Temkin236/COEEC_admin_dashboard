"use client"

import { useState } from "react"
import { Dropdown, Avatar, Badge, Space, Typography, Button, Layout, Menu } from "antd"
import type { MenuProps } from "antd"
import {
  DashboardOutlined,
  FileTextOutlined,
  TeamOutlined,
  ExperimentOutlined,
  BookOutlined,
  DownloadOutlined,
  MessageOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined,
  GlobalOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons"
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { logout } from "@/store/slices/authSlice"
import { LANGUAGE_LABELS } from "@/utils/constants"

// Pages
import DashboardPage from "@/pages/dashboard/DashboardPage"
import HomePage from "@/pages/content/HomePage"
import AboutPage from "@/pages/content/AboutPage"
import DepartmentsPage from "@/pages/content/DepartmentsPage"
import StaffListPage from "@/pages/staff/StaffListPage"
import StaffFormPage from "@/pages/staff/StaffFormPage"
import ResearchPage from "@/pages/research/ResearchPage"
import PublicationsPage from "@/pages/research/PublicationsPage"
import StudentsPage from "@/pages/students/StudentsPage"
import AlumniPage from "@/pages/students/AlumniPage"
import AcademicPage from "@/pages/academic/AcademicPage"
import DownloadsPage from "@/pages/downloads/DownloadsPage"
import ContactPage from "@/pages/contact/ContactPage"
import ApprovalPage from "@/pages/approval/ApprovalPage"
import SettingsPage from "@/pages/settings/SettingsPage"

const { Header, Sider, Content } = Layout
const { Text } = Typography

type LanguageKey = "en" | "am" | "af"

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAppSelector((state) => state.auth)
  const [currentLanguage, setCurrentLanguage] = useState<LanguageKey>("en")

  const handleLogout = () => {
    dispatch(logout())
    navigate("/login")
  }

  const languageMenu: MenuProps = {
    items: [
      { key: "en", label: "English" },
      { key: "am", label: "አማርኛ" },
      { key: "af", label: "Afaan Oromo" },
    ],
    onClick: ({ key }) => {
      setCurrentLanguage(key as LanguageKey)
      localStorage.setItem("language", key)
    },
  }

  const userMenu: MenuProps = {
    items: [
      {
        key: "profile",
        icon: <UserOutlined />,
        label: "Profile",
        onClick: () => navigate("/settings/profile"),
      },
      {
        key: "settings",
        icon: <SettingOutlined />,
        label: "Settings",
        onClick: () => navigate("/settings"),
      },
      { type: "divider" },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Logout",
        onClick: handleLogout,
        danger: true,
      },
    ],
  }

  const menuItems: MenuProps["items"] = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: "content",
      icon: <FileTextOutlined />,
      label: "Content",
      children: [
        { key: "/content/homepage", label: <Link to="/content/homepage">Homepage</Link> },
        { key: "/content/about", label: <Link to="/content/about">About</Link> },
        { key: "/content/departments", label: <Link to="/content/departments">Departments</Link> },
      ],
    },
    {
      key: "staff",
      icon: <TeamOutlined />,
      label: "Staff",
      children: [
        { key: "/staff", label: <Link to="/staff">All Staff</Link> },
        { key: "/staff/new", label: <Link to="/staff/new">Add Staff</Link> },
      ],
    },
    {
      key: "research",
      icon: <ExperimentOutlined />,
      label: "Research",
      children: [
        { key: "/research", label: <Link to="/research">Projects</Link> },
        { key: "/research/publications", label: <Link to="/research/publications">Publications</Link> },
      ],
    },
    {
      key: "students",
      icon: <BookOutlined />,
      label: "Students",
      children: [
        { key: "/students", label: <Link to="/students">Students</Link> },
        { key: "/students/alumni", label: <Link to="/students/alumni">Alumni</Link> },
      ],
    },
    {
      key: "/academic",
      icon: <BookOutlined />,
      label: <Link to="/academic">Academic Info</Link>,
    },
    {
      key: "/downloads",
      icon: <DownloadOutlined />,
      label: <Link to="/downloads">Downloads</Link>,
    },
    {
      key: "/contact",
      icon: <MessageOutlined />,
      label: <Link to="/contact">Contact & Feedback</Link>,
    },
    {
      key: "/approval",
      icon: <FileTextOutlined />,
      label: <Link to="/approval">Approvals</Link>,
    },
  ]

  const getSelectedKeys = () => {
    const path = location.pathname
    if (path === "/") return ["/"]

    for (const item of menuItems ?? []) {
      if (item && "children" in item && item.children) {
        for (const child of item.children) {
          if (typeof child !== "string" && path.startsWith(String(child.key))) {
            return [String(child.key)]
          }
        }
      } else if (item && typeof item !== "string" && path.startsWith(String(item.key))) {
        return [String(item.key)]
      }
    }
    return ["/"]
  }

  return (
    <Layout className="min-h-screen bg-[#f7f9fc]">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        breakpoint="lg"
        collapsedWidth={64}
        className="shadow-lg"
        style={{ background: "#ffffff" }}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          {!collapsed ? (
            <div className="text-center">
              <div className="text-[#1e3a5f] font-bold text-lg">COEEC</div>
              <div className="text-xs text-gray-500">Admin CMS</div>
            </div>
          ) : (
            <div className="text-[#1e3a5f] font-bold text-xl">C</div>
          )}
        </div>
        <Menu mode="inline" selectedKeys={getSelectedKeys()} items={menuItems} className="border-r-0" />
      </Sider>

      <Layout>
        <Header className="bg-white shadow-sm px-4 md:px-6 flex items-center justify-between">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-lg"
          />

          <Space size="middle">
            <Dropdown menu={languageMenu} placement="bottomRight">
              <Button type="text" icon={<GlobalOutlined />}>
                {LANGUAGE_LABELS[currentLanguage]}
              </Button>
            </Dropdown>

            <Badge count={5}>
              <Button type="text" icon={<BellOutlined />} />
            </Badge>

            <Dropdown menu={userMenu} placement="bottomRight">
              <Space className="cursor-pointer">
                <Avatar style={{ backgroundColor: "#1e3a5f" }}>{user?.name?.charAt(0) || "U"}</Avatar>
                <div className="hidden md:block">
                  <div className="text-sm font-medium">{user?.name || "User"}</div>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content className="m-3 md:m-6">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/content/homepage" element={<HomePage />} />
            <Route path="/content/about" element={<AboutPage />} />
            <Route path="/content/departments" element={<DepartmentsPage />} />
            <Route path="/staff" element={<StaffListPage />} />
            <Route path="/staff/new" element={<StaffFormPage />} />
            <Route path="/staff/:id" element={<StaffFormPage />} />
            <Route path="/research" element={<ResearchPage />} />
            <Route path="/research/publications" element={<PublicationsPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/students/alumni" element={<AlumniPage />} />
            <Route path="/academic" element={<AcademicPage />} />
            <Route path="/downloads" element={<DownloadsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/approval" element={<ApprovalPage />} />
            <Route path="/settings/*" element={<SettingsPage />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

export default DashboardLayout
