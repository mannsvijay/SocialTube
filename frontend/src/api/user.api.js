import api from './axios.config'

export const userApi = {
  getChannel: async (username) => {
    const { data } = await api.get(`/users/c/${username}`)
    return data.data
  },

  updateAccount: async (payload) => {
    const { data } = await api.patch('/users/update-account', payload)
    return data.data
  },

  updateAvatar: async (formData) => {
    const { data } = await api.patch('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.data
  },

  updateCoverImage: async (formData) => {
    const { data } = await api.patch('/users/cover-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.data
  },

  getWatchHistory: async () => {
    const { data } = await api.get('/users/watch-history')
    return data.data
  },
}