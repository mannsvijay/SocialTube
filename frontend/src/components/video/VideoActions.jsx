import { useState }           from 'react'
import { useNavigate }        from 'react-router-dom'
import { ThumbsUp, Bookmark, Share2 } from 'lucide-react'
import { toast }              from 'sonner'
import { useVideoLike }       from '@/hooks/useLike'
import { useAuth }            from '@/context/AuthContext'
import { ROUTES }             from '@/constants/routes'
import { cn }                 from '@/utils/helpers'
import AddToPlaylistModal     from '@/components/playlist/AddToPlaylistModal'

export default function VideoActions({ videoId, initialLiked = false, likeCount = 0 }) {
  const { isLoggedIn } = useAuth()
  const navigate       = useNavigate()
  const [saveOpen, setSaveOpen] = useState(false)

  const { liked, count, toggle, isPending } = useVideoLike({
    id:           videoId,
    initialLiked,
    initialCount: likeCount,
  })

  const handleSave = () => {
    if (!isLoggedIn) { navigate(ROUTES.LOGIN); return }
    setSaveOpen(true)
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard!')
  }

  return (
    <>
      <div className="flex items-center gap-2 mt-4 flex-wrap">

        {/* Like */}
        <button
          onClick={toggle}
          disabled={isPending}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium',
            'bg-bg-elevated hover:bg-border transition-all disabled:opacity-60',
            liked ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
          )}
        >
          <ThumbsUp size={16} fill={liked ? 'currentColor' : 'none'} />
          <span>{count > 0 ? count : 'Like'}</span>
        </button>

        {/* Save */}
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                     bg-bg-elevated hover:bg-border text-text-secondary hover:text-text-primary transition-all"
        >
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

      <AddToPlaylistModal
        isOpen={saveOpen}
        onClose={() => setSaveOpen(false)}
        videoId={videoId}
      />
    </>
  )
}