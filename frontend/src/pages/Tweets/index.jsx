import { useState }    from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast }       from 'sonner'
import { Send }        from 'lucide-react'
import { tweetApi }    from '@/api/tweet.api'
import { useAuth }     from '@/context/AuthContext'
import { KEYS }        from '@/constants/query-keys'
import TweetCard       from '@/components/tweet/TweetCard'
import Avatar          from '@/components/ui/Avatar'
import Skeleton        from '@/components/ui/Skeleton'

export default function Tweets() {
  const { user }  = useAuth()
  const qc        = useQueryClient()
  const [text, setText] = useState('')

  const { data: tweets, isLoading } = useQuery({
    queryKey: KEYS.tweets.byUser(user?._id),
    queryFn:  () => tweetApi.getByUser(user._id),
    enabled:  !!user?._id,
  })

  const { mutate, isPending } = useMutation({
    mutationFn: () => tweetApi.create(text.trim()),
    onSuccess: () => {
      setText('')
      qc.invalidateQueries({ queryKey: KEYS.tweets.byUser(user._id) })
      toast.success('Tweet posted!')
    },
    onError: () => toast.error('Failed to post tweet'),
  })

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-text-primary mb-6">Tweets</h1>

      {/* Compose */}
      <div className="bg-bg-secondary border border-border rounded-xl p-4 mb-6 flex gap-3">
        <Avatar src={user?.avatar} name={user?.fullName} size="sm" className="flex-shrink-0 mt-1" />
        <div className="flex-1">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            className="w-full bg-transparent outline-none resize-none text-sm
                       text-text-primary placeholder:text-text-muted"
          />
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
            <span className={`text-xs ${text.length > 280 ? 'text-error' : 'text-text-muted'}`}>
              {text.length}/280
            </span>
            <button
              onClick={() => mutate()}
              disabled={isPending || !text.trim() || text.length > 280}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent text-white
                         text-sm font-medium hover:bg-accent-hover disabled:opacity-50 transition-all"
            >
              <Send size={13} />
              {isPending ? 'Posting...' : 'Tweet'}
            </button>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {isLoading
          ? Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          : tweets?.length
            ? tweets.map(t => <TweetCard key={t._id} tweet={t} owner={user} />)
            : (
              <div className="text-center py-16">
                <p className="text-text-muted">No tweets yet — share something!</p>
              </div>
            )
        }
      </div>
    </div>
  )
}