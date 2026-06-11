import { useState, useEffect } from 'react'
import { useSearchParams }     from 'react-router-dom'
import { useQuery }            from '@tanstack/react-query'
import { Search as SearchIcon, X } from 'lucide-react'
import { videoApi }            from '@/api/video.api'
import { KEYS }                from '@/constants/query-keys'
import { useDebounce }         from '@/hooks/useDebounce'
import VideoGrid               from '@/components/video/VideoGrid'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlQuery   = searchParams.get('q') ?? ''
  const [input, setInput] = useState(urlQuery)
  const debounced  = useDebounce(input, 500)

  // Sync debounced input → URL (so it's shareable)
  useEffect(() => {
    const trimmed = debounced.trim()
    if (trimmed) {
      setSearchParams({ q: trimmed }, { replace: true })
    } else {
      setSearchParams({}, { replace: true })
    }
  }, [debounced])                                 // eslint-disable-line

  // Sync URL → input (e.g. when user searches from Navbar)
  useEffect(() => {
    setInput(urlQuery)
  }, [urlQuery])

  const { data, isLoading } = useQuery({
    queryKey: KEYS.videos.list({ query: debounced }),
    queryFn:  () => videoApi.getAll({ query: debounced, limit: 20 }),
    enabled:  !!debounced.trim(),
  })

  return (
    <div>
      {/* ── In-page search bar ── */}
      <div className="relative mb-6 max-w-2xl">
        <SearchIcon
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
        />
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Search videos..."
          autoFocus
          aria-label="Search videos"
          className="w-full pl-11 pr-10 py-3 bg-bg-elevated border border-border
                     rounded-full text-sm text-text-primary placeholder:text-text-muted
                     outline-none focus:border-accent transition-colors"
        />
        {input && (
          <button
            onClick={() => { setInput(''); setSearchParams({}) }}
            aria-label="Clear search"
            className="absolute right-4 top-1/2 -translate-y-1/2
                       text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── Results count ── */}
      {debounced && !isLoading && (
        <p className="text-text-secondary text-sm mb-5">
          {data?.total ?? 0} result{(data?.total ?? 0) !== 1 ? 's' : ''} for &ldquo;{debounced}&rdquo;
        </p>
      )}

      {/* ── Empty state ── */}
      {!debounced && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <SearchIcon size={40} className="text-text-muted" />
          <p className="text-text-primary font-medium">Search for videos</p>
          <p className="text-text-muted text-sm">
            Start typing to find content you love.
          </p>
        </div>
      )}

      {/* ── Results ── */}
      {debounced && (
        <VideoGrid
          videos={data?.videos}
          isLoading={isLoading}
          skeletonCount={8}
        />
      )}
    </div>
  )
}