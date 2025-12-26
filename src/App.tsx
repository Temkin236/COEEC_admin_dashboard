"use client"

import React, { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { validateToken } from "@/store/slices/authSlice"
import { Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./pages/auth/LoginPage"
import DashboardLayout from "./layouts/DashboardLayout"

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state: any) => state.auth)

  useEffect(() => {
    // If a token exists in localStorage, validate it with the server to populate Redux auth state
    try {
      const token = localStorage.getItem("token")
      if (token) {
        dispatch((validateToken as any)())
      }
    } catch (e) {
      // ignore
    }
  }, [dispatch])

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/*" element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />} />
    </Routes>
  )
}

export default App
