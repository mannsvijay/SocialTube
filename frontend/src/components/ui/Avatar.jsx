import { cn } from '@/utils/helpers'

const sizes = {
  xs: 'w-6  h-6  text-[10px]',
  sm: 'w-8  h-8  text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-xl',
  xl: 'w-20 h-20 text-3xl',
}

const palette = [
  'bg-violet-600', 'bg-blue-600', 'bg-emerald-600',
  'bg-orange-600', 'bg-pink-600', 'bg-rose-600',
]

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
}

function color(name = '') {
  return palette[(name.charCodeAt(0) || 0) % palette.length]
}

export default function Avatar({ src, name, size = 'md', className }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'User'}
        className={cn('rounded-full object-cover flex-shrink-0', sizes[size], className)}
        loading="lazy"
      />
    )
  }

  return (
    <div className={cn(
      'rounded-full flex-shrink-0 flex items-center justify-center font-semibold text-white select-none',
      sizes[size],
      color(name),
      className
    )}>
      {initials(name)}
    </div>
  )
}