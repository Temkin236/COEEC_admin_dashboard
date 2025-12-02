import React from "react"
import ReactDOM from "react-dom/client"
import { Provider } from "react-redux"
import { BrowserRouter } from "react-router-dom"
import { ConfigProvider, ThemeConfig } from "antd"
import App from "./App"
import { store } from "./store"
import "./index.css"

// Theme tuned to match ASTU COEEC look-and-feel (navy primary, soft grays)
const theme: ThemeConfig = {
  token: {
    colorPrimary: "#163b6b", // deep navy
    colorInfo: "#1a73e8",
    colorSuccess: "#3fb477",
    colorWarning: "#f7b500",
    colorError: "#e53935",
    wireframe: false,
    borderRadius: 8,
    fontSize: 14,
    colorBgLayout: "#f7f9fc",
    colorText: "#1f2937",
    colorLink: "#1a73e8",
    colorLinkHover: "#1558c4",
    colorPrimaryHover: "#1f6fe0",
    colorPrimaryActive: "#1558c4",
  },
  components: {
    Layout: {
      headerBg: "#ffffff",
      siderBg: "#ffffff",
    },
    Menu: {
      itemSelectedBg: "#e6f0ff",
      itemSelectedColor: "#163b6b",
    },
    Card: {
      // Use modern variants instead of deprecated bordered
      paddingSM: 16,
    },
    Statistic: {
      // Use styles.content over deprecated valueStyle in pages
    },
    Button: {
      colorPrimary: "#1a73e8",
      colorPrimaryHover: "#1f6fe0",
      colorPrimaryActive: "#1558c4",
    },
    Table: {
      headerBg: "#eef5ff",
      headerColor: "#163b6b",
      rowHoverBg: "#f7faff",
      borderColor: "#e5e7eb",
    },
    Tabs: {
      inkBarColor: "#1a73e8",
    },
  },
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ConfigProvider theme={theme}>
          <App />
        </ConfigProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)
