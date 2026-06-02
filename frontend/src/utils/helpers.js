import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Safely merge Tailwind classes — conflicts resolve in favor of the last class
 * Usage: cn('px-4 py-2', isActive && 'bg-accent', className)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}