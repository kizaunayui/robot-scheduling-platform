import { useRef, useEffect, useState, useCallback } from 'react'
import { useAppStore } from '../store/AppStore'

export default function CampusMapPage() {
  const { robots, tasks, paths, conflicts, mapData } = useAppStore()
  const canvasRef = useRef(null)
  const [hoveredCell, setHoveredCell] = useState(null)

  // 机器人平滑运动与转向跟踪
  const robotVisualsRef = useRef({})

  const W = 960, H = 640
  const cellW = W / mapData.cols
  const cellH = H / mapData.rows

  // 障碍物和位置快速查找
  const obsSet = new Set(mapData.obstacles.map(o => `${o[0]},${o[1]}`))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = W
    canvas.height = H

    let animationId
    let dashOffset = 0

    const render = () => {
      // 1. 清空画布与背景 (现代暗色科幻蓝)
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, W, H)

      // 2. 网格线 (暗色调)
      ctx.strokeStyle = '#1e293b'
      ctx.lineWidth = 0.5
      for (let x = 0; x <= mapData.cols; x++) {
        ctx.beginPath(); ctx.moveTo(x * cellW, 0); ctx.lineTo(x * cellW, H); ctx.stroke()
      }
      for (let y = 0; y <= mapData.rows; y++) {
        ctx.beginPath(); ctx.moveTo(0, y * cellH); ctx.lineTo(W, y * cellH); ctx.stroke()
      }

      // 3. 绘制障碍物 (立体深色板)
      for (let x = 0; x < mapData.cols; x++) {
        for (let y = 0; y < mapData.rows; y++) {
          if (obsSet.has(`${x},${y}`)) {
            // 障碍物主体
            ctx.fillStyle = '#334155'
            ctx.fillRect(x * cellW + 1, y * cellH + 1, cellW - 2, cellH - 2)

            // 立体高亮边
            ctx.strokeStyle = '#475569'
            ctx.lineWidth = 1
            ctx.strokeRect(x * cellW + 1.5, y * cellH + 1.5, cellW - 3, cellH - 3)

            ctx.fillStyle = '#1e293b'
            ctx.fillRect(x * cellW + 1, y * cellH + cellH - 3, cellW - 2, 2)
          }
        }
      }

      // 4. 绘制科室位置标记 (带彩色发光圈)
      Object.entries(mapData.locations).forEach(([name, [lx, ly]]) => {
        const cx = lx * cellW + cellW / 2
        const cy = ly * cellH + cellH / 2

        // 半透明扩散圈
        ctx.fillStyle = 'rgba(99, 102, 241, 0.15)'
        ctx.beginPath()
        ctx.arc(cx, cy, cellW * 0.9, 0, Math.PI * 2)
        ctx.fill()

        // 核心区域
        ctx.fillStyle = '#6366f1'
        ctx.beginPath()
        ctx.roundRect(lx * cellW + 3, ly * cellH + 3, cellW - 6, cellH - 6, 4)
        ctx.fill()

        ctx.strokeStyle = '#818cf8'
        ctx.lineWidth = 1.5
        ctx.stroke()

        // 位置文字
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 11px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(name, cx, cy)
      });

      // 5. 任务连线 (起点到终点虚线，流动指示)
      tasks.filter(t => t.status === '执行中').forEach(t => {
        const startLoc = mapData.locations[t.start]
        const endLoc = mapData.locations[t.end]
        if (startLoc && endLoc) {
          ctx.strokeStyle = '#f59e0b'
          ctx.lineWidth = 1.2
          ctx.globalAlpha = 0.4
          ctx.setLineDash([5, 5])
          ctx.lineDashOffset = dashOffset
          ctx.beginPath()
          ctx.moveTo(startLoc[0] * cellW + cellW / 2, startLoc[1] * cellH + cellH / 2)
          ctx.lineTo(endLoc[0] * cellW + cellW / 2, endLoc[1] * cellH + cellH / 2)
          ctx.stroke()
          ctx.setLineDash([])
          ctx.globalAlpha = 1
        }
      });

      // 6. 路径流光高亮 (Animated Dash Path)
      const pathColors = ['#10b981', '#3b82f6', '#ef4444', '#f59e0b']
      Object.entries(paths).forEach(([robotId, path], idx) => {
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
      });

      // 7. 冲突点 (闪烁红色光晕)
      conflicts.forEach(c => {
        if (c.loc) {
          const cx = c.loc[0] * cellW + cellW / 2
          const cy = c.loc[1] * cellH + cellH / 2
          
          // 呼吸圈
          const scale = 1 + 0.3 * Math.sin(Date.now() / 150)
          ctx.fillStyle = '#ef4444'
          ctx.globalAlpha = 0.25
          ctx.beginPath()
          ctx.arc(cx, cy, 14 * scale, 0, Math.PI * 2)
          ctx.fill()
          
          // 中心感叹号圆圈
          ctx.globalAlpha = 0.9
          ctx.beginPath()
          ctx.arc(cx, cy, 9, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = 1

          ctx.fillStyle = '#fff'
          ctx.font = 'bold 11px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('!', cx, cy)
        }
      });

      // 8. 机器人平滑运动与车体渲染
      robots.forEach((r) => {
        const [targetX, targetY] = r.pos

        // 初始化视觉位置
        if (!robotVisualsRef.current[r.id]) {
          robotVisualsRef.current[r.id] = { x: targetX, y: targetY, angle: 0 }
        }
        const vis = robotVisualsRef.current[r.id]

        const dx = targetX - vis.x
        const dy = targetY - vis.y

        // 位置 Lerp 插值
        vis.x += dx * 0.08
        vis.y += dy * 0.08

        // 方向角度插值
        if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
          const targetAngle = Math.atan2(dy, dx)
          let diff = targetAngle - vis.angle
          while (diff < -Math.PI) diff += Math.PI * 2
          while (diff > Math.PI) diff -= Math.PI * 2
          vis.angle += diff * 0.15
        }

        const cx = vis.x * cellW + cellW / 2
        const cy = vis.y * cellH + cellH / 2

        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(vis.angle)

        // 区分状态颜色
        const isBusy = r.status === 'busy'
        const isCharging = r.status === 'charging'
        const isPaused = r.status === 'paused'
        const color = isBusy ? '#3b82f6' : isCharging ? '#eab308' : isPaused ? '#ef4444' : '#10b981'

        // 机器人发光底座阴影
        ctx.shadowColor = color
        ctx.shadowBlur = isBusy ? 8 + 3 * Math.sin(Date.now() / 150) : 5

        // 机器人矩形车体
        ctx.fillStyle = '#1e293b'
        ctx.beginPath()
        ctx.roundRect(-cellW * 0.42, -cellH * 0.38, cellW * 0.84, cellH * 0.76, 4)
        ctx.fill()

        ctx.shadowBlur = 0

        // 上层控制面板
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.roundRect(-cellW * 0.25, -cellH * 0.25, cellW * 0.5, cellH * 0.5, 3)
        ctx.fill()

        // 车头前灯
        ctx.fillStyle = '#fde047'
        ctx.beginPath()
        ctx.moveTo(cellW * 0.38, -cellH * 0.15)
        ctx.lineTo(cellW * 0.46, 0)
        ctx.lineTo(cellW * 0.38, cellH * 0.15)
        ctx.closePath()
        ctx.fill()

        ctx.restore()

        // 绘制标签与电量
        // ID 标号
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 9px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(r.id, cx, cy)

        // 悬浮名称
        ctx.fillStyle = '#94a3b8'
        ctx.font = '9px sans-serif'
        ctx.fillText(r.name, cx, cy - cellH * 0.6 - 3)

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
      });

      // 9. 鼠标悬停的高亮框
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

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [robots, tasks, paths, conflicts, mapData, hoveredCell])

  // 坐标转换与交互
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

  const handleMouseMove = useCallback((e) => {
    const cell = getCell(e)
    setHoveredCell(cell)
  }, [getCell])

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
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredCell(null)}
          className="w-full rounded cursor-pointer border border-slate-800"
          style={{ aspectRatio: '3/2' }}
        />
        
        {/* 鼠标位置提示 */}
        {hoveredCell && (
          <div className="mt-2 text-xs text-slate-400 bg-slate-950/40 rounded p-2 border border-slate-800/50 flex items-center gap-2">
            <span>📍 鼠标网格坐标: </span>
            <span className="font-mono text-white font-bold">({hoveredCell[0]}, {hoveredCell[1]})</span>
            {obsSet.has(`${hoveredCell[0]},${hoveredCell[1]}`) && <span className="text-slate-500 font-medium">| 🚧 障碍物实体</span>}
            {!obsSet.has(`${hoveredCell[0]},${hoveredCell[1]}`) && <span className="text-green-400 font-medium">| 🟢 可行使车道</span>}
          </div>
        )}

        <div className="flex gap-4 mt-3 text-xs text-slate-400 flex-wrap">
          <span><span className="inline-block w-3 h-3 rounded bg-emerald-500 mr-1" />待机中机器人</span>
          <span><span className="inline-block w-3 h-3 rounded bg-blue-500 mr-1" />执行中机器人</span>
          <span><span className="inline-block w-3 h-3 rounded bg-yellow-500 mr-1" />充电中</span>
          <span><span className="inline-block w-3 h-3 rounded bg-red-500 mr-1" />暂停</span>
          <span><span className="inline-block w-3 h-3 rounded bg-indigo-500 mr-1" />科室位置标记</span>
          <span><span className="inline-block w-3 h-3 rounded bg-slate-600 mr-1" />固定障碍物</span>
          <span><span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1 animate-pulse" />冲突点区域</span>
          <span><span className="inline-block w-8 h-0.5 bg-amber-500 mr-1 opacity-40" style={{ borderBottom: '2px dashed #f59e0b' }} />任务直连指示线</span>
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
              <span className="text-slate-500 font-mono">[{r.pos.map(n=>Math.round(n)).join(',')}]</span>
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
                <span className="text-white font-bold">{t.name}</span>
                <span className="text-blue-400 font-mono font-bold">{t.robotId}</span>
              </div>
              <div className="text-slate-400">{t.start} → {t.end} | 进度 {t.progress}%</div>
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
