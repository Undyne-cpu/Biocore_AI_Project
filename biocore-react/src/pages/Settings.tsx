import React, { useEffect, useState } from 'react'
import { Card, Tabs, Form, Input, Select, Switch, Button, Divider, message } from 'antd'
import { UserOutlined, LockOutlined, BellOutlined, GlobalOutlined } from '@ant-design/icons'
import { getCurrentUser } from '../services/auth'
import { getUserSettings, updateUserSettings, updateUser, updatePassword } from '../services/user'
import type { UserSettings, AuthUser } from '../types'

const Settings: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const userResponse = await getCurrentUser()
      const userData = userResponse.data.data
      setUser(userData)
      form.setFieldsValue({
        name: userData.name,
        email: userData.email,
        institution: userData.institution,
        bio: userData.bio,
      })

      const settingsResponse = await getUserSettings(userData.id)
      const settings = settingsResponse.data.data
      form.setFieldsValue({
        language: settings.language,
        timezone: settings.timezone,
        defaultGenome: settings.defaultGenome,
      })
    } catch (error) {
      // handle error
    }
  }

  const handleProfileSave = async (values: { name?: string; institution?: string; bio?: string }) => {
    if (!user) return
    setLoading(true)
    try {
      await updateUser(user.id, values)
      message.success('个人资料已保存')
    } catch (error) {
      // handle error
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (values: { currentPassword: string; newPassword: string }) => {
    if (!user) return
    setLoading(true)
    try {
      await updatePassword(user.id, values)
      message.success('密码修改成功')
      form.setFieldsValue({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      // handle error
    } finally {
      setLoading(false)
    }
  }

  const handleSettingsSave = async (values: Partial<UserSettings>) => {
    if (!user) return
    setLoading(true)
    try {
      await updateUserSettings(user.id, values)
      message.success('设置已保存')
    } catch (error) {
      // handle error
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title="系统设置">
      <Tabs
        tabPosition="left"
        style={{ minHeight: 500 }}
        items={[
          {
            key: 'profile',
            label: <span><UserOutlined /> 个人资料</span>,
            children: (
              <Card>
                <Form layout="vertical" form={form} onFinish={handleProfileSave}>
                  <Form.Item name="name" label="姓名">
                    <Input />
                  </Form.Item>
                  <Form.Item name="email" label="邮箱">
                    <Input />
                  </Form.Item>
                  <Form.Item name="institution" label="机构">
                    <Input />
                  </Form.Item>
                  <Form.Item name="bio" label="简介">
                    <Input.TextArea rows={3} placeholder="介绍一下自己..." />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>保存更改</Button>
                </Form>
              </Card>
            )
          },
          {
            key: 'security',
            label: <span><LockOutlined /> 安全设置</span>,
            children: (
              <Card>
                <Form layout="vertical" onFinish={handlePasswordChange}>
                  <Form.Item name="currentPassword" label="当前密码" rules={[{ required: true, message: '请输入当前密码' }]}>
                    <Input.Password />
                  </Form.Item>
                  <Form.Item name="newPassword" label="新密码" rules={[{ required: true, min: 6, message: '密码至少6位' }]}>
                    <Input.Password />
                  </Form.Item>
                  <Form.Item name="confirmPassword" label="确认密码" dependencies={['newPassword']} rules={[
                    { required: true, message: '请确认密码' },
                    ({ getFieldValue }: { getFieldValue: (name: string) => string }) => ({
                      validator(_: any, value: string) {
                        if (!value || value === getFieldValue('newPassword')) {
                          return Promise.resolve()
                        }
                        return Promise.reject(new Error('两次密码不一致'))
                      }
                    })
                  ]}>
                    <Input.Password />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>修改密码</Button>
                </Form>
                <Divider />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>两步验证</div>
                    <div style={{ color: '#8c8c8c', fontSize: 12 }}>启用后登录需要验证码</div>
                  </div>
                  <Switch />
                </div>
              </Card>
            )
          },
          {
            key: 'notifications',
            label: <span><BellOutlined /> 通知设置</span>,
            children: (
              <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>邮件通知</div>
                    <div style={{ color: '#8c8c8c', fontSize: 12 }}>任务完成时发送邮件</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>任务失败提醒</div>
                    <div style={{ color: '#8c8c8c', fontSize: 12 }}>分析失败时发送通知</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>团队消息</div>
                    <div style={{ color: '#8c8c8c', fontSize: 12 }}>团队成员活动通知</div>
                  </div>
                  <Switch />
                </div>
              </Card>
            )
          },
          {
            key: 'preferences',
            label: <span><GlobalOutlined /> 偏好设置</span>,
            children: (
              <Card>
                <Form layout="vertical" form={form} onFinish={handleSettingsSave}>
                  <Form.Item name="language" label="语言">
                    <Select>
                      <Select.Option value="zh-CN">简体中文</Select.Option>
                      <Select.Option value="en-US">English</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name="timezone" label="时区">
                    <Select>
                      <Select.Option value="Asia/Shanghai">中国标准时间 (UTC+8)</Select.Option>
                      <Select.Option value="America/New_York">美国东部时间 (UTC-5)</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name="defaultGenome" label="默认参考基因组">
                    <Select>
                      <Select.Option value="hg38">GRCh38 (Human)</Select.Option>
                      <Select.Option value="hg19">GRCh37 (Human)</Select.Option>
                    </Select>
                  </Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>保存设置</Button>
                </Form>
              </Card>
            )
          }
        ]}
      />
    </Card>
  )
}

export default Settings