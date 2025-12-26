import { ReactNode } from "react"
import { usePermissions } from "@/hooks/usePermissions"

interface CanAccessProps {
  children: ReactNode
  action: string
  resource: string
  fallback?: ReactNode
}

interface CanAccessAnyProps {
  children: ReactNode
  permissions: Array<[string, string]>
  fallback?: ReactNode
}

/**
 * Component to conditionally render children based on a single permission
 * @param action - Resource name (e.g., "departments")
 * @param resource - Action type (e.g., "view", "create", "update")
 * @param fallback - Optional fallback content when permission is not granted
 */
export const CanAccess = ({ children, action, resource, fallback = null }: CanAccessProps) => {
  const { can } = usePermissions()
  
  if (!can(action, resource)) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

/**
 * Component to conditionally render children based on multiple permissions (OR logic)
 * User needs at least ONE of the specified permissions
 * @param permissions - Array of [action, resource] tuples to check
 * @param fallback - Optional fallback content when permissions are not granted
 */
export const CanAccessAny = ({ children, permissions, fallback = null }: CanAccessAnyProps) => {
  const { canAny } = usePermissions()
  
  if (!canAny(permissions)) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

/**
 * Component to conditionally render children based on multiple permissions (AND logic)
 * User needs ALL of the specified permissions
 */
export const CanAccessAll = ({ children, permissions, fallback = null }: CanAccessAnyProps) => {
  const { canAll } = usePermissions()
  
  if (!canAll(permissions)) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}
