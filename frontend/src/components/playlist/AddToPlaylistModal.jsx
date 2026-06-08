import { useState }    from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast }       from 'sonner'
import { Check, Plus, Loader2 } from 'lucide-react'
import { playlistApi } from '@/api/playlist.api'
import { useAuth }     from '@/context/AuthContext'
import { KEYS }        from '@/constants/query-keys'
import Modal                from '@/components/ui/Modal'
import CreatePlaylistModal  from './CreatePlaylistModal'

export default function AddToPlaylistModal({ isOpen, onClose, videoId }) {
  const { user } = useAuth()
  const qc       = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [loadingId,  setLoadingId]  = useState(null)

  const { data: playlists = [], isLoading } = useQuery({
    queryKey: KEYS.playlists.byUser(user?._id),
    queryFn:  () => playlistApi.getByUser(user._id),
    enabled:  !!user?._id && isOpen,
  })

  const isInPlaylist = (pl) =>
    pl.videos?.some((v) => (v._id ?? v) === videoId)

  const addMutation = useMutation({
    mutationFn: ({ id }) => playlistApi.addVideo(id, videoId),
    onMutate:   ({ id }) => setLoadingId(id),
    onSuccess:  (_, { id }) => {
      qc.invalidateQueries({ queryKey: KEYS.playlists.byUser(user?._id) })
      qc.invalidateQueries({ queryKey: KEYS.playlists.detail(id) })
      toast.success('Added to playlist')
      setLoadingId(null)
    },
    onError: () => { toast.error('Failed to add'); setLoadingId(null) },
  })

  const removeMutation = useMutation({
    mutationFn: ({ id }) => playlistApi.removeVideo(id, videoId),
    onMutate:   ({ id }) => setLoadingId(id),
    onSuccess:  (_, { id }) => {
      qc.invalidateQueries({ queryKey: KEYS.playlists.byUser(user?._id) })
      qc.invalidateQueries({ queryKey: KEYS.playlists.detail(id) })
      toast.success('Removed from playlist')
      setLoadingId(null)
    },
    onError: () => { toast.error('Failed to remove'); setLoadingId(null) },
  })

  const handleToggle = (pl) => {
    const args = { id: pl._id }
    isInPlaylist(pl) ? removeMutation.mutate(args) : addMutation.mutate(args)
  }

  return (
    <>
      <Modal
        isOpen={isOpen && !showCreate}
        onClose={onClose}
        title="Save to playlist"
      >
        <div className="space-y-1 max-h-72 overflow-y-auto scrollbar-hide">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={20} className="animate-spin text-text-muted" />
            </div>
          ) : playlists.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-6">
              No playlists yet — create one below!
            </p>
          ) : (
            playlists.map((pl) => {
              const active     = isInPlaylist(pl)
              const thisLoad   = loadingId === pl._id

              return (
                <button
                  key={pl._id}
                  onClick={() => handleToggle(pl)}
                  disabled={thisLoad}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                             hover:bg-bg-elevated transition-colors text-left disabled:opacity-60 group"
                >
                  {/* Checkbox */}
                  <span className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0
                                    border-2 transition-colors
                                    ${active
                                      ? 'bg-accent border-accent'
                                      : 'border-border group-hover:border-accent/50'}`}
                  >
                    {thisLoad
                      ? <Loader2 size={11} className="animate-spin text-white" />
                      : active && <Check size={11} className="text-white" />
                    }
                  </span>

                  <span className="text-sm text-text-primary flex-1 truncate">{pl.name}</span>
                  <span className="text-xs text-text-muted ml-auto flex-shrink-0">
                    {pl.videos?.length ?? 0}
                  </span>
                </button>
              )
            })
          )}
        </div>

        {/* New playlist button */}
        <button
          onClick={() => setShowCreate(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mt-3
                     border border-dashed border-border hover:border-accent/50
                     hover:bg-bg-elevated transition-all text-left group"
        >
          <span className="w-5 h-5 rounded border-2 border-border group-hover:border-accent/50
                           flex items-center justify-center flex-shrink-0 transition-colors">
            <Plus size={11} className="text-text-muted" />
          </span>
          <span className="text-sm text-text-secondary">New playlist</span>
        </button>
      </Modal>

      {/* Nested create modal */}
      <CreatePlaylistModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => setShowCreate(false)}
      />
    </>
  )
}