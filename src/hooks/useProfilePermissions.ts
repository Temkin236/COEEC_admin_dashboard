import { useAppSelector } from "@/store/hooks"

/**
 * Hook to check if user can edit a specific staff profile
 * Returns true if:
 * - User is editing their own profile AND has profile.update permission
 * - User has update.staff permission (admin/manager)
 */
export const useProfilePermissions = (staffId?: string) => {
  const { user } = useAppSelector((s) => s.auth)
  const currentUserStaffId = user?.staffId
  const permissions = user?.permissions || []

  // Check if this is the user's own profile
  const isOwnProfile = staffId && currentUserStaffId && staffId === currentUserStaffId

  // Check for relevant permissions
  const hasProfileUpdate = permissions.some(
    (p) => p.resource === "profile" && p.action === "update"
  )
  const hasStaffUpdate = permissions.some(
    (p) => p.resource === "staff" && p.action === "update"
  )
  const hasStaffCreate = permissions.some(
    (p) => p.resource === "staff" && p.action === "create"
  )

  // Can edit if:
  // 1. Editing own profile with profile.update permission
  // 2. Has update.staff permission (can edit any staff)
  const canEdit = (isOwnProfile && hasProfileUpdate) || hasStaffUpdate

  // Can create new staff profiles (admin function)
  const canCreate = hasStaffCreate

  // Can view profile
  const hasProfileView = permissions.some(
    (p) => p.resource === "profile" && p.action === "view"
  )
  const hasStaffView = permissions.some(
    (p) => p.resource === "staff" && p.action === "view"
  )
  const canView = (isOwnProfile && hasProfileView) || hasStaffView

  return {
    canEdit,
    canCreate,
    canView,
    isOwnProfile,
    hasProfileUpdate,
    hasStaffUpdate,
    hasStaffCreate,
  }
}
