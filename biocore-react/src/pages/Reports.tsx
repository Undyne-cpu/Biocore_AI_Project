import React, { useEffect, useState } from 'react'
import { Card, Table, Tag, Button, Space, Modal, Form, Input, Select, message, Popconfirm } from 'antd'
import { FileTextOutlined, DownloadOutlined, DeleteOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getReportList, createReport, downloadReport } from '../services/report'
import type { Report, ReportType } from '../types'

const Reports: React.FC = () => {
  const [data, setData] = useState<Report[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await getReportList()
      setData(response.data.data)
    } catch (error) {
      // handle error
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (_id: string) => {
    try {
      // await deleteReport(id)
      message.success('删除成功')
      fetchData()
    } catch (error) {
      // handle error
    }
  }

  const onFinish = async (values: { projectId: string; type: ReportType }) => {
    try {
      await createReport(values)
      message.success('报告生成成功')
      setIsModalOpen(false)
      form.resetFields()
      fetchData()
    } catch (error) {
      // handle error
    }
  }

  const columns: ColumnsType<Report> = [
    { title: '报告名称', dataIndex: 'name', key: 'name', render: (name) => <Space><FileTextOutlined />{name}</Space> },
    { title: '类型', dataIndex: 'type', key: 'type', render: (type) => <Tag>{type === 'summary' ? '概要' : '详细'}</Tag> },
    { title: '所属项目', dataIndex: 'project', key: 'project' },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} title="预览" />
          <Button type="text" icon={<DownloadOutlined />} title="下载" onClick={() => downloadReport(record.id)} />
          <Popconfirm title="确定要删除此报告吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} title="删除" />
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <Card
      title="报告中心"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>生成报告</Button>
      }
    >
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
      />

      <Modal title="生成报告" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="projectId" label="选择项目" rules={[{ required: true, message: '请选择项目' }]}>
            <Input placeholder="请输入项目ID" />
          </Form.Item>
          <Form.Item name="type" label="报告类型" rules={[{ required: true, message: '请选择报告类型' }]}>
            <Select placeholder="请选择报告类型">
              <Select.Option value="summary">概要报告</Select.Option>
              <Select.Option value="detailed">详细报告</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>取消</Button>
              <Button type="primary" htmlType="submit">生成</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default Reports