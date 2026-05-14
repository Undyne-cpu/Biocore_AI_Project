import api from '../utils/api'
import type { ApiResponse, TeamMember, InviteMemberParams } from '../types'

// 获取团队成员列表
export const getTeamList = () => {
  return api.get<ApiResponse<TeamMember[]>>('/team')
}

// 邀请成员
export const inviteMember = (data: InviteMemberParams) => {
  return api.post<ApiResponse<TeamMember>>('/team/invite', data)
}

// 移除成员
export const removeMember = (id: string) => {
  return api.delete<ApiResponse>(`/team/${id}`)
}

// 修改成员角色
export const updateMemberRole = (id: string, role: 'admin' | 'member') => {
  return api.put<ApiResponse>(`/team/${id}/role`, { role })
}