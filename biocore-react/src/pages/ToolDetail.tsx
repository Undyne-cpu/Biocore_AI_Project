import React, { useEffect, useState, useRef } from 'react'
import { Card, Tabs, Button, Tag, Descriptions, Row, Col, message, Form, Input, Select, Progress, Alert, List, Upload } from 'antd'
import { PlayCircleOutlined, FileTextOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, UploadOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { getToolDetail, runTool, getTaskStatus, TaskStatus } from '../services/tool'
import { uploadFile } from '../services/data'
import type { ToolDetail } from '../types'

const statusConfig: Record<TaskStatus, { color: string; icon: React.ReactNode; text: string }> = {
  queued: { color: 'default', icon: <ClockCircleOutlined />, text: '等待执行' },
  running: { color: 'processing', icon: <ClockCircleOutlined spin />, text: '执行中' },
  completed: { color: 'success', icon: <CheckCircleOutlined />, text: '已完成' },
  failed: { color: 'error', icon: <CloseCircleOutlined />, text: '失败' },
  not_found: { color: 'default', icon: <ClockCircleOutlined />, text: '不存在' },
}

interface FileItem {
  id: string
  name: string
  minio_path: string  // 完整的 MinIO 路径，由后端上传接口返回
}

const ToolDetail: React.FC = () => {
  const { toolId } = useParams<{ toolId: string }>()
  const navigate = useNavigate()
  const [tool, setTool] = useState<ToolDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([])
  const [projectId, setProjectId] = useState<string>('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [taskInfo, setTaskInfo] = useState<{ taskId: string; status: TaskStatus } | null>(null)
  const [taskResult, setTaskResult] = useState<any>(null)
  const [uploading, setUploading] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (toolId) {
      fetchToolDetail(toolId)
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [toolId])

  const fetchToolDetail = async (id: string) => {
    setLoading(true)
    try {
      const response = await getToolDetail(id)
      setTool(response.data.data)
    } catch (error) {
      message.error('获取工具详情失败')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (file: File) => {
    if (!projectId) {
      message.error('请先选择项目')
      return false
    }
    if (!tool) {
      message.error('工具信息加载中，请稍候')
      return false
    }

    setUploading(true)
    try {
      const response = await uploadFile({
        file,
        projectId,
        type: 'raw',
      })
      console.log('上传响应:', response)

      // 处理 response.data 可能为 null 的情况
      let uploadedFile = null
      if (response.data) {
        uploadedFile = response.data.data || response.data
      }

      // 如果后端没有返回文件信息，使用文件信息构造 minio_path
      if (uploadedFile) {
        const fileItem: FileItem = {
          id: uploadedFile.id || `temp_${Date.now()}`,
          name: uploadedFile.name || file.name,
          minio_path: uploadedFile.minio_path || uploadedFile.path || `${projectId}/${file.name}`,
        }
        setSelectedFiles(prev => [...prev, fileItem])
        message.success(`文件 ${file.name} 上传成功`)
      } else {
        // 后端返回 null 但状态码 200，视为上传成功但无返回信息
        // 使用文件名构造一个临时 minio_path（实际应以后端返回为准）
        const fileItem: FileItem = {
          id: `temp_${Date.now()}`,
          name: file.name,
          minio_path: `${projectId}/${file.name}`,
        }
        setSelectedFiles(prev => [...prev, fileItem])
        message.warning(`文件 ${file.name} 已上传，但无法获取完整路径信息`)
      }
    } catch (error: any) {
      console.error('上传失败:', error)
      console.error('错误响应:', error?.response?.data)
      message.error(`文件上传失败: ${error?.response?.data?.message || error.message || '未知错误'}`)
    } finally {
      setUploading(false)
    }
    return false // 阻止默认上传行为
  }

  const startPolling = (taskId: string) => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
    }

    pollingRef.current = setInterval(async () => {
      try {
        if (!toolId) return
        const response = await getTaskStatus(toolId, taskId)
        const { status, ...rest } = response.data.data
        setTaskInfo({ taskId, status })
        setTaskResult(rest)

        if (status === 'completed' || status === 'failed') {
          if (pollingRef.current) {
            clearInterval(pollingRef.current)
            pollingRef.current = null
          }
          if (status === 'completed') {
            message.success('分析任务已完成！')
          } else {
            message.error(`分析失败: ${rest.error || '未知错误'}`)
          }
        }
      } catch (error) {
        console.error('轮询状态失败', error)
      }
    }, 3000)
  }

  const handleSubmitTask = async () => {
    if (!toolId || !tool) return

    if (!projectId) {
      message.error('请选择项目')
      return
    }
    if (selectedFiles.length === 0) {
      message.error('请上传或选择输入文件')
      return
    }

    setSubmitLoading(true)
    try {
      const values = form.getFieldsValue()

      // 使用后端返回的 minio_path 提交任务
      const inputFiles = selectedFiles.map(f => f.minio_path)

      const response = await runTool(toolId, {
        projectId,
        inputFiles,
        parameters: values,
        extraParams: values.extraParams,
      })

      const { taskId } = response.data.data
      setTaskInfo({ taskId, status: 'queued' })
      message.success('分析任务已提交！')
      startPolling(taskId)
    } catch (error) {
      message.error('任务提交失败')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleViewResults = () => {
    navigate('/results')
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  if (!tool) {
    return <Card loading={loading} />
  }

  return (
    <div>
      <Card style={{ marginBottom: 24, borderLeft: '4px solid #667eea' }}>
        <Descriptions
          title={<><FileTextOutlined /> {tool.name}</>}
        >
          <Descriptions.Item label="版本">{tool.version}</Descriptions.Item>
          <Descriptions.Item label="分类">{tool.category}</Descriptions.Item>
          <Descriptions.Item label="输入格式">{tool.input}</Descriptions.Item>
          <Descriptions.Item label="输出格式">{tool.output}</Descriptions.Item>
          <Descriptions.Item label="描述">{tool.desc}</Descriptions.Item>
          {tool.input_path_prefix && (
            <Descriptions.Item label="输入路径">
              <code>{tool.input_path_prefix}</code>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {taskInfo && (
        <Card style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <strong>任务状态: </strong>
            <Tag color={statusConfig[taskInfo.status].color} icon={statusConfig[taskInfo.status].icon}>
              {statusConfig[taskInfo.status].text}
            </Tag>
          </div>

          {taskInfo.status === 'running' && (
            <Progress percent={50} status="active" />
          )}

          {taskInfo.status === 'completed' && taskResult?.output_files && (
            <div>
              <Alert message="分析完成！" type="success" style={{ marginBottom: 16 }} />
              <div style={{ marginBottom: 16 }}>
                <strong>输出文件:</strong>
                <List size="small" bordered dataSource={taskResult.output_files} renderItem={(item: string) => (
                  <List.Item>
                    <FileTextOutlined style={{ marginRight: 8 }} />
                    {item}
                  </List.Item>
                )} />
              </div>
              {taskResult.logs && (
                <div style={{ marginBottom: 16 }}>
                  <strong>日志:</strong>
                  <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, maxHeight: 200, overflow: 'auto' }}>
                    {taskResult.logs}
                  </pre>
                </div>
              )}
              <Button type="primary" onClick={handleViewResults}>查看所有结果</Button>
            </div>
          )}

          {taskInfo.status === 'failed' && taskResult?.error && (
            <Alert message={`错误: ${taskResult.error}`} type="error" />
          )}
        </Card>
      )}

      <Tabs
        items={[
          {
            key: 'params',
            label: '参数配置',
            children: (
              <Card>
                <Form form={form} layout="vertical">
                  <Row gutter={16}>
                    {tool.parameters && Object.entries(tool.parameters).map(([key, desc]) => (
                      <Col span={12} key={key}>
                        <Form.Item name={key} label={key}>
                          <Input placeholder={desc} />
                        </Form.Item>
                      </Col>
                    ))}
                  </Row>
                  <Form.Item name="extraParams" label="额外参数">
                    <Input.TextArea rows={2} placeholder="输入额外命令行参数..." />
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
                <Form layout="vertical">
                  <Form.Item label="选择项目" required>
                    <Select
                      placeholder="请选择项目"
                      value={projectId}
                      onChange={(value) => {
                        setProjectId(value)
                        setSelectedFiles([]) // 切换项目时清空已选文件
                      }}
                      style={{ width: 300 }}
                    >
                      <Select.Option value="proj_29b6223842f4">测试项目</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item label="上传 FASTQ 文件">
                    <Upload
                      accept=".fastq,.fq,.fastq.gz,.fq.gz"
                      showUploadList={false}
                      beforeUpload={handleUpload}
                    >
                      <Button icon={<UploadOutlined />} loading={uploading} disabled={!projectId}>
                        {uploading ? '上传中...' : '选择文件上传'}
                      </Button>
                    </Upload>
                    <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
                      支持 .fastq, .fq, .fastq.gz, .fq.gz 格式
                    </div>
                  </Form.Item>

                  {selectedFiles.length > 0 && (
                    <Form.Item label="已选择的文件">
                      <List
                        size="small"
                        bordered
                        dataSource={selectedFiles}
                        renderItem={(item, index) => (
                          <List.Item
                            actions={[
                              <Button type="text" danger size="small" onClick={() => removeFile(index)}>
                                移除
                              </Button>
                            ]}
                          >
                            <List.Item.Meta
                              avatar={<FileTextOutlined />}
                              title={item.name}
                              description={<code style={{ fontSize: 11 }}>{item.minio_path}</code>}
                            />
                          </List.Item>
                        )}
                      />
                    </Form.Item>
                  )}

                  <Form.Item style={{ marginTop: 24 }}>
                    <Button
                      type="primary"
                      icon={<PlayCircleOutlined />}
                      onClick={handleSubmitTask}
                      loading={submitLoading}
                      disabled={!projectId || selectedFiles.length === 0}
                      size="large"
                    >
                      提交分析任务
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            )
          },
          {
            key: 'output',
            label: '输出说明',
            children: (
              <Card>
                <div style={{ padding: 16, background: '#fafafa', borderRadius: 8 }}>
                  <div style={{ marginBottom: 12 }}>
                    <strong>输出文件格式:</strong> {tool.output}
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <strong>输出内容:</strong>
                    <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                      <li>HTML 报告 - 质量控制可视化结果</li>
                      <li>ZIP 文件 - 原始数据统计</li>
                    </ul>
                  </div>
                </div>
              </Card>
            )
          }
        ]}
      />
    </div>
  )
}

export default ToolDetail