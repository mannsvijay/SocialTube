import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link }        from 'react-router-dom'
import { toast }       from 'sonner'
import { commentApi }  from '@/api/comment.api'
import { useAuth }     from '@/hooks/useAuth'
import { KEYS }        from '@/constants/query-keys'
import { ROUTES }      from '@/constants/routes'
import Button          from '@/components/ui/Button'
import CommentInput    from './CommentInput'
import CommentList     from './CommentList'

const LIMIT = 10

const errorMessage = (err, fallback) => err?.response?.data?.message || fallback

export default function CommentSection({ videoId }) {
  const { user, isLoggedIn } = useAuth()
  const qc       = useQueryClient()
  const queryKey = KEYS.comments.byVideo(videoId)

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => commentApi.getByVideo(videoId, { page: pageParam, limit: LIMIT }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.comments.length, 0)
      return loaded < lastPage.total ? allPages.length + 1 : undefined
    },
    enabled: !!videoId,
  })

  const comments = data?.pages.flatMap(p => p.comments) ?? []
  const total    = data?.pages[0]?.total ?? 0

  const refresh = () => qc.invalidateQueries({ queryKey })

  const addMutation = useMutation({
    mutationFn: (content) => commentApi.add(videoId, content),
    onSuccess:  () => { refresh(); toast.success('Comment added') },
    onError:    (err) => toast.error(errorMessage(err, 'Failed to add comment')),
  })

  const updateMutation = useMutation({
    mutationFn: ({ commentId, content }) => commentApi.update(commentId, content),
    onSuccess:  () => { refresh(); toast.success('Comment updated') },
    onError:    (err) => toast.error(errorMessage(err, 'Failed to update comment')),
  })

  const deleteMutation = useMutation({
    mutationFn: (commentId) => commentApi.remove(commentId),
    onSuccess:  () => { refresh(); toast.success('Comment deleted') },
    onError:    (err) => toast.error(errorMessage(err, 'Failed to delete comment')),
  })

  return (
    <section className="mt-6" aria-label="Comments">
      <h2 className="text-text-primary font-semibold mb-5">
        {isLoading ? 'Comments' : `${total.toLocaleString()} Comment${total === 1 ? '' : 's'}`}
      </h2>

      <div className="mb-8">
        {isLoggedIn ? (
          <CommentInput
            user={user}
            onSubmit={(content) => addMutation.mutateAsync(content)}
          />
        ) : (
          <p className="text-text-muted text-sm">
            <Link to={ROUTES.LOGIN} className="text-accent hover:text-accent-light transition-colors">
              Log in
            </Link>{' '}
            to join the conversation.
          </p>
        )}
      </div>

      {isError ? (
        <p className="text-text-muted text-sm text-center py-8">Couldn&apos;t load comments.</p>
      ) : (
        <CommentList
          comments={comments}
          isLoading={isLoading}
          onUpdate={(commentId, content) => updateMutation.mutateAsync({ commentId, content })}
          onDelete={(commentId) => deleteMutation.mutateAsync(commentId)}
          deletingId={deleteMutation.isPending ? deleteMutation.variables : null}
        />
      )}

      {hasNextPage && (
        <div className="flex justify-center mt-6">
          <Button
            variant="outline"
            size="sm"
            isLoading={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            Show more comments
          </Button>
        </div>
      )}
    </section>
  )
}
