import { useState }    from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast }       from 'sonner'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { tweetApi }    from '@/api/tweet.api'
import { useAuth }     from '@/context/AuthContext'
import { KEYS }        from '@/constants/query-keys'
import { timeAgo }     from '@/utils/formatters'
import { toChannel }   from '@/constants/routes'
import { Link }        from 'react-router-dom'
import Avatar          from '@/components/ui/Avatar'

export default function TweetCard({ tweet, owner }) {
  const { user } = useAuth()
  const qc       = useQueryClient()
  const isOwn    = user?._id === (owner?._id || tweet.owner)

  const [editing,  setEditing]  = useState(false)
  const [editText, setEditText] = useState(tweet.content)

  const updateMutation = useMutation({
    mutationFn: () => tweetApi.update(tweet._id, editText.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.tweets.byUser(owner?._id || tweet.owner) })
      setEditing(false)
      toast.success('Tweet updated')
    },
    onError: () => toast.error('Failed to update tweet'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => tweetApi.remove(tweet._id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.tweets.byUser(owner?._id || tweet.owner) })
      toast.success('Tweet deleted')
    },
    onError: () => toast.error('Failed to delete tweet'),
  })

  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-4 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to={toChannel(owner?.username)}>
            <Avatar src={owner?.avatar} name={owner?.fullName} size="sm" />
          </Link>
          <div>
            <Link
              to={toChannel(owner?.username)}
              className="text-text-primary text-sm font-medium hover:text-accent transition-colors"
            >
              {owner?.fullName}
            </Link>
            <p className="text-text-muted text-xs">{timeAgo(tweet.createdAt)}</p>
          </div>
        </div>

        {isOwn && !editing && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded-full text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-all"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="p-1.5 rounded-full text-text-muted hover:text-error hover:bg-error/10 transition-all"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="mt-3">
          <textarea
            value={editText}
            onChange={e => setEditText(e.target.value)}
            rows={3}
            autoFocus
            className="w-full bg-bg-elevated rounded-lg px-3 py-2 text-sm text-text-primary
                       outline-none border border-border focus:border-accent resize-none"
          />
          <div className="flex gap-2 mt-2">
            <button onClick={() => updateMutation.mutate()} disabled={!editText.trim()}
              className="p-1.5 rounded-full text-success hover:bg-success/10 transition-colors">
              <Check size={14} />
            </button>
            <button onClick={() => { setEditing(false); setEditText(tweet.content) }}
              className="p-1.5 rounded-full text-text-muted hover:bg-bg-elevated transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-text-secondary text-sm leading-relaxed whitespace-pre-line">
          {tweet.content}
        </p>
      )}
    </div>
  )
}