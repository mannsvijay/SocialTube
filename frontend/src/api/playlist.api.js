import api from './axios.config'

export const playlistApi = {
  create: async ({ name, description }) => {
    const { data } = await api.post('/playlists', { name, description })
    return data.data
  },

  getById: async (playlistId) => {
    const { data } = await api.get(`/playlists/${playlistId}`)
    return data.data
  },

  getByUser: async (userId) => {
    const { data } = await api.get(`/playlists/user/${userId}`)
    return data.data                                        // array of playlists
  },

  update: async (playlistId, { name, description }) => {
    const { data } = await api.patch(`/playlists/${playlistId}`, { name, description })
    return data.data
  },

  remove: async (playlistId) => {
    const { data } = await api.delete(`/playlists/${playlistId}`)
    return data
  },

  addVideo: async (playlistId, videoId) => {
    const { data } = await api.patch(`/playlists/add/${videoId}/${playlistId}`)
    return data.data
  },

  removeVideo: async (playlistId, videoId) => {
    const { data } = await api.patch(`/playlists/remove/${videoId}/${playlistId}`)
    return data.data
  },
}