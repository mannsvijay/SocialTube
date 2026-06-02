import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/constants/routes'
import Spinner from '@/components/ui/Spinner'

/**
 * Wrap login/register routes.
 * If already logged in, redirect to home — don't show auth pages again.
 */
export default function GuestRoute() {
  const { isLoggedIn, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isLoggedIn) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return <Outlet />
}