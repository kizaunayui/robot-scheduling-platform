import { useRef, useEffect } from 'react'
import { useAppStore } from '../store/AppStore'

export default function CampusMapPage() {
  const { robots, tasks, paths, conflicts, mapData } = useAppStore()
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = 960, H = 640
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
      ctx.fillStyle = '#6366f1'
      ctx.globalAlpha = 0.8
      ctx.fillRect(lx * cellW + 2, ly * cellH + 2, cellW - 4, cellH - 4)
      ctx.globalAlpha = 1
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 11px sans-serif'
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
      ctx.globalAlpha = 0.6
      ctx.setLineDash([6, 4])
      ctx.beginPath()
      path.forEach(([px, py], j) => {
        const cx = px * cellW + cellW / 2, cy = py * cellH + cellH / 2
        if (j === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy)
      })
      ctx.stroke()
      ctx.setLineDash([])
      ctx.globalAlpha = 1
    })

    // 冲突点
    conflicts.forEach(c => {
      if (c.loc) {
        const cx = c.loc[0] * cellW + cellW / 2
        const cy = c.loc[1] * cellH + cellH / 2
        ctx.fillStyle = '#ef4444'
        ctx.globalAlpha = 0.4
        ctx.beginPath()
        ctx.arc(cx, cy, 14, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 12px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('!', cx, cy)
      }
    })

    // 机器人
    robots.forEach(r => {
      const cx = r.pos[0] * cellW + cellW / 2
      const cy = r.pos[1] * cellH + cellH / 2
      const color = r.status === 'busy' ? '#3b82f6' : r.status === 'charging' ? '#f59e0b' : r.status === 'paused' ? '#ef4444' : '#10b981'

      // 机器人圆形
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(cx, cy, 10, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()

      // ID标签
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 8px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(r.id, cx, cy)

      // 名称
      ctx.fillStyle = '#94a3b8'
      ctx.font = '9px sans-serif'
      ctx.fillText(r.name, cx, cy + 16)
    })

    // 执行中任务的起点终点连线
    tasks.filter(t => t.status === '执行中').forEach(t => {
      const startLoc = mapData.locations[t.start]
      const endLoc = mapData.locations[t.end]
      if (startLoc && endLoc) {
        ctx.strokeStyle = '#f59e0b'
        ctx.lineWidth = 1
        ctx.globalAlpha = 0.3
        ctx.setLineDash([3, 3])
        ctx.beginPath()
        ctx.moveTo(startLoc[0] * cellW + cellW / 2, startLoc[1] * cellH + cellH / 2)
        ctx.lineTo(endLoc[0] * cellW + cellW / 2, endLoc[1] * cellH + cellH / 2)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.globalAlpha = 1
      }
    })
  }, [robots, tasks, paths, conflicts, mapData])

  // 任务统计
  const runningTasks = tasks.filter(t => t.status === '执行中')
  const pendingTasks = tasks.filter(t => t.status === '待派发' || t.status === '加急')

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">🗺️ 院区地图</h1>

      {/* 状态栏 */}
      <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 flex items-center gap-6">
        <div className="text-sm text-slate-300">
          机器人: <span className="text-white font-bold">{robots.length}</span> 台
        </div>
        <div className="text-sm text-slate-300">
          执行中: <span className="text-blue-400 font-bold">{runningTasks.length}</span> 个任务
        </div>
        <div className="text-sm text-slate-300">
          待派发: <span className="text-yellow-400 font-bold">{pendingTasks.length}</span> 个任务
        </div>
        <div className="text-sm text-slate-300">
          路径: <span className="text-green-400 font-bold">{Object.keys(paths).length}</span> 条
        </div>
        <div className="text-sm text-slate-300">
          冲突: <span className="text-red-400 font-bold">{conflicts.length}</span> 个
        </div>
      </div>

      {/* 地图 */}
      <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
        <canvas ref={canvasRef} className="w-full rounded" style={{ aspectRatio: '3/2' }} />
        <div className="flex gap-4 mt-3 text-xs text-slate-400 flex-wrap">
          <span><span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1" />空闲机器人</span>
          <span><span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-1" />执行中机器人</span>
          <span><span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1" />充电中</span>
          <span><span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1" />暂停</span>
          <span><span className="inline-block w-3 h-3 rounded bg-purple-600 mr-1" />位置标记</span>
          <span><span className="inline-block w-3 h-3 rounded bg-slate-500 mr-1" />障碍物</span>
          <span><span className="inline-block w-3 h-3 rounded-full bg-red-400 mr-1 opacity-50" />冲突点</span>
          <span><span className="inline-block w-8 h-0.5 bg-amber-500 mr-1 opacity-30" style={{ borderBottom: '2px dashed #f59e0b' }} />任务起终点连线</span>
        </div>
      </div>

      {/* 图例面板 */}
      <div className="grid grid-cols-3 gap-4">
        {/* 机器人列表 */}
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <h3 className="text-sm font-bold text-white mb-3">🤖 机器人位置</h3>
          {robots.map(r => (
            <div key={r.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800 last:border-0">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${r.status === 'busy' ? 'bg-blue-500' : r.status === 'charging' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                <span className="text-slate-300">{r.name}</span>
              </div>
              <span className="text-slate-500">[{r.pos.join(',')}]</span>
            </div>
          ))}
        </div>

        {/* 执行中任务 */}
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <h3 className="text-sm font-bold text-white mb-3">🚀 执行中任务</h3>
          {runningTasks.length === 0 && <p className="text-slate-500 text-xs">暂无执行中任务</p>}
          {runningTasks.map(t => (
            <div key={t.id} className="text-xs py-1.5 border-b border-slate-800 last:border-0">
              <div className="flex items-center justify-between">
                <span className="text-white">{t.name}</span>
                <span className="text-blue-400">{t.robotId}</span>
              </div>
              <div className="text-slate-500">{t.start} → {t.end} | 进度 {t.progress}%</div>
            </div>
          ))}
        </div>

        {/* 位置坐标 */}
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <h3 className="text-sm font-bold text-white mb-3">📍 位置坐标</h3>
          {Object.entries(mapData.locations).map(([name, pos]) => (
            <div key={name} className="flex items-center justify-between text-xs py-1 border-b border-slate-800 last:border-0">
              <span className="text-slate-300">{name}</span>
              <span className="text-slate-500 font-mono">[{pos.join(',')}]</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
