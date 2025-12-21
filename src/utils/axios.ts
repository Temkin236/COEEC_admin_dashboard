import axios from "axios"
import { API_BASE_URL } from "./constants"

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Use loose typing here to avoid incompatibilities with axios internal types
axiosInstance.interceptors.request.use(
  (config: any) => {
    try {
      const token = localStorage.getItem("token")
      // Skip auth for public homepage content fetches
      const isPublicHomepage = config && config.url === '/content' && config.data && typeof config.data === 'object' && (config.data as any).type === 'homepage'

      config.headers = config.headers || {}
      if (token && !isPublicHomepage) {
        config.headers["Authorization"] = `Bearer ${token}`
        
        // Check if token is expired
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          const now = Math.floor(Date.now() / 1000)
          if (payload.exp && payload.exp < now) {
            console.warn('Token expired! exp:', payload.exp, 'now:', now)
            // Token is expired, but let it through - the response interceptor will handle refresh
          }
        } catch (e) {
          console.warn('Failed to decode token:', e)
        }
      }

      const language = localStorage.getItem("language") || "en"
      config.headers["Accept-Language"] = language
    } catch (e) {
      // swallow errors here to avoid blocking requests
      console.warn('axios request interceptor error', e)
    }

    return config
  },
  (error: any) => Promise.reject(error),
)

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || ({} as any)

    // Log the error for debugging
    console.error('Axios error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: originalRequest.url,
      data: error.response?.data
    })

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem("refreshToken")
      if (refreshToken) {
        try {
          console.log('Attempting to refresh token...')
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken })
          const { accessToken, refreshToken: newRefreshToken } = response.data
          console.log('Token refreshed successfully!')
          localStorage.setItem("token", accessToken)
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken)
          }
          originalRequest.headers = { ...(originalRequest.headers || {}), Authorization: `Bearer ${accessToken}` }
          return axiosInstance(originalRequest)
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
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
        console.warn('No refresh token available')
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
