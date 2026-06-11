import { useEffect, useRef, useCallback } from 'react'

/**
 * IntersectionObserver-based infinite scroll.
 * Returns a ref callback — attach to a sentinel element at the bottom of the list.
 *
 * Usage:
 *   const sentinelRef = useInfiniteScroll(fetchNextPage, { enabled: hasNextPage })
 *   <div ref={sentinelRef} />
 */
export function useInfiniteScroll(
  callback,
  { enabled = true, threshold = 0.3, rootMargin = '100px' } = {}
) {
  const observerRef = useRef(null)

  const sentinelRef = useCallback(
    (node) => {
      // Disconnect previous observer
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }

      if (!node || !enabled) return

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) callback()
        },
        { threshold, rootMargin }
      )

      observerRef.current.observe(node)
    },
    [callback, enabled, threshold, rootMargin]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect()
    }
  }, [])

  return sentinelRef
}