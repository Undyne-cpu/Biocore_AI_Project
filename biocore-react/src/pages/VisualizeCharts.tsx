import React from 'react'
import { Card, Row, Col, Select, Button, Space } from 'antd'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'

const heatmapOption: EChartsOption = {
  tooltip: { position: 'top' },
  xAxis: { type: 'category', data: ['Gene1', 'Gene2', 'Gene3', 'Gene4', 'Gene5'] },
  yAxis: { type: 'category', data: ['Sample1', 'Sample2', 'Sample3', 'Sample4'] },
  visualMap: { min: 0, max: 100, calculable: true, orient: 'horizontal', left: 'center', bottom: '0%' },
  series: [{ type: 'heatmap', data: [[0,0,5],[0,1,12],[0,2,8],[0,3,15],[1,0,18],[1,1,25],[1,2,32],[1,3,28],[2,0,42],[2,1,38],[2,2,45],[2,3,52],[3,0,68],[3,1,72],[3,2,85],[3,3,78]], emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } } }]
}

const volcanoOption: EChartsOption = {
  tooltip: { trigger: 'item' },
  xAxis: { type: 'category', data: Array.from({ length: 50 }, (_, i) => `Gene${i + 1}`), axisLabel: { show: false } },
  yAxis: { type: 'value' },
  series: [{ type: 'scatter', data: Array.from({ length: 50 }, () => ({ value: [Math.random() * 100, Math.random() * 10 - 5], itemStyle: { color: Math.random() > 0.8 ? '#f5222d' : Math.random() < 0.2 ? '#52c41a' : '#667eea' } })), symbolSize: 10 }]
}

const VisualizeCharts: React.FC = () => {
  return (
    <div>
      <Card 
        title="分析图表" 
        extra={
          <Space>
            <Select placeholder="选择数据集" style={{ width: 200 }} allowClear>
              <Select.Option value="1">肝癌RNA-seq差异表达</Select.Option>
            </Select>
            <Button>导出图片</Button>
          </Space>
        }
      >
        <Row gutter={16}>
          <Col span={12}>
            <Card title="热图" size="small">
              <ReactECharts option={heatmapOption} style={{ height: 350 }} />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="火山图" size="small">
              <ReactECharts option={volcanoOption} style={{ height: 350 }} />
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default VisualizeCharts