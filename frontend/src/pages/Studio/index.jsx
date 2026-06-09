import { useState }   from 'react'
import { Link }       from 'react-router-dom'
import {
  useQuery, useMutation, useQueryClient,
} from '@tanstack/react-query'
import { toast }      from 'sonner'
import {
  Eye, Users, ThumbsUp, VideoIcon,
  Pencil, Trash2, ToggleLeft, ToggleRight,
  UploadCloud, Check, X,
} from 'lucide-react'
import { dashboardApi } from '@/api/dashboard.api'
import { videoApi }     from '@/api/video.api'
import { KEYS }         from '@/constants/query-keys'
import { ROUTES, toWatch } from '@/constants/routes'
import { formatViews, timeAgo } from '@/utils/formatters'
import { cn }      from '@/utils/helpers'
import Modal       from '@/components/ui/Modal'
import Button      from '@/components/ui/Button'
import Input       from '@/components/ui/Input'
import Textarea    from '@/components/ui/Textarea'
import Skeleton    from '@/components/ui/Skeleton'

/* ── Stats card ─────────────────────────────── */
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-bg-secondary border border-border rounded-2xl p-5">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4', color)}>
        <Icon size={20} className="text-white" />
      </div>
      <p className="text-text-muted text-xs uppercase tracking-wide font-medium">{label}</p>
      <p className="text-text-primary text-2xl font-bold mt-1">
        {value ?? '—'}
      </p>
    </div>
  )
}

/* ── Status badge ────────────────────────────── */
function StatusBadge({ isPublished }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium',
      isPublished
        ? 'bg-success/10 text-success'
        : 'bg-warning/10 text-warning'
    )}>
      <span className={cn(
        'w-1.5 h-1.5 rounded-full mr-1.5',
        isPublished ? 'bg-success' : 'bg-warning'
      )} />
      {isPublished ? 'Published' : 'Draft'}
    </span>
  )
}

/* ── Edit modal ──────────────────────────────── */
function EditVideoModal({ video, isOpen, onClose }) {
  const qc = useQueryClient()
  const [title,       setTitle]       = useState(video?.title       ?? '')
  const [description, setDescription] = useState(video?.description ?? '')

  const { mutate, isPending } = useMutation({
    mutationFn: () => videoApi.update(video._id, {
      title:       title.trim(),
      description: description.trim(),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.dashboard.videos })
      qc.invalidateQueries({ queryKey: KEYS.videos.detail(video._id) })
      toast.success('Video updated!')
      onClose()
    },
    onError: () => toast.error('Failed to update video'),
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Video">
      <div className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Video title"
        />
        <Textarea
          label="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Video description"
          rows={4}
        />
        <div className="flex gap-3 pt-1">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1 rounded-lg"
          >
            Cancel
          </Button>
          <Button
            onClick={() => mutate()}
            isLoading={isPending}
            disabled={!title.trim()}
            className="flex-1 rounded-lg"
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  )
}

/* ── Single video row ────────────────────────── */
function VideoRow({ video }) {
  const qc = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)
  const [published, setPublished] = useState(video.isPublished)

  /* Toggle publish — optimistic */
  const toggleMutation = useMutation({
    mutationFn: () => videoApi.togglePublish(video._id),
    onMutate:   () => setPublished(p => !p),
    onSuccess:  (data) => setPublished(data.isPublished),
    onError:    () => {
      setPublished(video.isPublished)   // rollback
      toast.error('Failed to update status')
    },
    onSettled: () => qc.invalidateQueries({ queryKey: KEYS.dashboard.videos }),
  })

  /* Delete */
  const deleteMutation = useMutation({
    mutationFn: () => videoApi.remove(video._id),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: KEYS.dashboard.videos })
      qc.invalidateQueries({ queryKey: KEYS.dashboard.stats })
      toast.success('Video deleted')
    },
    onError: () => toast.error('Failed to delete video'),
  })

  const handleDelete = () => {
    if (!window.confirm(`Delete "${video.title}"? This cannot be undone.`)) return
    deleteMutation.mutate()
  }

  return (
    <>
      <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-bg-elevated/60
                      transition-colors group border border-transparent hover:border-border">

        {/* Thumbnail */}
        <Link
          to={toWatch(video._id)}
          className="relative w-32 aspect-video rounded-lg overflow-hidden bg-bg-elevated flex-shrink-0"
        >
          <img
            src={video.thumbNail}
            alt={video.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <Link to={toWatch(video._id)} className="block">
            <h3 className="text-text-primary text-sm font-medium line-clamp-1
                           hover:text-accent transition-colors">
              {video.title}
            </h3>
          </Link>
          <p className="text-text-muted text-xs mt-0.5 line-clamp-1">
            {video.description || 'No description'}
          </p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <StatusBadge isPublished={published} />
            <span className="text-text-muted text-xs">
              {formatViews(video.views)}
            </span>
            <span className="text-text-muted text-xs">
              {video.likesCount ?? 0} likes
            </span>
            <span className="text-text-muted text-xs hidden sm:block">
              {timeAgo(video.createdAt)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0
                        opacity-0 group-hover:opacity-100 transition-opacity">

          {/* Toggle publish */}
          <button
            onClick={() => toggleMutation.mutate()}
            disabled={toggleMutation.isPending}
            title={published ? 'Set to Draft' : 'Publish'}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary
                       hover:bg-bg-elevated transition-all disabled:opacity-50"
          >
            {published
              ? <ToggleRight size={18} className="text-success" />
              : <ToggleLeft  size={18} />
            }
          </button>

          {/* Edit */}
          <button
            onClick={() => setEditOpen(true)}
            title="Edit"
            className="p-2 rounded-lg text-text-muted hover:text-text-primary
                       hover:bg-bg-elevated transition-all"
          >
            <Pencil size={15} />
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            title="Delete"
            className="p-2 rounded-lg text-text-muted hover:text-error
                       hover:bg-error/10 transition-all disabled:opacity-50"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <EditVideoModal
        video={video}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </>
  )
}

/* ── Skeleton for video row ──────────────────── */
function VideoRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-3">
      <Skeleton className="w-32 aspect-video rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  )
}

