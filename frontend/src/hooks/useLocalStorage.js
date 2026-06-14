import { useState } from 'react'

/**
 * useState that persists to localStorage.
 * Handles JSON serialization and parse errors gracefully.
 *
 * Usage:
 *   const [collapsed, setCollapsed, removeCollapsed] = useLocalStorage('sidebar', false)
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      return item !== null ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      const next = value instanceof Function ? value(storedValue) : value
      setStoredValue(next)
      localStorage.setItem(key, JSON.stringify(next))
    } catch (error) {
      console.error(`[useLocalStorage] Failed to set "${key}":`, error)
    }
  }

  const remove = () => {
    try {
      setStoredValue(initialValue)
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`[useLocalStorage] Failed to remove "${key}":`, error)
    }
  }

  return [storedValue, setValue, remove]
}