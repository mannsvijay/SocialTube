import { ThumbsUp, Bookmark, Share2 } from 'lucide-react'
import { toast }           from 'sonner'
import { useVideoLike }    from '@/hooks/useLike'
import { cn }              from '@/utils/helpers'

export default function VideoActions({ videoId, initialLiked = false, likeCount = 0 }) {
  const { liked, count, toggle, isPending } = useVideoLike({
    id: videoId,
    initialLiked,
    initialCount: likeCount,
  })

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied!')
  }

  return (
    <div className="flex items-center gap-2 mt-4 flex-wrap">

      {/* Like */}
      <button
        onClick={toggle}
        disabled={isPending}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium',
          'bg-bg-elevated hover:bg-border transition-all',
          liked ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
        )}
      >
        <ThumbsUp size={16} fill={liked ? 'currentColor' : 'none'} />
        <span>{count > 0 ? count : 'Like'}</span>
      </button>

      {/* Save */}
      <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                         bg-bg-elevated hover:bg-border text-text-secondary hover:text-text-primary transition-all">
        <Bookmark size={16} />
        <span>Save</span>
      </button>

      {/* Share */}
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                   bg-bg-elevated hover:bg-border text-text-secondary hover:text-text-primary transition-all"
      >
        <Share2 size={16} />
        <span>Share</span>
      </button>
    </div>
  )
}