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

/**
 * Extract translation from translations array based on language
 * Falls back to first available translation if language not found
 */
export const getTranslation = (item: any, language: string = 'EN') => {
  if (!item) return null
  
  // If already has flat structure (title, description), return as is
  if (item.title && !item.translations) {
    return item
  }
  
  // Get translations array
  const translations = item.translations || []
  
  // Find translation for requested language
  let translation = translations.find((t: any) => t.language === language)
  
  // Fallback to English
  if (!translation) {
    translation = translations.find((t: any) => t.language === 'EN')
  }
  
  // Fallback to first available
  if (!translation && translations.length > 0) {
    translation = translations[0]
  }
  
  // Return merged object with translation fields at top level
  if (translation) {
    return {
      ...item,
      title: translation.title,
      slug: translation.slug,
      description: translation.description,
      content: translation.description, // Alias for consistency
      excerpt: translation.excerpt,
      language: translation.language,
    }
  }
  
  return item
}

/**
 * Transform API response items with translations to flat structure
 */
export const transformTranslatedItems = (items: any[], language: string = 'EN') => {
  if (!Array.isArray(items)) return []
  return items.map(item => getTranslation(item, language))
}

// Permission interface matching backend structure
export interface Permission {
  id: string
  action: string // e.g., "departments", "staff", "users"
  resource: string // e.g., "view", "create", "update", "delete", "publish"
  description?: string | null
}

/**
 * Check if user has a specific permission
 * @param permissions - User's permissions array from token
 * @param action - Resource name (e.g., "departments", "staff", "users")
 * @param resource - Action type (e.g., "view", "create", "update", "delete")
 * @returns boolean - Whether user has the permission
 */
export const checkPermission = (
  permissions: Permission[] | undefined,
  action: string,
  resource: string
): boolean => {
  if (!permissions || permissions.length === 0) return false
  const normalize = (s?: string) => (s || "").toString().toLowerCase().trim()
  const stripPlural = (s: string) => s.replace(/s$/i, "")

  const a = normalize(action)
  const r = normalize(resource)

  return permissions.some((p) => {
    const pa = normalize(p.action)
    const pr = normalize(p.resource)

    // direct match
    if (pa === a && pr === r) return true

    // allow plural/singular mismatches (department vs departments)
    if (stripPlural(pa) === stripPlural(a) && pr === r) return true
    if (pa === a && stripPlural(pr) === stripPlural(r)) return true

    // tolerate swapped fields (some sources may emit action/resource reversed)
    if (pa === r && pr === a) return true

    return false
  })
}

/**
 * Check if user has any of the specified permissions
 * @param permissions - User's permissions array
 * @param checks - Array of [action, resource] tuples to check
 * @returns boolean - Whether user has at least one of the permissions
 */
export const checkAnyPermission = (
  permissions: Permission[] | undefined,
  checks: Array<[string, string]>
): boolean => {
  if (!permissions || permissions.length === 0) return false
  return checks.some(([action, resource]) => checkPermission(permissions, action, resource))
}

/**
 * Check if user has all of the specified permissions
 * @param permissions - User's permissions array
 * @param checks - Array of [action, resource] tuples to check
 * @returns boolean - Whether user has all of the permissions
 */
export const checkAllPermissions = (
  permissions: Permission[] | undefined,
  checks: Array<[string, string]>
): boolean => {
  if (!permissions || permissions.length === 0) return false
  return checks.every(([action, resource]) => checkPermission(permissions, action, resource))
}

/**
 * Get all permissions for a specific action (resource)
 * @param permissions - User's permissions array
 * @param action - Resource name (e.g., "departments")
 * @returns Array of resource types user can perform on that action
 */
export const getResourcePermissions = (
  permissions: Permission[] | undefined,
  action: string
): string[] => {
  if (!permissions || permissions.length === 0) return []
  const normalize = (s?: string) => (s || "").toString().toLowerCase().trim()
  const stripPlural = (s: string) => s.replace(/s$/i, "")
  const a = normalize(action)

  return permissions
    .filter((p) => {
      const pa = normalize(p.action)
      return pa === a || stripPlural(pa) === stripPlural(a)
    })
    .map((p) => p.resource)
}
