import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import DataManagement from './pages/DataManagement'
import Tools from './pages/Tools'
import ToolDetail from './pages/ToolDetail'
import WorkflowDesigner from './pages/WorkflowDesigner'
import WorkflowExecute from './pages/WorkflowExecute'
import Visualize from './pages/Visualize'
import VisualizeGenome from './pages/VisualizeGenome'
import VisualizeCharts from './pages/VisualizeCharts'
import Results from './pages/Results'
import Reports from './pages/Reports'
import Team from './pages/Team'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="data" element={<DataManagement />} />
        <Route path="tools" element={<Tools />} />
        <Route path="tools/:toolId" element={<ToolDetail />} />
        <Route path="workflow-designer" element={<WorkflowDesigner />} />
        <Route path="workflow-execute" element={<WorkflowExecute />} />
        <Route path="visualize" element={<Visualize />} />
        <Route path="visualize/genome" element={<VisualizeGenome />} />
        <Route path="visualize/charts" element={<VisualizeCharts />} />
        <Route path="results" element={<Results />} />
        <Route path="reports" element={<Reports />} />
        <Route path="team" element={<Team />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App