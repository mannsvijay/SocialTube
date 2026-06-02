import {
  createContext, useContext,
  useState, useEffect, useCallback,
} from 'react'
import { authApi } from '@/api/auth.api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null)
  const [isLoading, setIsLoading] = useState(true)  // true until first session check

  // ─── Session verification on app mount ──────────────────────────────────
  useEffect(() => {
    authApi.getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  // ─── Listen for forced logout from Axios interceptor ────────────────────
  useEffect(() => {
    const handleExpired = () => setUser(null)
    window.addEventListener('auth:session-expired', handleExpired)
    return () => window.removeEventListener('auth:session-expired', handleExpired)
  }, [])

  // ─── Actions ────────────────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    const result = await authApi.login(credentials)
    setUser(result.user)
    return result
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setUser(null)
    }
  }, [])

  /**
   * Update user in context after profile/avatar edits
   * without re-fetching from server.
   */
  const updateUser = useCallback((updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev))
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isLoggedIn: !!user,
      login,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Usage in any component:
 *   const { user, isLoggedIn, login, logout } = useAuth()
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be called inside <AuthProvider>')
  return ctx
}