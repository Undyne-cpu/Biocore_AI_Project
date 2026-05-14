import api from '../utils/api'
import type { ApiResponse, ChartData, VisualizationData } from '../types'

// 获取可视化数据
export const getVisualizationData = (params?: {
  region?: string
  dataId?: string
}) => {
  return api.get<ApiResponse<VisualizationData>>('/visualize/data', { params })
}

// 获取基因组可视化
export const getGenomeVisualization = (params: {
  region: string
  dataId: string
}) => {
  return api.get<ApiResponse<any>>('/visualize/genome', { params })
}

// 获取图表数据
export const getChartsData = (params: {
  chartType: string
  projectId?: string
}) => {
  return api.get<ApiResponse<ChartData>>('/visualize/charts', { params })
}