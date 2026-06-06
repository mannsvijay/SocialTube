import api from './axios.config'

export const commentApi = {
  getByVideo: async (videoId, params = {}) => {
    const { data } = await api.get(`/comments/${videoId}`, { params })
    return data.data                           // { comments, total }
  },

  add: async (videoId, content) => {
    const { data } = await api.post(`/comments/${videoId}`, { content })
    return data.data
  },

  update: async (commentId, content) => {
    const { data } = await api.patch(`/comments/c/${commentId}`, { content })
    return data.data
  },

  remove: async (commentId) => {
    const { data } = await api.delete(`/comments/c/${commentId}`)
    return data
  },
}