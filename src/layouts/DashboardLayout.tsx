import { useState, useMemo } from "react";
import {
  Layout,
  Menu,
  Dropdown,
  Avatar,
  Badge,
  Space,
  Button,
  Drawer,
  List,
  Typography,
} from "antd";
import type { MenuProps } from "antd";
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
  NotificationOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import {
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { checkPermission, checkAnyPermission } from "@/utils/helpers";
import { LANGUAGE_LABELS } from "@/utils/constants";
import { SIDEBAR_TEXT, type LanguageKey } from "@/utils/translations";
import { useLanguage } from "@/contexts/LanguageContext";

// Pages
import DashboardPage from "@/pages/dashboard/DashboardPage";
import DepartmentsPage from "@/pages/content/DepartmentsPage";
import StaffListPage from "@/pages/staff/StaffListPage";
import StaffFormPage from "@/pages/staff/StaffFormPage";
import ResearchPage from "@/pages/research/ResearchPage";
import PublicationsPage from "@/pages/research/PublicationsPage";
import AboutPage from "@/pages/content/AboutPage";
import AboutAdminPage from "@/pages/content/AboutAdminPage";
/* Students pages removed from layout: /students route and submenu */
import AcademicPage from "@/pages/academic/AcademicPage";
import DownloadsPage from "@/pages/downloads/DownloadsPage";
import ContactPage from "@/pages/contact/ContactPage";
import SettingsPage from "@/pages/settings/SettingsPage";
import RolesPage from "@/pages/roles/RolesPage";
import RoleFormPage from "@/pages/roles/RoleFormPage";
import UsersPage from "@/pages/users/UsersPage";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import NewsPage from "@/pages/news/newsPage";
import EventsPage from "@/pages/events/eventsPage";
import EditProfile from "@/pages/profile/EditProfile"
import ExperiencePage from "@/pages/profile/ExperiencePage"
import EducationPage from "@/pages/profile/EducationPage"
import ConnectPage from "@/pages/profile/Connect"
import ProfileTabs from "@/pages/profile/ProfileTabs"


const { Header, Sider, Content } = Layout;

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
};

