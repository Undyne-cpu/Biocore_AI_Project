import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, Form, Input, Button, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { login, saveAuth } from '../services/auth'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = React.useState(false)

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true)
    try {
      const response = await login(values)
      const { data } = response.data
      saveAuth(data)
      message.success('登录成功！正在跳转...')
      setTimeout(() => {
        navigate('/dashboard')
      }, 500)
    } catch (error) {
      // 错误已在 axios 拦截器中处理
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{ width: 400, borderRadius: 16 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#fff',
            fontSize: 24,
            fontWeight: 600
          }}>
            <svg width="30" height="44" viewBox="0 0 18 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 2C3 2 7 4 11 8C15 12 15 14 15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M15 2C15 2 11 4 7 8C3 12 3 14 3 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M3 14C3 14 7 16 11 20C15 24 15 26 15 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M15 14C15 14 11 16 7 20C3 24 3 26 3 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>BioCore</h1>
          <p style={{ color: '#8c8c8c' }}>生物信息分析平台</p>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="email" rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '请输入有效的邮箱地址' }]}>
            <Input prefix={<UserOutlined />} placeholder="邮箱" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
          </Form.Item>
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <a href="#">忘记密码？</a>
              <Link to="/register">没有账号？注册</Link>
            </div>
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>登录</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default Login