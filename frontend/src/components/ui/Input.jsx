import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/utils/helpers'

const Input = forwardRef(function Input(
  { label, error, type = 'text', className, ...props },
  ref
) {
  const [visible, setVisible] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          ref={ref}
          type={isPassword ? (visible ? 'text' : 'password') : type}
          className={cn(
            'w-full rounded-lg bg-bg-elevated border border-border',
            'px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted',
            'outline-none transition-colors focus:border-accent',
            isPassword && 'pr-10',
            error && 'border-error focus:border-error',
            className
          )}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
          >
            {visible ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>

      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
})

export default Input