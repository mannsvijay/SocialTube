import { cn }    from '@/utils/helpers'
import Button    from './Button'

/**
 * Reusable empty/zero-state component.
 *
 * Usage:
 *   <EmptyState
 *     emoji="📭"
 *     title="No videos yet"
 *     description="Upload your first video to get started."
 *     action={{ label: 'Upload Now', onClick: () => navigate(ROUTES.UPLOAD) }}
 *   />
 */
export default function EmptyState({
  emoji       = '📭',
  title       = 'Nothing here yet',
  description,
  action,
  className,
}) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-24 gap-4 text-center',
      className
    )}>
      <span className="text-6xl select-none" aria-hidden="true">
        {emoji}
      </span>

      <div className="max-w-xs">
        <p className="text-text-primary font-semibold text-lg">{title}</p>
        {description && (
          <p className="text-text-muted text-sm mt-1.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant ?? 'default'}
          size="sm"
          className="mt-2 rounded-xl"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}