import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState }    from 'react'
import { useForm }     from 'react-hook-form'
import { toast }       from 'sonner'
import { Pencil, Trash2, Check, X, ListVideo, PlayCircle } from 'lucide-react'
import { playlistApi } from '@/api/playlist.api'
import { useAuth }     from '@/context/AuthContext'
import { KEYS }        from '@/constants/query-keys'
import { toWatch, toChannel, ROUTES } from '@/constants/routes'
import { formatViews, formatDuration, timeAgo } from '@/utils/formatters'
import Avatar   from '@/components/ui/Avatar'
import Button   from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'

/* ── Single video row inside the playlist ─── */
function VideoRow({ video, index, playlistId, isOwn }) {
  const qc = useQueryClient()

  const removeMutation = useMutation({
    mutationFn: () => playlistApi.removeVideo(playlistId, video._id),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: KEYS.playlists.detail(playlistId) })
      toast.success('Removed from playlist')
    },
    onError: () => toast.error('Failed to remove'),
  })

  return (
    <div className="flex items-center gap-2 group">
      {/* Index number */}
      <span className="text-text-muted text-xs w-5 text-right flex-shrink-0 select-none">
        {index + 1}
      </span>

      {/* Card */}
      <div className="flex-1 flex gap-3 p-2 rounded-xl hover:bg-bg-elevated transition-colors">
        <Link
          to={toWatch(video._id)}
          className="relative w-40 aspect-video rounded-lg overflow-hidden bg-bg-secondary flex-shrink-0"
        >
          <img
            src={video.thumbNail}
            alt={video.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          {video.duration != null && (
            <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded">
              {formatDuration(video.duration)}
            </span>
          )}
          {/* Play overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center
                          bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            <PlayCircle size={24} className="text-white" />
          </div>
        </Link>

        <div className="flex-1 min-w-0 pt-0.5">
          <Link to={toWatch(video._id)}>
            <h3 className="text-text-primary text-sm font-medium line-clamp-2 leading-snug
                           hover:text-accent transition-colors">
              {video.title}
            </h3>
          </Link>
          {video.owner && (
            <Link
              to={toChannel(video.owner.username)}
              className="text-text-muted text-xs mt-0.5 block hover:text-text-secondary transition-colors"
            >
              {video.owner.fullName || video.owner.username}
            </Link>
          )}
          <p className="text-text-muted text-xs mt-0.5">
            {formatViews(video.views)} · {timeAgo(video.createdAt)}
          </p>
        </div>

        {/* Remove button — only for owner */}
        {isOwn && (
          <button
            onClick={() => removeMutation.mutate()}
            disabled={removeMutation.isPending}
            className="self-center p-1.5 rounded-full flex-shrink-0
                       text-text-muted hover:text-error hover:bg-error/10
                       transition-all opacity-0 group-hover:opacity-100 disabled:opacity-40"
            aria-label="Remove from playlist"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

/* ── Main page ─────────────────────────────── */
export default function PlaylistDetail() {
  const { playlistId } = useParams()
  const { user }       = useAuth()
  const navigate       = useNavigate()
  const qc             = useQueryClient()
  const [editing, setEditing] = useState(false)

  const { data: playlist, isLoading } = useQuery({
    queryKey: KEYS.playlists.detail(playlistId),
    queryFn:  () => playlistApi.getById(playlistId),
    enabled:  !!playlistId,
  })

  const isOwn = user?._id === playlist?.owner?._id

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    values: {
      name:        playlist?.name        ?? '',
      description: playlist?.description ?? '',
    },
  })

  const updateMutation = useMutation({
    mutationFn: (payload) => playlistApi.update(playlistId, payload),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: KEYS.playlists.detail(playlistId) })
      setEditing(false)
      toast.success('Playlist updated')
    },
    onError: () => toast.error('Failed to update'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => playlistApi.remove(playlistId),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: KEYS.playlists.byUser(user?._id) })
      toast.success('Playlist deleted')
      navigate(ROUTES.PLAYLISTS)
    },
    onError: () => toast.error('Failed to delete'),
  })

  /* ── Loading skeleton ── */
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8 max-w-6xl mx-auto">
        <div className="space-y-4">
          <Skeleton className="w-full aspect-video rounded-2xl" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex gap-3 p-2">
              <Skeleton className="w-40 aspect-video rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  /* ── Not found ── */
  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
        <span className="text-5xl">📭</span>
        <p className="text-text-primary font-medium">Playlist not found</p>
        <Button variant="ghost" onClick={() => navigate(ROUTES.PLAYLISTS)}>
          Go back to playlists
        </Button>
      </div>
    )
  }

  const videos     = playlist.videos ?? []
  const coverThumb = videos[0]?.thumbNail

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8 max-w-6xl mx-auto">

      {/* ── Left — Sticky info panel ── */}
      <aside className="lg:sticky lg:top-20 self-start">
        <div className="rounded-2xl overflow-hidden bg-bg-secondary border border-border">

          {/* Cover image / gradient */}
          <div className="relative aspect-video bg-bg-elevated">
            {coverThumb ? (
              <img
                src={coverThumb}
                alt={playlist.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ListVideo size={48} className="text-text-muted" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-3 left-4">
              <p className="text-white font-bold text-2xl">{videos.length}</p>
              <p className="text-white/60 text-xs">videos</p>
            </div>
          </div>

          {/* Details */}
          <div className="p-5">
            {editing ? (
              /* ── Edit form ── */
              <form
                onSubmit={handleSubmit(d => updateMutation.mutate(d))}
                className="space-y-3"
              >
                <input
                  {...register('name', { required: true })}
                  placeholder="Playlist name"
                  className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2
                             text-sm text-text-primary outline-none focus:border-accent transition-colors"
                />
                <textarea
                  {...register('description')}
                  placeholder="Description (optional)"
                  rows={3}
                  className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2
                             text-sm text-text-primary outline-none focus:border-accent
                             transition-colors resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    isLoading={isSubmitting}
                    className="flex-1 rounded-lg gap-1.5"
                  >
                    <Check size={13} /> Save
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => { setEditing(false); reset() }}
                    className="flex-1 rounded-lg"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              /* ── View mode ── */
              <>
                <h1 className="text-text-primary font-bold text-xl leading-snug">
                  {playlist.name}
                </h1>

                {playlist.description && (
                  <p className="text-text-muted text-sm mt-1.5 leading-relaxed">
                    {playlist.description}
                  </p>
                )}

                {/* Owner */}
                {playlist.owner && (
                  <Link
                    to={toChannel(playlist.owner.username)}
                    className="flex items-center gap-2 mt-3 group w-fit"
                  >
                    <Avatar
                      src={playlist.owner.avatar}
                      name={playlist.owner.fullName}
                      size="xs"
                    />
                    <span className="text-text-secondary text-xs group-hover:text-accent transition-colors">
                      {playlist.owner.fullName}
                    </span>
                  </Link>
                )}

                {/* Play all button */}
                {videos.length > 0 && (
                  <Link
                    to={toWatch(videos[0]._id)}
                    className="flex items-center justify-center gap-2 mt-4
                               w-full py-2.5 rounded-xl bg-accent hover:bg-accent-hover
                               text-white text-sm font-medium transition-colors"
                  >
                    <PlayCircle size={16} />
                    Play all
                  </Link>
                )}

                {/* Edit / Delete — only for owner */}
                {isOwn && (
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditing(true)}
                      className="flex-1 rounded-lg gap-1.5"
                    >
                      <Pencil size={13} /> Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      isLoading={deleteMutation.isPending}
                      onClick={() => {
                        if (window.confirm('Delete this playlist?')) deleteMutation.mutate()
                      }}
                      className="flex-1 rounded-lg gap-1.5"
                    >
                      <Trash2 size={13} /> Delete
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </aside>

      {/* ── Right — Video list ── */}
      <div>
        {videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <span className="text-5xl">📭</span>
            <p className="text-text-primary font-medium">No videos in this playlist yet</p>
            <p className="text-text-muted text-sm">
              Save videos from the player to add them here.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-text-muted text-sm mb-4 px-2">
              {videos.length} video{videos.length !== 1 ? 's' : ''}
            </p>
            {videos.map((video, idx) => (
              <VideoRow
                key={video._id}
                video={video}
                index={idx}
                playlistId={playlistId}
                isOwn={isOwn}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}