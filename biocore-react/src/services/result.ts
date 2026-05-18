import api from '../utils/api'
import type { ApiResponse, Result, ResultDetail } from '../types'

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
  return api.get<ApiResponse<ResultDetail>>(`/results/${id}`)
}

// 下载结果
export const downloadResult = (id: string) => {
  return api.get(`/results/${id}/download`, { responseType: 'blob' })
}

// 删除结果
export const deleteResult = (id: string) => {
  return api.delete<ApiResponse>(`/results/${id}`)
}

// 获取结果文件列表（含可访问 URL）
export interface ResultFile {
  name: string
  type: string
  url: string
  size: string
  path?: string
  index?: number
}

// 后端返回的文件列表结构
interface ResultFilesResponse {
  files: ResultFile[]
}

export const getResultFiles = (id: string) => {
  return api.get<ApiResponse<ResultFilesResponse>>(`/results/${id}/files`)
}