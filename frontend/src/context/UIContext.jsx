import { useLocalStorage } from '@/hooks/useLocalStorage'
import { UIContext }       from './ui-context'

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
