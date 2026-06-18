import { useEffect } from 'react'

const APP_NAME = import.meta.env.VITE_APP_NAME || 'SocialTube'

/**
 * Sets the browser tab title dynamically.
 * Appends app name automatically.
 *
 * Usage:
 *   usePageTitle('Home')          → "Home | SocialTube"
 *   usePageTitle(video?.title)    → "Video Title | SocialTube"
 *   usePageTitle(null)            → "SocialTube"
 *
 * Restores previous title on unmount automatically.
 */
export function usePageTitle(title) {
  useEffect(() => {
    const previous   = document.title
    document.title   = title ? `${title} | ${APP_NAME}` : APP_NAME
    return () => { document.title = previous }
  }, [title])
}