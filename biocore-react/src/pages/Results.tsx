import React, { useEffect, useState } from 'react'
import { Card, Table, Tag, Button, Space, Input, Select, message, Popconfirm, Drawer, Descriptions, List, Alert } from 'antd'
import { SearchOutlined, DownloadOutlined, EyeOutlined, DeleteOutlined, SyncOutlined, FileTextOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, FileOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getResultList, deleteResult, getResultDetail, getResultFiles, ResultFile } from '../services/result'
import { downloadResult } from '../services/result'
import type { Result, ResultDetail } from '../types'

const Results: React.FC = () => {
  const [data, setData] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 })
  const [detailVisible, setDetailVisible] = useState(false)
  const [detailData, setDetailData] = useState<ResultDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [resultFiles, setResultFiles] = useState<ResultFile[]>([])

  useEffect(() => {
    fetchData()
  }, [pagination.current, pagination.pageSize, searchText, statusFilter])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await getResultList({
        search: searchText || undefined,
        status: statusFilter || undefined,
      })
      setData(response.data.data)
    } catch (error) {
      // handle error
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = async (id: string) => {
    setDetailVisible(true)
    setDetailLoading(true)
    setResultFiles([])
    try {
      const [detailRes, filesRes] = await Promise.all([
        getResultDetail(id),
        getResultFiles(id)
      ])
      setDetailData(detailRes.data.data)
      // 后端返回结构: { files: [...] }，需要从 data.data.files 取文件数组
      const filesData = filesRes.data.data
      setResultFiles(filesData?.files || [])
    } catch (error) {
      message.error('获取结果详情失败')
      setDetailVisible(false)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteResult(id)
      message.success('删除成功')
      fetchData()
    } catch (error) {
      // handle error
    }
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'failed': return <CloseCircleOutlined style={{ color: '#f5222d' }} />;
      case 'running': return <ClockCircleOutlined style={{ color: '#1677ff' }} />;
      case 'pending': return <ClockCircleOutlined style={{ color: '#8c8c8c' }} />;
      default: return null;
    }
  }

  const columns: ColumnsType<Result> = [
    { title: '结果名称', dataIndex: 'name', key: 'name', render: (name) => <Space><FileTextOutlined />{name}</Space> },
    { title: '分析工具', dataIndex: 'tool', key: 'tool', render: (tool) => <Tag>{tool}</Tag> },
    { title: '所属项目', dataIndex: 'project', key: 'project' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Space>
          {statusIcon(status)}
          <Tag color={status === 'completed' ? 'green' : status === 'failed' ? 'red' : status === 'running' ? 'blue' : 'default'}>
            {status === 'completed' ? '已完成' : status === 'failed' ? '失败' : status === 'running' ? '运行中' : '等待中'}
          </Tag>
        </Space>
      )
    },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
    { title: '耗时', dataIndex: 'duration', key: 'duration' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} title="查看" onClick={() => handleViewDetail(record.id)} />
          <Button type="text" icon={<DownloadOutlined />} title="下载" onClick={() => downloadResult(record.id)} />
          <Popconfirm title="确定要删除此结果吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} title="删除" />
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <Card
      title="分析结果"
      extra={
        <Space>
          <Input
            prefix={<SearchOutlined />}
            placeholder="搜索结果"
            style={{ width: 200 }}
            value={searchText}
            onChange={e => { setSearchText(e.target.value); setPagination(prev => ({ ...prev, current: 1 })) }}
          />
          <Select
            placeholder="状态筛选"
            style={{ width: 120 }}
            allowClear
            value={statusFilter || undefined}
            onChange={val => { setStatusFilter(val || ''); setPagination(prev => ({ ...prev, current: 1 })) }}
          >
            <Select.Option value="completed">已完成</Select.Option>
            <Select.Option value="failed">失败</Select.Option>
            <Select.Option value="running">运行中</Select.Option>
          </Select>
          <Button icon={<SyncOutlined />} onClick={fetchData}>刷新</Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 个结果`,
          onChange: (page, pageSize) => setPagination({ current: page, pageSize, total: pagination.total }),
        }}
      />

      <Drawer
        title="结果详情"
        placement="right"
        width={600}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        loading={detailLoading}
      >
        {detailData && (
          <>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="结果名称">{detailData.name}</Descriptions.Item>
              <Descriptions.Item label="分析工具">{detailData.tool}</Descriptions.Item>
              <Descriptions.Item label="所属项目">{detailData.project}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={detailData.status === 'completed' ? 'green' : detailData.status === 'failed' ? 'red' : 'blue'}>
                  {detailData.status === 'completed' ? '已完成' : detailData.status === 'failed' ? '失败' : detailData.status === 'running' ? '运行中' : '等待中'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">{detailData.createdAt}</Descriptions.Item>
              <Descriptions.Item label="耗时">{detailData.duration || '-'}</Descriptions.Item>
              {detailData.taskId && <Descriptions.Item label="任务ID" span={2}>{detailData.taskId}</Descriptions.Item>}
            </Descriptions>

            {detailData.status === 'failed' && detailData.error && (
              <Alert message={`错误: ${detailData.error}`} type="error" style={{ marginTop: 16 }} />
            )}

            {detailData.output_files && detailData.output_files.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <strong>输出文件:</strong>
                <List
                  size="small"
                  bordered
                  dataSource={detailData.output_files}
                  renderItem={(item: string) => (
                    <List.Item>
                      <FileTextOutlined style={{ marginRight: 8 }} />
                      {item}
                    </List.Item>
                  )}
                />
              </div>
            )}

            {resultFiles.length > 0 ? (
              <div style={{ marginTop: 16 }}>
                <strong>结果文件预览:</strong>
                <div style={{ marginTop: 8 }}>
                  {resultFiles.map((file, index) => {
                    const isHtml = file.name.toLowerCase().endsWith('.html') || file.type === 'html'
                    const isZip = file.name.toLowerCase().endsWith('.zip') || file.type === 'zip'

                    return (
                      <div key={index} style={{ marginBottom: 12, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
                        <div style={{ marginBottom: 8 }}>
                          <FileOutlined style={{ marginRight: 8 }} />
                          <strong>{file.name}</strong>
                          {file.size && <span style={{ marginLeft: 8, color: '#8c8c8c' }}>({file.size})</span>}
                        </div>
                        {isHtml && (
                          <div>
                            <a href={file.url} target="_blank" rel="noopener noreferrer">
                              <Button type="default" size="small" icon={<DownloadOutlined />}>
                                下载 HTML 文件
                              </Button>
                            </a>
                          </div>
                        )}
                        {isZip && (
                          <div>
                            <a href={file.url} target="_blank" rel="noopener noreferrer">
                              <Button type="default" size="small" icon={<DownloadOutlined />}>
                                下载 ZIP 文件
                              </Button>
                            </a>
                          </div>
                        )}
                        {!isHtml && !isZip && (
                          <div>
                            <a href={file.url} target="_blank" rel="noopener noreferrer">
                              <Button type="link" size="small" icon={<DownloadOutlined />}>
                                下载
                              </Button>
                            </a>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : null}

            {detailData.logs && (
              <div style={{ marginTop: 16 }}>
                <strong>日志:</strong>
                <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, maxHeight: 200, overflow: 'auto' }}>
                  {detailData.logs}
                </pre>
              </div>
            )}

            {detailData.inputFiles && detailData.inputFiles.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <strong>输入文件:</strong>
                <List
                  size="small"
                  bordered
                  dataSource={detailData.inputFiles}
                  renderItem={(item: string) => (
                    <List.Item>
                      <FileTextOutlined style={{ marginRight: 8 }} />
                      {item}
                    </List.Item>
                  )}
                />
              </div>
            )}

            {detailData.parameters && Object.keys(detailData.parameters).length > 0 && (
              <div style={{ marginTop: 16 }}>
                <strong>执行参数:</strong>
                <Descriptions column={1} size="small" style={{ marginTop: 8 }}>
                  {Object.entries(detailData.parameters).map(([key, value]) => (
                    <Descriptions.Item label={key}>{String(value)}</Descriptions.Item>
                  ))}
                </Descriptions>
              </div>
            )}
          </>
        )}
      </Drawer>
    </Card>
  )
}

export default Results