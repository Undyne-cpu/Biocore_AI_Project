import api from '../utils/api'
import type { ApiResponse, Tool, ToolDetail, RunToolParams, ToolRunResponse } from '../types'

// 获取工具列表
export const getToolList = (params?: {
  category?: string
  search?: string
}) => {
  return api.get<ApiResponse<{ categories: any[]; list: Tool[] }>>('/tools', { params })
}

// 获取工具详情
export const getToolDetail = (id: string) => {
  return api.get<ApiResponse<ToolDetail>>(`/tools/${id}`)
}

// 运行工具
export const runTool = (id: string, data: RunToolParams) => {
  return api.post<ApiResponse<ToolRunResponse>>(`/tools/${id}/run`, data)
}