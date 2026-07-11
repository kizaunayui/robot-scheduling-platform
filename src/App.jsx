import { lazy, Suspense } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { AppStoreProvider } from './store/AppStore'
import Layout from './components/Layout'

const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const TaskSchedulePage = lazy(() => import('./pages/TaskSchedulePage'))
const RobotResourcePage = lazy(() => import('./pages/RobotResourcePage'))
const SimulationPage = lazy(() => import('./pages/SimulationPage'))
const StatisticsPage = lazy(() => import('./pages/StatisticsPage'))

function PageFallback() {
  return <div role="status" className="grid min-h-[40vh] place-items-center text-sm text-slate-500">正在加载功能模块…</div>
}

export default function App() {
  return (
    <AppStoreProvider>
      <HashRouter>
        <Layout>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/tasks" element={<TaskSchedulePage />} />
              <Route path="/robots" element={<RobotResourcePage />} />
              <Route path="/simulation" element={<SimulationPage />} />
              <Route path="/statistics" element={<StatisticsPage />} />
            </Routes>
          </Suspense>
        </Layout>
      </HashRouter>
    </AppStoreProvider>
  )
}
