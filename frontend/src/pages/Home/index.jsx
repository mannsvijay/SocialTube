import { useCallback }       from 'react'
import { useInfiniteQuery }  from '@tanstack/react-query'
import { videoApi }          from '@/api/video.api'
import { KEYS }              from '@/constants/query-keys'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import VideoGrid             from '@/components/video/VideoGrid'
import Spinner               from '@/components/ui/Spinner'

const LIMIT  = 12
const PARAMS = { sortBy: 'createdAt', sortType: 'desc', limit: LIMIT }

export default function Home() {
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey:      KEYS.videos.infinite(PARAMS),
    queryFn:       ({ pageParam }) =>
      videoApi.getAll({ ...PARAMS, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.videos.length, 0)
      return loaded < lastPage.total ? allPages.length + 1 : undefined
    },
  })

  // Flatten all pages into one array
  const videos = data?.pages.flatMap(page => page.videos) ?? []

  // Stable callback for IntersectionObserver
  const handleFetchNext = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // Attach to sentinel div at the bottom
  const sentinelRef = useInfiniteScroll(handleFetchNext, {
    enabled: hasNextPage && !isFetchingNextPage,
  })

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
        <span className="text-5xl">⚠️</span>
        <div>
          <p className="text-text-primary font-medium">Failed to load videos</p>
          <p className="text-text-muted text-sm mt-1">
            Make sure the backend is running on port 8000.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="text-accent hover:text-accent-light text-sm underline underline-offset-2"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div>
      <VideoGrid
        videos={videos}
        isLoading={isLoading}
        skeletonCount={LIMIT}
      />

      {/* ── Infinite scroll sentinel ── */}
      {!isLoading && (
        <div
          ref={sentinelRef}
          className="flex items-center justify-center py-10 mt-4"
          aria-hidden="true"
        >
          {isFetchingNextPage && <Spinner size="md" />}

          {!hasNextPage && videos.length > 0 && (
            <p className="text-text-muted text-xs">
              You&apos;ve seen everything — check back later!
            </p>
          )}
        </div>
      )}
    </div>
  )
}