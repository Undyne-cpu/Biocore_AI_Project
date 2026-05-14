import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Button, List, Avatar, Progress, Tag, Space } from 'antd'
import {
  PlusOutlined,
  UploadOutlined,
  FolderOutlined,
  DatabaseOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  ArrowUpOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import { getDashboardStats, getTrendData } from '../services/statistics'
import { getLocalUser } from '../services/auth'
import type { DashboardStats, Project, Execution, TrendData } from '../types'

const quickAccessItems = [
  { icon: '📊', title: '质量控制', desc: 'FastQC分析', color: '#667eea', path: '/tools/fastqc' },
  { icon: '🔄', title: '序列比对', desc: 'BWA/GATK', color: '#00D4AA', path: '/tools' },
  { icon: '🧬', title: '变异检测', desc: 'SNP/Indel', color: '#f5222d', path: '/tools' },
  { icon: '📈', title: '表达分析', desc: 'RNA-seq', color: '#fa8c16', path: '/tools' },
  { icon: '🏷️', title: '功能注释', desc: 'GO/KEGG', color: '#52c41a', path: '/tools' },
  { icon: '🔗', title: '工作流', desc: '自定义Pipeline', color: '#722ed1', path: '/workflow-designer' },
]

const getStatusTag = (status: string) => {
  const statusMap: Record<string, { color: string; text: string }> = {
    completed: { color: 'green', text: '已完成' },
    processing: { color: 'blue', text: '分析中' },
    running: { color: 'processing', text: '运行中' },
    draft: { color: 'default', text: '草稿' },
  }
  const { color, text } = statusMap[status] || { color: 'default', text: status }
  return <Tag color={color}>{text}</Tag>
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const user = getLocalUser()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [trendData, setTrendData] = useState<TrendData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, trendRes] = await Promise.all([
        getDashboardStats(),
        getTrendData({ period: 'week' }),
      ])
      setStats(statsRes.data.data)
      setTrendData(trendRes.data.data)
    } catch (error) {
      // handle error
    } finally {
      setLoading(false)
    }
  }

  const chartOption: EChartsOption = trendData ? {
    tooltip: { trigger: 'axis' },
    legend: { data: trendData.series?.map(s => s.name) || [] },
    xAxis: { type: 'category', data: trendData.categories || ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
    yAxis: { type: 'value' },
    series: (trendData.series || []).map((s, i) => ({
      name: s.name,
      type: 'line',
      smooth: true,
      data: s.data,
      areaStyle: { opacity: 0.2 },
      lineStyle: { color: i === 0 ? '#667eea' : '#00D4AA' },
      itemStyle: { color: i === 0 ? '#667eea' : '#00D4AA' },
    })),
  } : {
    tooltip: { trigger: 'axis' },
    legend: { data: ['本周', '上周'] },
    xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
    yAxis: { type: 'value' },
    series: [
      { name: '本周', type: 'line', smooth: true, data: [12, 15, 8, 18, 22, 16, 20], areaStyle: { opacity: 0.2 }, lineStyle: { color: '#667eea' }, itemStyle: { color: '#667eea' } },
      { name: '上周', type: 'line', smooth: true, data: [8, 12, 10, 14, 16, 12, 14], areaStyle: { opacity: 0.2 }, lineStyle: { color: '#00D4AA' }, itemStyle: { color: '#00D4AA' } }
    ]
  }

  return (
    <div>
      <Card style={{ marginBottom: 24, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#fff' }}>
            <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>欢迎回来，{user?.name || '用户'}</h1>
            <p style={{ fontSize: 14, opacity: 0.9 }}>
              您有 <strong>{stats?.runningTasks || 0}</strong> 个任务正在运行
            </p>
          </div>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} style={{ background: '#fff', color: '#667eea', border: 'none' }} onClick={() => navigate('/projects?action=create')}>
              新建项目
            </Button>
            <Button icon={<UploadOutlined />} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none' }} onClick={() => navigate('/data')}>
              上传数据
            </Button>
          </Space>
        </div>
      </Card>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="项目总数"
              value={stats?.totalProjects || 0}
              prefix={<FolderOutlined />}
              suffix={<ArrowUpOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#667eea' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="存储空间 (GB)"
              value={stats?.storageUsed ? parseFloat(stats.storageUsed) : 0}
              suffix={`/ ${stats?.totalStorage || '256 GB'}`}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#00D4AA' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="已完成任务"
              value={stats?.completedTasks || 0}
              prefix={<CheckCircleOutlined />}
              suffix={<ArrowUpOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="运行中任务"
              value={stats?.runningTasks || 0}
              prefix={<LoadingOutlined spin />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title={<><ThunderboltOutlined /> 快捷入口</>} style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          {quickAccessItems.map((item, i) => (
            <Col span={4} key={i}>
              <Card style={{ textAlign: 'center', cursor: 'pointer' }} hoverable onClick={() => navigate(item.path)}>
                <div style={{ fontSize: 32, color: item.color, marginBottom: 8 }}>{item.icon}</div>
                <div style={{ fontWeight: 500 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>{item.desc}</div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title={<><FolderOutlined /> 最近项目</>} extra={<a onClick={() => navigate('/projects')}>查看全部</a>} loading={loading}>
            <List
              dataSource={stats?.recentProjects || []}
              renderItem={(item: Project) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar style={{ background: '#667eea' }}>{item.name[0]}</Avatar>}
                    title={item.name}
                    description={item.code}
                  />
                  {getStatusTag(item.status)}
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title={<><LoadingOutlined spin /> 运行中的任务</>} extra={<a onClick={() => navigate('/results')}>任务历史</a>} loading={loading}>
            {(stats?.runningTasksList || []).map((task: Execution, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: i < (stats?.runningTasksList?.length || 0) - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <Progress type="circle" percent={task.progress} size={50} />
                <div style={{ marginLeft: 16, flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{task.workflowName}</div>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>{task.currentStep}</div>
                  {task.elapsedTime && <div style={{ fontSize: 12, color: '#fa8c16' }}>已运行 {task.elapsedTime}</div>}
                </div>
              </div>
            ))}
            {(!stats?.runningTasksList || stats.runningTasksList.length === 0) && (
              <div style={{ textAlign: 'center', padding: 24, color: '#8c8c8c' }}>暂无运行中的任务</div>
            )}
          </Card>
        </Col>
      </Row>

      <Card title="任务趋势" style={{ marginTop: 24 }}>
        <ReactECharts option={chartOption} style={{ height: 300 }} />
      </Card>
    </div>
  )
}

export default Dashboard