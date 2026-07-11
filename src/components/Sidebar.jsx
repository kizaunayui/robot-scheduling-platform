import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ListChecks, Bot, Map, BarChart3 } from 'lucide-react'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: '调度总览' },
  { path: '/tasks', icon: ListChecks, label: '任务调度中心' },
  { path: '/robots', icon: Bot, label: '机器人资源管理' },
  { path: '/simulation', icon: Map, label: '院区调度仿真' },
  { path: '/statistics', icon: BarChart3, label: '调度统计与日志' },
]

export default function Sidebar({ className = '', onNavigate }) {
  return (
    <aside className={`w-[260px] lg:w-[220px] min-h-screen bg-slate-900 border-r border-slate-700/60 flex flex-col ${className}`}>
      <div className="px-4 py-5 border-b border-slate-700/60">
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <Bot size={22} className="text-blue-400" />
          <span>协同调度平台</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">多机器人协同调度仿真</p>
      </div>
      <nav className="flex-1 py-2 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border-r-2 border-blue-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
      <div className="px-4 py-3 border-t border-slate-700/60">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>系统运行中</span>
        </div>
      </div>
    </aside>
  )
}
