import { useNavigate } from 'react-router-dom'
import { ArrowLeft }   from 'lucide-react'
import { cn }          from '@/utils/helpers'

/**
 * Goes back in browser history.
 * Falls back to a given route if no history exists.
 *
 * Usage:
 *   <BackButton />
 *   <BackButton fallback="/playlists" label="Back to playlists" />
 */
export default function BackButton({
  fallback = '/',
  label    = 'Back',
  className,
}) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1)
    } else {
      navigate(fallback)
    }
  }

  return (
    <button
      onClick={handleBack}
      className={cn(
        'inline-flex items-center gap-1.5',
        'text-sm text-text-muted hover:text-text-primary',
        'transition-colors',
        className
      )}
    >
      <ArrowLeft size={15} />
      {label}
    </button>
  )
}