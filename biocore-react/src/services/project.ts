import api from '../utils/api'
import type {
  ApiResponse,
  PageResult,
  Project,
  CreateProjectParams,
  UpdateProjectParams,
} from '../types'

// 获取项目列表
export const getProjectList = (params?: {
  page?: number
  pageSize?: number
  status?: string
  type?: string
  search?: string
}) => {
  return api.get<ApiResponse<PageResult<Project>>>('/projects', { params })
}

// 获取项目详情
export const getProjectDetail = (id: string) => {
  return api.get<ApiResponse<Project>>(`/projects/${id}`)
}

// 创建项目
export const createProject = (data: CreateProjectParams) => {
  return api.post<ApiResponse<Project>>('/projects', data)
}

// 更新项目
export const updateProject = (id: string, data: UpdateProjectParams) => {
  return api.put<ApiResponse<Project>>(`/projects/${id}`, data)
}

// 删除项目
export const deleteProject = (id: string) => {
  return api.delete<ApiResponse>(`/projects/${id}`)
}