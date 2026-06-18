import { useParams }    from 'react-router-dom'
import { useQuery }     from '@tanstack/react-query'
import { useState }     from 'react'
import { Calendar, Users, VideoIcon } from 'lucide-react'
import { userApi }      from '@/api/user.api'
import { videoApi }     from '@/api/video.api'
import { tweetApi }     from '@/api/tweet.api'
import { playlistApi }  from '@/api/playlist.api'
import { KEYS }         from '@/constants/query-keys'
import { cn }           from '@/utils/helpers'
import { timeAgo }      from '@/utils/formatters'
import { usePageTitle } from '@/hooks/usePageTitle'
import ChannelHeader    from '@/components/channel/ChannelHeader'
import VideoGrid        from '@/components/video/VideoGrid'
import TweetCard        from '@/components/tweet/TweetCard'
import PlaylistCard     from '@/components/playlist/PlaylistCard'
import Skeleton         from '@/components/ui/Skeleton'

const TABS         = ['Videos', 'Playlists', 'Tweets', 'About']
const PLAYLIST_GRID = 'grid gap-x-4 gap-y-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

/* ── About tab content ── */
function AboutTab({ channel }) {
  const stats = [
    {
      icon:  Users,
      label: 'Subscribers',
      value: channel.subscribersCount?.toLocaleString() ?? '0',
    },
    {
      icon:  VideoIcon,
      label: 'Subscriptions',
      value: channel.channelSubscribedToCount?.toLocaleString() ?? '0',
    },
    {
      icon:  Calendar,
      label: 'Joined',
      value: new Date(channel.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year:  'numeric',
        day:   'numeric',
      }),
    },
  ]

  return (
    <div className="max-w-2xl space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="bg-bg-secondary border border-border rounded-2xl p-5
                       flex flex-col gap-2"
          >
            <Icon size={18} className="text-text-muted" />
            <p className="text-text-primary font-bold text-xl">{value}</p>
            <p className="text-text-muted text-xs uppercase tracking-wide font-medium">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Channel info */}
      <div className="bg-bg-secondary border border-border rounded-2xl p-6 space-y-4">
        <h3 className="text-text-primary font-semibold">Channel Info</h3>

        <div className="space-y-3 text-sm">
          <div className="flex gap-3">
            <span className="text-text-muted w-24 flex-shrink-0">Full Name</span>
            <span className="text-text-primary">{channel.fullName}</span>
          </div>

          <div className="flex gap-3">
            <span className="text-text-muted w-24 flex-shrink-0">Username</span>
            <span className="text-text-primary">@{channel.username}</span>
          </div>

          <div className="flex gap-3">
            <span className="text-text-muted w-24 flex-shrink-0">Email</span>
            <span className="text-text-primary">{channel.email}</span>
          </div>

          {channel.createdAt && (
            <div className="flex gap-3">
              <span className="text-text-muted w-24 flex-shrink-0">Joined</span>
              <span className="text-text-primary">
                {new Date(channel.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day:   'numeric',
                  year:  'numeric',
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Main Channel page ── */
export default function Channel() {
  const { username } = useParams()
  const [tab, setTab] = useState('Videos')

  const { data: channel, isLoading: channelLoading } = useQuery({
    queryKey: KEYS.user.channel(username),
    queryFn:  () => userApi.getChannel(username),
    enabled:  !!username,
  })

  usePageTitle(channel ? `${channel.fullName} — Channel` : 'Channel')

  const { data: videosData, isLoading: videosLoading } = useQuery({
    queryKey: KEYS.videos.list({ userId: channel?._id }),
    queryFn:  () => videoApi.getAll({ userId: channel._id, limit: 20 }),
    enabled:  !!channel?._id && tab === 'Videos',
  })

  const { data: playlists, isLoading: playlistsLoading } = useQuery({
    queryKey: KEYS.playlists.byUser(channel?._id),
    queryFn:  () => playlistApi.getByUser(channel._id),
    enabled:  !!channel?._id && tab === 'Playlists',
  })

  const { data: tweets, isLoading: tweetsLoading } = useQuery({
    queryKey: KEYS.tweets.byUser(channel?._id),
    queryFn:  () => tweetApi.getByUser(channel._id),
    enabled:  !!channel?._id && tab === 'Tweets',
  })

  /* ── Loading ── */
  if (channelLoading) {
    return (
      <div>
        <Skeleton className="w-full h-36 md:h-48 rounded-2xl" />
        <div className="flex items-center gap-4 mt-4">
          <Skeleton className="w-20 h-20 rounded-full flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>
    )
  }

  /* ── Not found ── */
  if (!channel) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
        <span className="text-5xl">👤</span>
        <p className="text-text-primary font-medium">Channel not found</p>
        <p className="text-text-muted text-sm">
          This channel doesn&apos;t exist or has been removed.
        </p>
      </div>
    )
  }

  return (
    <div>
      <ChannelHeader channel={channel} />

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto scrollbar-hide">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-5 py-2.5 text-sm font-medium flex-shrink-0',
              'transition-all border-b-2 -mb-px',
              tab === t
                ? 'border-accent text-text-primary'
                : 'border-transparent text-text-muted hover:text-text-secondary'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Videos ── */}
      {tab === 'Videos' && (
        <VideoGrid
          videos={videosData?.videos}
          isLoading={videosLoading}
          skeletonCount={8}
        />
      )}

      {/* ── Playlists ── */}
      {tab === 'Playlists' && (
        <>
          {playlistsLoading ? (
            <div className={PLAYLIST_GRID}>
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <Skeleton className="w-full aspect-video rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : playlists?.length ? (
            <div className={PLAYLIST_GRID}>
              {playlists.map(pl => (
                <PlaylistCard key={pl._id} playlist={pl} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-text-muted">No public playlists yet.</p>
            </div>
          )}
        </>
      )}

      {/* ── Tweets ── */}
      {tab === 'Tweets' && (
        <div className="max-w-2xl space-y-4">
          {tweetsLoading
            ? Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))
            : tweets?.length
              ? tweets.map(t => (
                  <TweetCard key={t._id} tweet={t} owner={channel} />
                ))
              : (
                <div className="text-center py-20">
                  <p className="text-text-muted text-sm">No tweets yet.</p>
                </div>
              )
          }
        </div>
      )}

      {/* ── About ── */}
      {tab === 'About' && <AboutTab channel={channel} />}
    </div>
  )
}