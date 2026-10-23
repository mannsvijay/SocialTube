import { useState }    from 'react'
import { Link }        from 'react-router-dom'
import { ThumbsUp, Pencil, Trash2 } from 'lucide-react'
import { useCommentLike } from '@/hooks/useLike'
import { useAuth }     from '@/context/AuthContext'
import { toChannel }   from '@/constants/routes'
import { timeAgo }     from '@/utils/formatters'
import { cn }          from '@/utils/helpers'
import Avatar          from '@/components/ui/Avatar'
import ConfirmDialog   from '@/components/ui/ConfirmDialog'
import CommentInput    from './CommentInput'

export default function CommentCard({ comment, onUpdate, onDelete, isDeleting }) {
  const { user } = useAuth()
  const [editing,    setEditing]    = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)

  const owner  = comment.owner ?? {}
  const isOwn  = !!user && user._id === owner._id
  const edited = comment.updatedAt && comment.updatedAt !== comment.createdAt

  const { liked, count, toggle, isPending } = useCommentLike({
    id:           comment._id,
    initialLiked: comment.isLiked ?? false,
    initialCount: comment.likesCount ?? 0,
  })

  return (
    <div className="flex gap-3 group">
      <Link to={toChannel(owner.username)} className="flex-shrink-0">
        <Avatar src={owner.avatar} name={owner.fullName || owner.username} size="sm" />
      </Link>

      <div className="flex-1 min-w-0">
        {editing ? (
          <CommentInput
            initialValue={comment.content}
            submitLabel="Save"
            placeholder="Edit your comment"
            autoFocus
            onSubmit={async (content) => {
              await onUpdate(comment._id, content)
              setEditing(false)
            }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <>
            <div className="flex items-baseline gap-2 flex-wrap">
              <Link
                to={toChannel(owner.username)}
                className="text-text-primary text-xs font-semibold hover:text-accent transition-colors"
              >
                @{owner.username}
              </Link>
              <span className="text-text-muted text-xs">
                {timeAgo(comment.createdAt)}{edited && ' (edited)'}
              </span>
            </div>

            <p className="text-text-secondary text-sm mt-1 whitespace-pre-line break-words">
              {comment.content}
            </p>

            <div className="flex items-center gap-1 mt-1.5 -ml-2">
              <button
                onClick={toggle}
                disabled={isPending}
                aria-label={liked ? 'Unlike comment' : 'Like comment'}
                className={cn(
                  'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-colors',
                  'hover:bg-bg-elevated disabled:opacity-60',
                  liked ? 'text-accent' : 'text-text-muted hover:text-text-primary'
                )}
              >
                <ThumbsUp size={13} fill={liked ? 'currentColor' : 'none'} />
                {count > 0 && <span>{count}</span>}
              </button>

              {isOwn && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditing(true)}
                    aria-label="Edit comment"
                    className="p-1.5 rounded-full text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => setConfirmDel(true)}
                    aria-label="Delete comment"
                    className="p-1.5 rounded-full text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDel}
        onClose={() => setConfirmDel(false)}
        onConfirm={async () => {
          try {
            await onDelete(comment._id)
            setConfirmDel(false)
          } catch {
            // CommentSection already shows the error toast, keep the dialog open to retry
          }
        }}
        isLoading={isDeleting}
        title="Delete comment?"
        description="Your comment will be permanently removed."
        confirmLabel="Delete"
      />
    </div>
  )
}
