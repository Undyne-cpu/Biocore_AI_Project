import React, { useEffect, useState } from 'react'
import { Card, Table, Tag, Button, Space, Avatar, Modal, Form, Input, Select, message, Popconfirm } from 'antd'
import { PlusOutlined, DeleteOutlined, MailOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getTeamList, inviteMember, removeMember, updateMemberRole } from '../services/team'
import type { TeamMember } from '../types'

const roleColors: Record<string, string> = {
  owner: 'gold',
  admin: 'purple',
  member: 'blue'
}

const roleNames: Record<string, string> = {
  owner: '所有者',
  admin: '管理员',
  member: '成员'
}

const Team: React.FC = () => {
  const [data, setData] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await getTeamList()
      setData(response.data.data)
    } catch (error) {
      // handle error
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (values: { email: string; role: 'admin' | 'member' }) => {
    try {
      await inviteMember(values)
      message.success('邀请已发送')
      setIsModalOpen(false)
      form.resetFields()
      fetchData()
    } catch (error) {
      // handle error
    }
  }

  const handleRemove = async (id: string) => {
    try {
      await removeMember(id)
      message.success('成员已移除')
      fetchData()
    } catch (error) {
      // handle error
    }
  }

  const handleRoleChange = async (id: string, role: 'admin' | 'member') => {
    try {
      await updateMemberRole(id, role)
      message.success('角色已更新')
      fetchData()
    } catch (error) {
      // handle error
    }
  }

  const columns: ColumnsType<TeamMember> = [
    {
      title: '成员',
      key: 'member',
      render: (_, record) => (
        <Space>
          <Avatar style={{ background: '#667eea' }}>{record.name?.[0] || record.email[0]}</Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}><MailOutlined /> {record.email}</div>
          </div>
        </Space>
      )
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role, record) => (
        record.role === 'owner' ? (
          <Tag color={roleColors[role]}>{roleNames[role]}</Tag>
        ) : (
          <Select
            value={role}
            onChange={(val) => handleRoleChange(record.id, val)}
            size="small"
          >
            <Select.Option value="admin">管理员</Select.Option>
            <Select.Option value="member">成员</Select.Option>
          </Select>
        )
      )
    },
    { title: '加入时间', dataIndex: 'joinedAt', key: 'joinedAt' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => record.role !== 'owner' ? (
        <Popconfirm title="确定要移除此成员吗？" onConfirm={() => handleRemove(record.id)}>
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ) : null
    }
  ]

  return (
    <Card
      title="团队管理"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>添加成员</Button>
      }
    >
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
      />

      <Modal title="添加成员" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleInvite}>
          <Form.Item name="email" label="邮箱地址" rules={[{ required: true, type: 'email', message: '请输入有效的邮箱地址' }]}>
            <Input placeholder="请输入邮箱地址" />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select placeholder="请选择角色">
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="member">成员</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>取消</Button>
              <Button type="primary" htmlType="submit">添加</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default Team