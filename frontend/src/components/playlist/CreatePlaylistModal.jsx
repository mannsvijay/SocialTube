import { useForm }          from 'react-hook-form'
import { zodResolver }      from '@hookform/resolvers/zod'
import { z }                from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast }            from 'sonner'
import { playlistApi }      from '@/api/playlist.api'
import { useAuth }          from '@/context/AuthContext'
import { KEYS }             from '@/constants/query-keys'
import Modal    from '@/components/ui/Modal'
import Input    from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button   from '@/components/ui/Button'

const schema = z.object({
  name:        z.string().min(1, 'Playlist name is required').max(100),
  description: z.string().max(500).optional().default(''),
})

export default function CreatePlaylistModal({ isOpen, onClose, onCreated }) {
  const { user } = useAuth()
  const qc       = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  const { mutate } = useMutation({
    mutationFn: playlistApi.create,
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: KEYS.playlists.byUser(user?._id) })
      toast.success('Playlist created!')
      reset()
      onCreated?.(created)   // optional callback — used by AddToPlaylistModal
      onClose()
    },
    onError: () => toast.error('Failed to create playlist'),
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Playlist">
      <form
        onSubmit={handleSubmit(({ name, description }) => mutate({ name, description }))}
        className="space-y-4"
      >
        <Input
          label="Name"
          placeholder="My Playlist"
          error={errors.name?.message}
          {...register('name')}
        />

        <Textarea
          label="Description (optional)"
          placeholder="What's this playlist about?"
          rows={3}
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => { reset(); onClose() }}
            className="flex-1 rounded-lg"
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="flex-1 rounded-lg">
            Create
          </Button>
        </div>
      </form>
    </Modal>
  )
}