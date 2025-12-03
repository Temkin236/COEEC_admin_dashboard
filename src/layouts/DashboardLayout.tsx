import { useState } from "react"
import { Layout, Menu, Dropdown, Avatar, Badge, Space, Button } from "antd"
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
} from "@ant-design/icons"
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { logout } from "@/store/slices/authSlice"
import { LANGUAGE_LABELS } from "@/utils/constants"
import { SIDEBAR_TEXT, type LanguageKey } from "@/utils/translations"
import { useLanguage } from "@/contexts/LanguageContext"

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

const HEADER_TEXT: Record<LanguageKey, { title: string; subtitle: string }> = {
  en: {
    title: "COEEC",
    subtitle: "College of Electrical Engineering",
  },
  am: {
    title: "ኮኢኢኢሲ",
    subtitle: "የኤሌክትሪክ መምህራን ኮሌጅ",
  },
  af: {
    title: "COEEC",
    subtitle: "Kolleejjii Injinariingii Elektirikaa",
  },
}

const DashboardLayout = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAppSelector((state) => state.auth)
  const { language: currentLanguage, setLanguage } = useLanguage()

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
      setLanguage(key as LanguageKey)
    },
  }

  const userMenu: MenuProps = {
    items: [
      { key: "profile", icon: <UserOutlined />, label: "Profile", onClick: () => navigate("/settings/profile") },
      { key: "settings", icon: <SettingOutlined />, label: "Settings", onClick: () => navigate("/settings") },
      { type: "divider" },
      { key: "logout", icon: <LogoutOutlined />, label: "Logout", onClick: handleLogout, danger: true },
    ],
  }

  const menuItems: MenuProps["items"] = [
    { key: "/", icon: <DashboardOutlined />, label: <Link to="/">{SIDEBAR_TEXT[currentLanguage].dashboard}</Link> },
    {
      key: "content",
      icon: <FileTextOutlined />,
      label: SIDEBAR_TEXT[currentLanguage].content,
      children: [
        { key: "/content/homepage", label: <Link to="/content/homepage">{SIDEBAR_TEXT[currentLanguage].homepage}</Link> },
        { key: "/content/about", label: <Link to="/content/about">{SIDEBAR_TEXT[currentLanguage].about}</Link> },
        { key: "/content/departments", label: <Link to="/content/departments">{SIDEBAR_TEXT[currentLanguage].departments}</Link> },
      ],
    },
    {
      key: "staff",
      icon: <TeamOutlined />,
      label: SIDEBAR_TEXT[currentLanguage].staff,
      children: [
        { key: "/staff", label: <Link to="/staff">{SIDEBAR_TEXT[currentLanguage].staffAll}</Link> },
        { key: "/staff/new", label: <Link to="/staff/new">{SIDEBAR_TEXT[currentLanguage].staffAdd}</Link> },
      ],
    },
    {
      key: "research",
      icon: <ExperimentOutlined />,
      label: SIDEBAR_TEXT[currentLanguage].research,
      children: [
        { key: "/research", label: <Link to="/research">{SIDEBAR_TEXT[currentLanguage].researchProjects}</Link> },
        { key: "/research/publications", label: <Link to="/research/publications">{SIDEBAR_TEXT[currentLanguage].researchPublications}</Link> },
      ],
    },
    {
      key: "students",
      icon: <BookOutlined />,
      label: SIDEBAR_TEXT[currentLanguage].students,
      children: [
        { key: "/students", label: <Link to="/students">{SIDEBAR_TEXT[currentLanguage].studentsAll}</Link> },
        { key: "/students/alumni", label: <Link to="/students/alumni">{SIDEBAR_TEXT[currentLanguage].studentsAlumni}</Link> },
      ],
    },
    { key: "/academic", icon: <BookOutlined />, label: <Link to="/academic">{SIDEBAR_TEXT[currentLanguage].academic}</Link> },
    { key: "/downloads", icon: <DownloadOutlined />, label: <Link to="/downloads">{SIDEBAR_TEXT[currentLanguage].downloads}</Link> },
    { key: "/contact", icon: <MessageOutlined />, label: <Link to="/contact">{SIDEBAR_TEXT[currentLanguage].contact}</Link> },
    { key: "/approval", icon: <FileTextOutlined />, label: <Link to="/approval">{SIDEBAR_TEXT[currentLanguage].approvals}</Link> },
  ]

  const getSelectedKeys = () => {
    const path = location.pathname
    if (path === "/") return ["/"]
    for (const item of menuItems ?? []) {
      if (item && "children" in item && item.children) {
        for (const child of item.children) {
          if (typeof child !== "string" && path.startsWith(String(child.key))) return [String(child.key)]
        }
      } else if (item && typeof item !== "string" && path.startsWith(String(item.key))) {
        return [String(item.key)]
      }
    }
    return ["/"]
  }

  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      <Sider width={240} theme="light" style={{ height: "100vh", position: "sticky", top: 0, left: 0 }}>
        <div className="h-16 flex items-center justify-center border-b border-neutral-200">
          <Link to="/" className="flex items-center gap-2">
            <img src="/downloads/coeec-logo.png" alt="COEEC" className="h-8 w-8 rounded-full object-cover" />
            <span className="text-primary font-semibold tracking-wide text-sm">
              COEEC Admin
            </span>
          </Link>
        </div>
        <Menu mode="inline" selectedKeys={getSelectedKeys()} items={menuItems} className="border-r-0" />
      </Sider>
      <Layout style={{ height: "100vh", overflow: "hidden" }}>
        <Header className="bg-white sticky top-0 z-50 shadow-sm border-b border-neutral-200 px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 select-none">
              <img
                src="/downloads/coeec-logo.png"
                alt="COEEC"
                className="h-8 w-8 rounded-full object-cover shadow-sm border border-neutral-200"
              />
              <div className="hidden md:block leading-tight">
                <div className="text-primary font-extrabold tracking-wide text-base">
                  {HEADER_TEXT[currentLanguage].title}
                </div>
                <div className="text-neutral-600 text-xs uppercase tracking-wide">
                  {HEADER_TEXT[currentLanguage].subtitle}
                </div>
              </div>
            </div>
          </div>
          <Space size="middle">
            <Dropdown menu={languageMenu} placement="bottomRight">
              <Button type="text" icon={<GlobalOutlined />}>{LANGUAGE_LABELS[currentLanguage]}</Button>
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
        <Content className="m-3 md:m-6" style={{ overflow: "auto", height: "calc(100vh - 64px)" }}>
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
