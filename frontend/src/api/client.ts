import axios from 'axios'
import { clearAuth, getToken } from '../auth/storage'

const client = axios.create({ baseURL: '/api' })

client.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const path = window.location.pathname
      if (path !== '/login' && path !== '/signup') {
        clearAuth()
        window.location.href = '/login'
        return new Promise(() => {})
      }
    }
    const msg = err.response?.data?.message || '오류가 발생했습니다.'
    return Promise.reject(new Error(msg))
  },
)

export default client
