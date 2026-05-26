import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppStoreProvider } from './store/AppStore'
import Layout from './components/Layout'
import DashboardPage from './pages/DashboardPage'
import CampusMapPage from './pages/CampusMapPage'
import RobotStatusPage from './pages/RobotStatusPage'
import RobotConfigPage from './pages/RobotConfigPage'
import TaskQueuePage from './pages/TaskQueuePage'
import TaskPlanPage from './pages/TaskPlanPage'
import TaskStatisticsPage from './pages/TaskStatisticsPage'
import OperationLogPage from './pages/OperationLogPage'
import DeviceMonitorPage from './pages/DeviceMonitorPage'
import UserManagementPage from './pages/UserManagementPage'

export default function App() {
  return (
    <AppStoreProvider>
      <BrowserRouter basename="/robot-scheduling-platform">
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/campus-map" element={<CampusMapPage />} />
            <Route path="/robot-status" element={<RobotStatusPage />} />
            <Route path="/robot-config" element={<RobotConfigPage />} />
            <Route path="/task-queue" element={<TaskQueuePage />} />
            <Route path="/task-plan" element={<TaskPlanPage />} />
            <Route path="/task-statistics" element={<TaskStatisticsPage />} />
            <Route path="/operation-log" element={<OperationLogPage />} />
            <Route path="/device-monitor" element={<DeviceMonitorPage />} />
            <Route path="/user-management" element={<UserManagementPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppStoreProvider>
  )
}
