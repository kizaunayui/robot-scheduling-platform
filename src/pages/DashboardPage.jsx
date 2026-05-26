import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '../store/AppStore'
import { taskTypeColors, taskTypeNames, taskStatusConfig } from '../data/mapData'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function DashboardPage() {
  const { robots, tasks, logs, metrics, paths, conflicts, mapData } = useAppStore()
  const canvasRef = useRef(null)
  const [animTick, setAnimTick] = useState(0)

  // 动态统计
  const runningTasks = tasks.filter(t => t.status === '执行中').length
  const completedTasks = tasks.filter(t => t.status === '已完成').length
  const pendingTasks = tasks.filter(t => t.status === '待派发' || t.status === '加急').length
  const onlineRobots = robots.filter(r => r.status !== 'fault').length
  const busyRobots = robots.filter(r => r.status === 'busy').length

  const statusDist = [
    { name: '空闲', value: robots.filter(r => r.status === 'idle').length },
    { name: '执行中', value: robots.filter(r => r.status === 'busy').length },
    { name: '充电中', value: robots.filter(r => r.status === 'charging').length },
    { name: '暂停', value: robots.filter(r => r.status === 'paused').length },
  ]

  // Canvas 网格地图
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
          ctx.fillRect(x * cellW, y * cellH, cellW, cellH)
        }
      }
    }

    // 位置标记
    Object.entries(mapData.locations).forEach(([name, [lx, ly]]) => {
      ctx.fillStyle = '#6366f1'
      ctx.fillRect(lx * cellW + 2, ly * cellH + 2, cellW - 4, cellH - 4)
      ctx.fillStyle = '#fff'
      ctx.font = '9px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(name, lx * cellW + cellW / 2, ly * cellH + cellH / 2)
    })

    // 路径
    const pathColors = ['#22c55e', '#3b82f6', '#ef4444', '#f59e0b']
    Object.entries(paths).forEach(([robotId, path], i) => {
      if (path.length < 2) return
      ctx.strokeStyle = pathColors[i % pathColors.length]
      ctx.lineWidth = 2
      ctx.globalAlpha = 0.6
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
      const color = r.status === 'busy' ? '#3b82f6' : r.status === 'charging' ? '#f59e0b' : r.status === 'paused' ? '#ef4444' : '#10b981'
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(cx, cy, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 7px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(r.id, cx, cy)
    })

    // 冲突点
    conflicts.forEach(c => {
      if (c.loc) {
        const cx = c.loc[0] * cellW + cellW / 2
        const cy = c.loc[1] * cellH + cellH / 2
        ctx.fillStyle = '#ef4444'
        ctx.globalAlpha = 0.5
        ctx.beginPath()
        ctx.arc(cx, cy, 10, 0, Math.PI * 2)
        ctx.fill()
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

  const recentLogs = logs.slice(0, 6)

  // 任务趋势数据（从 tasks 动态生成）
  const taskTypeDist = Object.entries(
    tasks.reduce((acc, t) => { acc[t.type] = (acc[t.type] || 0) + 1; return acc }, {})
  ).map(([type, count]) => ({ name: taskTypeNames[type] || type, value: count }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">📊 系统首页</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: '总任务', value: metrics.totalTasks, icon: '📋', color: 'bg-blue-600' },
          { label: '执行中', value: metrics.runningTasks, icon: '🚀', color: 'bg-indigo-600' },
          { label: '已完成', value: metrics.completedTasks, icon: '✅', color: 'bg-green-600' },
          { label: '在线机器人', value: metrics.onlineRobots, icon: '🤖', color: 'bg-teal-600' },
          { label: '路径冲突', value: conflicts.length, icon: '⚡', color: 'bg-orange-600' },
        ].map(card => (
          <div key={card.label} className={`${card.color} rounded-lg p-4 text-white shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">{card.label}</p>
                <p className="text-3xl font-bold mt-1">{card.value}</p>
              </div>
              <span className="text-4xl opacity-60">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* 地图预览 */}
        <div className="col-span-2 bg-slate-900 rounded-lg p-4 border border-slate-700">
          <h2 className="text-sm font-bold text-white mb-3">🗺️ 院区实时地图（网格视图）</h2>
          <canvas ref={canvasRef} className="w-full rounded border border-slate-600" style={{ aspectRatio: '3/2' }} />
          <div className="flex gap-3 mt-2 text-xs text-slate-400">
            <span><span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1" />空闲</span>
            <span><span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-1" />执行中</span>
            <span><span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1" />充电</span>
            <span><span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1" />暂停</span>
            <span><span className="inline-block w-3 h-3 rounded bg-slate-500 mr-1" />障碍物</span>
          </div>
        </div>

        {/* 机器人状态饼图 */}
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <h2 className="text-sm font-bold text-white mb-3">🤖 机器人状态分布</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusDist} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, value }) => `${name}:${value}`}>
                {statusDist.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 任务类型分布 */}
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <h2 className="text-sm font-bold text-white mb-3">📈 任务类型分布</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={taskTypeDist}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 最近操作日志 */}
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <h2 className="text-sm font-bold text-white mb-3">📝 最近操作日志</h2>
          <div className="space-y-2">
            {recentLogs.length === 0 && <p className="text-slate-500 text-sm">暂无日志</p>}
            {recentLogs.map((log, i) => (
              <div key={i} className="flex items-center justify-between text-xs p-2 bg-slate-800 rounded">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-slate-300">{log.message}</span>
                </div>
                <span className="text-slate-500">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
