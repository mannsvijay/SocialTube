import { createContext, useContext } from 'react'
import { useLocalStorage }          from '@/hooks/useLocalStorage'

const UIContext = createContext(null)

export function UIProvider({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage(
    'socialtube-sidebar-collapsed',
    false
  )

  const toggleSidebar = () => setSidebarCollapsed(v => !v)

  return (
    <UIContext.Provider value={{ sidebarCollapsed, setSidebarCollapsed, toggleSidebar }}>
      {children}
    </UIContext.Provider>
  )
}

export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI must be used within UIProvider')
  return ctx
}