import { useState }          from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Upload, X, SearchIcon } from 'lucide-react'
import { useAuth }    from '@/context/AuthContext'
import { ROUTES, toSearch } from '@/constants/routes'
import UserMenu from './UserMenu'
import Button   from '@/components/ui/Button'

export default function Navbar() {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    navigate(toSearch(query.trim()))
    setQuery('')
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-14 flex items-center gap-4 px-4
                       bg-bg-primary/95 backdrop-blur-sm border-b border-border">

      {/* ── Logo ── */}
      <Link
        to={ROUTES.HOME}
        className="flex-shrink-0 select-none mr-1"
        aria-label="SocialTube home"
      >
        <span className="text-xl font-bold text-white tracking-tight">
          Social<span className="text-accent">Tube</span>
        </span>
      </Link>

      {/* ── Desktop search ── */}
      <form
        onSubmit={handleSearch}
        className="hidden sm:flex flex-1 max-w-lg mx-auto"
        role="search"
        aria-label="Search videos"
      >
        <div className="flex w-full rounded-full overflow-hidden border border-border
                        focus-within:border-accent/60 transition-colors">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search videos..."
            aria-label="Search input"
            className="flex-1 bg-bg-secondary px-4 py-2 text-sm text-text-primary
                       placeholder:text-text-muted outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="px-3 bg-bg-secondary text-text-muted hover:text-text-primary transition-colors"
            >
              <X size={14} />
            </button>
          )}
          <button
            type="submit"
            aria-label="Submit search"
            className="px-4 bg-bg-elevated hover:bg-border transition-colors
                       text-text-secondary hover:text-text-primary"
          >
            <Search size={15} />
          </button>
        </div>
      </form>

      {/* ── Mobile search icon ── */}
      <button
        onClick={() => navigate(ROUTES.SEARCH)}
        className="sm:hidden ml-auto text-text-muted hover:text-text-primary transition-colors p-1"
        aria-label="Search"
      >
        <Search size={20} />
      </button>

      {/* ── Right actions ── */}
      <div className="hidden sm:flex items-center gap-2 flex-shrink-0 ml-auto sm:ml-0">
        {isLoggedIn ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={() => navigate(ROUTES.UPLOAD)}
              aria-label="Upload video"
            >
              <Upload size={15} />
              <span className="hidden md:inline">Upload</span>
            </Button>

            <UserMenu />
          </>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.LOGIN)}
            >
              Log in
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(ROUTES.REGISTER)}
            >
              Sign up
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}