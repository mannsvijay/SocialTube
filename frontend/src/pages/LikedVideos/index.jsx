import { useQuery }     from '@tanstack/react-query'
import { likeApi }      from '@/api/like.api'
import { KEYS }         from '@/constants/query-keys'
import { useNavigate }  from 'react-router-dom'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTES }       from '@/constants/routes'
import VideoGrid        from '@/components/video/VideoGrid'
import EmptyState       from '@/components/ui/EmptyState'

export default function LikedVideos() {
  const navigate = useNavigate()
  usePageTitle('Liked Videos')

  const { data, isLoading } = useQuery({
    queryKey: KEYS.likes.videos,
    queryFn:  likeApi.getLikedVideos,
  })

  const videos = data?.map(item => item.videoDetails).filter(Boolean) ?? []

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text-primary mb-6">
        Liked Videos
      </h1>

      {!isLoading && videos.length === 0 ? (
        <EmptyState
          emoji="👍"
          title="No liked videos yet"
          description="Videos you like will appear here."
          action={{
            label:   'Browse videos',
            onClick: () => navigate(ROUTES.HOME),
          }}
        />
      ) : (
        <VideoGrid videos={videos} isLoading={isLoading} skeletonCount={8} />
      )}
    </div>
  )
}