/* ── Main Studio page ────────────────────────── */
export default function Studio() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: KEYS.dashboard.stats,
    queryFn:  dashboardApi.getStats,
  })

  const { data: videosData, isLoading: videosLoading } = useQuery({
    queryKey: KEYS.dashboard.videos,
    queryFn:  () => dashboardApi.getVideos({ limit: 50 }),
  })

  const videos = videosData?.videos ?? []

  const statCards = [
    {
      icon:  Eye,
      label: 'Total Views',
      value: stats ? formatViews(stats.totalViews).replace(' views', '') : null,
      color: 'bg-blue-600',
    },
    {
      icon:  Users,
      label: 'Subscribers',
      value: stats?.totalSubscribers?.toLocaleString() ?? null,
      color: 'bg-violet-600',
    },
    {
      icon:  ThumbsUp,
      label: 'Total Likes',
      value: stats?.totalLikes?.toLocaleString() ?? null,
      color: 'bg-pink-600',
    },
    {
      icon:  VideoIcon,
      label: 'Videos',
      value: stats?.totalVideos?.toLocaleString() ?? null,
      color: 'bg-emerald-600',
    },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Creator Studio</h1>
          <p className="text-text-muted text-sm mt-0.5">Manage your channel and content</p>
        </div>
        <Link to={ROUTES.UPLOAD}>
          <Button className="gap-2 rounded-xl" size="sm">
            <UploadCloud size={15} />
            Upload Video
          </Button>
        </Link>
      </div>

      {/* ── Stats grid ── */}
      <section>
        <h2 className="text-text-secondary text-sm font-semibold uppercase tracking-wider mb-4">
          Channel Analytics
        </h2>

        {statsLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="bg-bg-secondary border border-border rounded-2xl p-5 space-y-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map(card => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>
        )}
      </section>

      {/* ── Videos section ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-text-secondary text-sm font-semibold uppercase tracking-wider">
            Your Videos
          </h2>
          {videos.length > 0 && (
            <span className="text-text-muted text-xs">
              {videos.length} video{videos.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="bg-bg-secondary border border-border rounded-2xl overflow-hidden">

          {/* Column headers — desktop */}
          <div className="hidden sm:flex items-center gap-4 px-6 py-3
                          border-b border-border text-text-muted text-xs
                          uppercase tracking-wide font-medium">
            <span className="w-32 flex-shrink-0">Video</span>
            <span className="flex-1">Details</span>
            <span className="w-24">Status</span>
            <span className="w-16 text-right">Actions</span>
          </div>

          {/* Video list */}
          <div className="divide-y divide-border px-3 py-2">
            {videosLoading ? (
              Array.from({ length: 4 }, (_, i) => <VideoRowSkeleton key={i} />)
            ) : videos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-bg-elevated flex items-center justify-center">
                  <VideoIcon size={28} className="text-text-muted" />
                </div>
                <div>
                  <p className="text-text-primary font-medium">No videos yet</p>
                  <p className="text-text-muted text-sm mt-1">
                    Upload your first video to get started.
                  </p>
                </div>
                <Link to={ROUTES.UPLOAD}>
                  <Button size="sm" className="gap-2 rounded-lg">
                    <UploadCloud size={14} />
                    Upload Now
                  </Button>
                </Link>
              </div>
            ) : (
              videos.map(video => <VideoRow key={video._id} video={video} />)
            )}
          </div>
        </div>
      </section>
    </div>
  )
}