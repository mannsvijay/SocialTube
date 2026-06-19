import { useQuery }     from '@tanstack/react-query'
import { useNavigate }  from 'react-router-dom'
import { userApi }      from '@/api/user.api'
import { KEYS }         from '@/constants/query-keys'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTES }       from '@/constants/routes'
import VideoGrid        from '@/components/video/VideoGrid'
import EmptyState       from '@/components/ui/EmptyState'

export default function History() {
  const navigate = useNavigate()
  usePageTitle('Watch History')

  const { data: videos, isLoading } = useQuery({
    queryKey: KEYS.user.history,
    queryFn:  userApi.getWatchHistory,
  })

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text-primary mb-6">
        Watch History
      </h1>

      {!isLoading && (!videos || videos.length === 0) ? (
        <EmptyState
          emoji="🕐"
          title="No watch history yet"
          description="Videos you watch will appear here."
          action={{
            label:   'Start watching',
            onClick: () => navigate(ROUTES.HOME),
          }}
        />
      ) : (
        <VideoGrid videos={videos} isLoading={isLoading} skeletonCount={8} />
      )}
    </div>
  )
}