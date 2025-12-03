import React from "react"
import ReactDOM from "react-dom/client"
import { Provider } from "react-redux"
import { BrowserRouter } from "react-router-dom"
import { ConfigProvider, ThemeConfig } from "antd"
import App from "./App"
import { store } from "./store"
import "./index.css"
import { LanguageProvider } from "./contexts/LanguageContext"

// Theme tuned to match ASTU COEEC look-and-feel (navy primary, soft grays)
const theme: ThemeConfig = {
  token: {
    // ASTU COEEC palette: deep navy + gold accent
    colorPrimary: "#163b6b",
    colorInfo: "#163b6b",
    colorWarning: "#fdbc2c",
    wireframe: false,
    borderRadius: 8,
    fontSize: 14,
    colorBgLayout: "#f8fafc",
    colorText: "#1f2937",
    colorLink: "#163b6b",
    colorLinkHover: "#1f4a7f",
    colorPrimaryHover: "#1f4a7f",
    colorPrimaryActive: "#122e53",
  },
  components: {
    Layout: {
      headerBg: "#ffffff",
      siderBg: "#ffffff",
    },
    Menu: {
      itemSelectedBg: "#eaf2ff",
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
      colorPrimary: "#163b6b",
      colorPrimaryHover: "#1f4a7f",
      colorPrimaryActive: "#122e53",
    },
    Table: {
      headerBg: "#f0f6ff",
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
      <LanguageProvider>
        <BrowserRouter>
          <ConfigProvider theme={theme}>
            <App />
          </ConfigProvider>
        </BrowserRouter>
      </LanguageProvider>
    </Provider>
  </React.StrictMode>,
)
