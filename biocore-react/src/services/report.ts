import api from '../utils/api'
import type { ApiResponse, Report, ReportType } from '../types'

// 获取报告列表
export const getReportList = () => {
  return api.get<ApiResponse<Report[]>>('/reports')
}

// 获取报告详情
export const getReportDetail = (id: string) => {
  return api.get<ApiResponse<Report>>(`/reports/${id}`)
}

// 创建报告
export const createReport = (data: {
  projectId: string
  type: ReportType
  template?: string
}) => {
  return api.post<ApiResponse<Report>>('/reports', data)
}

// 下载报告
export const downloadReport = (id: string, format: 'pdf' | 'docx' | 'html' = 'pdf') => {
  return api.get(`/reports/${id}/download`, {
    params: { format },
    responseType: 'blob',
  })
}