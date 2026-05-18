# BioCore FastQC API 文档

> 版本：1.0.0
> 更新日期：2026-05-16
> 基础 URL：`http://localhost:8000`

---

## 目录

1. [认证说明](#1-认证说明)
2. [工具列表](#2-工具列表)
3. [工具详情](#3-工具详情)
4. [提交分析任务](#4-提交分析任务)
5. [查询任务状态](#5-查询任务状态)
6. [错误码说明](#6-错误码说明)
7. [示例代码](#7-示例代码)

---

## 1. 认证说明

所有 `/tools` 相关接口需要认证。

### 1.1 登录获取 Token

**请求：**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "your@email.com",
  "password": "your_password"
}
```

**响应：**
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "id": "usr_xxx",
    "email": "your@email.com",
    "name": "用户名",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 1.2 请求 Header

除登录/注册接口外，所有请求需要携带：
```
Authorization: Bearer {token}
```

---

## 2. 工具列表

获取所有可用工具及其分类。

**请求：**
```http
GET /tools
Authorization: Bearer {token}
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "categories": [
      {
        "name": "Quality Control",
        "count": 1,
        "color": "#00b894"
      }
    ],
    "list": [
      {
        "id": "tool_fastqc",
        "name": "fastqc",
        "category": "Quality Control",
        "desc": "Quality control tool for FASTQ files",
        "input": "fastq",
        "output": "html+zip",
        "version": "0.11.9",
        "color": "#00b894",
        "usage": 5
      }
    ]
  }
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 工具唯一标识 |
| name | string | 工具名称 |
| category | string | 所属分类 |
| desc | string | 工具描述 |
| input | string | 输入文件格式 |
| output | string | 输出文件格式 |
| version | string | 工具版本 |
| color | string | 前端显示颜色 |
| usage | int | 使用次数 |

---

## 3. 工具详情

获取特定工具的详细信息。

**请求：**
```http
GET /tools/{tool_id}
Authorization: Bearer {token}
```

**路径参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| tool_id | string | 是 | 工具 ID，如 `tool_fastqc` |

**响应：**
```json
{
  "code": 200,
  "data": {
    "id": "tool_fastqc",
    "name": "fastqc",
    "category": "Quality Control",
    "desc": "Quality control tool for FASTQ files",
    "input": "fastq",
    "output": "html+zip",
    "version": "0.11.9",
    "parameters": {
      "contaminants": "Path to contaminants file",
      "adapters": "Path to adapters file",
      "limits": "Quality and length limits"
    },
    "genomes": ["hg38", "mm10", "hg19"]
  }
}
```

---

## 4. 提交分析任务

提交 FastQC 分析任务到队列。

**请求：**
```http
POST /tools/{tool_id}/run
Authorization: Bearer {token}
Content-Type: application/json

{
  "projectId": "proj_29b6223842f4",
  "inputFiles": ["test-data/sample.fastq"],
  "parameters": {
    "contaminants": "",
    "adapters": "",
    "limits": ""
  },
  "extraParams": "--quiet"
}
```

**路径参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| tool_id | string | 是 | 工具 ID，如 `tool_fastqc` |

**请求体：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| projectId | string | 是 | 项目 ID |
| inputFiles | string[] | 是 | MinIO 中的文件路径列表 |
| parameters | object | 否 | 工具参数字典 |
| extraParams | string | 否 | 额外命令行参数 |

**响应：**
```json
{
  "code": 200,
  "message": "分析任务已提交",
  "data": {
    "taskId": "a848c3e6-8265-4606-9451-8c20e71f36c5",
    "toolId": "tool_fastqc",
    "status": "queued",
    "estimatedTime": "5-10分钟"
  }
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| taskId | string | Celery 任务 ID，用于查询状态 |
| toolId | string | 工具 ID |
| status | string | 任务状态：`queued` |
| estimatedTime | string | 预估耗时 |

---

## 5. 查询任务状态

查询已提交任务的执行状态和结果。

**请求：**
```http
GET /tools/{tool_id}/tasks/{task_id}/status
Authorization: Bearer {token}
```

**路径参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| tool_id | string | 是 | 工具 ID |
| task_id | string | 是 | 任务 ID（提交任务时返回的 taskId） |

**响应（进行中）：**
```json
{
  "code": 200,
  "data": {
    "status": "running",
    "taskId": "a848c3e6-8265-4606-9451-8c20e71f36c5"
  }
}
```

**响应（已完成）：**
```json
{
  "code": 200,
  "data": {
    "status": "completed",
    "taskId": "a848c3e6-8265-4606-9451-8c20e71f36c5",
    "resultId": "result_3d62047c6c1d",
    "output_files": [
      "results/proj_29b6223842f4/fastqc/file_0_fastqc.html",
      "results/proj_29b6223842f4/fastqc/file_0_fastqc.zip"
    ],
    "logs": "Started analysis of file_0.fastq\nAnalysis complete for file_0.fastq"
  }
}
```

**响应（失败）：**
```json
{
  "code": 200,
  "data": {
    "status": "failed",
    "error": "Execution failed: ..."
  }
}
```

**任务状态值：**

| status | 含义 | 说明 |
|--------|------|------|
| `queued` | 已入队 | 等待执行 |
| `running` | 执行中 | 正在分析 |
| `completed` | 已完成 | 分析成功 |
| `failed` | 失败 | 执行出错 |
| `not_found` | 不存在 | 任务 ID 无效 |

**输出文件访问：**

输出文件存储在 MinIO 中，可通过以下方式访问：
- 使用 MinIO SDK 获取预签名 URL
- 或通过 BioCore 后端文件接口访问

---

## 6. 错误码说明

| HTTP 状态码 | code | 说明 |
|-------------|------|------|
| 401 | - | 未认证或 Token 过期 |
| 404 | - | 资源不存在 |
| 500 | - | 服务器内部错误 |

**常见错误响应：**
```json
{
  "detail": "Not authenticated"
}
```

```json
{
  "detail": "Not Found"
}
```

---

## 7. 示例代码

### 7.1 JavaScript (Fetch API)

```javascript
// 1. 登录获取 Token
async function login(email, password) {
  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  return data.data.token;
}

// 2. 获取工具列表
async function getTools(token) {
  const response = await fetch('/tools', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  return data.data.list;
}

// 3. 提交分析任务
async function submitTask(token, toolId, projectId, inputFiles) {
  const response = await fetch(`/tools/${toolId}/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      projectId,
      inputFiles,
      parameters: {}
    })
  });
  const data = await response.json();
  return data.data;
}

// 4. 轮询任务状态
async function pollTaskStatus(token, toolId, taskId, onProgress) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      const response = await fetch(`/tools/${toolId}/tasks/${taskId}/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      const status = data.data.status;

      onProgress(status);

      if (status === 'completed' || status === 'failed') {
        clearInterval(interval);
        resolve(data.data);
      }
    }, 3000); // 每 3 秒查询一次
  });
}

// 使用示例
const token = await login('user@example.com', 'password123');
const tools = await getTools(token);
const result = await submitTask(token, 'tool_fastqc', 'proj_xxx', ['data/sample.fastq']);
console.log('Task ID:', result.taskId);

const finalResult = await pollTaskStatus(token, 'tool_fastqc', result.taskId, (status) => {
  console.log('Current status:', status);
});
```

### 7.2 Python (Requests)

```python
import requests

BASE_URL = "http://localhost:8000"

# 1. 登录
def login(email, password):
    response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": email,
        "password": password
    })
    return response.json()["data"]["token"]

# 2. 获取工具列表
def get_tools(token):
    response = requests.get(f"{BASE_URL}/tools", headers={
        "Authorization": f"Bearer {token}"
    })
    return response.json()["data"]["list"]

# 3. 提交任务
def submit_task(token, tool_id, project_id, input_files):
    response = requests.post(f"{BASE_URL}/tools/{tool_id}/run", headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }, json={
        "projectId": project_id,
        "inputFiles": input_files,
        "parameters": {}
    })
    return response.json()["data"]

