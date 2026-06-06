import api from './axios.config'

export const tweetApi = {
  create:  async (content)           => { const { data } = await api.post('/tweets',             { content }); return data.data },
  getByUser: async (userId)          => { const { data } = await api.get(`/tweets/user/${userId}`);           return data.data },
  update:  async (tweetId, content)  => { const { data } = await api.patch(`/tweets/${tweetId}`, { content }); return data.data },
  remove:  async (tweetId)           => { const { data } = await api.delete(`/tweets/${tweetId}`);            return data },
}