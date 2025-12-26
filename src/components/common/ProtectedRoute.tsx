import { Navigate } from "react-router-dom"
import { useAppSelector } from "@/store/hooks"
import { hasPermission, checkPermission, checkAnyPermission } from "@/utils/helpers"

type ProtectedRouteProps = {
  children: React.ReactElement
  requiredRoles?: string[]
  requiredPermission?: [string, string] // [action, resource] e.g., ["departments", "view"]
  requiredAnyPermissions?: Array<[string, string]> // User needs at least one
}

const ProtectedRoute = ({ 
  children, 
  requiredRoles = [],
  requiredPermission,
  requiredAnyPermissions
}: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAppSelector((state: any) => state.auth)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check role-based access (if specified)
  if (requiredRoles.length > 0 && !hasPermission(user?.role, requiredRoles)) {
    return <Navigate to="/" replace />
  }

  // Check permission-based access
  if (requiredPermission) {
    const [action, resource] = requiredPermission
    if (!checkPermission(user?.permissions, action, resource)) {
      return <Navigate to="/" replace />
    }
  }

  // Check if user has at least one of the required permissions
  if (requiredAnyPermissions && requiredAnyPermissions.length > 0) {
    if (!checkAnyPermission(user?.permissions, requiredAnyPermissions)) {
      return <Navigate to="/" replace />
    }
  }

  return children
}

export default ProtectedRoute