# 4. 查询状态
def get_task_status(token, tool_id, task_id):
    response = requests.get(f"{BASE_URL}/tools/{tool_id}/tasks/{task_id}/status", headers={
        "Authorization": f"Bearer {token}"
    })
    return response.json()["data"]

# 使用示例
token = login("user@example.com", "password123")
result = submit_task(token, "tool_fastqc", "proj_xxx", ["data/sample.fastq"])
print(f"Task submitted: {result['taskId']}")

status = get_task_status(token, "tool_fastqc", result["taskId"])
print(f"Status: {status['status']}")
```

### 7.3 轮询状态完整示例

```javascript
async function runFastQCAnalysis(token, toolId, projectId, inputFiles) {
  // 1. 提交任务
  const submitResult = await submitTask(token, toolId, projectId, inputFiles);
  console.log(`任务已提交，Task ID: ${submitResult.taskId}`);

  // 2. 轮询状态
  let finalResult = null;
  const result = await pollTaskStatus(token, toolId, submitResult.taskId, (status) => {
    const statusMap = {
      'queued': '等待执行',
      'running': '分析中...',
      'completed': '已完成',
      'failed': '失败'
    };
    console.log(`当前状态: ${statusMap[status] || status}`);
  });

  console.log('分析结果:', result);
  return result;
}

// 执行
runFastQCAnalysis(token, 'tool_fastqc', 'proj_xxx', ['data/sample.fastq']);
```

---

## 附录：MinIO 文件上传

如果前端需要上传文件到 MinIO，可参考以下流程：

```javascript
// 1. 获取上传预签名 URL
async function getUploadUrl(token, bucket, objectName) {
  const response = await fetch(`/data/upload-url?bucket=${bucket}&object=${objectName}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
}

// 2. 上传文件到 MinIO
async function uploadToMinIO(file, presignedUrl) {
  const response = await fetch(presignedUrl, {
    method: 'PUT',
    body: file
  });
  return response.ok;
}

// 3. 使用示例
const file = document.getElementById('fastqFile').files[0];
const uploadInfo = await getUploadUrl(token, 'biocore', 'data/sample.fastq');
await uploadToMinIO(file, uploadInfo.url);
// 文件已上传到 MinIO，可以提交任务了
```

---

*文档结束*