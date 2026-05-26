import { useAppStore } from '../store/AppStore'
import { robotTypeColors, robotStatusNames } from '../data/mapData'

export default function RobotStatusPage() {
  const { robots, updateRobot } = useAppStore()

  const statusCounts = {
    running: robots.filter(r => r.status === 'running').length,
    idle: robots.filter(r => r.status === 'idle').length,
    charging: robots.filter(r => r.status === 'charging').length,
    error: robots.filter(r => r.status === 'error').length,
  }

  const handleAction = (robotId, action) => {
    if (action === 'start') updateRobot(robotId, { status: 'running' })
    else if (action === 'pause') updateRobot(robotId, { status: 'idle' })
    else if (action === 'charge') updateRobot(robotId, { status: 'charging' })
    else if (action === 'restart') updateRobot(robotId, { status: 'idle', battery: 100 })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">🤖 机器人状态管理</h1>

      {/* 状态统计 */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '运行中', count: statusCounts.running, color: 'bg-blue-600' },
          { label: '待机', count: statusCounts.idle, color: 'bg-green-600' },
          { label: '充电中', count: statusCounts.charging, color: 'bg-yellow-600' },
          { label: '故障', count: statusCounts.error, color: 'bg-red-600' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-lg p-4 text-white`}>
            <p className="text-sm opacity-80">{s.label}</p>
            <p className="text-3xl font-bold">{s.count}</p>
          </div>
        ))}
      </div>

      {/* 机器人列表 */}
      <div className="grid grid-cols-2 gap-4">
        {robots.map(robot => (
          <div key={robot.id} className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: robotTypeColors[robot.type] || '#9e9e9e' }} />
                <h3 className="text-white font-bold">{robot.name}</h3>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs ${
                robot.status === 'running' ? 'bg-blue-900 text-blue-300' :
                robot.status === 'idle' ? 'bg-green-900 text-green-300' :
                robot.status === 'charging' ? 'bg-yellow-900 text-yellow-300' :
                'bg-red-900 text-red-300'
              }`}>
                {robotStatusNames[robot.status]}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-3">
              <div>ID: <span className="text-slate-200">{robot.id}</span></div>
              <div>类型: <span className="text-slate-200">{robot.type}</span></div>
              <div>位置: <span className="text-slate-200">{robot.currentLocation}</span></div>
              <div>速度: <span className="text-slate-200">{robot.speed}m/s</span></div>
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

            <div className="flex gap-2">
              {robot.status !== 'running' && (
                <button onClick={() => handleAction(robot.id, 'start')} className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-500">启动</button>
              )}
              {robot.status === 'running' && (
                <button onClick={() => handleAction(robot.id, 'pause')} className="bg-yellow-600 text-white px-3 py-1 rounded text-xs hover:bg-yellow-500">暂停</button>
              )}
              {robot.status !== 'charging' && (
                <button onClick={() => handleAction(robot.id, 'charge')} className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-500">充电</button>
              )}
              <button onClick={() => handleAction(robot.id, 'restart')} className="bg-slate-700 text-slate-300 px-3 py-1 rounded text-xs hover:bg-slate-600">重启</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
