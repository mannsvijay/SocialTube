import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/constants/routes'
import Spinner from '@/components/ui/Spinner'

/**
 * Wrap any route that requires authentication.
 * Shows a full-page spinner while session is being verified on first load.
 * Saves the attempted URL so we can redirect back after login.
 */
export default function ProtectedRoute() {
  const { isLoggedIn, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isLoggedIn) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return <Outlet />
}