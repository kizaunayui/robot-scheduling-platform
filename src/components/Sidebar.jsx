import { NavLink } from 'react-router-dom'

const navItems = [
  { path: '/', icon: '📊', label: '系统首页' },
  { path: '/campus-map', icon: '🗺️', label: '院区地图' },
  { path: '/robot-status', icon: '🤖', label: '机器人状态' },
  { path: '/robot-config', icon: '⚙️', label: '机器人配置' },
  { path: '/task-queue', icon: '📋', label: '任务队列' },
  { path: '/task-plan', icon: '📐', label: '任务规划' },
  { path: '/task-statistics', icon: '📈', label: '任务统计' },
  { path: '/operation-log', icon: '📝', label: '操作日志' },
  { path: '/device-monitor', icon: '📡', label: '设备监控' },
  { path: '/user-management', icon: '👥', label: '用户管理' },
]

export default function Sidebar() {
  return (
    <aside className="w-[220px] min-h-screen bg-slate-900 border-r border-slate-700 flex flex-col">
      <div className="px-4 py-5 border-b border-slate-700">
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <span>协同调度平台</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">机器人协同调度优化仿真</p>
      </div>
      <nav className="flex-1 py-2 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-3 border-t border-slate-700">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>系统运行中</span>
        </div>
      </div>
    </aside>
  )
}
