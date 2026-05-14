import api from '../utils/api'
import type { ApiResponse, Result } from '../types'

// 获取结果列表
export const getResultList = (params?: {
  projectId?: string
  toolId?: string
  status?: string
  search?: string
}) => {
  return api.get<ApiResponse<Result[]>>('/results', { params })
}

// 获取结果详情
export const getResultDetail = (id: string) => {
  return api.get<ApiResponse<Result>>(`/results/${id}`)
}

// 下载结果
export const downloadResult = (id: string) => {
  return api.get(`/results/${id}/download`, { responseType: 'blob' })
}

// 删除结果
export const deleteResult = (id: string) => {
  return api.delete<ApiResponse>(`/results/${id}`)
}