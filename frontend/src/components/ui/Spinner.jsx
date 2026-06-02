import { cn } from '@/utils/helpers'

const sizeMap = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-[3px]',
}

/**
 * Usage:
 *   <Spinner />
 *   <Spinner size="lg" className="text-accent" />
 */
export default function Spinner({ size = 'md', className }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'rounded-full border-text-muted border-t-accent animate-spin',
        sizeMap[size],
        className
      )}
    />
  )
}