import { useState, useEffect } from 'react'
import { useSearchParams }     from 'react-router-dom'
import { useQuery }            from '@tanstack/react-query'
import { Search as SearchIcon, X, SlidersHorizontal } from 'lucide-react'
import { videoApi }            from '@/api/video.api'
import { KEYS }                from '@/constants/query-keys'
import { useDebounce }         from '@/hooks/useDebounce'
import { usePageTitle }        from '@/hooks/usePageTitle'
import { cn }                  from '@/utils/helpers'
import VideoGrid               from '@/components/video/VideoGrid'

/* ── Sort options ── */
const SORT_OPTIONS = [
  { label: 'Relevance', sortBy: 'createdAt', sortType: 'desc' },
  { label: 'Most Viewed', sortBy: 'views',      sortType: 'desc' },
  { label: 'Newest',     sortBy: 'createdAt',   sortType: 'desc' },
  { label: 'Oldest',     sortBy: 'createdAt',   sortType: 'asc'  },
]

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlQuery  = searchParams.get('q') ?? ''
  const [input,   setInput]   = useState(urlQuery)
  const [sortIdx, setSortIdx] = useState(0)
  const debounced = useDebounce(input, 500)

  usePageTitle(debounced ? `"${debounced}" — Search` : 'Search')

  // Sync debounced input → URL
  useEffect(() => {
    const trimmed = debounced.trim()
    if (trimmed) {
      setSearchParams({ q: trimmed }, { replace: true })
    } else {
      setSearchParams({}, { replace: true })
    }
  }, [debounced])           // eslint-disable-line

  // Sync URL → input (when user searches from Navbar)
  useEffect(() => {
    setInput(urlQuery)
  }, [urlQuery])

  const currentSort = SORT_OPTIONS[sortIdx]

  const { data, isLoading } = useQuery({
    queryKey: KEYS.videos.list({
      query:    debounced,
      sortBy:   currentSort.sortBy,
      sortType: currentSort.sortType,
    }),
    queryFn: () => videoApi.getAll({
      query:    debounced,
      sortBy:   currentSort.sortBy,
      sortType: currentSort.sortType,
      limit:    20,
    }),
    enabled: !!debounced.trim(),
  })

  return (
    <div>
      {/* ── Search bar ── */}
      <div className="relative mb-5 max-w-2xl">
        <SearchIcon
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2
                     text-text-muted pointer-events-none"
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

      {/* ── Sort filters — only show when there's a query ── */}
      {debounced && (
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-1.5 text-text-muted text-xs flex-shrink-0">
            <SlidersHorizontal size={13} />
            <span>Sort by</span>
          </div>

          <div className="flex gap-2 flex-wrap">
            {SORT_OPTIONS.map((opt, i) => (
              <button
                key={opt.label}
                onClick={() => setSortIdx(i)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                  i === sortIdx
                    ? 'bg-accent text-white'
                    : 'bg-bg-elevated text-text-secondary border border-border hover:border-accent/50 hover:text-text-primary'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Results count */}
          {!isLoading && (
            <span className="text-text-muted text-xs ml-auto flex-shrink-0">
              {data?.total ?? 0} result{(data?.total ?? 0) !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* ── Empty search state ── */}
      {!debounced && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <SearchIcon size={40} className="text-text-muted" />
          <p className="text-text-primary font-medium">Search for videos</p>
          <p className="text-text-muted text-sm">
            Start typing to find content you love.
          </p>
        </div>
      )}

      {/* ── No results ── */}
      {debounced && !isLoading && data?.total === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <span className="text-5xl">🔍</span>
          <p className="text-text-primary font-medium">
            No results for &ldquo;{debounced}&rdquo;
          </p>
          <p className="text-text-muted text-sm">
            Try different keywords or a different filter.
          </p>
        </div>
      )}

      {/* ── Results grid ── */}
      {debounced && (data?.total ?? 0) > 0 && (
        <VideoGrid
          videos={data?.videos}
          isLoading={isLoading}
          skeletonCount={8}
        />
      )}
    </div>
  )
}