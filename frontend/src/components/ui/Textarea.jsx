import { forwardRef, useId } from 'react'
import { cn }         from '@/utils/helpers'

const Textarea = forwardRef(function Textarea(
  { label, error, className, rows = 3, id, ...props },
  ref
) {
  const generatedId = useId()
  const textareaId  = id ?? generatedId
  const errorId     = `${textareaId}-error`

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-text-secondary">{label}</label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'w-full rounded-lg bg-bg-elevated border border-border',
          'px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted',
          'outline-none transition-colors focus:border-accent resize-none',
          error && 'border-error focus:border-error',
          className
        )}
        {...props}
      />
      {error && <p id={errorId} className="text-xs text-error">{error}</p>}
    </div>
  )
})

export default Textarea