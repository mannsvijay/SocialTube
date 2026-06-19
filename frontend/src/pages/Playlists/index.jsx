import { useState }     from 'react'
import { useQuery }     from '@tanstack/react-query'
import { Plus }         from 'lucide-react'
import { playlistApi }  from '@/api/playlist.api'
import { useAuth }      from '@/context/AuthContext'
import { KEYS }         from '@/constants/query-keys'
import { usePageTitle } from '@/hooks/usePageTitle'
import PlaylistCard         from '@/components/playlist/PlaylistCard'
import CreatePlaylistModal  from '@/components/playlist/CreatePlaylistModal'
import EmptyState  from '@/components/ui/EmptyState'
import Skeleton    from '@/components/ui/Skeleton'
import Button      from '@/components/ui/Button'

const GRID = 'grid gap-x-4 gap-y-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

export default function Playlists() {
  const { user }        = useAuth()
  const [open, setOpen] = useState(false)
  usePageTitle('Your Playlists')

  const { data: playlists, isLoading } = useQuery({
    queryKey: KEYS.playlists.byUser(user?._id),
    queryFn:  () => playlistApi.getByUser(user._id),
    enabled:  !!user?._id,
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">
          Your Playlists
        </h1>
        <Button onClick={() => setOpen(true)} size="sm" className="gap-1.5">
          <Plus size={15} />
          New Playlist
        </Button>
      </div>

      {isLoading ? (
        <div className={GRID}>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="w-full aspect-video rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : !playlists?.length ? (
        <EmptyState
          emoji="🎵"
          title="No playlists yet"
          description="Create a playlist to organize your favorite videos."
          action={{ label: 'Create playlist', onClick: () => setOpen(true) }}
        />
      ) : (
        <div className={GRID}>
          {playlists.map(pl => (
            <PlaylistCard key={pl._id} playlist={pl} />
          ))}
        </div>
      )}

      <CreatePlaylistModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  )
}