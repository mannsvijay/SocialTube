import { useEffect, useRef } from 'react'
import { createPortal }      from 'react-dom'
import { X }                 from 'lucide-react'
import { cn }                from '@/utils/helpers'

export default function Modal({ isOpen, onClose, title, children, className }) {
  const overlayRef = useRef(null)

  // Escape key + body scroll lock
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Panel */}
      <div className={cn(
        'relative z-10 w-full max-w-md',
        'bg-bg-secondary border border-border rounded-2xl shadow-2xl',
        className
      )}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-text-primary font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-text-muted hover:text-text-primary
                       hover:bg-bg-elevated transition-all"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body
  )
}