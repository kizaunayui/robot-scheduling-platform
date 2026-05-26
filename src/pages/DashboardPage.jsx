import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '../store/AppStore'
import { mapNodes, mapEdges, mapAreas, nodeTypeColors, robotTypeColors } from '../data/mapData'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'

const taskTrend = [
  { hour: '08:00', tasks: 5 }, { hour: '09:00', tasks: 8 }, { hour: '10:00', tasks: 12 },
  { hour: '11:00', tasks: 15 }, { hour: '12:00', tasks: 10 }, { hour: '13:00', tasks: 7 },
  { hour: '14:00', tasks: 14 }, { hour: '15:00', tasks: 18 }, { hour: '16:00', tasks: 11 },
]

const COLORS = ['#2196f3', '#4caf50', '#ff9800', '#f44336']

export default function DashboardPage() {
  const { robots, tasks, logs, devices } = useAppStore()
  const canvasRef = useRef(null)
  const [animTick, setAnimTick] = useState(0)

  const todayTasks = tasks.length
  const onlineRobots = robots.filter(r => r.status !== 'error').length
  const errorDevices = devices.filter(d => d.status === 'FAULT').length
  const urgentTasks = tasks.filter(t => t.priority === 'HIGH' && t.status !== 'COMPLETED').length

  const statusDist = [
    { name: '运行中', value: robots.filter(r => r.status === 'running').length },
    { name: '待机', value: robots.filter(r => r.status === 'idle').length },
    { name: '充电中', value: robots.filter(r => r.status === 'charging').length },
    { name: '故障', value: robots.filter(r => r.status === 'error').length },
  ]

  // Canvas 地图预览
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = 600, H = 400
    canvas.width = W
    canvas.height = H

    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(0, 0, W, H)

    // 简化地图 - 1F预览
    const scale = 0.5
    const areas1F = mapAreas.filter(a => a.floor === '1F')
    const nodes1F = mapNodes.filter(n => n.floor === '1F')
    const edges1F = mapEdges.filter(e => e.floor === '1F')
    const nodeMap = new Map(mapNodes.map(n => [n.id, n]))

    areas1F.forEach(a => {
      ctx.fillStyle = a.color
      ctx.globalAlpha = 0.3
      ctx.fillRect(a.x * scale, a.y * scale, a.w * scale, a.h * scale)
      ctx.globalAlpha = 1
    })

    edges1F.forEach(e => {
      const from = nodeMap.get(e.from)
      const to = nodeMap.get(e.to)
      if (!from || !to) return
      ctx.strokeStyle = '#b0bec5'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(from.x * scale, from.y * scale)
      ctx.lineTo(to.x * scale, to.y * scale)
      ctx.stroke()
    })

    nodes1F.forEach(n => {
      ctx.fillStyle = nodeTypeColors[n.type] || '#9e9e9e'
      ctx.beginPath()
      ctx.arc(n.x * scale, n.y * scale, 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#37474f'
      ctx.font = '8px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(n.name, n.x * scale, n.y * scale + 12)
    })

    // 机器人
    const r1F = robots.filter(r => r.floor === '1F')
    r1F.forEach(r => {
      const color = r.status === 'running' ? '#2196f3' : r.status === 'charging' ? '#ffc107' : r.status === 'error' ? '#f44336' : '#42a5f5'
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(r.x * scale, r.y * scale, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 7px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(r.id.replace('R0', ''), r.x * scale, r.y * scale)
    })
  }, [robots, animTick])

  // 定时刷新动画
  useEffect(() => {
    const timer = setInterval(() => setAnimTick(t => t + 1), 5000)
    return () => clearInterval(timer)
  }, [])

  const recentLogs = logs.slice(0, 6)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">📊 系统首页</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '今日任务', value: todayTasks, icon: '📋', color: 'bg-blue-600' },
          { label: '在线机器人', value: onlineRobots, icon: '🤖', color: 'bg-green-600' },
          { label: '故障设备', value: errorDevices, icon: '⚠️', color: 'bg-red-600' },
          { label: '紧急任务', value: urgentTasks, icon: '🚨', color: 'bg-orange-600' },
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
          <h2 className="text-sm font-bold text-white mb-3">🗺️ 院区实时地图 (1F)</h2>
          <canvas ref={canvasRef} className="w-full rounded border border-slate-600" style={{ aspectRatio: '3/2' }} />
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
        {/* 任务趋势 */}
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <h2 className="text-sm font-bold text-white mb-3">📈 今日任务趋势</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={taskTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
              <Line type="monotone" dataKey="tasks" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 最近操作日志 */}
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <h2 className="text-sm font-bold text-white mb-3">📝 最近操作日志</h2>
          <div className="space-y-2">
            {recentLogs.map(log => (
              <div key={log.logId} className="flex items-center justify-between text-xs p-2 bg-slate-800 rounded">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${log.status === '成功' ? 'bg-green-500' : log.status === '失败' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                  <span className="text-slate-300">{log.robotId}</span>
                  <span className="text-slate-400">{log.action}</span>
                </div>
                <span className="text-slate-500">{log.operateTime}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
