import api from './axios.config'

export const videoApi = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/videos', { params })
    return data.data
  },

  getById: async (videoId) => {
    const { data } = await api.get(`/videos/${videoId}`)
    return data.data
  },

  // onProgress(0-100) callback for upload tracking
  publish: async (formData, onProgress) => {
    const { data } = await api.post('/videos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 0,               // no timeout — large files can take time
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total))
        }
      },
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
    return data.data
  },
}