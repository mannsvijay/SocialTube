import { cn } from '@/utils/helpers'

const variants = {
  default: 'bg-accent text-white',
  success: 'bg-success text-white',
  error:   'bg-error text-white',
  warning: 'bg-warning text-black',
  muted:   'bg-bg-elevated text-text-secondary',
}

/**
 * Usage:
 *   <Badge count={5} />
 *   <Badge variant="success">New</Badge>
 *   count={0} renders nothing
 */
export default function Badge({ count, children, variant = 'default', className }) {
  const display = count != null
    ? count > 99 ? '99+' : String(count)
    : children

  if (count === 0) return null

  return (
    <span className={cn(
      'inline-flex items-center justify-center',
      'text-[10px] font-bold leading-none',
      'min-w-[18px] h-[18px] px-1 rounded-full',
      variants[variant],
      className
    )}>
      {display}
    </span>
  )
}