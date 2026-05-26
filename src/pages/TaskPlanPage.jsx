import { useState, useRef, useEffect } from 'react'
import { useAppStore } from '../store/AppStore'
import { mapNodes, mapEdges, mapAreas, nodeTypeColors, robotStatusNames, robotTypeColors } from '../data/mapData'
import { findMultiplePaths } from '../utils/scheduling'

const floors = ['1F', '2F', '3F']
const floorNames = { '1F': '一层', '2F': '二层', '3F': '三层' }

export default function TaskPlanPage() {
  const { robots, tasks, addTask, dispatchTask } = useAppStore()
  const [startId, setStartId] = useState('')
  const [endId, setEndId] = useState('')
  const [selectedFloor, setSelectedFloor] = useState('1F')
  const [routes, setRoutes] = useState(null)
  const [message, setMessage] = useState('')
  const [taskType, setTaskType] = useState('药品配送')
  const [priority, setPriority] = useState('MEDIUM')
  const canvasRef = useRef(null)

  const selectableNodes = mapNodes.filter(n => !n.id.includes('corridor'))

  const handlePlan = () => {
    if (!startId || !endId) { setMessage('请选择起终点'); return }
    if (startId === endId) { setMessage('起终点不能相同'); return }
    const result = findMultiplePaths(startId, endId)
    setRoutes(result)
    setMessage('✅ 路径规划完成')
    setTimeout(() => setMessage(''), 3000)
  }

  const handleCreateTask = (route) => {
    const startNode = mapNodes.find(n => n.id === startId)
    const endNode = mapNodes.find(n => n.id === endId)
    const newTask = {
      taskId: `T${String(tasks.length + 1).padStart(3, '0')}`,
      taskType,
      startLocation: startNode?.name || startId,
      endLocation: endNode?.name || endId,
      priority,
      status: 'PENDING',
      assignedRobot: null,
      createTime: new Date().toLocaleString('zh-CN', { hour12: false }),
      progress: 0,
    }
    addTask(newTask)
    setMessage(`✅ 任务 ${newTask.taskId} 已创建`)
    setTimeout(() => setMessage(''), 3000)
  }

  // Canvas 地图绘制
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = 700, H = 500
    canvas.width = W
    canvas.height = H

    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, W, H)

    const scale = 0.55
    const offsetX = 20, offsetY = 20
    const nodesF = mapNodes.filter(n => n.floor === selectedFloor)
    const edgesF = mapEdges.filter(e => e.floor === selectedFloor)
    const areasF = mapAreas.filter(a => a.floor === selectedFloor)
    const nodeMap = new Map(mapNodes.map(n => [n.id, n]))

    // 区域块
    areasF.forEach(a => {
      ctx.fillStyle = a.color || '#1e293b'
      ctx.globalAlpha = 0.2
      ctx.fillRect(a.x * scale + offsetX, a.y * scale + offsetY, a.w * scale, a.h * scale)
      ctx.globalAlpha = 1
      ctx.strokeStyle = '#334155'
      ctx.lineWidth = 1
      ctx.strokeRect(a.x * scale + offsetX, a.y * scale + offsetY, a.w * scale, a.h * scale)
      ctx.fillStyle = '#64748b'
      ctx.font = '11px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(a.name, (a.x + a.w / 2) * scale + offsetX, (a.y + a.h / 2) * scale + offsetY)
    })

    // 边
    edgesF.forEach(e => {
      const from = nodeMap.get(e.from)
      const to = nodeMap.get(e.to)
      if (!from || !to) return
      ctx.strokeStyle = e.isElevator ? '#f59e0b' : '#334155'
      ctx.lineWidth = e.isElevator ? 2 : 1
      ctx.setLineDash(e.isElevator ? [4, 4] : [])
      ctx.beginPath()
      ctx.moveTo(from.x * scale + offsetX, from.y * scale + offsetY)
      ctx.lineTo(to.x * scale + offsetX, to.y * scale + offsetY)
      ctx.stroke()
      ctx.setLineDash([])
    })

    // 路径高亮
    if (routes?.routeA?.path) {
      const drawRoute = (route, color) => {
        if (!route?.path) return
        ctx.strokeStyle = color
        ctx.lineWidth = 3
        ctx.setLineDash([6, 4])
        ctx.beginPath()
        route.path.forEach((nid, i) => {
          const n = nodeMap.get(nid)
          if (!n) return
          if (i === 0) ctx.moveTo(n.x * scale + offsetX, n.y * scale + offsetY)
          else ctx.lineTo(n.x * scale + offsetX, n.y * scale + offsetY)
        })
        ctx.stroke()
        ctx.setLineDash([])
      }
      drawRoute(routes.routeA, '#22c55e')
      if (routes.routeB?.reachable) drawRoute(routes.routeB, '#3b82f6')
      if (routes.routeC?.reachable) drawRoute(routes.routeC, '#ef4444')
    }

    // 节点
    nodesF.forEach(n => {
      const x = n.x * scale + offsetX, y = n.y * scale + offsetY
      const isSelected = n.id === startId || n.id === endId
      ctx.fillStyle = isSelected ? '#f59e0b' : (nodeTypeColors[n.type] || '#64748b')
      ctx.beginPath()
      ctx.arc(x, y, isSelected ? 8 : 5, 0, Math.PI * 2)
      ctx.fill()
      if (isSelected) {
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()
      }
      ctx.fillStyle = '#94a3b8'
      ctx.font = '9px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(n.name, x, y + 14)
    })
  }, [selectedFloor, routes, startId, endId])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">📐 任务规划</h1>
      {message && <div className="p-2 bg-green-900/50 text-green-300 rounded text-sm">{message}</div>}

      <div className="grid grid-cols-4 gap-3">
        <div>
          <label className="text-sm text-slate-400 mb-1 block">起点</label>
          <select value={startId} onChange={e => setStartId(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white">
            <option value="">选择起点</option>
            {selectableNodes.map(n => <option key={n.id} value={n.id}>{n.name} ({n.floor})</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm text-slate-400 mb-1 block">终点</label>
          <select value={endId} onChange={e => setEndId(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white">
            <option value="">选择终点</option>
            {selectableNodes.map(n => <option key={n.id} value={n.id}>{n.name} ({n.floor})</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm text-slate-400 mb-1 block">任务类型</label>
          <select value={taskType} onChange={e => setTaskType(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white">
            {['药品配送', '样本转运', '器械运输', '医疗废物处理'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm text-slate-400 mb-1 block">优先级</label>
          <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white">
            <option value="HIGH">高</option>
            <option value="MEDIUM">中</option>
            <option value="LOW">低</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={handlePlan} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">🔍 路径规划</button>
        <div className="flex gap-1">
          {floors.map(f => (
            <button key={f} onClick={() => setSelectedFloor(f)} className={`px-3 py-2 rounded text-sm ${selectedFloor === f ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>{floorNames[f]}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-slate-900 rounded-lg p-4 border border-slate-700">
          <canvas ref={canvasRef} className="w-full rounded" style={{ aspectRatio: '7/5' }} />
          <div className="flex gap-3 mt-2 text-xs text-slate-400">
            <span><span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1" />最优路径A</span>
            <span><span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-1" />备用路径B</span>
            <span><span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1" />应急路径C</span>
            <span><span className="inline-block w-3 h-3 rounded-full bg-amber-500 mr-1" />起终点</span>
          </div>
        </div>

        <div className="space-y-3">
          {routes && [routes.routeA, routes.routeB, routes.routeC].filter(Boolean).map((r, i) => (
            <div key={i} className={`bg-slate-800 rounded-lg p-3 border ${i === 0 ? 'border-green-500/50' : i === 1 ? 'border-blue-500/50' : 'border-red-500/50'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-white">{r.label}</span>
                <button onClick={() => handleCreateTask(r)} className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">创建任务</button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-slate-400">距离: <span className="text-white">{r.distance}m</span></div>
                <div className="text-slate-400">时间: <span className="text-white">{r.time}分钟</span></div>
                <div className="text-slate-400">电量: <span className="text-white">{r.energy}%</span></div>
                <div className="text-slate-400">风险: <span className={r.risk === 'high' ? 'text-red-400' : r.risk === 'medium' ? 'text-yellow-400' : 'text-green-400'}>{r.risk}</span></div>
              </div>
              <div className="mt-2 text-xs text-slate-500">{r.path?.map(id => mapNodes.find(n => n.id === id)?.name || id).join(' → ')}</div>
            </div>
          ))}
          {!routes && <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 text-center text-slate-500 text-sm">选择起终点后点击路径规划</div>}
        </div>
      </div>
    </div>
  )
}
