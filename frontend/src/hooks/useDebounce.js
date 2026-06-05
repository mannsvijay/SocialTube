import { useState, useEffect } from 'react'

/**
 * Delays updating the returned value until `delay` ms after the last change.
 * Use for search inputs to avoid firing an API call on every keystroke.
 *
 * Usage:
 *   const debouncedQuery = useDebounce(searchQuery, 500)
 *   useEffect(() => { fetchResults(debouncedQuery) }, [debouncedQuery])
 */
export function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}