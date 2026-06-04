import { cn } from '@/utils/helpers'
import Spinner from './Spinner'

const variants = {
  default: 'bg-accent hover:bg-accent-hover text-white',
  ghost:   'bg-transparent hover:bg-bg-elevated text-text-secondary hover:text-text-primary',
  outline: 'border border-border hover:border-border-light bg-transparent text-text-primary',
  danger:  'bg-error hover:bg-red-600 text-white',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm gap-1.5 h-8',
  md: 'px-4 py-2   text-sm gap-2   h-9',
  lg: 'px-6 py-2.5 text-base gap-2 h-11',
}

export default function Button({
  children,
  variant  = 'default',
  size     = 'md',
  isLoading = false,
  className,
  disabled,
  ...props
}) {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium',
        'transition-all duration-150 select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading
        ? <Spinner size="sm" className="border-current border-t-transparent" />
        : children
      }
    </button>
  )
}