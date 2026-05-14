import React, { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Badge, Input } from 'antd'
import {
  HomeOutlined,
  FolderOutlined,
  DatabaseOutlined,
  ToolOutlined,
  ProjectOutlined,
  BarChartOutlined,
  FileTextOutlined,
  TeamOutlined,
  SettingOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { logout, clearAuth, getLocalUser } from '../services/auth'
import type { AuthUser } from '../types'

const { Header, Sider, Content } = Layout

const menuItems = [
  { key: '/dashboard', icon: <HomeOutlined />, label: '首页' },
  { key: '/projects', icon: <FolderOutlined />, label: '项目' },
  { key: '/data', icon: <DatabaseOutlined />, label: '数据管理' },
  { key: '/workflow-designer', icon: <ProjectOutlined />, label: '工作流' },
  { key: '/visualize', icon: <BarChartOutlined />, label: '可视化' },
  { key: '/tools', icon: <ToolOutlined />, label: '工具' },
  { key: '/results', icon: <FileTextOutlined />, label: '结果查看' },
  { key: '/reports', icon: <FileTextOutlined />, label: '报告中心' },
  { key: '/team', icon: <TeamOutlined />, label: '团队管理' },
]

const userMenuItems = [
  { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
]

const MainLayout: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [user] = useState<AuthUser | null>(() => getLocalUser())

  const selectedKey = menuItems.find(item =>
    location.pathname.startsWith(item.key)
  )?.key || (location.pathname.startsWith('/workflow') ? '/workflow-designer' : '/dashboard')

  const userMenuProps = {
    items: userMenuItems,
    onClick: async ({ key }: { key: string }) => {
      if (key === 'settings') navigate('/settings')
      if (key === 'logout') {
        try {
          await logout()
        } catch (e) {
          // ignore
        }
        clearAuth()
        navigate('/login')
      }
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        width={240} 
        style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          overflow: 'auto'
        }}
      >
        <div style={{ 
          padding: '20px 16px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 18,
            fontWeight: 600
          }}>
            <svg width="18" height="26" viewBox="0 0 18 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 2C3 2 7 4 11 8C15 12 15 14 15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M15 2C15 2 11 4 7 8C3 12 3 14 3 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M3 14C3 14 7 16 11 20C15 24 15 26 15 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M15 14C15 14 11 16 7 20C3 24 3 26 3 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ color: '#fff', fontSize: 20, fontWeight: 600 }}>BioCore</span>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ 
            background: 'transparent', 
            borderRight: 0,
            marginTop: 8
          }}
        />

        <div style={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          right: 0,
          padding: '16px',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={location.pathname === '/settings' ? ['/settings'] : []}
            items={[{ key: '/settings', icon: <SettingOutlined />, label: '设置' }]}
            onClick={({ key }) => navigate(key)}
            style={{ background: 'transparent', borderRight: 0 }}
          />
          <Dropdown menu={userMenuProps} placement="topRight">
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              padding: '12px 0',
              cursor: 'pointer'
            }}>
              <Avatar style={{ background: '#667eea' }}>{user?.name?.[0] || 'U'}</Avatar>
              <div style={{ color: '#fff' }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{user?.name || '用户'}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{user?.email || ''}</div>
              </div>
            </div>
          </Dropdown>
        </div>
      </Sider>

      <Layout style={{ marginLeft: 240 }}>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <Input.Search
            placeholder="搜索项目、数据或工具..."
            style={{ width: 300 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Badge count={3}>
              <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
            </Badge>
            <QuestionCircleOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
          </div>
        </Header>

        <Content style={{ padding: 24, minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout