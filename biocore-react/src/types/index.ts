// ============ 通用类型 ============
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface ResultFile {
  id: string
  name: string
  type: string
  size: string
  createdAt: string
}

// ============ 认证模块 ============
export interface LoginParams {
  email: string
  password: string
}

export interface RegisterParams {
  email: string
  password: string
  name: string
  institution?: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  institution?: string
  avatar?: string
  bio?: string
  role: 'owner' | 'admin' | 'member'
}

export interface AuthResponse {
  id: string
  email: string
  name: string
  institution?: string
  avatar?: string
  token: string
  refreshToken: string
}

export interface RefreshTokenResponse {
  token: string
  refreshToken: string
}

// ============ 用户模块 ============
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  institution?: string
  bio?: string
  role: 'owner' | 'admin' | 'member'
  joinedAt: string
}

export interface UserSettings {
  language: string
  timezone: string
  defaultGenome: string
  notifications: {
    email: boolean
    taskFailure: boolean
    teamMessages: boolean
  }
  twoFactorEnabled: boolean
}

export interface UpdateUserParams {
  name?: string
  institution?: string
  bio?: string
  avatar?: string
}

export interface UpdatePasswordParams {
  currentPassword: string
  newPassword: string
}

// ============ 项目模块 ============
export type ProjectType = 'wgs' | 'wes' | 'rna' | 'chip' | 'meta'
export type ProjectStatus = 'draft' | 'processing' | 'completed'

export interface Project {
  id: string
  name: string
  code: string
  description?: string
  type: ProjectType
  status: ProjectStatus
  genome?: string
  owner?: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

export interface CreateProjectParams {
  name: string
  type: ProjectType
  description?: string
  genome?: string
}

export interface UpdateProjectParams {
  name?: string
  description?: string
  status?: ProjectStatus
}

// ============ 数据模块 ============
export type DataFileFormat = 'fasta' | 'fastq' | 'bam' | 'vcf' | 'bed' | 'gtf' | 'gff'
export type DataFileType = 'raw' | 'reference' | 'result' | 'annotation'
export type DataFileStatus = 'uploading' | 'ready' | 'error'

export interface DataFile {
  id: string
  name: string
  type: DataFileType
  size: string
  format: DataFileFormat
  md5?: string
  path?: string
  minio_path?: string  // 上传后返回的完整 MinIO 路径，如 "input/projects/xxx/data/sample.fastq"
  uploadTime: string
  status: DataFileStatus
  description?: string
}

export interface UploadFileParams {
  file: File
  projectId: string
  type?: DataFileType
  description?: string
}

// ============ 工具模块 ============
export interface Tool {
  id: string
  name: string
  category: string
  desc: string
  input: string
  output: string
  version: string
  color: string
  usage: number
}

export interface ToolDetail extends Tool {
  parameters: Record<string, string>
  genomes: string[]
  input_path_prefix?: string  // MinIO 输入路径前缀，如 "input/projects/"
}

export interface RunToolParams {
  projectId: string
  inputFiles: string[]
  parameters?: Record<string, any>
  extraParams?: string
}

export interface ToolRunResponse {
  taskId: string
  toolId: string
  status: string
  estimatedTime: string
}

// ============ 工作流模块 ============
export type WorkflowStatus = 'draft' | 'published' | 'archived'

export interface Workflow {
  id: string
  name: string
  description?: string
  steps: number
  status: WorkflowStatus
  createdAt: string
}

export interface WorkflowNode {
  id: string
  tool: string
  name: string
  parameters?: Record<string, any>
}

export interface WorkflowEdge {
  source: string
  target: string
}

export interface CreateWorkflowParams {
  name: string
  description?: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  settings?: Record<string, any>
}

export interface RunWorkflowParams {
  inputFiles: Record<string, string>
  settings?: Record<string, any>
}

export interface WorkflowRunResponse {
  executionId: string
  workflowId: string
  name: string
  status: string
}

// ============ 执行监控模块 ============
export type ExecutionStatus = 'queued' | 'running' | 'paused' | 'completed' | 'failed'

export interface Execution {
  id: string
  workflowId: string
  workflowName: string
  status: ExecutionStatus
  progress: number
  currentStep: string
  startTime: string
  elapsedTime: string
  estimatedRemaining?: string
}

export interface ExecutionNode {
  id: string
  name: string
  status: ExecutionStatus
  startTime?: string
  endTime?: string
  error?: string
}

// ============ 结果模块 ============
export type ResultStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface Result {
  id: string
  name: string
  tool: string
  project: string
  status: ResultStatus
  createdAt: string
  duration?: string
}

export interface ResultDetail extends Result {
  taskId?: string
  output_files?: string[]
  logs?: string
  error?: string
  parameters?: Record<string, any>
  inputFiles?: string[]
}

// ============ 报告模块 ============
export type ReportType = 'summary' | 'detailed'
export type ReportFormat = 'pdf' | 'docx' | 'html'

export interface Report {
  id: string
  name: string
  project: string
  type: ReportType
  createdAt: string
}

// ============ 团队模块 ============
export interface TeamMember {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'member'
  avatar?: string
  joinedAt: string
}

export interface InviteMemberParams {
  email: string
  role: 'admin' | 'member'
}

// ============ 可视化模块 ============
export interface ChartData {
  categories: string[]
  series: {
    name: string
    data: number[]
  }[]
}

export interface VisualizationData {
  id: string
  name: string
  type: string
  data: any
}

// ============ 统计模块 ============
export interface DashboardStats {
  totalProjects: number
  totalStorage: string
  storageUsed: string
  completedTasks: number
  runningTasks: number
  recentProjects: Project[]
  runningTasksList: Execution[]
}

export interface TrendData {
  categories?: string[]
  series?: {
    name: string
    data: number[]
  }[]
  period?: string
  data?: number[]
}