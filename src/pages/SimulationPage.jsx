import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { useAppStore } from '../store/AppStore'
import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react'

export default function SimulationPage() {
  const { robots, tasks, paths, conflicts, mapData, simulationRunning, toggleSimulation, stepSimulation, resetSimulation } = useAppStore()
  const canvasRef = useRef(null)
  const robotVisualsRef = useRef({})
  const [hoveredCell, setHoveredCell] = useState(null)

  const W = 960, H = 640
  const cellW = W / mapData.cols
  const cellH = H / mapData.rows
  const obsSet = useMemo(() => new Set(mapData.obstacles.map(o => `${o[0]},${o[1]}`)), [mapData.obstacles])

  // 冲突信息
  const conflictDetails = conflicts.map(c => ({
    type: c.type === 'vertex' ? '路口交叉冲突' : '对向冲突',
    location: c.loc ? `(${c.loc[0]}, ${c.loc[1]})` : '未知',
    time: c.time,
    agents: `${c.a} ↔ ${c.b}`,
    strategy: c.type === 'vertex' ? '等待-重规划' : '路径绕行',
  }))
  const hasActiveWork = tasks.some(task => task.status === '执行中') || robots.some(r => r.status === 'charging')

  const handleReset = () => {
    resetSimulation()
    robotVisualsRef.current = {}
  }

  // Canvas 渲染
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = W
    canvas.height = H

    let animationId
    let dashOffset = 0

    const render = () => {
      // 背景
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
      for (let x = 0; x < mapData.cols; x++) {
        for (let y = 0; y < mapData.rows; y++) {
          if (obsSet.has(`${x},${y}`)) {
            ctx.fillStyle = '#334155'
            ctx.fillRect(x * cellW + 1, y * cellH + 1, cellW - 2, cellH - 2)
            ctx.strokeStyle = '#475569'
            ctx.lineWidth = 0.5
            ctx.strokeRect(x * cellW + 1, y * cellH + 1, cellW - 2, cellH - 2)
          }
        }
      }

      // 科室位置标记
      Object.entries(mapData.locations).forEach(([name, [lx, ly]]) => {
        const cx = lx * cellW + cellW / 2
        const cy = ly * cellH + cellH / 2

        ctx.fillStyle = 'rgba(99, 102, 241, 0.12)'
        ctx.beginPath(); ctx.arc(cx, cy, cellW * 0.8, 0, Math.PI * 2); ctx.fill()

        ctx.fillStyle = '#4f46e5'
        ctx.beginPath()
        ctx.roundRect(lx * cellW + 2, ly * cellH + 2, cellW - 4, cellH - 4, 3)
        ctx.fill()
        ctx.strokeStyle = '#6366f1'
        ctx.lineWidth = 1
        ctx.stroke()

        ctx.fillStyle = '#fff'
        ctx.font = 'bold 10px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(name, cx, cy)
      })

      // 任务起终点标记
      const activeTasks = tasks.filter(t => t.status === '执行中')
      activeTasks.forEach(t => {
        const startLoc = mapData.locations[t.start]
        const endLoc = mapData.locations[t.end]
        if (startLoc) {
          const sx = startLoc[0] * cellW + cellW / 2
          const sy = startLoc[1] * cellH + cellH / 2
          ctx.fillStyle = 'rgba(34, 197, 94, 0.2)'
          ctx.beginPath(); ctx.arc(sx, sy, 12, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = '#22c55e'
          ctx.font = 'bold 8px sans-serif'
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText('S', sx, sy)
        }
        if (endLoc) {
          const ex = endLoc[0] * cellW + cellW / 2
          const ey = endLoc[1] * cellH + cellH / 2
          ctx.fillStyle = 'rgba(239, 68, 68, 0.2)'
          ctx.beginPath(); ctx.arc(ex, ey, 12, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = '#ef4444'
          ctx.font = 'bold 8px sans-serif'
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText('E', ex, ey)
        }
      })

      // 路径流光
      const pathColors = ['#10b981', '#3b82f6', '#ef4444', '#f59e0b']
      Object.values(paths).forEach((path, idx) => {
        if (path.length < 2) return
        const color = pathColors[idx % pathColors.length]

        ctx.strokeStyle = color
        ctx.lineWidth = 3.5
        ctx.globalAlpha = 0.65
        ctx.setLineDash([8, 6])
        ctx.lineDashOffset = -dashOffset

        ctx.beginPath()
        path.forEach(([px, py], j) => {
          const cx = px * cellW + cellW / 2
          const cy = py * cellH + cellH / 2
          if (j === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy)
        })
        ctx.stroke()
        ctx.setLineDash([])
        ctx.globalAlpha = 1
      })

      // 冲突点 (红色/橙色标注)
      conflicts.forEach((c) => {
        if (c.loc) {
          const cx = c.loc[0] * cellW + cellW / 2
          const cy = c.loc[1] * cellH + cellH / 2

          const scale = 1 + 0.3 * Math.sin(Date.now() / 150)
          ctx.fillStyle = 'rgba(239, 68, 68, 0.2)'
          ctx.beginPath(); ctx.arc(cx, cy, 16 * scale, 0, Math.PI * 2); ctx.fill()

          ctx.fillStyle = c.type === 'vertex' ? '#ef4444' : '#f97316'
          ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.fill()
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke()

          ctx.fillStyle = '#fff'
          ctx.font = 'bold 10px sans-serif'
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText('!', cx, cy)
        }
      })

      // 机器人渲染（带平滑运动）
      robots.forEach((r) => {
        const [targetX, targetY] = r.pos

        if (!robotVisualsRef.current[r.id]) {
          robotVisualsRef.current[r.id] = { x: targetX, y: targetY, angle: 0 }
        }
        const vis = robotVisualsRef.current[r.id]

        const dx = targetX - vis.x
        const dy = targetY - vis.y
        vis.x += dx * 0.08
        vis.y += dy * 0.08

        if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
          const targetAngle = Math.atan2(dy, dx)
          let diff = targetAngle - vis.angle
          while (diff < -Math.PI) diff += Math.PI * 2
          while (diff > Math.PI) diff -= Math.PI * 2
          vis.angle += diff * 0.15
        }

        const cx = vis.x * cellW + cellW / 2
        const cy = vis.y * cellH + cellH / 2

        const isBusy = r.status === 'busy'
        const isCharging = r.status === 'charging'
        const isError = r.status === 'error'
        const isPaused = r.status === 'paused'
        const color = isBusy ? '#3b82f6' : isCharging ? '#eab308' : isError ? '#ef4444' : isPaused ? '#f97316' : '#10b981'

        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(vis.angle)

        // 发光底座
        ctx.shadowColor = color
        ctx.shadowBlur = isBusy ? 8 + 3 * Math.sin(Date.now() / 150) : 5

        // 车体
        ctx.fillStyle = '#1e293b'
        ctx.beginPath()
        ctx.roundRect(-cellW * 0.42, -cellH * 0.38, cellW * 0.84, cellH * 0.76, 4)
        ctx.fill()
        ctx.shadowBlur = 0

        // 面板
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.roundRect(-cellW * 0.25, -cellH * 0.25, cellW * 0.5, cellH * 0.5, 3)
        ctx.fill()

        // 车头灯
        ctx.fillStyle = '#fde047'
        ctx.beginPath()
        ctx.moveTo(cellW * 0.38, -cellH * 0.15)
        ctx.lineTo(cellW * 0.46, 0)
        ctx.lineTo(cellW * 0.38, cellH * 0.15)
        ctx.closePath()
        ctx.fill()

        ctx.restore()

        // ID
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 9px sans-serif'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(r.id, cx, cy)

        // 名称
        ctx.fillStyle = '#94a3b8'
        ctx.font = '9px sans-serif'
        ctx.fillText(r.name, cx, cy - cellH * 0.6)

        // 电量槽
        const batW = cellW * 0.8
        const batH = 2.5
        const bx = cx - batW / 2
        const by = cy + cellH * 0.6 + 2
        ctx.fillStyle = '#334155'
        ctx.fillRect(bx, by, batW, batH)
        const batColor = r.battery > 50 ? '#10b981' : r.battery > 20 ? '#f59e0b' : '#ef4444'
        ctx.fillStyle = batColor
        ctx.fillRect(bx, by, batW * (r.battery / 100), batH)
      })

      // 悬停高亮
      if (hoveredCell) {
        const [hx, hy] = hoveredCell
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)'
        ctx.lineWidth = 1.5
        ctx.strokeRect(hx * cellW + 1, hy * cellH + 1, cellW - 2, cellH - 2)
      }

      dashOffset = (dashOffset + 0.3) % 24
      animationId = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(animationId)
  }, [robots, tasks, paths, conflicts, mapData, hoveredCell, cellW, cellH, obsSet])

  const getCell = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const scaleX = W / rect.width
    const scaleY = H / rect.height
    const mx = (e.clientX - rect.left) * scaleX
    const my = (e.clientY - rect.top) * scaleY
    const cx = Math.floor(mx / cellW)
    const cy = Math.floor(my / cellH)
    if (cx >= 0 && cx < mapData.cols && cy >= 0 && cy < mapData.rows) return [cx, cy]
    return null
  }, [mapData, cellW, cellH])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">院区调度仿真</h1>
        <div className="flex gap-2">
          <button onClick={toggleSimulation} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm text-white transition ${simulationRunning ? 'bg-amber-600 hover:bg-amber-500' : 'bg-blue-600 hover:bg-blue-500'}`}>
            {simulationRunning ? <Pause size={14} /> : <Play size={14} />}{simulationRunning ? '暂停仿真' : '运行调度'}
          </button>
          <button onClick={stepSimulation} disabled={simulationRunning || !hasActiveWork} title={!hasActiveWork ? '请先运行调度生成执行中任务' : undefined} className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded text-sm hover:bg-indigo-500 transition disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500">
            <SkipForward size={14} />推进一步
          </button>
          <button onClick={handleReset} className="flex items-center gap-1.5 bg-slate-700 text-slate-300 px-3 py-1.5 rounded text-sm hover:bg-slate-600 transition">
            <RotateCcw size={14} />重置仿真
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Canvas 地图 */}
        <div className="bg-slate-900 rounded-lg p-3 sm:p-4 border border-slate-700/60 xl:col-span-9">
          <canvas
            ref={canvasRef}
            onMouseMove={(e) => setHoveredCell(getCell(e))}
            onMouseLeave={() => setHoveredCell(null)}
            className="w-full rounded border border-slate-800 cursor-crosshair"
            style={{ aspectRatio: '3/2' }}
          />
          {hoveredCell && (
            <div className="mt-2 text-xs text-slate-500 bg-slate-800/40 rounded p-2 flex items-center gap-2">
              <span>坐标:</span>
              <span className="font-mono text-white">({hoveredCell[0]}, {hoveredCell[1]})</span>
              {obsSet.has(`${hoveredCell[0]},${hoveredCell[1]}`) && <span className="text-slate-500">| 障碍物</span>}
            </div>
          )}
          <div className="flex gap-4 mt-2 text-xs text-slate-500 flex-wrap">
            <span><span className="inline-block w-3 h-3 rounded bg-emerald-500 mr-1" />空闲机器人</span>
            <span><span className="inline-block w-3 h-3 rounded bg-blue-500 mr-1" />执行中</span>
            <span><span className="inline-block w-3 h-3 rounded bg-amber-500 mr-1" />充电中</span>
            <span><span className="inline-block w-3 h-3 rounded bg-red-500 mr-1" />故障/暂停</span>
            <span><span className="inline-block w-3 h-3 rounded bg-indigo-500 mr-1" />科室</span>
            <span><span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1 animate-pulse" />冲突点</span>
            <span><span className="inline-block w-3 h-2 rounded-full bg-green-500/40 mr-1 border border-green-500" />起点</span>
            <span><span className="inline-block w-3 h-2 rounded-full bg-red-500/40 mr-1 border border-red-500" />终点</span>
          </div>
        </div>

        {/* 右侧面板 */}
        <div className="space-y-4 xl:col-span-3">
          {/* 状态栏 */}
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700/60 space-y-2">
            <h3 className="text-sm font-bold text-white mb-2">仿真状态</h3>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">机器人</span>
              <span className="text-white font-medium">{robots.length} 台</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">执行中任务</span>
              <span className="text-blue-400 font-medium">{tasks.filter(t => t.status === '执行中').length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">规划路径</span>
              <span className="text-emerald-400 font-medium">{Object.keys(paths).length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">冲突检测</span>
              <span className={`font-medium ${conflicts.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{conflicts.length}</span>
            </div>
          </div>

          {/* 冲突处理 */}
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700/60">
            <h3 className="text-sm font-bold text-white mb-2">冲突处理记录</h3>
            {conflictDetails.length === 0 ? (
              <p className="text-xs text-slate-600">当前无冲突</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {conflictDetails.map((cd, i) => (
                  <div key={i} className="bg-slate-800/60 rounded p-2 text-xs border border-red-700/20">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      <span className="text-red-400 font-medium">{cd.type}</span>
                    </div>
                    <div className="text-slate-500">位置: <span className="text-slate-300">{cd.location}</span></div>
                    <div className="text-slate-500">涉及: <span className="text-slate-300">{cd.agents}</span></div>
                    <div className="text-slate-500">策略: <span className="text-amber-400">{cd.strategy}</span></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 机器人位置列表 */}
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700/60">
            <h3 className="text-sm font-bold text-white mb-2">机器人位置</h3>
            <div className="space-y-1.5">
              {robots.map(r => (
                <div key={r.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-800 last:border-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${r.status === 'busy' ? 'bg-blue-500' : r.status === 'charging' ? 'bg-amber-500' : r.status === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                    <span className="text-slate-300">{r.id}</span>
                  </div>
                  <span className="text-slate-600 font-mono">[{r.pos.map(n=>Math.round(n)).join(',')}]</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
