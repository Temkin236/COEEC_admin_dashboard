import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

export const formatDate = (date, format = "YYYY-MM-DD HH:mm") => {
  return dayjs(date).format(format)
}

export const formatRelativeTime = (date) => {
  return dayjs(date).fromNow()
}

export const truncateText = (text, length = 100) => {
  if (!text) return ""
  return text.length > length ? `${text.substring(0, length)}...` : text
}

export const getInitials = (name) => {
  if (!name) return ""
  const parts = name.split(" ")
  return parts
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

export const downloadFile = (url, filename) => {
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const getStatusColor = (status) => {
  const colors = {
    draft: "default",
    pending: "processing",
    approved: "success",
    rejected: "error",
  }
  return colors[status] || "default"
}

export const hasPermission = (userRole, requiredRoles) => {
  if (!requiredRoles || requiredRoles.length === 0) return true
  return requiredRoles.includes(userRole)
}
