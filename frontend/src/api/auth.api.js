import api from './axios.config'

/**
 * All functions return res.data.data — the actual payload.
 * No double .data needed in components or hooks.
 */
export const authApi = {

  /**
   * @param {FormData} formData — must include avatar file
   */
  register: async (formData) => {
    const { data } = await api.post('/users/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.data
  },

  /**
   * @param {{ email?: string, username?: string, password: string }}
   */
  login: async (credentials) => {
    const { data } = await api.post('/users/login', credentials)
    return data.data   // { user, accessToken, refreshToken }
  },

  logout: async () => {
    const { data } = await api.post('/users/logout')
    return data
  },

  getCurrentUser: async () => {
    const { data } = await api.get('/users/current-user')
    return data.data   // user object directly
  },

  changePassword: async ({ oldPassword, newPassword }) => {
    const { data } = await api.post('/users/change-password', { oldPassword, newPassword })
    return data
  },
}