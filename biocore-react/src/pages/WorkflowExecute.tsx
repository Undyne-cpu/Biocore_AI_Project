import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Card, Row, Col, Button, Space, Statistic, Progress, List, Tag } from 'antd'
import { 
  ClockCircleOutlined,
  RocketOutlined,
  LeftOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'

interface WorkflowNode {
  id: string
  name: string
  tool: string
  status: 'ready' | 'running' | 'completed' | 'error'
  progress: number
  inputs: string[]
  outputs: string[]
}

const workflowNodes: WorkflowNode[] = [
  { id: '1', name: '开始', tool: 'Input', status: 'completed', progress: 100, inputs: [], outputs: ['raw_data'] },
  { id: '2', name: 'FastQC', tool: 'fastqc', status: 'completed', progress: 100, inputs: ['raw_data'], outputs: ['qc_report'] },
  { id: '3', name: 'BWA-MEM', tool: 'bwa', status: 'completed', progress: 100, inputs: ['qc_report'], outputs: ['alignment'] },
  { id: '4', name: 'GATK HaplotypeCaller', tool: 'gatk', status: 'running', progress: 65, inputs: ['alignment'], outputs: ['variants'] },
  { id: '5', name: 'ANNOVAR', tool: 'annovar', status: 'ready', progress: 0, inputs: ['variants'], outputs: ['annotations'] },
  { id: '6', name: '完成', tool: 'Output', status: 'ready', progress: 0, inputs: ['annotations'], outputs: [] },
]

const logData = [
  { time: '15:43:22', level: 'info', message: '任务差异表达分析 已启动' },
  { time: '15:43:25', level: 'info', message: '步骤 3/5: DESeq2分析 开始执行' },
  { time: '15:43:30', level: 'info', message: '读取基因计数矩阵: 25678 个基因' },
  { time: '15:44:12', level: 'warning', message: '检测到低表达基因，已过滤 2341 个基因' },
  { time: '15:44:45', level: 'info', message: '差异表达分析完成，发现 1523 个差异基因' },
]

const executionChartOption: EChartsOption = {
  tooltip: { trigger: 'axis' },
  legend: { data: ['CPU使用率', '内存使用率'] },
  xAxis: { type: 'category', data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '现在'] },
  yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
  series: [
    { name: 'CPU使用率', type: 'line', smooth: true, data: [12, 45, 78, 92, 85, 76, 68], areaStyle: { opacity: 0.2 }, itemStyle: { color: '#667eea' }, lineStyle: { color: '#667eea' } },
    { name: '内存使用率', type: 'line', smooth: true, data: [25, 45, 65, 72, 68, 65, 62], areaStyle: { opacity: 0.2 }, itemStyle: { color: '#00D4AA' }, lineStyle: { color: '#00D4AA' } }
  ]
}

const WorkflowExecute: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  // 从路由状态获取工作流信息
  const workflowInfo = location.state?.workflow as { id: string, name: string, status: string } | undefined
  
  // 返回工作流设计器
  const goBack = () => {
    navigate('/workflow-designer')
  }

  return (
    <div>
      <Button icon={<LeftOutlined />} onClick={goBack} style={{ marginBottom: 16 }}>返回工作流设计器</Button>
      
      {workflowInfo && (
        <Card style={{ marginBottom: 24, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#fff' }}>
              <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{workflowInfo.name}</h1>
              <p style={{ fontSize: 14, opacity: 0.9 }}>工作流ID: {workflowInfo.id}</p>
            </div>
            <Space>
              <Button style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none' }}>暂停</Button>
              <Button danger>停止任务</Button>
            </Space>
          </div>
        </Card>
      )}

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card><Statistic title="总体进度" value={65} suffix="%" valueStyle={{ color: '#667eea' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="已用时间" value="45分钟" prefix={<ClockCircleOutlined />} valueStyle={{ color: '#fa8c16' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="预计剩余" value="12分钟" prefix={<ClockCircleOutlined />} valueStyle={{ color: '#00D4AA' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="当前步骤" value="3/5" prefix={<RocketOutlined />} valueStyle={{ color: '#722ed1' }} /></Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={16}>
          <Card title="执行流程">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {workflowNodes.map((node, index) => (
                <React.Fragment key={node.id}>
                  <Card 
                    size="small" 
                    style={{ 
                      width: 140, 
                      textAlign: 'center',
                      borderColor: node.status === 'running' ? '#667eea' : node.status === 'completed' ? '#52c41a' : '#d9d9d9'
                    }}
                  >
                    <Tag color={node.status === 'completed' ? 'green' : node.status === 'running' ? 'blue' : 'default'} style={{ marginBottom: 8 }}>
                      {node.status === 'completed' ? '已完成' : node.status === 'running' ? '运行中' : '等待'}
                    </Tag>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{node.name}</div>
                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>{node.tool}</div>
                    {node.status === 'running' && <Progress percent={node.progress} size="small" style={{ marginTop: 8 }} />}
                  </Card>
                  {index < workflowNodes.length - 1 && <span style={{ color: '#d9d9d9', fontSize: 20 }}>→</span>}
                </React.Fragment>
              ))}
            </div>
          </Card>

          <Card title="资源使用" style={{ marginTop: 16 }}>
            <ReactECharts option={executionChartOption} style={{ height: 250 }} />
          </Card>
        </Col>

        <Col span={8}>
          <Card title="执行日志" style={{ height: '100%' }}>
            <List
              size="small"
              dataSource={logData}
              renderItem={(item) => (
                <List.Item style={{ display: 'block', padding: '8px 0' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ color: '#8c8c8c', fontSize: 12 }}>{item.time}</span>
                    <Tag color={item.level === 'info' ? 'blue' : 'warning'} style={{ fontSize: 10, margin: 0 }}>{item.level}</Tag>
                  </div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>{item.message}</div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default WorkflowExecute