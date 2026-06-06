import api from './axios.config'

export const subscriptionApi = {
  // Toggle subscribe / unsubscribe to a channel
  toggle: async (channelId) => {
    const { data } = await api.post(`/subscriptions/c/${channelId}`)
    return data.data                           // { isSubscribed }
  },

  // Channels that subscriberId is subscribed to
  getSubscribedChannels: async (subscriberId) => {
    const { data } = await api.get(`/subscriptions/c/${subscriberId}`)
    return data.data                           // { channels, totalChannels }
  },

  // Subscribers of channelId
  getSubscribers: async (channelId) => {
    const { data } = await api.get(`/subscriptions/u/${channelId}`)
    return data.data                           // { subscribers, totalSubscribers }
  },
}