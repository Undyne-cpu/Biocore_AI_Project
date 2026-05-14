import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { message } from 'antd'

const BASE_URL = 'http://localhost:8000'

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器：添加 Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// 响应拦截器：统一处理错误
api.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== 200) {
      message.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return response
  },
  async (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status
      const res = error.response.data as any

      switch (status) {
        case 401:
          // Token 过期，尝试刷新
          const refreshToken = localStorage.getItem('refreshToken')
          if (refreshToken) {
            try {
              const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
              const { token, refreshToken: newRefreshToken } = response.data.data
              localStorage.setItem('token', token)
              localStorage.setItem('refreshToken', newRefreshToken)
              // 重试原请求
              if (error.config && error.config.headers) {
                error.config.headers.Authorization = `Bearer ${token}`
                return api(error.config)
              }
            } catch {
              // 刷新失败，跳转登录
              localStorage.removeItem('token')
              localStorage.removeItem('refreshToken')
              window.location.href = '/login'
            }
          } else {
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            window.location.href = '/login'
          }
          break
        case 403:
          message.error('权限不足')
          break
        case 404:
          message.error('资源不存在')
          break
        case 500:
          message.error('服务器内部错误')
          break
        default:
          message.error(res?.message || '请求失败')
      }
    } else if (error.request) {
      message.error('网络连接失败，请检查网络')
    } else {
      message.error('请求配置错误')
    }
    return Promise.reject(error)
  }
)

export default api
export { BASE_URL }