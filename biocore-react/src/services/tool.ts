import api from '../utils/api'
import type { ApiResponse, Tool, ToolDetail, RunToolParams, ToolRunResponse } from '../types'

// 任务状态类型
export type TaskStatus = 'queued' | 'running' | 'completed' | 'failed' | 'not_found'

// 任务状态响应
export interface TaskStatusResponse {
  status: TaskStatus
  taskId: string
  resultId?: string
  output_files?: string[]
  logs?: string
  error?: string
}

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

// 查询任务状态
export const getTaskStatus = (toolId: string, taskId: string) => {
  return api.get<ApiResponse<TaskStatusResponse>>(`/tools/${toolId}/tasks/${taskId}/status`)
}