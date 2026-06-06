import api from './axios.config'

export const likeApi = {
  toggleVideo:   async (videoId)   => { const { data } = await api.post(`/likes/toggle/v/${videoId}`);   return data.data },
  toggleComment: async (commentId) => { const { data } = await api.post(`/likes/toggle/c/${commentId}`); return data.data },
  toggleTweet:   async (tweetId)   => { const { data } = await api.post(`/likes/toggle/t/${tweetId}`);   return data.data },

  getLikedVideos: async () => {
    const { data } = await api.get('/likes/videos')
    return data.data
  },
}