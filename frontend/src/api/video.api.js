import api from './axios.config'

export const videoApi = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/videos', { params })
    return data.data                       // { videos, total }
  },

  getById: async (videoId) => {
    const { data } = await api.get(`/videos/${videoId}`)
    return data.data                       // video object
  },

  publish: async (formData) => {
    const { data } = await api.post('/videos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.data
  },

  update: async (videoId, payload) => {
    const { data } = await api.patch(`/videos/${videoId}`, payload)
    return data.data
  },

  remove: async (videoId) => {
    const { data } = await api.delete(`/videos/${videoId}`)
    return data
  },

  togglePublish: async (videoId) => {
    const { data } = await api.patch(`/videos/toggle/publish/${videoId}`)
    return data.data                       // { isPublished }
  },
}