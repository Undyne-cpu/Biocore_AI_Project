import api from '../utils/api'
import type {
  ApiResponse,
  Workflow,
  CreateWorkflowParams,
  RunWorkflowParams,
  WorkflowRunResponse,
} from '../types'

// 获取工作流列表
export const getWorkflowList = () => {
  return api.get<ApiResponse<Workflow[]>>('/workflows')
}

// 获取工作流详情
export const getWorkflowDetail = (id: string) => {
  return api.get<ApiResponse<Workflow>>(`/workflows/${id}`)
}

// 创建工作流
export const createWorkflow = (data: CreateWorkflowParams) => {
  return api.post<ApiResponse<Workflow>>('/workflows', data)
}

// 更新工作流
export const updateWorkflow = (id: string, data: Partial<CreateWorkflowParams>) => {
  return api.put<ApiResponse<Workflow>>(`/workflows/${id}`, data)
}

// 删除工作流
export const deleteWorkflow = (id: string) => {
  return api.delete<ApiResponse>(`/workflows/${id}`)
}

// 运行工作流
export const runWorkflow = (id: string, data: RunWorkflowParams) => {
  return api.post<ApiResponse<WorkflowRunResponse>>(`/workflows/${id}/run`, data)
}

// 验证工作流
export const validateWorkflow = (id: string) => {
  return api.post<ApiResponse<{ valid: boolean; errors: string[] }>>(`/workflows/${id}/validate`)
}