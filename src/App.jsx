import { useState } from 'react';
import Sidebar from './components/Sidebar';
import RobotStatusPage from './pages/RobotStatusPage';
import RobotConfigPage from './pages/RobotConfigPage';
import TaskQueuePage from './pages/TaskQueuePage';
import TaskPlanPage from './pages/TaskPlanPage';
import TaskStatisticsPage from './pages/TaskStatisticsPage';
import OperationLogPage from './pages/OperationLogPage';
import DeviceMonitorPage from './pages/DeviceMonitorPage';

const pages = {
  robotStatus: { title: '机器人状态管理', component: RobotStatusPage },
  robotConfig: { title: '机器人配置管理', component: RobotConfigPage },
  taskQueue: { title: '任务队列管理', component: TaskQueuePage },
  taskPlan: { title: '任务规划', component: TaskPlanPage },
  taskStatistics: { title: '任务统计', component: TaskStatisticsPage },
  operationLog: { title: '操作日志', component: OperationLogPage },
  deviceMonitor: { title: '设备监控', component: DeviceMonitorPage },
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('robotStatus');
  const PageComponent = pages[currentPage].component;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} pages={pages} />
      <main className="flex-1 overflow-auto p-6">
        <h1 className="text-2xl font-bold mb-4">{pages[currentPage].title}</h1>
        <PageComponent />
      </main>
    </div>
  );
}
