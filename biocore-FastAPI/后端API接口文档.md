# BioCore 生物信息分析平台 - 后端API接口文档

## 概述

这是一个基于Python的FastAPI框架的后端项目，我的数据库连接方式是：postgresql://postgres:m2m2fczs@biocore-db-postgresql.ns-o5yhyhkn.svc:5432

- **基础URL**: `https://api.biocore.com/api/v1`
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON
- **字符编码**: UTF-8

---

## 目录

1. [认证模块 (Auth)](#1-认证模块-auth)
2. [用户模块 (User)](#2-用户模块-user)
3. [项目模块 (Project)](#3-项目模块-project)
4. [数据管理模块 (Data)](#4-数据管理模块-data)
5. [工具模块 (Tool)](#5-工具模块-tool)
6. [工作流模块 (Workflow)](#6-工作流模块-workflow)
7. [执行监控模块 (Execution)](#7-执行监控模块-execution)
8. [结果模块 (Result)](#8-结果模块-result)
9. [报告模块 (Report)](#9-报告模块-report)
10. [团队模块 (Team)](#10-团队模块-team)
11. [可视化模块 (Visualization)](#11-可视化模块-visualization)
12. [统计模块 (Statistics)](#12-统计模块-statistics)

---

## 1. 认证模块 (Auth)

### 1.1 用户注册
```
POST /auth/register
```

**请求参数:**
```json
{
  "email": "string (required, email)",
  "password": "string (required, min 6 chars)",
  "name": "string (required)",
  "institution": "string (optional)"
}
```

**响应示例:**
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "用户名",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### 1.2 用户登录
```
POST /auth/login
```

**请求参数:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**响应示例:**
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "id": "usr_abc123",
    "email": "demo@biocore.com",
    "name": "李博士",
    "institution": "XX大学生命科学学院",
    "avatar": null,
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### 1.3 用户登出
```
POST /auth/logout
```

**请求头:**
```
Authorization: Bearer <token>
```

**响应示例:**
```json
{
  "code": 200,
  "message": "登出成功"
}
```

---

### 1.4 获取当前用户信息
```
GET /auth/me
```

**请求头:**
```
Authorization: Bearer <token>
```

**响应示例:**
```json
{
  "code": 200,
  "data": {
    "id": "usr_abc123",
    "email": "demo@biocore.com",
    "name": "李博士",
    "institution": "XX大学生命科学学院",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "生物信息学研究人员",
    "createdAt": "2024-01-15T08:00:00Z"
  }
}
```

---

### 1.5 刷新令牌
```
POST /auth/refresh
```

**请求参数:**
```json
{
  "refreshToken": "string (required)"
}
```

**响应示例:**
```json
{
  "code": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

## 2. 用户模块 (User)

### 2.1 获取用户列表
```
GET /users
```

**查询参数:**
| 参数 | 类型 | 说明 |
|------|------|------|
| page | int | 页码 (默认: 1) |
| pageSize | int | 每页数量 (默认: 20) |
| search | string | 搜索关键词 |

**响应示例:**
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": "usr_abc123",
        "name": "李博士",
        "email": "li@example.com",
        "avatar": null,
        "role": "owner",
        "joinedAt": "2024-01-15"
      }
    ],
    "total": 10,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 2.2 获取用户详情
```
GET /users/:id
```

**路径参数:**
| 参数 | 类型 | 说明 |
|------|------|------|
| id | string | 用户ID |

**响应示例:**
```json
{
  "code": 200,
  "data": {
    "id": "usr_abc123",
    "name": "李博士",
    "email": "li@example.com",
    "avatar": null,
    "institution": "XX大学生命科学学院",
    "bio": "生物信息学研究人员",
    "role": "owner",
    "joinedAt": "2024-01-15"
  }
}
```

---

### 2.3 更新用户信息
```
PUT /users/:id
```

**路径参数:**
| 参数 | 类型 | 说明 |
|------|------|------|
| id | string | 用户ID |

**请求参数:**
```json
{
  "name": "string (optional)",
  "institution": "string (optional)",
  "bio": "string (optional)",
  "avatar": "string (optional, URL)"
}
```

**响应示例:**
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": "usr_abc123",
    "name": "李博士",
    "institution": "XX大学生命科学学院",
    "bio": "生物信息学研究人员"
  }
}
```

---

### 2.4 修改密码
```
PUT /users/:id/password
```

**请求参数:**
```json
{
  "currentPassword": "string (required)",
  "newPassword": "string (required, min 6 chars)"
}
```

**响应示例:**
```json
{
  "code": 200,
  "message": "密码修改成功"
}
```

---

### 2.5 获取用户设置
```
GET /users/:id/settings
```

**响应示例:**
```json
{
  "code": 200,
  "data": {
    "language": "zh-CN",
    "timezone": "Asia/Shanghai",
    "defaultGenome": "hg38",
    "notifications": {
      "email": true,
      "taskFailure": true,
      "teamMessages": false
    },
    "twoFactorEnabled": false
  }
}
```

---

### 2.6 更新用户设置
```
PUT /users/:id/settings
```

**请求参数:**
```json
{
  "language": "string (optional)",
  "timezone": "string (optional)",
  "defaultGenome": "string (optional)",
  "notifications": {
    "email": "boolean",
    "taskFailure": "boolean",
    "teamMessages": "boolean"
  }
}
```

---

## 3. 项目模块 (Project)

### 3.1 获取项目列表
```
GET /projects
```

**查询参数:**
| 参数 | 类型 | 说明 |
|------|------|------|
| page | int | 页码 (默认: 1) |
| pageSize | int | 每页数量 (默认: 20) |
| status | string | 状态筛选 (draft/processing/completed) |
| type | string | 类型筛选 (wgs/rna/chip/meta) |
| search | string | 搜索关键词 |

**响应示例:**
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": "proj_001",
        "name": "全基因组测序分析",
        "code": "WGS-2024-001",
        "description": "全基因组测序数据分析与变异检测",
        "type": "wgs",
        "status": "completed",
        "createdAt": "2024-01-15",
        "updatedAt": "2024-05-10"
      }
    ],
    "total": 12,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 3.2 创建项目
```
POST /projects
```

**请求参数:**
```json
{
  "name": "string (required)",
  "type": "string (required, wgs/wes/rna/chip/meta)",
  "description": "string (optional)",
  "genome": "string (optional, hg38/hg19/mm10)"
}
```

**响应示例:**
```json
{
  "code": 200,
  "message": "项目创建成功",
  "data": {
    "id": "proj_new001",
    "name": "新项目",
    "code": "PROJ-2024-023",
    "type": "wgs",
    "status": "draft",
    "createdAt": "2024-05-13"
  }
}
```

---

### 3.3 获取项目详情
```
GET /projects/:id
```

**响应示例:**
```json
{
  "code": 200,
  "data": {
    "id": "proj_001",
    "name": "全基因组测序分析",
    "code": "WGS-2024-001",
    "description": "全基因组测序数据分析与变异检测",
    "type": "wgs",
    "status": "completed",
    "genome": "hg38",
    "owner": {
      "id": "usr_abc123",
      "name": "李博士"
    },
    "createdAt": "2024-01-15",
    "updatedAt": "2024-05-10"
  }
}
```

---

### 3.4 更新项目
```
PUT /projects/:id
```

**请求参数:**
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "status": "string (optional)"
}
```

---

### 3.5 删除项目
```
DELETE /projects/:id
```

**响应示例:**
```json
{
  "code": 200,
  "message": "项目删除成功"
}
```

---

## 4. 数据管理模块 (Data)

### 4.1 获取数据文件列表
```
GET /data
```

**查询参数:**
| 参数 | 类型 | 说明 |
|------|------|------|
| projectId | string | 项目ID |
| format | string | 文件格式筛选 (fasta/fastq/bam/vcf) |
| type | string | 文件类型 (raw/reference/result/annotation) |
| search | string | 搜索关键词 |

**响应示例:**
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": "file_001",
        "name": "sample1_R1.fastq.gz",
        "type": "raw",
        "size": "2.3 GB",
        "format": "fastq",
        "uploadTime": "2024-05-10 14:30",
        "status": "ready"
      }
    ],
    "total": 256,
    "storageUsed": "128 GB",
    "storageTotal": "256 GB"
  }
}
```

---

### 4.2 上传数据文件
```
POST /data/upload
```

**请求参数 (multipart/form-data):**
| 参数 | 类型 | 说明 |
|------|------|------|
| file | File | 文件 (required) |
| projectId | string | 项目ID |
| type | string | 文件类型 |
| description | string | 文件描述 |

**响应示例:**
```json
{
  "code": 200,
  "message": "文件上传成功",
  "data": {
    "id": "file_new001",
    "name": "sample1_R1.fastq.gz",
    "size": "2.3 GB",
    "format": "fastq",
    "status": "ready"
  }
}
```

---

### 4.3 获取文件详情
```
GET /data/:id
```

**响应示例:**
```json
{
  "code": 200,
  "data": {
    "id": "file_001",
    "name": "sample1_R1.fastq.gz",
    "type": "raw",
    "size": "2.3 GB",
    "format": "fastq",
    "md5": "a1b2c3d4e5f6...",
    "path": "/storage/projects/proj_001/data/file_001.fastq.gz",
    "uploadTime": "2024-05-10 14:30",
    "status": "ready"
  }
}
```

---

### 4.4 下载文件
```
GET /data/:id/download
```

**响应:** 文件流

---

### 4.5 删除文件
```
DELETE /data/:id
```

**响应示例:**
```json
{
  "code": 200,
  "message": "文件删除成功"
}
```

---

## 5. 工具模块 (Tool)

### 5.1 获取工具列表
```
GET /tools
```

**查询参数:**
| 参数 | 类型 | 说明 |
|------|------|------|
| category | string | 分类筛选 (quality/alignment/variant/expression) |
| search | string | 搜索关键词 |

**响应示例:**
```json
{
  "code": 200,
  "data": {
    "categories": [
      {
        "name": "质控工具",
        "count": 3,
        "color": "#667eea"
      }
    ],
    "list": [
      {
        "id": "fastqc",
        "name": "FastQC",
        "category": "质控",
        "desc": "测序质量评估",
        "input": "FASTQ",
        "output": "HTML报告",
        "version": "0.11.9",
        "color": "#667eea",
        "usage": 1250
      }
    ]
  }
}
```

---

### 5.2 获取工具详情
```
GET /tools/:id
```

**响应示例:**
```json
{
  "code": 200,
  "data": {
    "id": "gatk",
    "name": "GATK HaplotypeCaller",
    "category": "变异",
    "desc": "SNP/Indel检测",
    "input": "BAM",
    "output": "VCF",
    "version": "4.4.0.0",
    "parameters": [
      {
        "name": "threads",
        "label": "线程数",
        "type": "number",
        "default": 4,
        "min": 1,
        "max": 32
      },
      {
        "name": "memory",
        "label": "内存 (GB)",
        "type": "number",
        "default": 8,
        "min": 1,
        "max": 64
      }
    ],
    "genomes": ["hg38", "hg19", "mm10"]
  }
}
```

---

### 5.3 运行工具
```
POST /tools/:id/run
```

**请求参数:**
```json
{
  "projectId": "string (required)",
  "inputFiles": ["string (required)"],
  "parameters": {
    "threads": 4,
    "memory": 8,
    "genome": "hg38"
  },
  "extraParams": "string (optional)"
}
```

**响应示例:**
```json
{
  "code": 200,
  "message": "分析任务已提交",
  "data": {
    "taskId": "task_001",
    "toolId": "gatk",
    "status": "queued",
    "estimatedTime": "30分钟"
  }
}
```

---

## 6. 工作流模块 (Workflow)

### 6.1 获取工作流列表
```
GET /workflows
```

**响应示例:**
```json
{
  "code": 200,
  "data": [
    {
      "id": "wf_001",
      "name": "WGS标准流程",
      "description": "从原始数据到变异检测",
      "steps": 4,
      "status": "draft",
      "createdAt": "2024-05-01"
    }
  ]
}
```

---

### 6.2 创建工作流
```
POST /workflows
```

**请求参数:**
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "nodes": [
    {
      "id": "node1",
      "tool": "fastqc",
      "name": "FastQC",
      "params": {}
    }
  ],
  "edges": [
    {
      "source": "node1",
      "target": "node2"
    }
  ],
  "settings": {
    "parallelTasks": 4,
    "failStrategy": "skip"
  }
}
```

---

### 6.3 获取工作流详情
```
GET /workflows/:id
```

---

### 6.4 更新工作流
```
PUT /workflows/:id
```

---

### 6.5 删除工作流
```
DELETE /workflows/:id
```

---

### 6.6 保存工作流配置
```
POST /workflows/:id/save-config
```

**请求参数:**
```json
{
  "nodeId": "string",
  "config": {
    "threads": 4,
    "memory": 8
  }
}
```

---

### 6.7 运行工作流
```
POST /workflows/:id/run
```

**请求参数:**
```json
{
  "inputFiles": {
    "start": "file_001"
  },
  "settings": {
    "saveCheckpoints": true
  }
}
```

**响应示例:**
```json
{
  "code": 200,
  "message": "工作流已启动",
  "data": {
    "executionId": "exec_001",
    "workflowId": "wf_001",
    "name": "WGS标准分析流程",
    "status": "running"
  }
}
```

---

### 6.8 验证工作流
```
POST /workflows/:id/validate
```

**响应示例:**
```json
{
  "code": 200,
  "data": {
    "valid": true,
    "errors": []
  }
}
```

---

## 7. 执行监控模块 (Execution)

### 7.1 获取执行列表
```
GET /executions
```

**查询参数:**
| 参数 | 类型 | 说明 |
|------|------|------|
| status | string | 状态筛选 (queued/running/paused/completed/failed) |
| workflowId | string | 工作流ID |

**响应示例:**
```json
{
  "code": 200,
  "data": [
    {
      "id": "exec_001",
      "workflowId": "wf_001",
      "workflowName": "WGS标准分析流程",
      "status": "running",
      "progress": 65,
      "currentStep": "3/5",
      "startTime": "2024-05-13 10:00:00",
      "elapsedTime": "45分钟"
    }
  ]
}
```

---

### 7.2 获取执行详情
```
GET /executions/:id
```

**响应示例:**
```json
{
  "code": 200,
  "data": {
    "id": "exec_001",
    "workflowId": "wf_001",
    "workflowName": "WGS标准分析流程",
    "status": "running",
    "progress": 65,
    "currentStep": "3/5",
    "startTime": "2024-05-13 10:00:00",
    "elapsedTime": "45分钟",
    "estimatedRemaining": "12分钟",
    "nodes": [
      {
        "id": "1",
        "name": "开始",
        "tool": "Input",
        "status": "completed",
        "progress": 100,
        "outputs": ["raw_data"]
      },
      {
        "id": "4",
        "name": "GATK HaplotypeCaller",
        "tool": "gatk",
        "status": "running",
        "progress": 65,
        "inputs": ["alignment"],
        "outputs": ["variants"]
      }
    ]
  }
}
```

---

### 7.3 获取执行日志
```
GET /executions/:id/logs
```

**查询参数:**
| 参数 | 类型 | 说明 |
|------|------|------|
| level | string | 日志级别 (info/warning/error) |
| nodeId | string | 节点ID |
| startTime | string | 开始时间 |
| endTime | string | 结束时间 |

**响应示例:**
```json
{
  "code": 200,
  "data": [
    {
      "time": "15:43:22",
      "level": "info",
      "nodeId": "3",
      "message": "任务差异表达分析 已启动"
    },
    {
      "time": "15:44:12",
      "level": "warning",
      "nodeId": "3",
      "message": "检测到低表达基因，已过滤 2341 个基因"
    }
  ]
}
```

---

### 7.4 获取资源使用情况
```
GET /executions/:id/resources
```

**响应示例:**
```json
{
  "code": 200,
  "data": {
    "cpuUsage": [12, 45, 78, 92, 85, 76, 68],
    "memoryUsage": [25, 45, 65, 72, 68, 65, 62],
    "timePoints": ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "现在"]
  }
}
```

---

### 7.5 暂停执行
```
POST /executions/:id/pause
```

**响应示例:**
```json
{
  "code": 200,
  "message": "执行已暂停"
}
```

---

### 7.6 恢复执行
```
POST /executions/:id/resume
```

---

### 7.7 停止执行
```
POST /executions/:id/stop
```

**响应示例:**
```json
{
  "code": 200,
  "message": "执行已停止"
}
```

---

## 8. 结果模块 (Result)

### 8.1 获取结果列表
```
GET /results
```

**查询参数:**
| 参数 | 类型 | 说明 |
|------|------|------|
| projectId | string | 项目ID |
| toolId | string | 工具ID |
| status | string | 状态筛选 |
| search | string | 搜索关键词 |

**响应示例:**
```json
{
  "code": 200,
  "data": [
    {
      "id": "result_001",
      "name": "差异表达分析_20240509",
      "tool": "DESeq2",
      "project": "肝癌RNA-seq",
      "status": "completed",
      "createdAt": "2024-05-09 15:30",
      "duration": "12分钟"
    }
  ]
}
```

---

### 8.2 获取结果详情
```
GET /results/:id
```

**响应示例:**
```json
{
  "code": 200,
  "data": {
    "id": "result_001",
    "name": "差异表达分析_20240509",
    "tool": "DESeq2",
    "project": "肝癌RNA-seq",
    "status": "completed",
    "createdAt": "2024-05-09 15:30",
    "duration": "12分钟",
    "files": [
      {
        "id": "file_001",
        "name": "variants.annotated.vcf",
        "type": "VCF",
        "size": "45 MB"
      }
    ]
  }
}
```

---

### 8.3 下载结果
```
GET /results/:id/download
```

**查询参数:**
| 参数 | 类型 | 说明 |
|------|------|------|
| fileId | string | 文件ID (可选，不传则下载全部) |
| format | string | 打包格式 (zip/tar.gz) |

---

### 8.4 删除结果
```
DELETE /results/:id
```

---

## 9. 报告模块 (Report)

### 9.1 获取报告列表
```
GET /reports
```

**响应示例:**
```json
{
  "code": 200,
  "data": [
    {
      "id": "report_001",
      "name": "WGS分析报告",
      "project": "全基因组测序分析",
      "createdAt": "2024-05-09"
    }
  ]
}
```

---

### 9.2 获取报告详情
```
GET /reports/:id
```

---

### 9.3 创建报告
```
POST /reports
```

**请求参数:**
```json
{
  "projectId": "string (required)",
  "type": "string (required, summary/detailed)",
  "template": "string (optional)"
}
```

---

### 9.4 下载报告
```
GET /reports/:id/download
```

**查询参数:**
| 参数 | 类型 | 说明 |
|------|------|------|
| format | string | 格式 (pdf/docx/html) |

---

## 10. 团队模块 (Team)

### 10.1 获取团队成员列表
```
GET /team
```

**响应示例:**
```json
{
  "code": 200,
  "data": [
    {
      "id": "usr_abc123",
      "name": "李博士",
      "email": "li@example.com",
      "role": "owner",
      "avatar": "李",
      "joinedAt": "2024-01-15"
    }
  ]
}
```

---

### 10.2 邀请成员
```
POST /team/invite
```

**请求参数:**
```json
{
  "email": "string (required)",
  "role": "string (required, admin/member)"
}
```

**响应示例:**
```json
{
  "code": 200,
  "message": "邀请已发送",
  "data": {
    "memberId": "usr_new001",
    "email": "newuser@example.com",
    "role": "member"
  }
}
```

---

### 10.3 移除成员
```
DELETE /team/:id
```

**响应示例:**
```json
{
  "code": 200,
  "message": "成员已移除"
}
```

---

### 10.4 修改成员角色
```
PUT /team/:id/role
```

**请求参数:**
```json
{
  "role": "string (required, admin/member)"
}
```

---

## 11. 可视化模块 (Visualization)

### 11.1 获取可视化数据
```
GET /visualize/data
```

**查询参数:**
| 参数 | 类型 | 说明 |
|------|------|------|
| projectId | string | 项目ID |
| type | string | 可视化类型 |

---

### 11.2 获取基因组可视化数据
```
GET /visualize/genome
```

**查询参数:**
| 参数 | 类型 | 说明 |
|------|------|------|
| region | string | 基因组区域 (如: chr1:1000000-2000000) |
| dataId | string | 数据文件ID |

**响应示例:**
```json
{
  "code": 200,
  "data": {
    "chromosome": "chr1",
    "start": 1000000,
    "end": 2000000,
    "tracks": [...]
  }
}
```

---

### 11.3 获取图表数据
```
GET /visualize/charts
```

**查询参数:**
| 参数 | 类型 | 说明 |
|------|------|------|
| chartType | string | 图表类型 |
| projectId | string | 项目ID |
| dataRange | string | 数据范围 |

**响应示例:**
```json
{
  "code": 200,
  "data": {
    "categories": ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    "series": [
      { "name": "本周", "data": [12, 15, 8, 18, 22, 16, 20] },
      { "name": "上周", "data": [8, 12, 10, 14, 16, 12, 14] }
    ]
  }
}
```

---

## 12. 统计模块 (Statistics)

### 12.1 获取仪表盘统计数据
```
GET /statistics/dashboard
```

**响应示例:**
```json
{
  "code": 200,
  "data": {
    "totalProjects": 12,
    "totalStorage": "256 GB",
    "storageUsed": "128 GB",
    "completedTasks": 48,
    "runningTasks": 2,
    "recentProjects": [
      {
        "name": "全基因组测序分析",
        "meta": "WGS-2024-001 · 2小时前",
        "status": "completed"
      }
    ],
    "runningTasksList": [
      {
        "name": "差异表达分析",
        "step": "步骤 3/5: DESeq2分析",
        "progress": 65,
        "remainingTime": "12分钟"
      }
    ]
  }
}
```

---

### 12.2 获取使用统计
```
GET /statistics/usage
```

**查询参数:**
| 参数 | 类型 | 说明 |
|------|------|------|
| startDate | string | 开始日期 |
| endDate | string | 结束日期 |

**响应示例:**
```json
{
  "code": 200,
  "data": {
    "toolUsage": [
      { "tool": "FastQC", "count": 1250 },
      { "tool": "BWA-MEM", "count": 980 },
      { "tool": "GATK HaplotypeCaller", "count": 856 }
    ],
    "totalUsage": 5347,
    "trend": [...]
  }
}
```

---

### 12.3 获取任务趋势数据
```
GET /statistics/trend
```

**查询参数:**
| 参数 | 类型 | 说明 |
|------|------|------|
| period | string | 时间周期 (day/week/month) |

**响应示例:**
```json
{
  "code": 200,
  "data": {
    "labels": ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    "thisWeek": [12, 15, 8, 18, 22, 16, 20],
    "lastWeek": [8, 12, 10, 14, 16, 12, 14]
  }
}
```

---

## 附录：错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 (token无效或过期) |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 附录：状态值说明

### 项目状态 (project.status)
| 状态值 | 说明 |
|--------|------|
| draft | 草稿 |
| processing | 分析中 |
| completed | 已完成 |

### 文件格式 (data.format)
| 格式值 | 说明 |
|--------|------|
| fasta | FASTA 序列文件 |
| fastq | FASTQ 测序文件 |
| bam | BAM 比对文件 |
| vcf | VCF 变异文件 |
| other | 其他格式 |

### 执行状态 (execution.status)
| 状态值 | 说明 |
|--------|------|
| queued | 排队中 |
| running | 运行中 |
| paused | 已暂停 |
| completed | 已完成 |
| failed | 失败 |

### 工作流节点状态 (node.status)
| 状态值 | 说明 |
|--------|------|
| ready | 就绪 |
| configured | 已配置 |
| running | 运行中 |
| completed | 已完成 |
| error | 错误 |

### 用户角色 (team.role)
| 角色值 | 说明 |
|--------|------|
| owner | 所有者 |
| admin | 管理员 |
| member | 成员 |

---

*文档生成时间: 2024-05-13*