const DashboardLayout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const { language: currentLanguage, setLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifications = [
    {
      id: 1,
      title: "New staff member added",
      description: "A new staff profile was created.",
    },
    {
      id: 2,
      title: "Pending content approval",
      description: "There are pages awaiting review.",
    },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const languageMenu: MenuProps = {
    items: [
      { key: "en", label: "English" },
      { key: "am", label: "አማርኛ" },
      { key: "af", label: "Afaan Oromo" },
    ],
    onClick: ({ key }) => {
      setLanguage(key as LanguageKey);
    },
  };

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
  };

  const menuItems: MenuProps["items"] = useMemo(() => {
    const permissions = user?.permissions || [];
    const items: MenuProps["items"] = [];

    // Debug logging - show actual permissions and targeted checks
    console.log("User info:", {
      role: user?.role,
      permissionsCount: permissions.length,
      permissions: permissions,
      email: user?.email,
    });
    console.log("Permission checks:", {
      staff_view: checkPermission(permissions, "staff", "view"),
      departments_view: checkPermission(permissions, "departments", "view"),
      any_staff_actions: checkAnyPermission(permissions, [
        ["staff", "view"],
        ["staff", "create"],
        ["staff", "update"],
      ]),
    });

    // Dashboard - always visible
    items.push({
      key: "/",
      icon: <DashboardOutlined />,
      label: <Link to="/">{SIDEBAR_TEXT[currentLanguage].dashboard}</Link>,
    });

    // Departments as top-level
    if (checkPermission(permissions, "departments", "view")) {
      items.push({
        key: "departments",
        icon: <FileTextOutlined />,
        label: (
          <Link to="/content/departments">
            {SIDEBAR_TEXT[currentLanguage].departments}
          </Link>
        ),
      });
    }

    // Staff Management
    if (
      checkAnyPermission(permissions, [
        ["staff", "view"],
        ["staff", "create"],
        ["staff", "update"],
      ])
    ) {
      const staffChildren: any[] = [];
      if (checkPermission(permissions, "staff", "view")) {
        staffChildren.push({
          key: "/staff",
          label: (
            <Link to="/staff">{SIDEBAR_TEXT[currentLanguage].staffAll}</Link>
          ),
        });
      }
      if (checkPermission(permissions, "staff", "create")) {
        staffChildren.push({
          key: "/staff/new",
          label: (
            <Link to="/staff/new">
              {SIDEBAR_TEXT[currentLanguage].staffAdd}
            </Link>
          ),
        });
      }
      if (staffChildren.length > 0) {
        items.push({
          key: "staff",
          icon: <TeamOutlined />,
          label: SIDEBAR_TEXT[currentLanguage].staff,
          children: staffChildren,
        });
      }
    }

    // Profile (personal) - visible to all authenticated users
    items.push({
      key: "/profile",
      icon: <UserOutlined />,
      label: <Link to="/profile">Profile</Link>,
    });

    // Roles Management
    if (
      checkAnyPermission(permissions, [
        ["roles", "view"],
        ["roles", "create"],
        ["roles", "assign"],
      ])
    ) {
      const rolesChildren: any[] = [];
      if (checkPermission(permissions, "roles", "view")) {
        rolesChildren.push({
          key: "/roles",
          label: <Link to="/roles">View Roles</Link>,
        });
      }
      if (checkPermission(permissions, "roles", "create")) {
        rolesChildren.push({
          key: "/roles/create",
          label: <Link to="/roles/create">Create Role</Link>,
        });
      }
      if (rolesChildren.length > 0) {
        items.push({
          key: "roles",
          icon: <TeamOutlined />,
          label: "Roles",
          children: rolesChildren,
        });
      }
    }

    // Users Management
    if (checkPermission(permissions, "users", "view")) {
      items.push({
        key: "users",
        icon: <UserOutlined />,
        label: "Users",
        children: [
          { key: "/users", label: <Link to="/users">All Users</Link> },
        ],
      });
    }

    // Research & Publications
    if (
      checkAnyPermission(permissions, [
        ["research", "view"],
        ["publications", "view"],
      ])
    ) {
      const researchChildren: any[] = [];
      if (checkPermission(permissions, "research", "view")) {
        researchChildren.push({
          key: "/research",
          label: (
            <Link to="/research">
              {SIDEBAR_TEXT[currentLanguage].researchProjects}
            </Link>
          ),
        });
      }
      if (checkPermission(permissions, "publications", "view")) {
        researchChildren.push({
          key: "/research/publications",
          label: (
            <Link to="/research/publications">
              {SIDEBAR_TEXT[currentLanguage].researchPublications}
            </Link>
          ),
        });
      }
      if (researchChildren.length > 0) {
        items.push({
          key: "research",
          icon: <ExperimentOutlined />,
          label: SIDEBAR_TEXT[currentLanguage].research,
          children: researchChildren,
        });
      }
    }

    // About (public page) - visible to all authenticated users (no permission required)
    items.push({
      key: "/content/about",
      icon: <FileTextOutlined />,
      label: <Link to="/content/about">{SIDEBAR_TEXT[currentLanguage].about}</Link>,
    });

    // Students section removed

    // Academic - courses, programs, calendar
    if (
      checkAnyPermission(permissions, [
        ["courses", "view"],
        ["programs", "view"],
        ["calendar", "view"],
      ])
    ) {
      items.push({
        key: "/academic",
        icon: <BookOutlined />,
        label: (
          <Link to="/academic">{SIDEBAR_TEXT[currentLanguage].academic}</Link>
        ),
      });
    }

    // Downloads
    if (checkPermission(permissions, "downloads", "view")) {
      items.push({
        key: "/downloads",
        icon: <DownloadOutlined />,
        label: (
          <Link to="/downloads">{SIDEBAR_TEXT[currentLanguage].downloads}</Link>
        ),
      });
    }

    // News
    if (
      checkAnyPermission(permissions, [
        ["news", "view"],
        ["news", "create"],
        ["news", "update"],
      ])
    ) {
      items.push({
        key: "/news",
        icon: <NotificationOutlined />,
        label: <Link to="/news">{SIDEBAR_TEXT[currentLanguage].news}</Link>,
      });
    }

    // Events
    if (
      checkAnyPermission(permissions, [
        ["events", "view"],
        ["events", "create"],
        ["events", "update"],
      ])
    ) {
      items.push({
        key: "/events",
        icon: <CalendarOutlined />,
        label: <Link to="/events">{SIDEBAR_TEXT[currentLanguage].events}</Link>,
      });
    }

    // Contact - visible to all (public contact form + admin view inside page)
    items.push({
      key: "/contact",
      icon: <MessageOutlined />,
      label: <Link to="/contact">{SIDEBAR_TEXT[currentLanguage].contact}</Link>,
    });

    return items;
  }, [user?.permissions, currentLanguage]);

  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path === "/") return ["/"];
    for (const item of menuItems ?? []) {
      if (item && "children" in item && item.children) {
        for (const child of item.children) {
          if (typeof child !== "string" && path.startsWith(String(child.key)))
            return [String(child.key)];
        }
      } else if (
        item &&
        typeof item !== "string" &&
        path.startsWith(String(item.key))
      ) {
        return [String(item.key)];
      }
    }
    return ["/"];
  };

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
            <img
              src="/downloads/coeec-logo.png"
              alt="COEEC"
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="text-primary-600 font-semibold tracking-wide text-sm">
              COEEC Admin
            </span>
          </Link>
        </div>
        {/* Scrollable menu area when sidebar content exceeds viewport */}
        <div
          className="overflow-y-auto"
          style={{ height: "calc(100vh - 64px)" }}
        >
          <Menu
            mode="inline"
            selectedKeys={getSelectedKeys()}
            items={menuItems}
            className="border-r-0"
          />
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
              <Button
                type="text"
                icon={<GlobalOutlined />}
                className="px-2 sm:px-3"
              >
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
                <Avatar style={{ backgroundColor: "#17A2B8" }}>
                  {user?.name?.charAt(0) || "U"}
                </Avatar>
                <div className="hidden sm:block">
                  <div className="text-xs sm:text-sm font-medium">
                    {user?.name || "User"}
                  </div>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        {/* Notifications Drawer */}
        <Content
          className="m-0 md:m-2"
          style={{ overflow: "auto", height: "calc(100vh - 64px)" }}
        >
          <Drawer
            title="Notifications"
            placement="right"
            open={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
            size="large"
          >
            {notifications.length === 0 ? (
              <Typography.Text type="secondary">
                No notifications yet.
              </Typography.Text>
            ) : (
              <List
                itemLayout="vertical"
                dataSource={notifications}
                renderItem={(item) => (
                  <List.Item key={item.id}>
                    <List.Item.Meta
                      title={<span className="font-medium">{item.title}</span>}
                      description={
                        <span className="text-sm text-gray-500">
                          {item.description}
                        </span>
                      }
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

            {/* Content pages removed (homepage/about) per project requirement */}
            <Route
              path="/content/departments"
              element={
                <ProtectedRoute requiredPermission={["departments", "view"]}>
                  <DepartmentsPage />
                </ProtectedRoute>
              }
            />

            {/* Staff Management */}
            <Route
              path="/staff"
              element={
                <ProtectedRoute requiredPermission={["staff", "view"]}>
                  <StaffListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/new"
              element={
                <ProtectedRoute requiredPermission={["staff", "create"]}>
                  <StaffFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/:id"
              element={
                <ProtectedRoute
                  requiredAnyPermissions={[
                    ["staff", "view"],
                    ["staff", "update"],
                  ]}
                >
                  <StaffFormPage />
                </ProtectedRoute>
              }
            />

            {/* Research & Publications */}
            <Route
              path="/research"
              element={
                <ProtectedRoute requiredPermission={["research", "view"]}>
                  <ResearchPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/research/publications"
              element={
                <ProtectedRoute requiredPermission={["publications", "view"]}>
                  <PublicationsPage />
                </ProtectedRoute>
              }
            />

            {/* Students routes removed */}

            {/* Academic (courses, programs, calendar) */}
            <Route
              path="/academic"
              element={
                <ProtectedRoute
                  requiredAnyPermissions={[
                    ["courses", "view"],
                    ["programs", "view"],
                    ["calendar", "view"],
                  ]}
                >
                  <AcademicPage />
                </ProtectedRoute>
              }
            />

            {/* Downloads */}
            <Route
              path="/downloads"
              element={
                <ProtectedRoute requiredPermission={["downloads", "view"]}>
                  <DownloadsPage />
                </ProtectedRoute>
              }
            />

            {/* News */}
            <Route
              path="/news"
              element={
                <ProtectedRoute
                  requiredAnyPermissions={[
                    ["news", "view"],
                    ["news", "create"],
                    ["news", "update"],
                  ]}
                >
                  <NewsPage />
                </ProtectedRoute>
              }
            />

            {/* Events */}
            <Route
              path="/events"
              element={
                <ProtectedRoute
                  requiredAnyPermissions={[
                    ["events", "view"],
                    ["events", "create"],
                    ["events", "update"],
                  ]}
                >
                  <EventsPage />
                </ProtectedRoute>
              }
            />

            {/* Contact - public page: shows form for public users, admin UI for users with contact.view */}
            <Route path="/contact" element={<ContactPage />} />

            {/* Public About page (no permission required) */}
            <Route path="/content/about" element={<AboutPage />} />

            {/* Admin editor for About page */}
            <Route
              path="/content/about/admin"
              element={
                <ProtectedRoute
                  requiredAnyPermissions={[
                    ["departments", "update"],
                    ["news", "update"],
                    ["research", "update"],
                  ]}
                >
                  <AboutAdminPage />
                </ProtectedRoute>
              }
            />

            {/* Approval route removed per project requirement */}

            {/* Roles Management */}
            <Route
              path="/roles"
              element={
                <ProtectedRoute requiredPermission={["roles", "view"]}>
                  <RolesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/roles/create"
              element={
                <ProtectedRoute requiredPermission={["roles", "create"]}>
                  <RoleFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/roles/:id/edit"
              element={
                <ProtectedRoute
                  requiredAnyPermissions={[
                    ["roles", "view"],
                    ["roles", "create"],
                  ]}
                >
                  <RoleFormPage />
                </ProtectedRoute>
              }
            />

            {/* Users Management */}
            <Route
              path="/users"
              element={
                <ProtectedRoute requiredPermission={["users", "view"]}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />

            {/* Settings - accessible to all authenticated users for profile */}
            <Route path="/settings/*" element={<SettingsPage />} />
            {/* Profile pages */}
            <Route path="/profile" element={<ProfileTabs />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/profile/experience" element={<ExperiencePage />} />
            <Route path="/profile/education" element={<EducationPage />} />
            <Route path="/profile/connect" element={<ConnectPage />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
