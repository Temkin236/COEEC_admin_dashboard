"use client"

import { useEffect } from "react"
import { useSelector } from "react-redux"
import { Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./pages/auth/LoginPage"
import DashboardLayout from "./layouts/DashboardLayout"
import { useAppDispatch } from "./store/hooks"
import { validateToken } from "./store/slices/authSlice"
import { Spin } from "antd"

function App() {
  const dispatch = useAppDispatch()
  const { isAuthenticated, loading, user } = useSelector((state: any) => state.auth)
  const token = localStorage.getItem("token")

  // Fetch user data on app load if token exists
  useEffect(() => {
    if (token && !user) {
      dispatch(validateToken())
    }
  }, [dispatch, token, user])

  // Show loading spinner while fetching user data
  if (token && !user && loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
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
