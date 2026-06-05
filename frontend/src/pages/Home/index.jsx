import { useQuery }    from '@tanstack/react-query'
import { videoApi }    from '@/api/video.api'
import { KEYS }        from '@/constants/query-keys'
import VideoGrid       from '@/components/video/VideoGrid'

const DEFAULT_PARAMS = { sortBy: 'createdAt', sortType: 'desc', limit: 20 }

export default function Home() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: KEYS.videos.list(DEFAULT_PARAMS),
    queryFn:  () => videoApi.getAll(DEFAULT_PARAMS),
  })

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
        <span className="text-5xl">⚠️</span>
        <div>
          <p className="text-text-primary font-medium">Failed to load videos</p>
          <p className="text-text-muted text-sm mt-1">Check if the backend is running.</p>
        </div>
        <button
          onClick={refetch}
          className="text-accent hover:text-accent-light text-sm underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <VideoGrid
      videos={data?.videos}
      isLoading={isLoading}
      skeletonCount={12}
    />
  )
}