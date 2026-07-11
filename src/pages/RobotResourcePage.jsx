import { useAppStore } from '../store/AppStore'
import { taskTypeNames } from '../data/mapData'
import { Play, Pause, BatteryCharging, AlertTriangle, RotateCcw } from 'lucide-react'

const containerNames = { normal: '标准舱', cold: '冷链舱', sealed: '密闭舱', large: '大型舱' }

const statusInfo = {
  idle: { label: '空闲', color: 'bg-emerald-900/60 text-emerald-300 border-emerald-700/40', dot: 'bg-emerald-500' },
  busy: { label: '执行中', color: 'bg-blue-900/60 text-blue-300 border-blue-700/40', dot: 'bg-blue-500' },
  charging: { label: '充电中', color: 'bg-amber-900/60 text-amber-300 border-amber-700/40', dot: 'bg-amber-500' },
  paused: { label: '已暂停', color: 'bg-orange-900/60 text-orange-300 border-orange-700/40', dot: 'bg-orange-500' },
  error: { label: '故障', color: 'bg-red-900/60 text-red-300 border-red-700/40', dot: 'bg-red-500' },
}

export default function RobotResourcePage() {
  const { robots, tasks, robotAction } = useAppStore()

  const statusCounts = {
    idle: robots.filter(r => r.status === 'idle').length,
    busy: robots.filter(r => r.status === 'busy').length,
    charging: robots.filter(r => r.status === 'charging').length,
    paused: robots.filter(r => r.status === 'paused').length,
    error: robots.filter(r => r.status === 'error').length,
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-white">机器人资源管理</h1>

      {/* 状态统计 */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: '空闲', count: statusCounts.idle, color: 'bg-emerald-600' },
          { label: '执行中', count: statusCounts.busy, color: 'bg-blue-600' },
          { label: '充电中', count: statusCounts.charging, color: 'bg-amber-600' },
          { label: '暂停', count: statusCounts.paused, color: 'bg-orange-600' },
          { label: '故障', count: statusCounts.error, color: 'bg-red-600' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-lg p-3 text-white`}>
            <p className="text-xs opacity-80">{s.label}</p>
            <p className="text-2xl font-bold">{s.count}</p>
          </div>
        ))}
      </div>

      {/* 机器人卡片网格 */}
      <div className="grid grid-cols-2 gap-4">
        {robots.map(robot => {
          const si = statusInfo[robot.status] || statusInfo.idle
          const currentTask = robot.taskId ? tasks.find(t => t.id === robot.taskId) : null

          return (
            <div key={robot.id} className="bg-slate-900 rounded-lg border border-slate-700/60 overflow-hidden">
              {/* 卡片头部 */}
              <div className="px-4 py-3 border-b border-slate-700/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${si.dot}`} />
                  <h3 className="text-white font-bold text-sm">{robot.name}</h3>
                  <span className="text-slate-600 text-xs font-mono">{robot.id}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs border ${si.color}`}>{si.label}</span>
              </div>

              {/* 卡片内容 */}
              <div className="px-4 py-3 space-y-3">
                {/* 基本信息 */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><span className="text-slate-500">类型</span><div className="text-slate-200">{robot.type}</div></div>
                  <div><span className="text-slate-500">速度</span><div className="text-slate-200">{robot.speed} m/s</div></div>
                  <div><span className="text-slate-500">载重</span><div className="text-slate-200">{robot.capacity} kg</div></div>
                  <div><span className="text-slate-500">舱位</span><div className="text-slate-200">{containerNames[robot.container] || robot.container}</div></div>
                  <div><span className="text-slate-500">区域</span><div className="text-slate-200">{robot.area}</div></div>
                  <div><span className="text-slate-500">位置</span><div className="text-slate-200 font-mono">[{robot.pos.map(n=>Math.round(n)).join(',')}]</div></div>
                </div>

                {/* 能力标签 */}
                <div className="flex gap-1.5 flex-wrap">
                  {robot.skills.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-indigo-900/40 text-indigo-300 rounded text-xs border border-indigo-700/30">{taskTypeNames[s] || s}</span>
                  ))}
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-xs border border-slate-700/40">{containerNames[robot.container] || robot.container}</span>
                </div>

                {/* 电量条 */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">电量</span>
                    <span className={robot.battery > 60 ? 'text-emerald-400' : robot.battery > 30 ? 'text-amber-400' : 'text-red-400'}>{Math.round(robot.battery)}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${robot.battery > 60 ? 'bg-emerald-500' : robot.battery > 30 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${robot.battery}%` }}
                    />
                  </div>
                </div>

                {/* 低电量警告 */}
                {robot.battery < 30 && (
                  <div className="bg-red-900/20 border border-red-700/30 rounded p-2 text-xs text-red-300 flex items-center gap-1.5">
                    <AlertTriangle size={12} />电量不足，请及时充电
                  </div>
                )}

                {/* 当前任务 */}
                {currentTask && (
                  <div className="bg-slate-800/60 rounded p-2 text-xs">
                    <span className="text-slate-500">当前任务:</span>
                    <span className="text-blue-400 ml-1">{currentTask.id} - {currentTask.name}</span>
                    <span className="text-slate-500 ml-2">{currentTask.start} → {currentTask.end}</span>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 bg-slate-700 rounded-full h-1">
                        <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${currentTask.progress}%` }} />
                      </div>
                      <span className="text-slate-500">{currentTask.progress}%</span>
                    </div>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex gap-2 pt-1">
                  {(robot.status === 'paused' || robot.status === 'charging') && (
                    <button onClick={() => robotAction(robot.id, 'start')} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-500 transition">
                      <Play size={12} />{robot.status === 'charging' ? '完成充电' : robot.taskId ? '继续任务' : '启动'}
                    </button>
                  )}
                  {(robot.status === 'idle' || robot.status === 'busy') && (
                    <button onClick={() => robotAction(robot.id, 'pause')} className="flex items-center gap-1 bg-amber-600 text-white px-3 py-1.5 rounded text-xs hover:bg-amber-500 transition">
                      <Pause size={12} />暂停
                    </button>
                  )}
                  {robot.status !== 'charging' && robot.status !== 'error' && (
                    <button onClick={() => robotAction(robot.id, 'charge')} className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-1.5 rounded text-xs hover:bg-emerald-500 transition">
                      <BatteryCharging size={12} />回充
                    </button>
                  )}
                  {robot.status !== 'error' && (
                    <button onClick={() => robotAction(robot.id, 'fault')} className="flex items-center gap-1 bg-red-600/80 text-white px-3 py-1.5 rounded text-xs hover:bg-red-500 transition">
                      <AlertTriangle size={12} />设为故障
                    </button>
                  )}
                  {robot.status === 'error' && (
                    <button onClick={() => robotAction(robot.id, 'recover')} className="flex items-center gap-1 bg-teal-600 text-white px-3 py-1.5 rounded text-xs hover:bg-teal-500 transition">
                      <RotateCcw size={12} />恢复空闲
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
