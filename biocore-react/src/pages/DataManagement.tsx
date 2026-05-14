import React, { useEffect, useState } from 'react'
import { Card, Table, Tag, Button, Space, Upload, Input, Breadcrumb, message, Progress, Popconfirm } from 'antd'
import { UploadOutlined, FileOutlined, DeleteOutlined, DownloadOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getFileList, uploadFile, deleteFile } from '../services/data'
import type { DataFile } from '../types'

const formatColors: Record<string, string> = {
  fasta: '#667eea',
  fastq: '#00D4AA',
  bam: '#fa8c16',
  vcf: '#f5222d',
  bed: '#722ed1',
  gtf: '#52c41a',
  gff: '#1890ff',
  other: '#8c8c8c'
}

const formatNames: Record<string, string> = {
  fasta: 'FASTA',
  fastq: 'FASTQ',
  bam: 'BAM',
  vcf: 'VCF',
  bed: 'BED',
  gtf: 'GTF',
  gff: 'GFF',
  other: 'Other'
}

const DataManagement: React.FC = () => {
  const [data, setData] = useState<DataFile[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [pagination.current, pagination.pageSize, searchText])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await getFileList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        search: searchText || undefined,
      })
      const { list, total } = response.data.data
      setData(list)
      setPagination(prev => ({ ...prev, total }))
    } catch (error) {
      // handle error
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      await uploadFile({
        file,
        projectId: '', // 需要项目ID
        type: 'raw',
      })
      message.success('文件上传成功')
      fetchData()
    } catch (error) {
      // handle error
    } finally {
      setUploading(false)
    }
    return false // 阻止默认上传行为
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteFile(id)
      message.success('文件删除成功')
      fetchData()
    } catch (error) {
      // handle error
    }
  }

  const columns: ColumnsType<DataFile> = [
    {
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <FileOutlined style={{ fontSize: 20, color: formatColors[record.format] || formatColors.other }} />
          <div>
            <div style={{ fontWeight: 500 }}>{name}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.type}</div>
          </div>
        </Space>
      )
    },
    {
      title: '格式',
      dataIndex: 'format',
      key: 'format',
      render: (format) => (
        <Tag style={{ background: formatColors[format] || formatColors.other, color: '#fff', border: 'none' }}>
          {formatNames[format] || 'Other'}
        </Tag>
      )
    },
    { title: '大小', dataIndex: 'size', key: 'size' },
    { title: '上传时间', dataIndex: 'uploadTime', key: 'uploadTime' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'ready' ? 'green' : status === 'uploading' ? 'blue' : 'red'}>
          {status === 'ready' ? '就绪' : status === 'uploading' ? '上传中' : '错误'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} title="预览" />
          <Button type="text" icon={<DownloadOutlined />} title="下载" />
          <Popconfirm title="确定要删除此文件吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} title="删除" />
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>项目</Breadcrumb.Item>
        <Breadcrumb.Item>数据管理</Breadcrumb.Item>
      </Breadcrumb>

      <Card
        title="数据文件"
        extra={
          <Space>
            <Input
              prefix={<SearchOutlined />}
              placeholder="搜索文件"
              style={{ width: 200 }}
              value={searchText}
              onChange={e => { setSearchText(e.target.value); setPagination(prev => ({ ...prev, current: 1 })) }}
            />
            <Button icon={<DownloadOutlined />}>导入</Button>
            <Upload showUploadList={false} beforeUpload={handleUpload}>
              <Button type="primary" icon={<UploadOutlined />} loading={uploading}>上传文件</Button>
            </Upload>
          </Space>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Card size="small" style={{ background: '#fafafa' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div><strong>总存储:</strong> 256 GB</div>
              <div><strong>已使用:</strong> 128 GB</div>
              <Progress percent={50} style={{ width: 200 }} />
            </div>
          </Card>
        </div>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 个文件`,
            onChange: (page, pageSize) => setPagination({ current: page, pageSize, total: pagination.total }),
          }}
        />
      </Card>
    </div>
  )
}

export default DataManagement