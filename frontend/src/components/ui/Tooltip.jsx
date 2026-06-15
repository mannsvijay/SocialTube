import { useState } from 'react'
import { cn }       from '@/utils/helpers'

const positions = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full   left-1/2 -translate-x-1/2 mt-2',
  left:   'right-full top-1/2  -translate-y-1/2  mr-2',
  right:  'left-full  top-1/2  -translate-y-1/2  ml-2',
}

/**
 * Lightweight hover tooltip — wraps any element.
 *
 * Usage:
 *   <Tooltip content="Delete video">
 *     <button><Trash2 /></button>
 *   </Tooltip>
 *
 *   Pass content={undefined} to disable.
 */
export default function Tooltip({ children, content, position = 'top', className }) {
  const [visible, setVisible] = useState(false)

  if (!content) return children

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={()    => setVisible(true)}
      onBlur={()     => setVisible(false)}
    >
      {children}

      {visible && (
        <div
          role="tooltip"
          className={cn(
            'absolute z-50 pointer-events-none whitespace-nowrap',
            'px-2.5 py-1 rounded-lg text-xs font-medium',
            'bg-bg-elevated border border-border text-text-primary shadow-xl',
            positions[position],
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  )
}