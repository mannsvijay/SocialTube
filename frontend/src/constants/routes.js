export const ROUTES = {
  HOME:            '/',
  LOGIN:           '/login',
  REGISTER:        '/register',

  // Dynamic — use helpers for link generation
  WATCH:           '/watch/:videoId',
  CHANNEL:         '/c/:username',
  PLAYLIST_DETAIL: '/playlist/:playlistId',

  SEARCH:          '/search',
  UPLOAD:          '/upload',
  STUDIO:          '/studio',
  LIKED_VIDEOS:    '/liked-videos',
  HISTORY:         '/history',
  PLAYLISTS:       '/playlists',
  TWEETS:          '/tweets',
  SUBSCRIPTIONS:   '/subscriptions',
  SETTINGS:        '/settings',
  NOT_FOUND:       '*',
}

// Helper functions for dynamic routes
export const toWatch        = (id)       => `/watch/${id}`
export const toChannel      = (username) => `/c/${username}`
export const toPlaylist     = (id)       => `/playlist/${id}`
export const toSearch       = (query)    => `/search?q=${encodeURIComponent(query)}`