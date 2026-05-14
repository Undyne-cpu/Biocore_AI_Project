import api from '../utils/api'
import type { ApiResponse, PageResult, DataFile, UploadFileParams } from '../types'

// 获取文件列表
export const getFileList = (params?: {
  projectId?: string
  format?: string
  type?: string
  search?: string
  page?: number
  pageSize?: number
}) => {
  return api.get<ApiResponse<PageResult<DataFile>>>('/data', { params })
}

// 获取文件详情
export const getFileDetail = (id: string) => {
  return api.get<ApiResponse<DataFile>>(`/data/${id}`)
}

// 上传文件
export const uploadFile = (data: UploadFileParams) => {
  const formData = new FormData()
  formData.append('file', data.file)
  formData.append('projectId', data.projectId)
  if (data.type) formData.append('type', data.type)
  if (data.description) formData.append('description', data.description)

  return api.post<ApiResponse<DataFile>>('/data/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// 下载文件
export const downloadFile = (id: string) => {
  return api.get(`/data/${id}/download`, { responseType: 'blob' })
}

// 删除文件
export const deleteFile = (id: string) => {
  return api.delete<ApiResponse>(`/data/${id}`)
}