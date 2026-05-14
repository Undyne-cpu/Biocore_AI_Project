import React, { useEffect, useState } from 'react'
import { Card, Tabs, Table, Button, Space, Tag, Descriptions, Row, Col, message, Form, InputNumber, Select, Input } from 'antd'
import { PlayCircleOutlined, DatabaseOutlined, FileTextOutlined, DownloadOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import { getToolDetail, runTool } from '../services/tool'
import type { ToolDetail, ResultFile } from '../types'

const resultFiles: ResultFile[] = [
  { id: '1', name: 'variants.annotated.vcf', type: 'VCF', size: '45 MB', createdAt: '2024-05-09 18:20' },
  { id: '2', name: 'summary_report.pdf', type: 'PDF', size: '2.3 MB', createdAt: '2024-05-09 18:25' },
  { id: '3', name: 'alignment_stats.json', type: 'JSON', size: '156 KB', createdAt: '2024-05-09 16:45' },
  { id: '4', name: 'coverage_plot.png', type: 'PNG', size: '890 KB', createdAt: '2024-05-09 18:20' },
]

const columns: ColumnsType<ResultFile> = [
  { title: '文件名', dataIndex: 'name', key: 'name' },
  { title: '类型', dataIndex: 'type', key: 'type', render: (type) => <Tag>{type}</Tag> },
  { title: '大小', dataIndex: 'size', key: 'size' },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
  {
    title: '操作',
    key: 'action',
    render: () => (
      <Space>
        <Button size="small" icon={<FileTextOutlined />}>预览</Button>
        <Button size="small" icon={<DownloadOutlined />}>下载</Button>
      </Space>
    )
  }
]

const ToolDetail: React.FC = () => {
  const { toolId } = useParams<{ toolId: string }>()
  const [tool, setTool] = useState<ToolDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    if (toolId) {
      fetchToolDetail(toolId)
    }
  }, [toolId])

  const fetchToolDetail = async (id: string) => {
    setLoading(true)
    try {
      const response = await getToolDetail(id)
      setTool(response.data.data)
      // 初始化表单默认值
      const params: Record<string, any> = {}
      response.data.data.parameters?.forEach((p: any) => {
        if (p.default !== undefined) {
          params[p.name] = p.default
        }
      })
      form.setFieldsValue(params)
    } catch (error) {
      // handle error
    } finally {
      setLoading(false)
    }
  }

  const handleRunTool = async () => {
    if (!toolId || !tool) return
    try {
      const values = form.getFieldsValue()
      await runTool(toolId, {
        projectId: '', // 需要选择项目
        inputFiles: [],
        parameters: values,
      })
      message.success('分析任务已提交')
    } catch (error) {
      // handle error
    }
  }

  if (!tool) {
    return <Card loading={loading} />
  }

  return (
    <div>
      <Card style={{ marginBottom: 24, borderLeft: '4px solid #667eea' }}>
        <Descriptions
          title={<><FileTextOutlined /> {tool.name}</>}
          extra={<Button type="primary" icon={<PlayCircleOutlined />} onClick={handleRunTool}>运行分析</Button>}
        >
          <Descriptions.Item label="版本">{tool.version}</Descriptions.Item>
          <Descriptions.Item label="分类">{tool.category}</Descriptions.Item>
          <Descriptions.Item label="输入格式">{tool.input}</Descriptions.Item>
          <Descriptions.Item label="输出格式">{tool.output}</Descriptions.Item>
          <Descriptions.Item label="描述">{tool.desc}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Tabs
        items={[
          {
            key: 'params',
            label: '参数配置',
            children: (
              <Card>
                <Form form={form} layout="vertical">
                  <Row gutter={16}>
                    {tool.parameters?.map((param) => (
                      <Col span={12} key={param.name}>
                        <Form.Item name={param.name} label={param.label}>
                          {param.type === 'number' ? (
                            <InputNumber style={{ width: '100%' }} />
                          ) : param.type === 'select' && param.options ? (
                            <Select>
                              {param.options.map((opt: string) => (
                                <Select.Option key={opt} value={opt}>{opt}</Select.Option>
                              ))}
                            </Select>
                          ) : (
                            <InputNumber style={{ width: '100%' }} />
                          )}
                        </Form.Item>
                      </Col>
                    ))}
                  </Row>
                  <Form.Item name="extraParams" label="额外参数">
                    <Input.TextArea rows={3} placeholder="输入额外参数..." />
                  </Form.Item>
                </Form>
              </Card>
            )
          },
          {
            key: 'input',
            label: '输入数据',
            children: (
              <Card>
                <div style={{ padding: 16, background: '#fafafa', borderRadius: 8, marginBottom: 16 }}>
                  <div style={{ marginBottom: 8 }}><strong>输入样本</strong></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <DatabaseOutlined style={{ fontSize: 24, color: '#667eea' }} />
                    <div>
                      <div>alignment_result.bam</div>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>8.2 GB · 就绪</div>
                    </div>
                    <Button size="small">更换</Button>
                  </div>
                </div>
              </Card>
            )
          },
          {
            key: 'output',
            label: '输出设置',
            children: (
              <Card>
                <Table columns={columns} dataSource={resultFiles} rowKey="id" size="small" />
              </Card>
            )
          }
        ]}
      />
    </div>
  )
}

export default ToolDetail