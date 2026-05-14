import React, { useEffect, useState } from 'react'
import { Card, Table, Tag, Button, Space, Modal, Form, Input, Select, message, Popconfirm } from 'antd'
import { PlusOutlined, SearchOutlined, FolderOutlined, DeleteOutlined, EditOutlined, ExportOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getProjectList, createProject, updateProject, deleteProject } from '../services/project'
import type { Project as ProjectType, CreateProjectParams } from '../types'

const ProjectTypeIcon: Record<string, string> = {
  wgs: 'WGS',
  wes: 'WES',
  rna: 'RNA',
  chip: 'ChIP',
  meta: 'Meta'
}

const ProjectTypeColor: Record<string, string> = {
  wgs: '#667eea',
  wes: '#764ba2',
  rna: '#00D4AA',
  chip: '#fa8c16',
  meta: '#722ed1'
}

const Projects: React.FC = () => {
  const [data, setData] = useState<ProjectType[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectType | null>(null)
  const [form] = Form.useForm()
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 })
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    fetchData()
  }, [pagination.current, pagination.pageSize, searchText])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await getProjectList({
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

  const columns: ColumnsType<ProjectType> = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <Tag style={{ background: ProjectTypeColor[record.type] || '#667eea', color: '#fff', border: 'none' }}>
            {ProjectTypeIcon[record.type] || record.type.toUpperCase()}
          </Tag>
          <div>
            <div style={{ fontWeight: 500 }}>{name}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.code}</div>
          </div>
        </Space>
      )
    },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          completed: { color: 'green', text: '已完成' },
          processing: { color: 'blue', text: '分析中' },
          draft: { color: 'default', text: '草稿' },
        }
        const { color, text } = statusMap[status] || { color: 'default', text: status }
        return <Tag color={color}>{text}</Tag>
      }
    },
    { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<FolderOutlined />} onClick={() => message.info('查看项目详情')} />
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="确定要删除此项目吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ]

  const handleEdit = (project: ProjectType) => {
    setEditingProject(project)
    form.setFieldsValue(project)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id)
      message.success('项目删除成功')
      fetchData()
    } catch (error) {
      // handle error
    }
  }

  const onFinish = async (values: CreateProjectParams) => {
    try {
      if (editingProject) {
        await updateProject(editingProject.id, values)
        message.success('项目更新成功')
      } else {
        await createProject(values)
        message.success('项目创建成功')
      }
      setIsModalOpen(false)
      form.resetFields()
      setEditingProject(null)
      fetchData()
    } catch (error) {
      // handle error
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingProject(null)
    form.resetFields()
  }

  return (
    <Card
      title="项目列表"
      extra={
        <Space>
          <Input
            prefix={<SearchOutlined />}
            placeholder="搜索项目"
            style={{ width: 200 }}
            value={searchText}
            onChange={e => { setSearchText(e.target.value); setPagination(prev => ({ ...prev, current: 1 })) }}
          />
          <Button icon={<ExportOutlined />}>导出</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>新建项目</Button>
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
          showTotal: (total) => `共 ${total} 个项目`,
          onChange: (page, pageSize) => setPagination(prev => ({ current: page, pageSize, total: prev.total })),
        }}
      />

      <Modal
        title={editingProject ? '编辑项目' : '新建项目'}
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="项目名称" rules={[{ required: true, message: '请输入项目名称' }]}>
            <Input placeholder="请输入项目名称" />
          </Form.Item>
          <Form.Item name="type" label="项目类型" rules={[{ required: true, message: '请选择项目类型' }]}>
            <Select placeholder="请选择项目类型">
              <Select.Option value="wgs">全基因组测序 (WGS)</Select.Option>
              <Select.Option value="wes">全外显子组测序 (WES)</Select.Option>
              <Select.Option value="rna">转录组测序 (RNA-seq)</Select.Option>
              <Select.Option value="chip">ChIP-seq</Select.Option>
              <Select.Option value="meta">宏基因组 (Meta)</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="项目描述">
            <Input.TextArea rows={3} placeholder="请输入项目描述" />
          </Form.Item>
          <Form.Item name="genome" label="参考基因组">
            <Select placeholder="请选择参考基因组">
              <Select.Option value="hg38">GRCh38 (Human)</Select.Option>
              <Select.Option value="hg19">GRCh37 (Human)</Select.Option>
              <Select.Option value="mm10">GRCm38 (Mouse)</Select.Option>
              <Select.Option value="rn6">Rnor_6.0 (Rat)</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={handleModalClose}>取消</Button>
              <Button type="primary" htmlType="submit">{editingProject ? '保存' : '创建'}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default Projects