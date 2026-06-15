import { useState, useRef, useEffect } from 'react'
import { Link }                        from 'react-router-dom'
import { MoreVertical, BookmarkPlus, Link2 } from 'lucide-react'
import { toast }                       from 'sonner'
import { toWatch, toChannel }          from '@/constants/routes'
import { formatViews, formatDuration, timeAgo } from '@/utils/formatters'
import { cn }    from '@/utils/helpers'
import Avatar    from '@/components/ui/Avatar'
import AddToPlaylistModal from '@/components/playlist/AddToPlaylistModal'

/* ── 3-dot context menu ───────────────────────────────────── */
function VideoContextMenu({ videoId, onSave }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const stop = (e) => { e.preventDefault(); e.stopPropagation() }

  const handleToggle = (e) => { stop(e); setOpen(o => !o) }

  const handleSave = (e) => { stop(e); onSave(); setOpen(false) }

  const handleCopy = (e) => {
    stop(e)
    navigator.clipboard.writeText(
      `${window.location.origin}/watch/${videoId}`
    )
    toast.success('Link copied!')
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleToggle}
        aria-label="More options"
        className="p-1 rounded-full bg-black/80 text-white
                   hover:bg-black/95 transition-colors"
      >
        <MoreVertical size={15} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 z-50
                        bg-bg-secondary border border-border rounded-xl
                        shadow-2xl overflow-hidden animate-dropdown">
          <button
            onClick={handleSave}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                       text-text-secondary hover:text-text-primary
                       hover:bg-bg-elevated transition-colors text-left"
          >
            <BookmarkPlus size={15} className="opacity-70 flex-shrink-0" />
            Save to playlist
          </button>
          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                       text-text-secondary hover:text-text-primary
                       hover:bg-bg-elevated transition-colors text-left"
          >
            <Link2 size={15} className="opacity-70 flex-shrink-0" />
            Copy link
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Main VideoCard ───────────────────────────────────────── */
export default function VideoCard({ video, className }) {
  const [saveOpen, setSaveOpen] = useState(false)

  if (!video) return null

  const { _id, title, thumbNail, duration, views, createdAt, owner } = video

  return (
    <>
      <article className={cn('group flex flex-col gap-3', className)}>

        {/* Thumbnail */}
        <Link
          to={toWatch(_id)}
          className="relative block overflow-hidden rounded-xl aspect-video bg-bg-elevated"
        >
          <img
            src={thumbNail}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform
                       duration-300 group-hover:scale-105"
          />

          {/* Duration badge */}
          {duration != null && (
            <span className="absolute bottom-2 left-2 bg-black/80 text-white
                             text-xs font-medium px-1.5 py-0.5 rounded">
              {formatDuration(duration)}
            </span>
          )}

          {/* 3-dot menu — appears on hover */}
          <div className="absolute top-2 right-2
                          opacity-0 group-hover:opacity-100
                          transition-opacity duration-200">
            <VideoContextMenu
              videoId={_id}
              onSave={() => setSaveOpen(true)}
            />
          </div>
        </Link>

        {/* Info row */}
        <div className="flex gap-3 px-0.5">
          {owner && (
            <Link
              to={toChannel(owner.username)}
              className="flex-shrink-0 mt-0.5"
              tabIndex={-1}
              aria-hidden="true"
            >
              <Avatar src={owner.avatar} name={owner.fullName} size="sm" />
            </Link>
          )}

          <div className="flex-1 min-w-0">
            <Link to={toWatch(_id)}>
              <h3 className="text-text-primary text-sm font-medium line-clamp-2
                             leading-snug hover:text-white transition-colors">
                {title}
              </h3>
            </Link>

            {owner && (
              <Link
                to={toChannel(owner.username)}
                className="text-text-muted text-xs mt-0.5 block
                           hover:text-text-secondary transition-colors"
              >
                {owner.fullName || owner.username}
              </Link>
            )}

            <p className="text-text-muted text-xs mt-0.5">
              {formatViews(views)} · {timeAgo(createdAt)}
            </p>
          </div>
        </div>
      </article>

      <AddToPlaylistModal
        isOpen={saveOpen}
        onClose={() => setSaveOpen(false)}
        videoId={_id}
      />
    </>
  )
}