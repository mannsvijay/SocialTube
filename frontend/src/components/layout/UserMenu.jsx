import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate }           from 'react-router-dom'
import {
  User, LayoutDashboard,
  Settings, LogOut, ChevronDown,
} from 'lucide-react'
import { toast }   from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { ROUTES, toChannel } from '@/constants/routes'
import { cn }   from '@/utils/helpers'
import Avatar   from '@/components/ui/Avatar'

export default function UserMenu() {
  const { user, logout }    = useAuth()
  const navigate            = useNavigate()
  const [open, setOpen]     = useState(false)
  const [leaving, setLeaving] = useState(false)
  const menuRef             = useRef(null)

  /* ── Close on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /* ── Close on Escape ── */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const handleLogout = async () => {
    setLeaving(true)
    try {
      await logout()
      toast.success('Logged out successfully')
      navigate(ROUTES.HOME)
    } catch {
      toast.error('Logout failed — try again')
    } finally {
      setLeaving(false)
      setOpen(false)
    }
  }

  const navItems = [
    { icon: User,             label: 'My Channel', to: toChannel(user?.username) },
    { icon: LayoutDashboard,  label: 'Studio',     to: ROUTES.STUDIO            },
    { icon: Settings,         label: 'Settings',   to: ROUTES.SETTINGS          },
  ]

  return (
    <div ref={menuRef} className="relative">

      {/* ── Trigger button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Open user menu"
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          'flex items-center gap-1.5 rounded-full',
          'ring-2 ring-transparent transition-all duration-200',
          open ? 'ring-accent/70' : 'hover:ring-accent/40'
        )}
      >
        <Avatar src={user?.avatar} name={user?.fullName} size="sm" />
        <ChevronDown
          size={13}
          className={cn(
            'text-text-muted transition-transform duration-200 hidden sm:block',
            open && 'rotate-180'
          )}
        />
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div
          role="menu"
          className={cn(
            'absolute right-0 top-full mt-2 w-56 z-50',
            'bg-bg-secondary border border-border rounded-2xl shadow-2xl',
            'overflow-hidden animate-dropdown'
          )}
        >
          {/* User info — not clickable */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Avatar src={user?.avatar} name={user?.fullName} size="sm" />
            <div className="min-w-0">
              <p className="text-text-primary text-sm font-medium truncate">
                {user?.fullName}
              </p>
              <p className="text-text-muted text-xs truncate">@{user?.username}</p>
            </div>
          </div>

          {/* Navigation links */}
          <div className="py-1" role="group">
            {navItems.map(({ icon: Icon, label, to }) => (
              <Link
                key={to}
                to={to}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm
                           text-text-secondary hover:text-text-primary
                           hover:bg-bg-elevated transition-colors"
              >
                <Icon size={15} className="flex-shrink-0 opacity-70" />
                {label}
              </Link>
            ))}
          </div>

          {/* Logout */}
          <div className="border-t border-border py-1">
            <button
              role="menuitem"
              onClick={handleLogout}
              disabled={leaving}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                         text-text-secondary hover:text-error hover:bg-error/5
                         transition-colors disabled:opacity-50 text-left"
            >
              <LogOut size={15} className="flex-shrink-0 opacity-70" />
              {leaving ? 'Logging out...' : 'Log out'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}