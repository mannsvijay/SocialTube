import VideoCard from './VideoCard'
import { VideoCardSkeleton } from '@/components/ui/Skeleton'
import { cn } from '@/utils/helpers'

const GRID = 'grid gap-x-4 gap-y-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

export default function VideoGrid({
  videos = [],
  isLoading,
  skeletonCount = 12,
  className,
}) {
  if (isLoading) {
    return (
      <div className={cn(GRID, className)}>
        {Array.from({ length: skeletonCount }, (_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!videos.length) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
        <span className="text-5xl">📭</span>
        <div>
          <p className="text-text-primary font-medium">No videos yet</p>
          <p className="text-text-muted text-sm mt-1">
            Be the first to upload, or check back later.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(GRID, className)}>
      {videos.map(video => (
        <VideoCard key={video._id} video={video} />
      ))}
    </div>
  )
}