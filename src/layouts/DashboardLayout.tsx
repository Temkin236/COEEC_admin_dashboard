import { useState } from "react"
import { Layout, Menu, Dropdown, Avatar, Badge, Space, Button, Drawer, List, Typography } from "antd"
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
import HomeAdminPage from "@/pages/content/HomeAdminPage"
import AboutAdminPage from "@/pages/content/AboutAdminPage"
import StaffListPage from "@/pages/staff/StaffListPage"
import StaffFormPage from "@/pages/staff/StaffFormPage"
import ResearchPage from "@/pages/research/ResearchPage"
import PublicationsPage from "@/pages/research/PublicationsPage"
import StudentsPage from "@/pages/students/StudentsPage"
import AlumniPage from "@/pages/students/AlumniPage"
import StudentLifePage from "@/pages/students/StudentLifePage"
import ClubsPage from "@/pages/students/ClubsPage"
import CareersPage from "@/pages/students/CareersPage"
import AcademicPage from "@/pages/academic/AcademicPage"
import DownloadsPage from "@/pages/downloads/DownloadsPage"
import ContactPage from "@/pages/contact/ContactPage"
import ApprovalPage from "@/pages/approval/ApprovalPage"
import SettingsPage from "@/pages/settings/SettingsPage"
import RolesPage from "@/pages/roles/RolesPage"
import RoleFormPage from "@/pages/roles/RoleFormPage"

const { Header, Sider, Content } = Layout

const HEADER_TEXT: Record<LanguageKey, { title: string; subtitle: string }> = {
  en: {
    title: "COEEC",
    subtitle: "College of Electrical and Computing",
  },
  am: {
    title: "COEEC",
    subtitle: "የኤሌክትሪክ እና ኮምፒዩቲንግ ኮሌጅ",
  },
  af: {
    title: "COEEC",
    subtitle: "Kolleejjii Elektirikaa fi Computing",
  },
}

