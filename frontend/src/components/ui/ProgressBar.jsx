import { cn } from '@/utils/helpers'

export default function ProgressBar({ value = 0, className, showLabel = false }) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={cn('w-full', className)}>
      <div className="w-full bg-bg-elevated rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-text-muted text-xs mt-1.5 text-right">
          {clamped < 100 ? `${clamped}% uploaded` : 'Processing...'}
        </p>
      )}
    </div>
  )
}