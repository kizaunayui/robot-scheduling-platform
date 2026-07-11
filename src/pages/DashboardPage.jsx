import { useRef, useEffect, useState } from 'react'
import { useAppStore } from '../store/AppStore'
import { ListChecks, Pause, Play, RotateCcw, Clock, Zap } from 'lucide-react'

export default function DashboardPage() {
  const { robots, tasks, logs, metrics, paths, conflicts, mapData, simulationRunning, toggleSimulation, resetSimulation } = useAppStore()
  const canvasRef = useRef(null)
  const [animTick, setAnimTick] = useState(0)

  const runningTasks = tasks.filter(t => t.status === '执行中').length
  const completedTasks = tasks.filter(t => t.status === '已完成').length
  const pendingTasks = tasks.filter(t => t.status === '待派发' || t.status === '加急').length
  const onlineRobots = robots.filter(r => r.status !== 'error').length
  const idleRobots = robots.filter(r => r.status === 'idle').length
  const busyRobots = robots.filter(r => r.status === 'busy').length
  const utilization = robots.length > 0 ? Math.round((busyRobots / robots.length) * 100) : 0

  const recentLogs = logs.slice(0, 10)

  // Canvas 网格地图预览
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = 720, H = 480
    canvas.width = W
    canvas.height = H
    const cellW = W / mapData.cols, cellH = H / mapData.rows

    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, W, H)

    // 网格线
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 0.5
    for (let x = 0; x <= mapData.cols; x++) {
      ctx.beginPath(); ctx.moveTo(x * cellW, 0); ctx.lineTo(x * cellW, H); ctx.stroke()
    }
    for (let y = 0; y <= mapData.rows; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * cellH); ctx.lineTo(W, y * cellH); ctx.stroke()
    }

    // 障碍物
    const obsSet = new Set(mapData.obstacles.map(o => `${o[0]},${o[1]}`))
    for (let x = 0; x < mapData.cols; x++) {
      for (let y = 0; y < mapData.rows; y++) {
        if (obsSet.has(`${x},${y}`)) {
          ctx.fillStyle = '#334155'
          ctx.fillRect(x * cellW + 1, y * cellH + 1, cellW - 2, cellH - 2)
        }
      }
    }

    // 位置标记
    Object.entries(mapData.locations).forEach(([name, [lx, ly]]) => {
      const cx = lx * cellW + cellW / 2
      const cy = ly * cellH + cellH / 2
      ctx.fillStyle = 'rgba(99, 102, 241, 0.12)'
      ctx.beginPath(); ctx.arc(cx, cy, cellW * 0.7, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#4f46e5'
      ctx.beginPath()
      ctx.roundRect(lx * cellW + 2, ly * cellH + 2, cellW - 4, cellH - 4, 3)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 9px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(name, cx, cy)
    })

    // 路径
    const pathColors = ['#22c55e', '#3b82f6', '#ef4444', '#f59e0b']
    Object.values(paths).forEach((path, i) => {
      if (path.length < 2) return
      ctx.strokeStyle = pathColors[i % pathColors.length]
      ctx.lineWidth = 2
      ctx.globalAlpha = 0.55
      ctx.setLineDash([4, 3])
      ctx.beginPath()
      path.forEach(([px, py], j) => {
        const cx = px * cellW + cellW / 2, cy = py * cellH + cellH / 2
        if (j === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy)
      })
      ctx.stroke()
      ctx.setLineDash([])
      ctx.globalAlpha = 1
    })

    // 机器人
    robots.forEach(r => {
      const cx = r.pos[0] * cellW + cellW / 2
      const cy = r.pos[1] * cellH + cellH / 2
      const color = r.status === 'busy' ? '#3b82f6' : r.status === 'charging' ? '#f59e0b' : r.status === 'paused' ? '#ef4444' : r.status === 'error' ? '#ef4444' : '#10b981'
      ctx.fillStyle = color
      ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke()
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 7px sans-serif'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(r.id, cx, cy)
    })

    // 冲突点
    conflicts.forEach(c => {
      if (c.loc) {
        const cx = c.loc[0] * cellW + cellW / 2
        const cy = c.loc[1] * cellH + cellH / 2
        ctx.fillStyle = '#ef4444'
        ctx.globalAlpha = 0.5
        ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 1
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 8px sans-serif'
        ctx.fillText('!', cx, cy)
      }
    })
  }, [robots, paths, conflicts, mapData, animTick])

  useEffect(() => {
    const timer = setInterval(() => setAnimTick(t => t + 1), 5000)
    return () => clearInterval(timer)
  }, [])

  const kpiCards = [
    { label: '今日任务数', value: metrics.totalTasks, color: 'bg-blue-600', icon: ListChecks },
    { label: '待派发', value: pendingTasks, color: 'bg-amber-600', icon: Clock },
    { label: '执行中', value: runningTasks, color: 'bg-indigo-600', icon: Play },
    { label: '已完成', value: completedTasks, color: 'bg-emerald-600', icon: ListChecks },
    { label: '在线机器人', value: onlineRobots, color: 'bg-teal-600', icon: Zap },
    { label: '空闲机器人', value: idleRobots, color: 'bg-cyan-600', icon: Zap },
    { label: '利用率', value: `${utilization}%`, color: 'bg-purple-600', icon: Zap },
    { label: '冲突数', value: conflicts.length, color: 'bg-rose-600', icon: Zap },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-white">调度总览</h1>
        <div className="flex gap-2">
          <button onClick={toggleSimulation} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm text-white transition ${simulationRunning ? 'bg-amber-600 hover:bg-amber-500' : 'bg-blue-600 hover:bg-blue-500'}`}>
            {simulationRunning ? <Pause size={14} /> : <Play size={14} />}{simulationRunning ? '暂停仿真' : '运行调度'}
          </button>
          <button onClick={resetSimulation} className="flex items-center gap-1.5 bg-slate-700 text-slate-300 px-3 py-1.5 rounded text-sm hover:bg-slate-600 transition">
            <RotateCcw size={14} />重置仿真
          </button>
        </div>
      </div>

      {/* KPI 卡片 */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpiCards.map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className={`${card.color} rounded-lg p-3 text-white shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-80">{card.label}</p>
                  <p className="text-2xl font-bold mt-0.5">{card.value}</p>
                </div>
                <Icon size={28} className="opacity-40" />
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* 地图预览 */}
        <div className="bg-slate-900 rounded-lg p-3 sm:p-4 border border-slate-700/60 xl:col-span-2">
          <h2 className="text-sm font-bold text-white mb-3">院区调度地图预览</h2>
          <canvas ref={canvasRef} className="w-full rounded border border-slate-700" style={{ aspectRatio: '3/2' }} />
          <div className="flex gap-3 mt-2 text-xs text-slate-500">
            <span><span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1" />空闲</span>
            <span><span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-1" />执行中</span>
            <span><span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1" />充电</span>
            <span><span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1" />故障/暂停</span>
            <span><span className="inline-block w-3 h-3 rounded bg-indigo-500 mr-1" />科室</span>
          </div>
        </div>

        {/* 最近调度日志 */}
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700/60">
          <h2 className="text-sm font-bold text-white mb-3">最近调度日志</h2>
          <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
            {recentLogs.length === 0 && <p className="text-slate-600 text-xs">暂无日志</p>}
            {recentLogs.map((log, i) => (
              <div key={i} className="flex items-center justify-between text-xs p-2 bg-slate-800/60 rounded">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-slate-400 truncate">{log.message}</span>
                </div>
                <span className="text-slate-600 shrink-0 ml-2">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
