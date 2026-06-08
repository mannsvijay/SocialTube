import { forwardRef } from 'react'
import { cn }         from '@/utils/helpers'

const Textarea = forwardRef(function Textarea(
  { label, error, className, rows = 3, ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-text-secondary">{label}</label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          'w-full rounded-lg bg-bg-elevated border border-border',
          'px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted',
          'outline-none transition-colors focus:border-accent resize-none',
          error && 'border-error focus:border-error',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
})

export default Textarea