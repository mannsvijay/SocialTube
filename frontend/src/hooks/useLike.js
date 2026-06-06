import { useState }    from 'react'
import { useMutation } from '@tanstack/react-query'
import { likeApi }     from '@/api/like.api'
import { toast }       from 'sonner'

function createLikeHook(mutationFn) {
  return function useLike({ id, initialLiked = false, initialCount = 0 }) {
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
      onError: (_, __, prev) => {
        setState(prev)
        toast.error('Failed to update like')
      },
    })

    return { ...state, toggle: mutate, isPending }
  }
}

export const useVideoLike   = createLikeHook(likeApi.toggleVideo)
export const useCommentLike = createLikeHook(likeApi.toggleComment)
export const useTweetLike   = createLikeHook(likeApi.toggleTweet)