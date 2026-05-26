import { useAppStore } from '../store/AppStore'

export default function RobotStatusPage() {
  const { robots, robotAction } = useAppStore()

  const statusCounts = {
    idle: robots.filter(r => r.status === 'idle').length,
    busy: robots.filter(r => r.status === 'busy').length,
    charging: robots.filter(r => r.status === 'charging').length,
    paused: robots.filter(r => r.status === 'paused').length,
  }

  const statusInfo = {
    idle: { label: '空闲', color: 'bg-green-900 text-green-300', dot: 'bg-green-500' },
    busy: { label: '执行中', color: 'bg-blue-900 text-blue-300', dot: 'bg-blue-500' },
    charging: { label: '充电中', color: 'bg-yellow-900 text-yellow-300', dot: 'bg-yellow-500' },
    paused: { label: '已暂停', color: 'bg-red-900 text-red-300', dot: 'bg-red-500' },
  }

  const containerNames = { normal: '标准舱', cold: '冷链舱', sealed: '密闭舱', large: '大型舱' }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">🤖 机器人状态管理</h1>

      {/* 状态统计 */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '空闲', count: statusCounts.idle, color: 'bg-green-600' },
          { label: '执行中', count: statusCounts.busy, color: 'bg-blue-600' },
          { label: '充电中', count: statusCounts.charging, color: 'bg-yellow-600' },
          { label: '暂停', count: statusCounts.paused, color: 'bg-red-600' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-lg p-4 text-white`}>
            <p className="text-sm opacity-80">{s.label}</p>
            <p className="text-3xl font-bold">{s.count}</p>
          </div>
        ))}
      </div>

      {/* 机器人卡片 */}
      <div className="grid grid-cols-2 gap-4">
        {robots.map(robot => {
          const si = statusInfo[robot.status] || statusInfo.idle
          return (
            <div key={robot.id} className="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${si.dot}`} />
                  <h3 className="text-white font-bold">{robot.name}</h3>
                  <span className="text-slate-500 text-xs">({robot.id})</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs ${si.color}`}>{si.label}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs text-slate-400 mb-3">
                <div>类型: <span className="text-slate-200">{robot.type}</span></div>
                <div>速度: <span className="text-slate-200">{robot.speed}m/s</span></div>
                <div>区域: <span className="text-slate-200">{robot.area}</span></div>
                <div>位置: <span className="text-slate-200">[{robot.pos.join(',')}]</span></div>
                <div>载重: <span className="text-slate-200">{robot.capacity}kg</span></div>
                <div>舱位: <span className="text-slate-200">{containerNames[robot.container] || robot.container}</span></div>
              </div>

              {/* Skills */}
              <div className="flex gap-1 mb-3 flex-wrap">
                {robot.skills.map(s => (
                  <span key={s} className="px-2 py-0.5 bg-indigo-900/50 text-indigo-300 rounded text-xs">{s}</span>
                ))}
              </div>

              {/* 电量条 */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">电量</span>
                  <span className={robot.battery > 60 ? 'text-green-400' : robot.battery > 30 ? 'text-yellow-400' : 'text-red-400'}>{robot.battery}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${robot.battery > 60 ? 'bg-green-500' : robot.battery > 30 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${robot.battery}%` }}
                  />
                </div>
              </div>

              {robot.battery < 30 && (
                <div className="bg-red-900/30 border border-red-700 rounded p-2 text-xs text-red-300 mb-3">
                  ⚠️ 电量不足，请及时充电
                </div>
              )}

              {robot.taskId && (
                <div className="text-xs text-slate-400 mb-3">
                  当前任务: <span className="text-blue-400">{robot.taskId}</span>
                </div>
              )}

              {/* 匹配原因 */}
              {robot.matchReasons && robot.matchReasons.length > 0 && (
                <div className="flex gap-1 mb-3 flex-wrap">
                  {robot.matchReasons.map((r, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-green-900/30 text-green-400 rounded text-xs">{r}</span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                {robot.status !== 'idle' && robot.status !== 'busy' && (
                  <button onClick={() => robotAction(robot.id, 'start')} className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-500">启动</button>
                )}
                {(robot.status === 'idle' || robot.status === 'busy') && (
                  <button onClick={() => robotAction(robot.id, 'pause')} className="bg-yellow-600 text-white px-3 py-1 rounded text-xs hover:bg-yellow-500">暂停</button>
                )}
                {robot.status !== 'charging' && (
                  <button onClick={() => robotAction(robot.id, 'charge')} className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-500">充电</button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
