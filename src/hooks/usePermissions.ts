import { useAppSelector } from "@/store/hooks"
import { checkPermission, checkAnyPermission, checkAllPermissions, getResourcePermissions, Permission } from "@/utils/helpers"

/**
 * Custom hook for checking user permissions
 * @returns 
 */
export const usePermissions = () => {
  const user = useAppSelector((state) => state.auth.user)
  const permissions = user?.permissions || []

  return {
    permissions,
    /**
     * Check if user has a specific permission
     * @param action - Resource name (e.g., "departments", "staff")
     * @param resource - Action type (e.g., "view", "create", "update", "delete")
     */
    can: (action: string, resource: string): boolean => {
      return checkPermission(permissions, action, resource)
    },
    /**
     * Check if user has any of the specified permissions
     * @param checks - Array of [action, resource] tuples
     */
    canAny: (checks: Array<[string, string]>): boolean => {
      return checkAnyPermission(permissions, checks)
    },
    /**
     * Check if user has all of the specified permissions
     * @param checks - Array of [action, resource] tuples
     */
    canAll: (checks: Array<[string, string]>): boolean => {
      return checkAllPermissions(permissions, checks)
    },
    /**
     * Get all action types (resources) user can perform on a specific resource
     * @param action - Resource name (e.g., "departments")
     * @returns Array of resource types (e.g., ["view", "create", "update"])
     */
    getResourceActions: (action: string): string[] => {
      return getResourcePermissions(permissions, action)
    },
    /**
     * Check if user can create a resource
     */
    canCreate: (action: string): boolean => {
      return checkPermission(permissions, action, "create")
    },
    /**
     * Check if user can view a resource
     */
    canView: (action: string): boolean => {
      return checkPermission(permissions, action, "view")
    },
    /**
     * Check if user can update a resource
     */
    canUpdate: (action: string): boolean => {
      return checkPermission(permissions, action, "update")
    },
    /**
     * Check if user can delete a resource
     */
    canDelete: (action: string): boolean => {
      return checkPermission(permissions, action, "delete")
    },
    /**
     * Check if user can publish a resource
     */
    canPublish: (action: string): boolean => {
      return checkPermission(permissions, action, "publish")
    },
  }
}
