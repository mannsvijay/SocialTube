import { NavLink } from 'react-router-dom'
import {
  Home, Rss, Clock, ThumbsUp, ListVideo,
  MessageSquare, LayoutDashboard, Settings, Upload,
} from 'lucide-react'
import { cn }     from '@/utils/helpers'
import { useAuth } from '@/context/AuthContext'
import { ROUTES }  from '@/constants/routes'

const publicLinks = [
  { icon: Home,         label: 'Home',          to: ROUTES.HOME },
  { icon: Rss,          label: 'Subscriptions', to: ROUTES.SUBSCRIPTIONS },
]

const userLinks = [
  { icon: Clock,        label: 'History',       to: ROUTES.HISTORY },
  { icon: ThumbsUp,     label: 'Liked Videos',  to: ROUTES.LIKED_VIDEOS },
  { icon: ListVideo,    label: 'Playlists',     to: ROUTES.PLAYLISTS },
  { icon: MessageSquare,label: 'Tweets',        to: ROUTES.TWEETS },
]

const creatorLinks = [
  { icon: Upload,        label: 'Upload',  to: ROUTES.UPLOAD },
  { icon: LayoutDashboard,label:'Studio',  to: ROUTES.STUDIO },
]

const bottomLinks = [
  { icon: Settings, label: 'Settings', to: ROUTES.SETTINGS },
]

function SideLink({ icon: Icon, label, to }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
          'hover:bg-bg-elevated hover:text-text-primary',
          isActive
            ? 'bg-bg-elevated text-text-primary'
            : 'text-text-muted'
        )
      }
    >
      <Icon size={18} className="flex-shrink-0" />
      <span className="hidden lg:block">{label}</span>
    </NavLink>
  )
}

export default function Sidebar() {
  const { isLoggedIn } = useAuth()

  return (
    <aside className={cn(
      'hidden md:flex flex-col fixed left-0 top-14 bottom-0 z-40',
      'w-[72px] lg:w-[240px]',
      'bg-bg-primary border-r border-border py-4 px-2',
      'overflow-y-auto scrollbar-hide'
    )}>
      <nav className="flex flex-col gap-1 flex-1">
        {publicLinks.map(link => <SideLink key={link.to} {...link} />)}

        {isLoggedIn && (
          <>
            <div className="my-2 border-t border-border" />
            {userLinks.map(link => <SideLink key={link.to} {...link} />)}
            <div className="my-2 border-t border-border" />
            {creatorLinks.map(link => <SideLink key={link.to} {...link} />)}
          </>
        )}
      </nav>

      <div className="mt-auto border-t border-border pt-2">
        {bottomLinks.map(link => <SideLink key={link.to} {...link} />)}
      </div>
    </aside>
  )
}