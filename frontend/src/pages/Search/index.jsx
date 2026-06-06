import { useSearchParams } from 'react-router-dom'
import { useQuery }        from '@tanstack/react-query'
import { videoApi }        from '@/api/video.api'
import { KEYS }            from '@/constants/query-keys'
import VideoGrid           from '@/components/video/VideoGrid'
import { Search }          from 'lucide-react'

export default function SearchPage() {
  const [params]  = useSearchParams()
  const query     = params.get('q') || ''

  const { data, isLoading } = useQuery({
    queryKey: KEYS.videos.list({ query }),
    queryFn:  () => videoApi.getAll({ query, limit: 20 }),
    enabled:  !!query.trim(),
  })

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
        <Search size={40} className="text-text-muted" />
        <p className="text-text-primary font-medium">Search for videos</p>
        <p className="text-text-muted text-sm">Type something in the search bar above.</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-text-secondary text-sm mb-6">
        {isLoading
          ? 'Searching...'
          : `${data?.total ?? 0} results for "${query}"`
        }
      </p>
      <VideoGrid
        videos={data?.videos}
        isLoading={isLoading}
        skeletonCount={8}
      />
    </div>
  )
}