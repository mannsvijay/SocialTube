import { useContext }  from 'react'
import { AuthContext } from '@/context/auth-context'

/**
 * Usage in any component:
 *   const { user, isLoggedIn, login, logout } = useAuth()
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be called inside <AuthProvider>')
  return ctx
}