const DashboardLayout = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAppSelector((state) => state.auth)
  const { language: currentLanguage, setLanguage } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const notifications = [
    { id: 1, title: "New staff member added", description: "A new staff profile was created." },
    { id: 2, title: "Pending content approval", description: "There are pages awaiting review." },
  ]

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
        { key: "/content/homepage", label: <Link to="/content/homepage-admin">{SIDEBAR_TEXT[currentLanguage].homepage}</Link> },
        { key: "/content/about-admin", label: <Link to="/content/about-admin">{SIDEBAR_TEXT[currentLanguage].about}</Link> },
        { key: "/content/departments", label: <Link to="/content/departments">{SIDEBAR_TEXT[currentLanguage].departments}</Link> },
      ],
    },
    {
      key: "staff",
      icon: <TeamOutlined />,
      label: SIDEBAR_TEXT[currentLanguage].staff,
      children: [
        { key: "/staff", label: <Link to="/staff">{SIDEBAR_TEXT[currentLanguage].staffAll}</Link> },
        { key: "/staff/new", label: <Link to="/staff/new">{SIDEBAR_TEXT[currentLanguage].staffAdd}</Link> }
     
      ],
    },
     {
      key: "roles",
      icon: <TeamOutlined />,
      label: "Roles",
      children: [
        { key: "/roles", label: <Link to="/roles">View Roles</Link> },
        { key: "/roles/create", label: <Link to="/roles/create">Create Role</Link> },
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
        { key: "/students/life", label: <Link to="/students/life">{SIDEBAR_TEXT[currentLanguage].studentsLife}</Link> },
        { key: "/students/clubs", label: <Link to="/students/clubs">{SIDEBAR_TEXT[currentLanguage].studentsClubs}</Link> },
        { key: "/students/careers", label: <Link to="/students/careers">{SIDEBAR_TEXT[currentLanguage].studentsCareers}</Link> },
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
      {/* Desktop sidebar; hidden on mobile */}
      <Sider
        width={240}
        theme="light"
        style={{ height: "100vh", position: "sticky", top: 0, left: 0 }}
        className="hidden md:block"
      >
        <div className="h-16 flex items-center justify-center border-b border-neutral-200">
          <Link to="/" className="flex items-center gap-2">
            <img src="/downloads/coeec-logo.png" alt="COEEC" className="h-8 w-8 rounded-full object-cover" />
            <span className="text-primary-600 font-semibold tracking-wide text-sm">
              COEEC Admin
            </span>
          </Link>
        </div>
        {/* Scrollable menu area when sidebar content exceeds viewport */}
        <div className="overflow-y-auto" style={{ height: "calc(100vh - 64px)" }}>
          <Menu mode="inline" selectedKeys={getSelectedKeys()} items={menuItems} className="border-r-0" />
        </div>
      </Sider>
      <Layout style={{ height: "100vh", overflow: "hidden" }}>
        <Header className="bg-white sticky top-0 z-50 shadow-sm border-b border-neutral-200 px-3 sm:px-4 md:px-6 flex items-center justify-between">
          {/* Stack header content on small screens */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile: menu button */}
            <Button
              type="text"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              {/* simple hamburger icon using three bars */}
              <span className="block w-5 h-[2px] bg-neutral-700 mb-[3px]"></span>
              <span className="block w-5 h-[2px] bg-neutral-700 mb-[3px]"></span>
              <span className="block w-5 h-[2px] bg-neutral-700"></span>
            </Button>
            <div className="flex items-center gap-2 sm:gap-3 select-none">
              <img
                src="/downloads/coeec-logo.png"
                alt="COEEC"
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover shadow-sm border border-neutral-200"
              />
              <div className="hidden sm:block leading-tight">
                <div className="text-primary-600 font-extrabold tracking-wide text-sm sm:text-base">
                  {HEADER_TEXT[currentLanguage].title}
                </div>
                <div className="text-neutral-600 text-[10px] sm:text-xs uppercase tracking-wide line-clamp-1">
                  {HEADER_TEXT[currentLanguage].subtitle}
                </div>
              </div>
            </div>
          </div>
          <Space size={12} wrap>
            <Dropdown menu={languageMenu} placement="bottomRight">
              <Button type="text" icon={<GlobalOutlined />} className="px-2 sm:px-3">
                {LANGUAGE_LABELS[currentLanguage]}
              </Button>
            </Dropdown>
            <Badge count={notifications.length} overflowCount={99}>
              <Button
                aria-label="Notifications"
                type="text"
                icon={<BellOutlined />}
                onClick={() => setNotificationsOpen(true)}
                className="px-2 sm:px-3"
              />
            </Badge>
            <Dropdown menu={userMenu} placement="bottomRight">
              <Space className="cursor-pointer">
                <Avatar style={{ backgroundColor: "#17A2B8" }}>{user?.name?.charAt(0) || "U"}</Avatar>
                <div className="hidden sm:block">
                  <div className="text-xs sm:text-sm font-medium">{user?.name || "User"}</div>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        {/* Notifications Drawer */}
        <Content className="m-0 md:m-2" style={{ overflow: "auto", height: "calc(100vh - 64px)" }}>
          <Drawer
            title="Notifications"
            placement="right"
            open={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
            size="large"
          >
            {notifications.length === 0 ? (
              <Typography.Text type="secondary">No notifications yet.</Typography.Text>
            ) : (
              <List
                itemLayout="vertical"
                dataSource={notifications}
                renderItem={(item) => (
                  <List.Item key={item.id}>
                    <List.Item.Meta
                      title={<span className="font-medium">{item.title}</span>}
                      description={<span className="text-sm text-gray-500">{item.description}</span>}
                    />
                  </List.Item>
                )}
              />
            )}
          </Drawer>
        {/* Mobile navigation drawer */}
          <Drawer
            title={SIDEBAR_TEXT[currentLanguage].dashboard}
            placement="left"
            getContainer={false}
            maskClosable
            size="default"
            open={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            className="md:hidden"
          >
            <Menu
              mode="inline"
              selectedKeys={getSelectedKeys()}
              items={menuItems}
              className="[&_.ant-menu-item]:py-2 [&_.ant-menu-item]:text-sm"
            />
          </Drawer>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/content/homepage" element={<HomePage />} />
            <Route path="/content/homepage-admin" element={<HomeAdminPage />} />
            <Route path="/content/about-admin" element={<AboutAdminPage />} />
            <Route path="/content/about" element={<AboutPage />} />
            <Route path="/content/departments" element={<DepartmentsPage />} />
            <Route path="/staff" element={<StaffListPage />} />
            <Route path="/staff/new" element={<StaffFormPage />} />
            <Route path="/staff/:id" element={<StaffFormPage />} />
            <Route path="/research" element={<ResearchPage />} />
            <Route path="/research/publications" element={<PublicationsPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/students/alumni" element={<AlumniPage />} />
            <Route path="/students/life" element={<StudentLifePage />} />
            <Route path="/students/clubs" element={<ClubsPage />} />
            <Route path="/students/careers" element={<CareersPage />} />
            <Route path="/academic" element={<AcademicPage />} />
            <Route path="/downloads" element={<DownloadsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/approval" element={<ApprovalPage />} />
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/roles/create" element={<RoleFormPage />} />
            <Route path="/roles/:id/edit" element={<RoleFormPage />} />
            <Route path="/settings/*" element={<SettingsPage />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

export default DashboardLayout
