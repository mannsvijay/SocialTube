import { useState }    from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast }       from 'sonner'
import { subscriptionApi } from '@/api/subscription.api'
import { useAuth }     from '@/hooks/useAuth'
import { KEYS }        from '@/constants/query-keys'
import { ROUTES }      from '@/constants/routes'

/**
 * Optimistic subscribe toggle.
 * onSuccess({ subscribed, count }) runs after the server confirms — use it to patch cached query data.
 */
export function useSubscription({ channelId, initialSubscribed = false, initialCount = 0, onSuccess }) {
  const { user, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const qc       = useQueryClient()
  const [state, setState] = useState({ subscribed: initialSubscribed, count: initialCount })

  const { mutate, isPending } = useMutation({
    mutationFn: () => subscriptionApi.toggle(channelId),
    onMutate: () => {
      const prev = { ...state }
      setState(s => ({
        subscribed: !s.subscribed,
        count: s.subscribed ? s.count - 1 : s.count + 1,
      }))
      return prev
    },
    onSuccess: (data, _, prev) => {
      const subscribed = data?.isSubscribed ?? !prev.subscribed
      const count = Math.max(prev.count + (subscribed ? 1 : 0) - (prev.subscribed ? 1 : 0), 0)
      setState({ subscribed, count })
      onSuccess?.({ subscribed, count })

      // the Subscriptions page and channel pages show this, refetch them next time they are opened
      qc.invalidateQueries({ queryKey: KEYS.subscriptions.channels(user?._id) })
      qc.invalidateQueries({ queryKey: ['user', 'channel'] })
    },
    onError: (err, __, prev) => {
      setState(prev)
      toast.error(err?.response?.data?.message || 'Failed to update subscription')
    },
  })

  const toggle = () => {
    if (!isLoggedIn) { navigate(ROUTES.LOGIN); return }
    if (!channelId) return
    mutate()
  }

  return { ...state, toggle, isPending }
}
