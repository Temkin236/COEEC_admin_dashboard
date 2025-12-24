import axios, { type AxiosRequestConfig } from "axios"
import { API_BASE_URL } from "./constants"

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
})

axiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem("token")
    // Skip auth for public homepage content fetches
    const isPublicHomepage = config.url === '/content' && config.data && typeof config.data === 'object' && (config.data as any).type === 'homepage'
    if (token && !isPublicHomepage) {
      ;(config.headers as any).Authorization = `Bearer ${token}`
    }

    const language = localStorage.getItem("language") || "en"
    ;(config.headers as any)["Accept-Language"] = language

    return config
  },
  (error) => Promise.reject(error),
)

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || ({} as any)

    if (error.response?.status === 403) {
      // Forbidden - User is authenticated but doesn't have permission
      // or session is invalid in a way that requires re-login
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("auth_user")
      window.location.href = "/login"
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem("refreshToken")
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken })
          const { accessToken, refreshToken: newRefreshToken } = response.data
          localStorage.setItem("token", accessToken)
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken)
          }
          originalRequest.headers = { ...(originalRequest.headers || {}), Authorization: `Bearer ${accessToken}` }
          return axiosInstance(originalRequest)
        } catch (refreshError) {
          // Check if it's a public homepage request, don't redirect
          const isPublicHomepage = originalRequest.url === '/content' && originalRequest.data && typeof originalRequest.data === 'object' && (originalRequest.data as any).type === 'homepage'
          if (!isPublicHomepage) {
            localStorage.removeItem("token")
            localStorage.removeItem("refreshToken")
            localStorage.removeItem("auth_user")
            window.location.href = "/login"
          }
          return Promise.reject(refreshError)
        }
      } else {
        // Check if it's a public homepage request, don't redirect
        const isPublicHomepage = originalRequest.url === '/content' && originalRequest.data && typeof originalRequest.data === 'object' && (originalRequest.data as any).type === 'homepage'
        if (!isPublicHomepage) {
          localStorage.removeItem("token")
          localStorage.removeItem("refreshToken")
          localStorage.removeItem("auth_user")
          window.location.href = "/login"
        }
      }
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
