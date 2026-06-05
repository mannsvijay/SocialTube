import { Link }                            from 'react-router-dom'
import { toWatch, toChannel }              from '@/constants/routes'
import { formatViews, formatDuration, timeAgo } from '@/utils/formatters'
import { cn }    from '@/utils/helpers'
import Avatar    from '@/components/ui/Avatar'

export default function VideoCard({ video, className }) {
  if (!video) return null
  const { _id, title, thumbNail, duration, views, createdAt, owner } = video

  return (
    <article className={cn('group flex flex-col gap-3', className)}>

      {/* Thumbnail */}
      <Link
        to={toWatch(_id)}
        className="relative block overflow-hidden rounded-xl aspect-video bg-bg-elevated"
      >
        <img
          src={thumbNail}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {duration != null && (
          <span className="absolute bottom-2 right-2 bg-black/80 text-white
                           text-xs font-medium px-1.5 py-0.5 rounded">
            {formatDuration(duration)}
          </span>
        )}
      </Link>

      {/* Info row */}
      <div className="flex gap-3 px-0.5">
        {owner && (
          <Link to={toChannel(owner.username)} className="flex-shrink-0 mt-0.5">
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
              className="text-text-muted text-xs mt-1 block hover:text-text-secondary transition-colors"
            >
              {owner.fullName || owner.username}
            </Link>
          )}

          <p className="text-text-muted text-xs mt-0.5">
            {formatViews(views)} • {timeAgo(createdAt)}
          </p>
        </div>
      </div>
    </article>
  )
}