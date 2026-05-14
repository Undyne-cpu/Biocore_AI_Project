import React, { useEffect, useState } from 'react'
import { Card, Table, Tag, Button, Space, Input, Select, message, Popconfirm } from 'antd'
import { SearchOutlined, DownloadOutlined, EyeOutlined, DeleteOutlined, SyncOutlined, FileTextOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getResultList, deleteResult } from '../services/result'
import { downloadResult } from '../services/result'
import type { Result } from '../types'

const Results: React.FC = () => {
  const [data, setData] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 })

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
          <Button type="text" icon={<EyeOutlined />} title="查看" />
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
    </Card>
  )
}

export default Results