import Skeleton    from '@/components/ui/Skeleton'
import CommentCard from './CommentCard'

export default function CommentList({ comments, isLoading, onUpdate, onDelete, deletingId }) {
  if (isLoading) {
    return (
      <div className="space-y-5">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-1/4" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!comments.length) {
    return (
      <p className="text-text-muted text-sm text-center py-8">
        No comments yet — start the conversation!
      </p>
    )
  }

  return (
    <div className="space-y-5">
      {comments.map(comment => (
        <CommentCard
          key={comment._id}
          comment={comment}
          onUpdate={onUpdate}
          onDelete={onDelete}
          isDeleting={deletingId === comment._id}
        />
      ))}
    </div>
  )
}
