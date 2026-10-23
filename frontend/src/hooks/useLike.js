import { useState }    from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { likeApi }     from '@/api/like.api'
import { useAuth }     from '@/hooks/useAuth'
import { ROUTES }      from '@/constants/routes'
import { toast }       from 'sonner'

/**
 * Optimistic like toggle.
 * onSuccess({ liked, count }) runs after the server confirms — use it to patch cached query data.
 */
function createLikeHook(mutationFn) {
  return function useLike({ id, initialLiked = false, initialCount = 0, onSuccess }) {
    const { isLoggedIn } = useAuth()
    const navigate       = useNavigate()
    const [state, setState] = useState({ liked: initialLiked, count: initialCount })

    const { mutate, isPending } = useMutation({
      mutationFn: () => mutationFn(id),
      onMutate: () => {
        const prev = { ...state }
        setState(s => ({
          liked: !s.liked,
          count: s.liked ? s.count - 1 : s.count + 1,
        }))
        return prev
      },
      onSuccess: (data, _, prev) => {
        // trust the server's answer in case the optimistic guess was wrong
        const liked = data?.isLiked ?? !prev.liked
        const count = Math.max(prev.count + (liked ? 1 : 0) - (prev.liked ? 1 : 0), 0)
        setState({ liked, count })
        onSuccess?.({ liked, count })
      },
      onError: (_, __, prev) => {
        setState(prev)
        toast.error('Failed to update like')
      },
    })

    const toggle = () => {
      if (!isLoggedIn) { navigate(ROUTES.LOGIN); return }
      if (!id) return
      mutate()
    }

    return { ...state, toggle, isPending }
  }
}

export const useVideoLike   = createLikeHook(likeApi.toggleVideo)
export const useCommentLike = createLikeHook(likeApi.toggleComment)
export const useTweetLike   = createLikeHook(likeApi.toggleTweet)
