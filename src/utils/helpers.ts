import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

export const formatDate = (date: string | Date, format = "YYYY-MM-DD HH:mm") => {
  return dayjs(date).format(format)
}

export const formatRelativeTime = (date: string | Date) => {
  return dayjs(date).fromNow()
}

export const truncateText = (text: string, length = 100) => {
  if (!text) return ""
  return text.length > length ? `${text.substring(0, length)}...` : text
}

export const getInitials = (name?: string) => {
  if (!name) return ""
  const parts = name.split(" ")
  return parts
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

export const downloadFile = (url: string, filename: string) => {
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    draft: "default",
    pending: "processing",
    approved: "success",
    rejected: "error",
  }
  return colors[status] || "default"
}

export const hasPermission = (userRole?: string, requiredRoles?: string[]) => {
  if (!requiredRoles || requiredRoles.length === 0) return true
  return requiredRoles.includes(userRole || "")
}
