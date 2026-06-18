import { useState, useEffect } from 'react'
import { ArrowUp }             from 'lucide-react'
import { cn }                  from '@/utils/helpers'

/**
 * Fixed button that appears after scrolling 400px.
 * Smoothly scrolls back to top on click.
 * Sits above mobile nav on small screens.
 */
export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
      className={cn(
        'fixed bottom-24 md:bottom-8 right-4 z-40',
        'w-10 h-10 rounded-full',
        'bg-bg-elevated border border-border shadow-xl',
        'flex items-center justify-center',
        'text-text-secondary hover:text-text-primary',
        'hover:border-accent/50 hover:bg-bg-secondary',
        'transition-all duration-300',
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      )}
    >
      <ArrowUp size={16} />
    </button>
  )
}