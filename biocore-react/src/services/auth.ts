import api from '../utils/api'
import type {
  ApiResponse,
  LoginParams,
  RegisterParams,
  AuthUser,
  AuthResponse,
  RefreshTokenResponse,
} from '../types'

// 用户登录
export const login = (data: LoginParams) => {
  return api.post<ApiResponse<AuthResponse>>('/auth/login', data)
}

// 用户注册
export const register = (data: RegisterParams) => {
  return api.post<ApiResponse<AuthResponse>>('/auth/register', data)
}

// 用户登出
export const logout = () => {
  return api.post<ApiResponse>('/auth/logout')
}

// 获取当前用户信息
export const getCurrentUser = () => {
  return api.get<ApiResponse<AuthUser>>('/auth/me')
}

// 刷新 Token
export const refreshToken = (refreshToken: string) => {
  return api.post<ApiResponse<RefreshTokenResponse>>('/auth/refresh', { refreshToken })
}

// 保存 Token 到本地
export const saveAuth = (data: AuthResponse) => {
  localStorage.setItem('token', data.token)
  localStorage.setItem('refreshToken', data.refreshToken)
  localStorage.setItem('user', JSON.stringify({
    id: data.id,
    email: data.email,
    name: data.name,
    avatar: data.avatar,
  }))
}

// 清除本地 Auth
export const clearAuth = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}

// 获取本地用户信息
export const getLocalUser = () => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

// 检查是否已登录
export const isAuthenticated = () => {
  return !!localStorage.getItem('token')
}