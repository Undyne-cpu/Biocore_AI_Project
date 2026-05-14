import React from 'react'
import { Card, Row, Col, Button, Space, Select } from 'antd'
import { BarChartOutlined, DatabaseOutlined } from '@ant-design/icons'

const visualItems = [
  { title: '基因组浏览器', desc: '交互式浏览基因组区域', icon: <DatabaseOutlined />, color: '#667eea', path: '/visualize/genome' },
  { title: '分析图表', desc: '热图、火山图、富集图等', icon: <BarChartOutlined />, color: '#00D4AA', path: '/visualize/charts' },
]

const Visualize: React.FC = () => {
  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ marginBottom: 4 }}>可视化中心</h2>
            <p style={{ color: '#8c8c8c' }}>选择可视化类型开始探索您的数据</p>
          </div>
          <Space>
            <Select placeholder="选择项目" style={{ width: 200 }} allowClear>
              <Select.Option value="1">全基因组测序分析</Select.Option>
              <Select.Option value="2">肝癌RNA-seq差异表达</Select.Option>
            </Select>
          </Space>
        </div>
      </Card>

      <Row gutter={16}>
        {visualItems.map((item) => (
          <Col span={12} key={item.title}>
            <Card hoverable style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, color: item.color, marginBottom: 16 }}>{item.icon}</div>
                <h3 style={{ marginBottom: 8 }}>{item.title}</h3>
                <p style={{ color: '#8c8c8c', marginBottom: 16 }}>{item.desc}</p>
                <Button type="primary" href={item.path}>打开</Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default Visualize