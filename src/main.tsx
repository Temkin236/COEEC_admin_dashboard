import React from "react"
import ReactDOM from "react-dom/client"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import { BrowserRouter } from "react-router-dom"
import { ConfigProvider, ThemeConfig, Spin } from "antd"
import App from "./App"
import { store, persistor } from "./store"
import "./index.css"
import { LanguageProvider } from "./contexts/LanguageContext"

// Theme tuned to match ASTU COEEC look-and-feel (navy primary, soft grays)
const theme: ThemeConfig = {
  token: {
    // Primary brand color updated to #17A2B8
    colorPrimary: "#17A2B8",
    colorInfo: "#17A2B8",
    colorWarning: "#fdbc2c",
    wireframe: false,
    borderRadius: 8,
    fontSize: 14,
    colorBgLayout: "#f8fafc",
    colorText: "#1f2937",
    colorLink: "#17A2B8",
    colorLinkHover: "#148ea3",
    colorPrimaryHover: "#148ea3",
    colorPrimaryActive: "#117c8f",
  },
  components: {
    Layout: {
      headerBg: "#ffffff",
      siderBg: "#ffffff",
    },
    Menu: {
      itemSelectedBg: "#e6f7fb",
      itemSelectedColor: "#17A2B8",
    },
    Card: {
      // Use modern variants instead of deprecated bordered
      paddingSM: 16,
    },
    Statistic: {
      // Use styles.content over deprecated valueStyle in pages
    },
    Button: {
      colorPrimary: "#17A2B8",
      colorPrimaryHover: "#148ea3",
      colorPrimaryActive: "#117c8f",
    },
    Table: {
      headerBg: "#e6f7fb",
      headerColor: "#17A2B8",
      rowHoverBg: "#f2fbfd",
      borderColor: "#e5e7eb",
    },
    Tabs: {
      inkBarColor: "#17A2B8",
    },
  },
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<div className="flex items-center justify-center min-h-screen"><Spin size="large" /></div>} persistor={persistor}>
        <LanguageProvider>
          <BrowserRouter>
            <ConfigProvider theme={theme}>
              <App />
            </ConfigProvider>
          </BrowserRouter>
        </LanguageProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>,
)
