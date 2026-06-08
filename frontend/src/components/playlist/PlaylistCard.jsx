import { Link }        from 'react-router-dom'
import { ListVideo }   from 'lucide-react'
import { toPlaylist }  from '@/constants/routes'

export default function PlaylistCard({ playlist }) {
  const { _id, name, description, videos } = playlist
  const count     = videos?.length ?? 0
  const thumbnail = videos?.[0]?.thumbNail ?? null

  return (
    <Link to={toPlaylist(_id)} className="group flex flex-col gap-3">

      {/* Thumbnail with count overlay */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-bg-elevated">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ListVideo size={36} className="text-text-muted" />
          </div>
        )}

        {/* Right-side count strip — YouTube style */}
        <div className="absolute top-0 right-0 h-full w-[30%] bg-black/80
                        flex flex-col items-center justify-center gap-1">
          <span className="text-white font-bold text-xl leading-none">{count}</span>
          <span className="text-white/60 text-[10px] uppercase tracking-wide">videos</span>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity
                        flex items-center justify-center">
          <span className="text-white text-sm font-medium">Play all</span>
        </div>
      </div>

      {/* Info */}
      <div className="px-0.5">
        <h3 className="text-text-primary text-sm font-medium line-clamp-2 leading-snug
                       group-hover:text-white transition-colors">
          {name}
        </h3>
        {description && (
          <p className="text-text-muted text-xs mt-0.5 line-clamp-1">{description}</p>
        )}
        <p className="text-text-muted text-xs mt-0.5">Playlist</p>
      </div>
    </Link>
  )
}