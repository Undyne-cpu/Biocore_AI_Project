import api from '../utils/api'
import type {
  ApiResponse,
  PageResult,
  User,
  UserSettings,
  UpdateUserParams,
  UpdatePasswordParams,
} from '../types'

// 获取用户列表
export const getUserList = (params?: {
  page?: number
  pageSize?: number
  search?: string
}) => {
  return api.get<ApiResponse<PageResult<User>>>('/users', { params })
}

// 获取用户详情
export const getUserDetail = (id: string) => {
  return api.get<ApiResponse<User>>(`/users/${id}`)
}

// 更新用户信息
export const updateUser = (id: string, data: UpdateUserParams) => {
  return api.put<ApiResponse<User>>(`/users/${id}`, data)
}

// 修改密码
export const updatePassword = (id: string, data: UpdatePasswordParams) => {
  return api.put<ApiResponse>(`/users/${id}/password`, data)
}

// 获取用户设置
export const getUserSettings = (id: string) => {
  return api.get<ApiResponse<UserSettings>>(`/users/${id}/settings`)
}

// 更新用户设置
export const updateUserSettings = (id: string, data: Partial<UserSettings>) => {
  return api.put<ApiResponse<UserSettings>>(`/users/${id}/settings`, data)
}