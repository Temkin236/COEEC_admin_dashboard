"use client"

import { useSelector } from "react-redux"
import { Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./pages/auth/LoginPage"
import DashboardLayout from "./layouts/DashboardLayout"

function App() {
  const { isAuthenticated } = useSelector((state: any) => state.auth)

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/*" element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />} />
    </Routes>
  )
}

export default App
