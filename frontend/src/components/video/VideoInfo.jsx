import { useState }              from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { formatViews, timeAgo }  from '@/utils/formatters'

export default function VideoInfo({ title, views, createdAt, description }) {
  const [expanded, setExpanded] = useState(false)
  const long = description?.length > 200

  return (
    <div className="mt-4">
      <h1 className="text-text-primary font-semibold text-lg md:text-xl leading-snug">
        {title}
      </h1>
      <p className="text-text-muted text-sm mt-1">
        {formatViews(views)} &nbsp;·&nbsp; {timeAgo(createdAt)}
      </p>

      {description && (
        <div
          className="mt-3 bg-bg-elevated rounded-xl p-4 text-sm text-text-secondary
                     leading-relaxed whitespace-pre-line cursor-pointer"
          onClick={() => setExpanded(e => !e)}
        >
          <p className={!expanded && long ? 'line-clamp-3' : ''}>
            {description}
          </p>
          {long && (
            <button className="flex items-center gap-1 text-text-primary font-medium text-xs mt-2">
              {expanded
                ? <><ChevronUp size={14} /> Show less</>
                : <><ChevronDown size={14} /> Show more</>
              }
            </button>
          )}
        </div>
      )}
    </div>
  )
}