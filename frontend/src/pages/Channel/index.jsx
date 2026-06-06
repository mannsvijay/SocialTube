import { useParams }    from 'react-router-dom'
import { useQuery }     from '@tanstack/react-query'
import { useState }     from 'react'
import { userApi }      from '@/api/user.api'
import { videoApi }     from '@/api/video.api'
import { tweetApi }     from '@/api/tweet.api'
import { KEYS }         from '@/constants/query-keys'
import { cn }           from '@/utils/helpers'
import ChannelHeader    from '@/components/channel/ChannelHeader'
import VideoGrid        from '@/components/video/VideoGrid'
import TweetCard        from '@/components/tweet/TweetCard'
import Skeleton         from '@/components/ui/Skeleton'

const TABS = ['Videos', 'Tweets']

export default function Channel() {
  const { username } = useParams()
  const [tab, setTab] = useState('Videos')

  const { data: channel, isLoading: channelLoading } = useQuery({
    queryKey: KEYS.user.channel(username),
    queryFn:  () => userApi.getChannel(username),
    enabled:  !!username,
  })

  const { data: videosData, isLoading: videosLoading } = useQuery({
    queryKey: KEYS.videos.list({ userId: channel?._id }),
    queryFn:  () => videoApi.getAll({ userId: channel._id, limit: 20 }),
    enabled:  !!channel?._id && tab === 'Videos',
  })

  const { data: tweets, isLoading: tweetsLoading } = useQuery({
    queryKey: KEYS.tweets.byUser(channel?._id),
    queryFn:  () => tweetApi.getByUser(channel._id),
    enabled:  !!channel?._id && tab === 'Tweets',
  })

  if (channelLoading) {
    return (
      <div>
        <Skeleton className="w-full h-48 rounded-2xl" />
        <div className="flex items-center gap-4 mt-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    )
  }

  if (!channel) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
        <span className="text-5xl">👤</span>
        <p className="text-text-primary font-medium">Channel not found</p>
      </div>
    )
  }

  return (
    <div>
      <ChannelHeader channel={channel} />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-5 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px',
              tab === t
                ? 'border-accent text-text-primary'
                : 'border-transparent text-text-muted hover:text-text-secondary'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'Videos' && (
        <VideoGrid
          videos={videosData?.videos}
          isLoading={videosLoading}
          skeletonCount={8}
        />
      )}

      {tab === 'Tweets' && (
        <div className="max-w-2xl space-y-4">
          {tweetsLoading
            ? Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
            : tweets?.length
              ? tweets.map(t => <TweetCard key={t._id} tweet={t} owner={channel} />)
              : <p className="text-text-muted text-sm py-8 text-center">No tweets yet.</p>
          }
        </div>
      )}
    </div>
  )
}