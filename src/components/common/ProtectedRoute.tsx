import { Navigate } from "react-router-dom"
import { useAppSelector } from "@/store/hooks"
import { hasPermission } from "@/utils/helpers"

type ProtectedRouteProps = {
  children: React.ReactElement
  requiredRoles?: string[]
}

const ProtectedRoute = ({ children, requiredRoles = [] }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAppSelector((state: any) => state.auth)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRoles.length > 0 && !hasPermission(user?.role, requiredRoles)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
