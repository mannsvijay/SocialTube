import { useCallback }         from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery }            from '@tanstack/react-query'
import { toast }               from 'sonner'
import { ListVideo }           from 'lucide-react'
import { videoApi }            from '@/api/video.api'
import { KEYS }                from '@/constants/query-keys'
import { toChannel, toWatch }  from '@/constants/routes'
import { formatViews, formatDuration, timeAgo } from '@/utils/formatters'
import { cn }                  from '@/utils/helpers'
import { useAuth }             from '@/context/AuthContext'
import { useSubscription }     from '@/hooks/useSubscription'
import { useLocalStorage }     from '@/hooks/useLocalStorage'
import { usePageTitle }        from '@/hooks/usePageTitle'
import VideoPlayer             from '@/components/video/VideoPlayer'
import VideoInfo               from '@/components/video/VideoInfo'
import VideoActions            from '@/components/video/VideoActions'
import CommentSection          from '@/components/comment/CommentSection'
import Avatar                  from '@/components/ui/Avatar'
import Skeleton                from '@/components/ui/Skeleton'

/* ── Compact related video card ─────────────────── */
function RelatedCard({ video }) {
  return (
    <Link to={toWatch(video._id)} className="flex gap-3 group">
      <div className="relative w-40 aspect-video rounded-lg overflow-hidden
                      bg-bg-elevated flex-shrink-0">
        <img
          src={video.thumbNail}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover
                     group-hover:scale-105 transition-transform duration-300"
        />
        {video.duration != null && (
          <span className="absolute bottom-1 right-1 bg-black/80
                           text-white text-[10px] px-1 rounded">
            {formatDuration(video.duration)}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-text-primary text-xs font-medium line-clamp-2
                      leading-snug group-hover:text-accent transition-colors">
          {video.title}
        </p>
        <p className="text-text-muted text-[11px] mt-1">
          {video.owner?.fullName || video.owner?.username}
        </p>
        <p className="text-text-muted text-[11px]">
          {formatViews(video.views)} · {timeAgo(video.createdAt)}
        </p>
      </div>
    </Link>
  )
}

/* ── Loading skeleton ───────────────────────────── */
function WatchSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      <div>
        <Skeleton className="w-full aspect-video rounded-xl" />
        <Skeleton className="h-6 w-3/4 mt-4" />
        <Skeleton className="h-4 w-1/3 mt-2" />
        <div className="flex gap-3 mt-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-9 w-20 rounded-full" />
          ))}
        </div>
        <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border">
          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="w-40 aspect-video rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Main page ──────────────────────────────────── */
export default function Watch() {
  const { videoId } = useParams()
  const { user }    = useAuth()
  const navigate    = useNavigate()

  // Autoplay preference — persisted in localStorage
  const [autoplay, setAutoplay] = useLocalStorage('socialtube-autoplay', true)

  const { data: video, isLoading, isError } = useQuery({
    queryKey: KEYS.videos.detail(videoId),
    queryFn:  () => videoApi.getById(videoId),
    enabled:  !!videoId,
  })

  const { data: relatedData, isLoading: relatedLoading } = useQuery({
    queryKey: KEYS.videos.list({ limit: 10 }),
    queryFn:  () => videoApi.getAll({ limit: 10 }),
  })

  const { subscribed, count: subCount, toggle: toggleSub, isPending: subPending } =
    useSubscription({
      channelId:         video?.owner?._id,
      initialSubscribed: false,
      initialCount:      0,
    })

  // Dynamic browser tab title
  usePageTitle(video?.title ?? 'Watch')

  // Autoplay — navigate to next related video when current ends
  const handleVideoEnd = useCallback(() => {
    if (!autoplay) return
    const next = relatedData?.videos?.find(v => v._id !== videoId)
    if (next) {
      toast.success(`Playing next: ${next.title}`, { duration: 2000 })
      navigate(toWatch(next._id))
    }
  }, [autoplay, relatedData, videoId, navigate])

  if (isLoading) return <WatchSkeleton />

  if (isError || !video) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
        <span className="text-5xl">⚠️</span>
        <p className="text-text-primary font-medium">Video not found</p>
        <p className="text-text-muted text-sm">
          This video may have been deleted or made private.
        </p>
      </div>
    )
  }

  const owner      = video.owner
  const isOwnVideo = user?._id === owner?._id

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-x-6 gap-y-8">

      {/* ── Left ── */}
      <div className="min-w-0">
        <VideoPlayer
          url={video.videoFile}
          title={video.title}
          onEnded={handleVideoEnd}
        />

        <VideoInfo
          title={video.title}
          views={video.views}
          createdAt={video.createdAt}
          description={video.description}
        />

        <VideoActions videoId={video._id} />

        {/* ── Channel row ── */}
        {owner && (
          <div className="flex items-center justify-between mt-5 py-4
                          border-t border-b border-border gap-3 flex-wrap">
            <Link
              to={toChannel(owner.username)}
              className="flex items-center gap-3 group"
            >
              <Avatar src={owner.avatar} name={owner.fullName} size="md" />
              <div>
                <p className="text-text-primary text-sm font-medium
                               group-hover:text-accent transition-colors">
                  {owner.fullName}
                </p>
                <p className="text-text-muted text-xs">@{owner.username}</p>
              </div>
            </Link>

            {!isOwnVideo && (
              <button
                onClick={toggleSub}
                disabled={subPending}
                className={cn(
                  'px-5 py-2 rounded-full text-sm font-semibold transition-all flex-shrink-0',
                  subscribed
                    ? 'bg-bg-elevated text-text-secondary border border-border hover:text-error hover:border-error'
                    : 'bg-white text-black hover:bg-white/90'
                )}
              >
                {subscribed
                  ? `Subscribed · ${subCount.toLocaleString()}`
                  : 'Subscribe'
                }
              </button>
            )}
          </div>
        )}

        <CommentSection videoId={video._id} />
      </div>

      {/* ── Right ── */}
      <aside className="flex flex-col gap-3">

        {/* Autoplay toggle */}
        <div className="flex items-center justify-between px-1 pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <ListVideo size={15} className="text-text-muted" />
            <span className="text-text-secondary text-sm">Autoplay</span>
          </div>
          <button
            onClick={() => setAutoplay(p => !p)}
            role="switch"
            aria-checked={autoplay}
            aria-label="Toggle autoplay"
            className={cn(
              'relative w-10 h-5 rounded-full transition-colors duration-200',
              autoplay ? 'bg-accent' : 'bg-bg-elevated border border-border'
            )}
          >
            <span className={cn(
              'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm',
              'transition-all duration-200',
              autoplay ? 'left-[22px]' : 'left-0.5'
            )} />
          </button>
        </div>

        <h3 className="text-text-secondary text-sm font-medium px-1">Up next</h3>

        {relatedLoading
          ? Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-40 aspect-video rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))
          : relatedData?.videos
              ?.filter(v => v._id !== videoId)
              .slice(0, 8)
              .map(v => <RelatedCard key={v._id} video={v} />)
        }
      </aside>
    </div>
  )
}