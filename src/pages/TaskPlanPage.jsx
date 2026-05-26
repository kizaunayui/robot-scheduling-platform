import { useState, useRef, useEffect } from 'react'
import { useAppStore } from '../store/AppStore'
import { taskTypeNames } from '../data/mapData'

export default function TaskPlanPage() {
  const { tasks, robots, paths, conflicts, planRoutes, dispatchTask, mapData } = useAppStore()
  const [message, setMessage] = useState('')
  const canvasRef = useRef(null)

  const locationNames = Object.keys(mapData.locations)

  const handlePlan = () => {
    const result = planRoutes()
    setMessage(`✅ 路径规划完成，共 ${Object.keys(result.paths).length} 条路径，${result.conflicts.length} 个冲突`)
    setTimeout(() => setMessage(''), 4000)
  }

  // Canvas 地图
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

    // 网格
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
      ctx.fillRect(lx * cellW + 1, ly * cellH + 1, cellW - 2, cellH - 2)
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
      ctx.lineWidth = 3
      ctx.globalAlpha = 0.7
      ctx.setLineDash([6, 4])
      ctx.beginPath()
      path.forEach(([px, py], j) => {
        const cx = px * cellW + cellW / 2, cy = py * cellH + cellH / 2
        if (j === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy)
      })
      ctx.stroke()
      ctx.setLineDash([])
      ctx.globalAlpha = 1

      // 路径标签
      const first = path[0]
      ctx.fillStyle = pathColors[i % pathColors.length]
      ctx.font = 'bold 10px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(robotId, first[0] * cellW + cellW + 2, first[1] * cellH + cellH / 2)
    })

    // 冲突点
    conflicts.forEach(c => {
      if (c.loc) {
        const cx = c.loc[0] * cellW + cellW / 2
        const cy = c.loc[1] * cellH + cellH / 2
        ctx.fillStyle = '#ef4444'
        ctx.globalAlpha = 0.4
        ctx.beginPath()
        ctx.arc(cx, cy, 12, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 10px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('⚠', cx, cy)
      }
    })

    // 机器人
    robots.forEach(r => {
      const cx = r.pos[0] * cellW + cellW / 2
      const cy = r.pos[1] * cellH + cellH / 2
      const color = r.status === 'busy' ? '#3b82f6' : r.status === 'charging' ? '#f59e0b' : '#10b981'
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(cx, cy, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 7px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(r.id, cx, cy)
    })
  }, [paths, conflicts, robots, mapData])

  // 生成路径详情
  const pathDetails = Object.entries(paths).map(([robotId, path]) => {
    const robot = robots.find(r => r.id === robotId)
    const task = tasks.find(t => t.robotId === robotId && t.status === '执行中')
    return {
      robotId,
      robotName: robot?.name || robotId,
      taskName: task?.name || '-',
      pathLength: path.length,
      estimatedSteps: Math.max(0, path.length - 1),
      start: path[0] ? `[${path[0].join(',')}]` : '-',
      end: path[path.length - 1] ? `[${path[path.length - 1].join(',')}]` : '-',
    }
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">📐 路径规划</h1>
      {message && <div className="p-2 bg-green-900/50 text-green-300 rounded text-sm">{message}</div>}

      <div className="flex gap-2">
        <button onClick={handlePlan} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">🔍 执行路径规划（CBS）</button>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>执行中任务: {tasks.filter(t => t.status === '执行中').length}</span>
          <span>|</span>
          <span>冲突数: {conflicts.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-slate-900 rounded-lg p-4 border border-slate-700">
          <canvas ref={canvasRef} className="w-full rounded" style={{ aspectRatio: '3/2' }} />
          <div className="flex gap-3 mt-2 text-xs text-slate-400">
            <span><span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1" />路径1</span>
            <span><span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-1" />路径2</span>
            <span><span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1" />路径3</span>
            <span><span className="inline-block w-3 h-3 rounded-full bg-amber-500 mr-1" />路径4</span>
            <span><span className="inline-block w-3 h-3 rounded bg-purple-600 mr-1" />位置标记</span>
            <span><span className="inline-block w-3 h-3 rounded-full bg-red-400 mr-1 opacity-50" />冲突点</span>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white">路径详情</h3>
          {pathDetails.length === 0 && (
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 text-center text-slate-500 text-sm">
              点击"执行路径规划"生成路径
            </div>
          )}
          {pathDetails.map((d, i) => (
            <div key={d.robotId} className="bg-slate-800 rounded-lg p-3 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#22c55e', '#3b82f6', '#ef4444', '#f59e0b'][i % 4] }} />
                <span className="text-sm font-medium text-white">{d.robotName}</span>
                <span className="text-xs text-slate-500">({d.robotId})</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-slate-400">任务: <span className="text-white">{d.taskName}</span></div>
                <div className="text-slate-400">步数: <span className="text-white">{d.estimatedSteps}</span></div>
                <div className="text-slate-400">起点: <span className="text-white">{d.start}</span></div>
                <div className="text-slate-400">终点: <span className="text-white">{d.end}</span></div>
              </div>
            </div>
          ))}

          {conflicts.length > 0 && (
            <div className="bg-red-900/30 rounded-lg p-3 border border-red-700">
              <h4 className="text-sm font-bold text-red-300 mb-2">⚠ 冲突列表</h4>
              {conflicts.slice(0, 5).map((c, i) => (
                <div key={i} className="text-xs text-red-400 mb-1">
                  {c.type === 'vertex' ? '顶点冲突' : '边冲突'}: {c.a} ↔ {c.b} @ t={c.time}
                </div>
              ))}
              {conflicts.length > 5 && <div className="text-xs text-red-500">...还有 {conflicts.length - 5} 个冲突</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
