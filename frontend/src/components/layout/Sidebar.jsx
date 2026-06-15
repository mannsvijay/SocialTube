import { NavLink }   from 'react-router-dom'
import {
  Home, Rss, Clock, ThumbsUp, ListVideo,
  MessageSquare, LayoutDashboard, Settings,
  Upload, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { cn }      from '@/utils/helpers'
import { useAuth } from '@/context/AuthContext'
import { useUI }   from '@/context/UIContext'
import { ROUTES }  from '@/constants/routes'
import Tooltip     from '@/components/ui/Tooltip'

const publicLinks = [
  { icon: Home,          label: 'Home',          to: ROUTES.HOME          },
  { icon: Rss,           label: 'Subscriptions', to: ROUTES.SUBSCRIPTIONS },
]

const userLinks = [
  { icon: Clock,         label: 'History',       to: ROUTES.HISTORY       },
  { icon: ThumbsUp,      label: 'Liked Videos',  to: ROUTES.LIKED_VIDEOS  },
  { icon: ListVideo,     label: 'Playlists',     to: ROUTES.PLAYLISTS     },
  { icon: MessageSquare, label: 'Tweets',        to: ROUTES.TWEETS        },
]

const creatorLinks = [
  { icon: Upload,          label: 'Upload', to: ROUTES.UPLOAD  },
  { icon: LayoutDashboard, label: 'Studio', to: ROUTES.STUDIO  },
]

const bottomLinks = [
  { icon: Settings, label: 'Settings', to: ROUTES.SETTINGS },
]

/* ── Single nav link ── */
function SideLink({ icon: Icon, label, to, collapsed }) {
  return (
    <Tooltip content={collapsed ? label : undefined} position="right">
      <NavLink
        to={to}
        className={({ isActive }) =>
          cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm',
            'font-medium transition-colors',
            'hover:bg-bg-elevated hover:text-text-primary',
            collapsed && 'justify-center',
            isActive
              ? 'bg-bg-elevated text-text-primary'
              : 'text-text-muted'
          )
        }
      >
        <Icon size={18} className="flex-shrink-0" />
        {!collapsed && <span>{label}</span>}
      </NavLink>
    </Tooltip>
  )
}

/* ── Divider ── */
function Divider() {
  return <div className="my-2 border-t border-border" />
}

export default function Sidebar() {
  const { isLoggedIn }                    = useAuth()
  const { sidebarCollapsed, toggleSidebar } = useUI()

  return (
    <aside className={cn(
      'hidden md:flex flex-col fixed left-0 top-14 bottom-0 z-40',
      'bg-bg-primary border-r border-border py-4 px-2',
      'overflow-y-auto scrollbar-hide',
      'transition-all duration-300 ease-in-out',
      sidebarCollapsed ? 'w-[72px]' : 'w-[240px]'
    )}>

      {/* ── Navigation ── */}
      <nav className="flex flex-col gap-1 flex-1">
        {publicLinks.map(link => (
          <SideLink key={link.to} {...link} collapsed={sidebarCollapsed} />
        ))}

        {isLoggedIn && (
          <>
            <Divider />
            {userLinks.map(link => (
              <SideLink key={link.to} {...link} collapsed={sidebarCollapsed} />
            ))}
            <Divider />
            {creatorLinks.map(link => (
              <SideLink key={link.to} {...link} collapsed={sidebarCollapsed} />
            ))}
          </>
        )}
      </nav>

      {/* ── Bottom — Settings + Collapse toggle ── */}
      <div className="mt-auto space-y-1">
        <Divider />

        {bottomLinks.map(link => (
          <SideLink key={link.to} {...link} collapsed={sidebarCollapsed} />
        ))}

        <Tooltip
          content={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          position="right"
        >
          <button
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl',
              'text-sm text-text-muted hover:text-text-primary',
              'hover:bg-bg-elevated transition-colors',
              sidebarCollapsed && 'justify-center'
            )}
          >
            {sidebarCollapsed
              ? <ChevronRight size={18} />
              : <>
                  <ChevronLeft size={18} className="flex-shrink-0" />
                  <span>Collapse</span>
                </>
            }
          </button>
        </Tooltip>
      </div>
    </aside>
  )
}