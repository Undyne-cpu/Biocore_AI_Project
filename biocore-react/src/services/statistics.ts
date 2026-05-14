import api from '../utils/api'
import type { ApiResponse, DashboardStats, TrendData } from '../types'

// 获取仪表盘统计
export const getDashboardStats = () => {
  return api.get<ApiResponse<DashboardStats>>('/statistics/dashboard')
}

// 获取使用统计
export const getUsageStats = () => {
  return api.get<ApiResponse<any>>('/statistics/usage')
}

// 获取趋势数据
export const getTrendData = (params: { period: 'day' | 'week' | 'month' }) => {
  return api.get<ApiResponse<TrendData>>('/statistics/trend', { params })
}