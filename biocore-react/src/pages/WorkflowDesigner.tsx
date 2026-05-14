import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Space, Tag, Modal, Form, InputNumber, Select, Checkbox, Input, Divider, message } from 'antd'
import { SaveOutlined, CheckCircleOutlined, PlayCircleOutlined, ThunderboltOutlined, SearchOutlined } from '@ant-design/icons'
import '../styles/workflow-designer.css'

interface ToolNode {
  id: string
  name: string
  tool: string
  category: string
  status: 'ready' | 'configured'
  params: Record<string, any>
}

const categoryTools = [
  {
    category: '序列处理',
    icon: '🔤',
    tools: [
      { id: 'fastqc', name: 'FastQC', icon: '📊', desc: '测序质量评估', color: '#667eea' },
      { id: 'seqkit', name: 'SeqKit', icon: '🛠️', desc: '序列处理工具集', color: '#00D4AA' },
    ]
  },
  {
    category: '变异分析',
    icon: '🧬',
    tools: [
      { id: 'bwa', name: 'BWA', icon: '🔄', desc: '序列比对', color: '#fa8c16' },
      { id: 'gatk', name: 'GATK', icon: '🧬', desc: '变异检测', color: '#f5222d' },
      { id: 'annovar', name: 'ANNOVAR', icon: '🏷️', desc: '变异注释', color: '#722ed1' },
    ]
  },
  {
    category: '表达分析',
    icon: '📈',
    tools: [
      { id: 'star', name: 'STAR', icon: '⭐', desc: 'RNA-seq比对', color: '#52c41a' },
      { id: 'featurecounts', name: 'featureCounts', icon: '🔢', desc: '基因计数', color: '#1890ff' },
    ]
  }
]

const workflowNodes: ToolNode[] = [
  { id: 'start', name: '开始', tool: 'Input', category: 'system', status: 'configured', params: {} },
  { id: 'node1', name: 'FastQC', tool: 'fastqc', category: 'fastqc', status: 'ready', params: {} },
  { id: 'node2', name: 'BWA-MEM', tool: 'bwa', category: 'bwa', status: 'ready', params: {} },
  { id: 'node3', name: 'GATK HaplotypeCaller', tool: 'gatk', category: 'gatk', status: 'ready', params: {} },
  { id: 'node4', name: 'ANNOVAR', tool: 'annovar', category: 'annovar', status: 'ready', params: {} },
  { id: 'end', name: '完成', tool: 'Output', category: 'system', status: 'configured', params: {} },
]

const templates = [
  { name: 'WGS标准流程', steps: 4, icon: '🧬' },
  { name: 'RNA-seq流程', steps: 5, icon: '📊' },
  { name: 'ChIP-seq流程', steps: 4, icon: '🔬' },
]

