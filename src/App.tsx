"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Routes, Route, Navigate } from "react-router-dom"
import { Layout, Spin } from "antd"
import LoginPage from "./pages/auth/LoginPage"
import DashboardLayout from "./layouts/DashboardLayout"
import { validateToken } from "./store/slices/authSlice"

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, loading } = useSelector((state: any) => state.auth)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      // @ts-ignore
      dispatch(validateToken())
    }
  }, [dispatch])

  if (loading) {
    return (
      <Layout className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </Layout>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/*" element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />} />
    </Routes>
  )
}

export default App
