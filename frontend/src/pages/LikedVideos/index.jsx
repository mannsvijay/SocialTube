import { useQuery }   from '@tanstack/react-query'
import { likeApi }    from '@/api/like.api'
import { KEYS }       from '@/constants/query-keys'
import VideoGrid      from '@/components/video/VideoGrid'

export default function LikedVideos() {
  const { data, isLoading } = useQuery({
    queryKey: KEYS.likes.videos,
    queryFn:  likeApi.getLikedVideos,
  })

  const videos = data?.map(item => item.videoDetails) ?? []

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text-primary mb-6">Liked Videos</h1>
      <VideoGrid videos={videos} isLoading={isLoading} skeletonCount={8} />
    </div>
  )
}