const WorkflowDesigner: React.FC = () => {
  const navigate = useNavigate()
  const [isConfigModalOpen, setIsConfigModalOpen] = React.useState(false)
  const [isRunModalOpen, setIsRunModalOpen] = React.useState(false)
  const [currentWorkflow, setCurrentWorkflow] = React.useState<{id: string, name: string, status: string} | null>(null)
  const [form] = Form.useForm()

  const handleToolConfig = () => {
    setIsConfigModalOpen(true)
  }

  const onSaveConfig = () => {
    message.success('配置已保存')
    setIsConfigModalOpen(false)
  }

  const onRunWorkflow = () => {
    const workflowInstance = {
      id: `wf_${Date.now()}`,
      name: 'WGS标准分析流程',
      status: 'running'
    }
    setCurrentWorkflow(workflowInstance)
    setIsRunModalOpen(false)
    message.success('工作流已启动，正在跳转到执行监控页面...')
    setTimeout(() => {
      navigate('/workflow-execute', { state: { workflow: workflowInstance } })
    }, 500)
  }

  const goToExecute = () => {
    if (currentWorkflow) {
      navigate('/workflow-execute', { state: { workflow: currentWorkflow } })
    } else {
      navigate('/workflow-execute')
    }
  }

  return (
    <div className="workflow-designer">
      <Card size="small" className="tool-panel" title={<><SearchOutlined /> 工具库</>}>
        {categoryTools.map((cat) => (
          <div key={cat.category} style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>
              {cat.icon} {cat.category}
            </div>
            {cat.tools.map((tool) => (
              <Card
                key={tool.id}
                size="small"
                style={{ marginBottom: 8, cursor: 'grab', borderLeft: `3px solid ${tool.color}` }}
                hoverable
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{tool.icon}</span>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{tool.name}</div>
                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>{tool.desc}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ))}
      </Card>

      <Card className="canvas-panel" title="工作流设计器"
        extra={
          <Space wrap>
            <Button icon={<SaveOutlined />}>保存</Button>
            <Button icon={<CheckCircleOutlined />}>验证</Button>
            <Button type="primary" icon={<PlayCircleOutlined />} onClick={() => setIsRunModalOpen(true)}>运行</Button>
            <Button icon={<ThunderboltOutlined />} onClick={goToExecute}>执行监控</Button>
          </Space>
        }
      >
        <div className="workflow-nodes">
          {workflowNodes.map((node, index) => (
            <React.Fragment key={node.id}>
              <Card className="node-card" style={{ borderTop: '3px solid #667eea' }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{node.name}</div>
                <Tag color={node.status === 'configured' ? 'green' : 'blue'} style={{ marginBottom: 8 }}>
                  {node.status === 'configured' ? '已配置' : '就绪'}
                </Tag>
                <div style={{ marginTop: 8 }}>
                  <Button size="small" onClick={handleToolConfig}>配置</Button>
                </div>
              </Card>
              {index < workflowNodes.length - 1 && (
                <div className="node-arrow">
                  <svg width="40" height="20">
                    <path d="M0 10 L40 10" stroke="currentColor" strokeWidth="2" fill="none" />
                    <path d="M32 6 L40 10 L32 14" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </Card>

      <Card size="small" className="property-panel" title="属性配置">
        <Form layout="vertical" form={form}>
          <Form.Item label="工作流名称">
            <Input defaultValue="WGS标准分析流程" />
          </Form.Item>
          <Form.Item label="描述">
            <Input.TextArea rows={3} defaultValue="从原始测序数据到变异检测的完整WGS分析流程，包含质控、比对、变异检测和注释。" />
          </Form.Item>
          <Divider>快速模板</Divider>
          {templates.map((t) => (
            <Card key={t.name} size="small" style={{ marginBottom: 8 }} hoverable>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ marginRight: 8 }}>{t.icon}</span>
                  <span style={{ fontWeight: 500 }}>{t.name}</span>
                  <span style={{ color: '#8c8c8c', marginLeft: 8 }}>({t.steps}步)</span>
                </div>
                <Button size="small">应用</Button>
              </div>
            </Card>
          ))}
          <Divider>执行设置</Divider>
          <Form.Item label="并发任务数">
            <Select defaultValue="4">
              <Select.Option value="1">1 (串行)</Select.Option>
              <Select.Option value="2">2</Select.Option>
              <Select.Option value="4">4</Select.Option>
              <Select.Option value="8">8</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="失败策略">
            <Select defaultValue="skip">
              <Select.Option value="stop">立即停止</Select.Option>
              <Select.Option value="skip">跳过继续</Select.Option>
              <Select.Option value="retry">自动重试</Select.Option>
            </Select>
          </Form.Item>
          <Checkbox defaultChecked>自动保存检查点</Checkbox>
        </Form>
      </Card>

      <Modal title="配置节点" open={isConfigModalOpen} onCancel={() => setIsConfigModalOpen(false)} footer={null} width={600}>
        <Form layout="vertical">
          <Form.Item label="线程数">
            <InputNumber defaultValue={4} min={1} max={32} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="内存 (GB)">
            <InputNumber defaultValue={8} min={1} max={64} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="额外参数">
            <Input placeholder="输入额外参数..." />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsConfigModalOpen(false)}>取消</Button>
              <Button type="primary" onClick={onSaveConfig}>保存配置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="确认运行" open={isRunModalOpen} onCancel={() => setIsRunModalOpen(false)} footer={null}>
        <div style={{ padding: 16 }}>
          <div style={{ marginBottom: 12 }}><strong>工作流:</strong> WGS标准分析流程</div>
          <div style={{ marginBottom: 12 }}><strong>步骤数:</strong> 4</div>
          <div style={{ marginBottom: 12 }}><strong>预计时间:</strong> 约 1-2 小时</div>
        </div>
        <div style={{ textAlign: 'right', padding: 16, borderTop: '1px solid #f0f0f0' }}>
          <Space>
            <Button onClick={() => setIsRunModalOpen(false)}>取消</Button>
            <Button type="primary" onClick={onRunWorkflow}>开始运行</Button>
          </Space>
        </div>
      </Modal>
    </div>
  )
}

export default WorkflowDesigner