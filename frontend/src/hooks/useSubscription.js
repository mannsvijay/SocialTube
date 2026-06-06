import { useState }    from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast }       from 'sonner'
import { subscriptionApi } from '@/api/subscription.api'
import { useAuth }     from '@/context/AuthContext'
import { ROUTES }      from '@/constants/routes'

export function useSubscription({ channelId, initialSubscribed = false, initialCount = 0 }) {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
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
    onError: (_, __, prev) => {
      setState(prev)
      toast.error('Failed to update subscription')
    },
  })

  const toggle = () => {
    if (!isLoggedIn) { navigate(ROUTES.LOGIN); return }
    if (!channelId) return
    mutate()
  }

  return { ...state, toggle, isPending }
}