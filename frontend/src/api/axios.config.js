import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true,   // cookies automatically sent with every request
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Token Refresh Logic ───────────────────────────────────────────────────

let isRefreshing = false
let pendingQueue = []   // requests waiting for refresh to complete

const flushQueue = (error = null) => {
  pendingQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve()
  )
  pendingQueue = []
}

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const original = error.config

    // Don't intercept auth endpoints or already-retried requests
    const isAuthRoute = ['/refresh-token', '/login', '/register']
      .some((path) => original.url?.includes(path))

    if (error.response?.status !== 401 || original._retry || isAuthRoute) {
      return Promise.reject(error)
    }

    // If a refresh is already in flight, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject })
      }).then(() => api(original))
        .catch((err) => Promise.reject(err))
    }

    original._retry = true
    isRefreshing = true

    try {
      await api.post('/users/refresh-token')
      flushQueue()
      return api(original)           // retry the original request
    } catch (refreshError) {
      flushQueue(refreshError)
      // Tell AuthContext to clear the session
      window.dispatchEvent(new CustomEvent('auth:session-expired'))
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default api