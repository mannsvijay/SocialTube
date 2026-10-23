import { Link }            from 'react-router-dom'
import { useQueryClient }  from '@tanstack/react-query'
import { useAuth }         from '@/context/AuthContext'
import { useSubscription } from '@/hooks/useSubscription'
import { KEYS }            from '@/constants/query-keys'
import { ROUTES }          from '@/constants/routes'
import { cn }              from '@/utils/helpers'
import Avatar              from '@/components/ui/Avatar'

export default function ChannelHeader({ channel }) {
  const { user } = useAuth()
  const qc       = useQueryClient()
  const isOwn    = user?._id === channel._id

  const { subscribed, count, toggle, isPending } = useSubscription({
    channelId:         channel._id,
    initialSubscribed: channel.isSubscribed ?? false,
    initialCount:      channel.subscribersCount ?? 0,
    onSuccess: ({ subscribed, count }) =>
      qc.setQueryData(KEYS.user.channel(channel.username), (prev) =>
        prev ? { ...prev, isSubscribed: subscribed, subscribersCount: count } : prev
      ),
  })

  return (
    <div className="mb-6">
      {/* Cover */}
      <div className="w-full h-36 md:h-48 rounded-2xl overflow-hidden bg-gradient-to-br
                      from-accent/30 via-bg-elevated to-bg-secondary">
        {channel.coverImage && (
          <img
            src={channel.coverImage}
            alt={`${channel.fullName} cover`}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Identity row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4">
        <Avatar src={channel.avatar} name={channel.fullName} size="xl" />

        <div className="flex-1 min-w-0">
          <h1 className="text-text-primary text-2xl font-bold truncate">{channel.fullName}</h1>
          <p className="text-text-muted text-sm mt-0.5">
            @{channel.username}
            <span className="mx-1.5">·</span>
            {count.toLocaleString()} subscriber{count === 1 ? '' : 's'}
            <span className="mx-1.5">·</span>
            {(channel.channelSubscribedToCount ?? 0).toLocaleString()} subscribed
          </p>
        </div>

        {isOwn ? (
          <Link
            to={ROUTES.SETTINGS}
            className="px-5 py-2 rounded-full text-sm font-semibold bg-bg-elevated
                       text-text-primary border border-border hover:border-accent/50
                       transition-colors self-start sm:self-auto"
          >
            Customize channel
          </Link>
        ) : (
          <button
            onClick={toggle}
            disabled={isPending}
            className={cn(
              'px-5 py-2 rounded-full text-sm font-semibold transition-all self-start sm:self-auto',
              subscribed
                ? 'bg-bg-elevated text-text-secondary border border-border hover:text-error hover:border-error'
                : 'bg-white text-black hover:bg-white/90'
            )}
          >
            {subscribed ? 'Subscribed' : 'Subscribe'}
          </button>
        )}
      </div>
    </div>
  )
}
