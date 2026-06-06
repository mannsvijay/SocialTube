import { useQuery }   from '@tanstack/react-query'
import { userApi }    from '@/api/user.api'
import { KEYS }       from '@/constants/query-keys'
import VideoGrid      from '@/components/video/VideoGrid'

export default function History() {
  const { data: videos, isLoading } = useQuery({
    queryKey: KEYS.user.history,
    queryFn:  userApi.getWatchHistory,
  })

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text-primary mb-6">Watch History</h1>
      <VideoGrid videos={videos} isLoading={isLoading} skeletonCount={8} />
    </div>
  )
}