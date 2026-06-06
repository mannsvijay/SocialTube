import { useQuery }  from '@tanstack/react-query'
import { Link }      from 'react-router-dom'
import { subscriptionApi } from '@/api/subscription.api'
import { useAuth }   from '@/context/AuthContext'
import { KEYS }      from '@/constants/query-keys'
import { toChannel } from '@/constants/routes'
import Avatar        from '@/components/ui/Avatar'
import Skeleton      from '@/components/ui/Skeleton'

export default function Subscriptions() {
  const { user } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: KEYS.subscriptions.channels(user?._id),
    queryFn:  () => subscriptionApi.getSubscribedChannels(user._id),
    enabled:  !!user?._id,
  })

  const channels = data?.channels ?? []

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-text-primary mb-6">Subscriptions</h1>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-bg-secondary rounded-xl">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : channels.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-text-muted">You haven't subscribed to any channels yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {channels.map(({ channelInfo }) => (
            <Link
              key={channelInfo._id}
              to={toChannel(channelInfo.username)}
              className="flex items-center gap-4 p-4 bg-bg-secondary rounded-xl
                         border border-border hover:border-accent/50 transition-colors group"
            >
              <Avatar src={channelInfo.avatar} name={channelInfo.fullName} size="md" />
              <div>
                <p className="text-text-primary text-sm font-medium group-hover:text-accent transition-colors">
                  {channelInfo.fullName}
                </p>
                <p className="text-text-muted text-xs">@{channelInfo.username}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}