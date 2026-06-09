import api from './axios.config'

export const dashboardApi = {
  getStats: async () => {
    const { data } = await api.get('/dashboard/stats')
    return data.data           // { totalVideos, totalViews, totalLikes, totalSubscribers }
  },

  getVideos: async (params = {}) => {
    const { data } = await api.get('/dashboard/videos', { params })
    return data.data           // { videos, total }
  },
}