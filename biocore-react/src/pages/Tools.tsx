import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Input, Select, Tag, Button, Space, Badge } from 'antd'
import { SearchOutlined, FilterOutlined, ExperimentOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import { getToolList } from '../services/tool'
import type { Tool } from '../types'

const Tools: React.FC = () => {
  const navigate = useNavigate()
  const [tools, setTools] = useState<Tool[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  useEffect(() => {
    fetchData()
  }, [searchText, selectedCategory])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await getToolList({
        search: searchText || undefined,
        category: selectedCategory || undefined,
      })
      const { categories: cats, list } = response.data.data
      setCategories(cats || [])
      setTools(list || [])
    } catch (error) {
      // handle error
    } finally {
      setLoading(false)
    }
  }

  const usageChartOption: EChartsOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: tools.map(t => t.name), axisLabel: { rotate: 30 } },
    yAxis: { type: 'value', name: '使用次数' },
    series: [{ type: 'bar', data: tools.map(t => t.usage), itemStyle: { color: '#667eea' } }]
  }

  const handleToolClick = (toolId: string) => {
    navigate(`/tools/${toolId}`)
  }

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {categories.map((cat) => (
          <Col span={6} key={cat.name}>
            <Card loading={loading}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 8, background: cat.color || '#667eea', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20 }}>
                  <ExperimentOutlined />
                </div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 600 }}>{cat.count}</div>
                  <div style={{ color: '#8c8c8c' }}>{cat.name}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        title="分析工具"
        extra={
          <Space>
            <Input
              prefix={<SearchOutlined />}
              placeholder="搜索工具"
              style={{ width: 200 }}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
            <Select
              placeholder="分类"
              style={{ width: 120 }}
              allowClear
              value={selectedCategory || undefined}
              onChange={val => setSelectedCategory(val || '')}
            >
              {categories.map(cat => (
                <Select.Option key={cat.name} value={cat.name}>{cat.name}</Select.Option>
              ))}
            </Select>
            <Button icon={<FilterOutlined />}>筛选</Button>
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          {tools.map((tool) => (
            <Col span={6} key={tool.id}>
              <Card
                hoverable
                style={{ cursor: 'pointer' }}
                onClick={() => handleToolClick(tool.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: tool.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <ExperimentOutlined />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{tool.name}</div>
                    <Tag color="default">{tool.category}</Tag>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 12 }}>{tool.desc}</div>
                <div style={{ fontSize: 12, marginBottom: 8 }}>
                  <span style={{ color: '#8c8c8c' }}>输入:</span> {tool.input}
                </div>
                <div style={{ fontSize: 12, marginBottom: 8 }}>
                  <span style={{ color: '#8c8c8c' }}>输出:</span> {tool.output}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Badge count={`${tool.usage}次使用`} style={{ backgroundColor: '#f0f0f0', color: '#8c8c8c' }} />
                  <Button size="small" type="primary" onClick={(e) => { e.stopPropagation(); handleToolClick(tool.id); }}>查看详情</Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Card title="工具使用统计" style={{ marginTop: 16 }}>
        <ReactECharts option={usageChartOption} style={{ height: 300 }} />
      </Card>
    </div>
  )
}

export default Tools