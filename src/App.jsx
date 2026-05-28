import { HashRouter, Routes, Route } from 'react-router-dom'
import { AppStoreProvider } from './store/AppStore'
import Layout from './components/Layout'
import DashboardPage from './pages/DashboardPage'
import TaskSchedulePage from './pages/TaskSchedulePage'
import RobotResourcePage from './pages/RobotResourcePage'
import SimulationPage from './pages/SimulationPage'
import StatisticsPage from './pages/StatisticsPage'

export default function App() {
  return (
    <AppStoreProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/tasks" element={<TaskSchedulePage />} />
            <Route path="/robots" element={<RobotResourcePage />} />
            <Route path="/simulation" element={<SimulationPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppStoreProvider>
  )
}
