import axios from 'axios'

const client = axios.create({ baseURL: '/api' })

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message || '오류가 발생했습니다.'
    return Promise.reject(new Error(msg))
  },
)

export default client
