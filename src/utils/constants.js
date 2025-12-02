export const USER_ROLES = {
  ADMIN: "admin",
  EDITOR: "editor",
  COORDINATOR: "coordinator",
}

export const APPROVAL_STATUS = {
  DRAFT: "draft",
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
}

export const LANGUAGES = {
  EN: "en",
  AM: "am",
  AF: "af",
}

export const LANGUAGE_LABELS = {
  en: "English",
  am: "አማርኛ",
  af: "Afaan Oromo",
}

export const DEPARTMENTS = [
  { id: 1, name: "Computer Science and Engineering", code: "CSE" },
  { id: 2, name: "Electrical and Electronics Engineering", code: "EEE" },
  { id: 3, name: "Information Technology", code: "IT" },
]

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api"
