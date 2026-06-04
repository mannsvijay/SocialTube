import { useState }           from 'react'
import { Link, useNavigate }  from 'react-router-dom'
import { Search, Upload, X }  from 'lucide-react'
import { useAuth }            from '@/context/AuthContext'
import { ROUTES, toSearch, toChannel } from '@/constants/routes'
import Avatar  from '@/components/ui/Avatar'
import Button  from '@/components/ui/Button'

export default function Navbar() {
  const { user, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    navigate(toSearch(query.trim()))
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-14 flex items-center gap-4 px-4
                       bg-bg-primary/95 backdrop-blur-sm border-b border-border">

      {/* ── Logo ───────────────────────────────────── */}
      <Link to={ROUTES.HOME} className="flex-shrink-0 select-none">
        <span className="text-xl font-bold text-white tracking-tight">
          Social<span className="text-accent">Tube</span>
        </span>
      </Link>

      {/* ── Search ─────────────────────────────────── */}
      <form
        onSubmit={handleSearch}
        className="hidden sm:flex flex-1 max-w-lg mx-auto"
      >
        <div className="flex w-full rounded-full overflow-hidden
                        border border-border focus-within:border-accent/70 transition-colors">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search videos..."
            className="flex-1 bg-bg-secondary px-4 py-2 text-sm text-text-primary
                       placeholder:text-text-muted outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="px-3 bg-bg-secondary text-text-muted hover:text-text-primary transition-colors"
            >
              <X size={14} />
            </button>
          )}
          <button
            type="submit"
            className="px-4 bg-bg-elevated hover:bg-border transition-colors
                       text-text-secondary hover:text-text-primary"
          >
            <Search size={15} />
          </button>
        </div>
      </form>

      {/* ── Right actions ──────────────────────────── */}
      <div className="flex items-center gap-2 ml-auto flex-shrink-0">
        {isLoggedIn ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex gap-1.5"
              onClick={() => navigate(ROUTES.UPLOAD)}
            >
              <Upload size={15} />
              Upload
            </Button>

            <button
              onClick={() => navigate(toChannel(user.username))}
              className="rounded-full ring-2 ring-transparent hover:ring-accent/50 transition-all"
              aria-label="My channel"
            >
              <Avatar src={user?.avatar} name={user?.fullName} size="sm" />
            </button>
          </>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.LOGIN)}>
              Log in
            </Button>
            <Button size="sm" onClick={() => navigate(ROUTES.REGISTER)}>
              Sign up
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}