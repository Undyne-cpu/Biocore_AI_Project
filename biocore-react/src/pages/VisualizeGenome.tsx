import React from 'react'
import { Card, Row, Col, Select, Button, Space, InputNumber } from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'

const VisualizeGenome: React.FC = () => {
  return (
    <div>
      <Card 
        title="基因组浏览器" 
        extra={
          <Space>
            <Select placeholder="选择参考基因组" defaultValue="hg38" style={{ width: 150 }}>
              <Select.Option value="hg38">GRCh38</Select.Option>
              <Select.Option value="hg19">GRCh37</Select.Option>
              <Select.Option value="mm10">GRCm38</Select.Option>
            </Select>
            <Button icon={<ReloadOutlined />}>加载数据</Button>
          </Space>
        }
      >
        <Card style={{ background: '#1a1a2e', minHeight: 500 }}>
          <div style={{ textAlign: 'center', color: '#fff', padding: 100 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>
              <SearchOutlined />
            </div>
            <h3 style={{ color: '#fff', marginBottom: 8 }}>IGV.js 基因组浏览器</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>
              请选择参考基因组和加载BAM/VCF文件后开始浏览
            </p>
            <div style={{ marginTop: 24 }}>
              <Space>
                <InputNumber placeholder="位置 (chr:start-end)" style={{ width: 200 }} />
                <Button type="primary" icon={<SearchOutlined />}>跳转</Button>
              </Space>
            </div>
          </div>
        </Card>
      </Card>

      <Card title="轨道设置" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Card size="small">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>参考基因组</span>
                <Button size="small">隐藏</Button>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>比对轨道</span>
                <Button size="small">显示</Button>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>变异轨道</span>
                <Button size="small">显示</Button>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default VisualizeGenome