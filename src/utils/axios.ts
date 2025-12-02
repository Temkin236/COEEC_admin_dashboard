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
    if (token) {
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

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem("refreshToken")
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken })
          const { token } = response.data
          localStorage.setItem("token", token)
          originalRequest.headers = { ...(originalRequest.headers || {}), Authorization: `Bearer ${token}` }
          return axiosInstance(originalRequest)
        } catch (refreshError) {
          localStorage.removeItem("token")
          localStorage.removeItem("refreshToken")
          window.location.href = "/login"
          return Promise.reject(refreshError)
        }
      } else {
        localStorage.removeItem("token")
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
