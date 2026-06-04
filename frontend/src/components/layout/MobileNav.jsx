import { NavLink }  from 'react-router-dom'
import { Home, Search, Upload, User } from 'lucide-react'
import { cn }      from '@/utils/helpers'
import { useAuth } from '@/context/AuthContext'
import { ROUTES, toChannel } from '@/constants/routes'

export default function MobileNav() {
  const { user, isLoggedIn } = useAuth()

  const items = [
    { icon: Home,   label: 'Home',   to: ROUTES.HOME },
    { icon: Search, label: 'Search', to: ROUTES.SEARCH },
    { icon: Upload, label: 'Upload', to: isLoggedIn ? ROUTES.UPLOAD : ROUTES.LOGIN },
    {
      icon: User,
      label: isLoggedIn ? 'You' : 'Log in',
      to: isLoggedIn ? toChannel(user?.username) : ROUTES.LOGIN,
    },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 h-16
                    bg-bg-secondary/95 backdrop-blur-sm border-t border-border
                    flex items-center">
      {items.map(({ icon: Icon, label, to }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex-1 flex flex-col items-center justify-center gap-1 h-full text-xs',
              'transition-colors',
              isActive ? 'text-accent' : 'text-text-muted hover:text-text-secondary'
            )
          }
        >
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}