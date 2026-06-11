/**
 * Centralized query key factory — prevents string typos
 * and makes cache invalidation predictable.
 *
 * Usage:
 *   queryKey: KEYS.videos.detail(videoId)
 *   invalidateQueries({ queryKey: KEYS.comments.byVideo(videoId) })
 */
export const KEYS = {
  videos: {
    all:      ()       => ['videos'],
    lists:    ()       => ['videos', 'list'],
    list:     (params) => ['videos', 'list', params ?? {}],
    detail:   (id)     => ['videos', 'detail', id],
    infinite: (params) => ['videos', 'infinite', params ?? {}],  // ← NEW
  },

  user: {
    current:  ['user', 'current'],
    channel:  (username) => ['user', 'channel', username],
    history:  ['user', 'history'],
  },

  comments: {
    byVideo: (videoId) => ['comments', videoId],
  },

  likes: {
    videos: ['likes', 'videos'],
  },

  playlists: {
    mine:    ['playlists', 'mine'],
    byUser:  (userId) => ['playlists', 'user', userId],
    detail:  (id)     => ['playlists', 'detail', id],
  },

  subscriptions: {
    channels:    (subscriberId) => ['subscriptions', 'channels', subscriberId],
    subscribers: (channelId)    => ['subscriptions', 'subscribers', channelId],
  },

  tweets: {
    byUser: (userId) => ['tweets', userId],
  },

  dashboard: {
    stats:  ['dashboard', 'stats'],
    videos: ['dashboard', 'videos'],
  },
}