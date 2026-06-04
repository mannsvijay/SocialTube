import { cn } from '@/utils/helpers'

export default function Skeleton({ className }) {
  return (
    <div className={cn('animate-pulse rounded-lg bg-bg-elevated', className)} />
  )
}

// Pre-built shape for video feed
export function VideoCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="w-full aspect-video rounded-xl" />
      <div className="flex gap-3 px-1">
        <Skeleton className="w-9 h-9 rounded-full flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2 pt-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  )
}