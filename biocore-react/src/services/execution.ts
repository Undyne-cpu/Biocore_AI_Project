import api from '../utils/api'
import type { ApiResponse, Execution, ExecutionNode } from '../types'

// 获取执行列表
export const getExecutionList = (params?: {
  status?: string
  workflowId?: string
}) => {
  return api.get<ApiResponse<Execution[]>>('/executions', { params })
}

// 获取执行详情
export const getExecutionDetail = (id: string) => {
  return api.get<ApiResponse<Execution & { nodes: ExecutionNode[] }>>(`/executions/${id}`)
}

// 获取执行日志
export const getExecutionLogs = (id: string) => {
  return api.get<ApiResponse<{ logs: string[] }>>(`/executions/${id}/logs`)
}

// 获取资源使用
export const getExecutionResources = (id: string) => {
  return api.get<ApiResponse<any>>(`/executions/${id}/resources`)
}

// 暂停执行
export const pauseExecution = (id: string) => {
  return api.post<ApiResponse>(`/executions/${id}/pause`)
}

// 恢复执行
export const resumeExecution = (id: string) => {
  return api.post<ApiResponse>(`/executions/${id}/resume`)
}

// 停止执行
export const stopExecution = (id: string) => {
  return api.post<ApiResponse>(`/executions/${id}/stop`)
}