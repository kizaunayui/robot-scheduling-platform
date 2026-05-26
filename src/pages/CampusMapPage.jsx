import { useState } from 'react'
import { useAppStore } from '../store/AppStore'
import { mapFloors } from '../data/mapData'
import HospitalMap from '../components/HospitalMap'
import { findMultiplePaths } from '../utils/scheduling'

export default function CampusMapPage() {
  const { robots, tasks } = useAppStore()
  const [floor, setFloor] = useState('1F')
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [startNode, setStartNode] = useState('')
  const [endNode, setEndNode] = useState('')

  const handlePlanPath = () => {
    if (!startNode || !endNode) return
    const routes = findMultiplePaths(startNode, endNode)
    setSelectedRoute(routes.routeA)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">🗺️ 院区地图</h1>

      {/* 楼层切换 */}
      <div className="flex gap-2">
        {mapFloors.map(f => (
          <button
            key={f.id}
            onClick={() => { setFloor(f.id); setSelectedRoute(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              floor === f.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {f.name} - {f.description}
          </button>
        ))}
      </div>

      {/* 路径规划工具栏 */}
      <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 flex items-center gap-4">
        <span className="text-sm text-slate-300">快速路径规划：</span>
        <input
          placeholder="起点节点ID (如 1F-pharmacy)"
          value={startNode}
          onChange={e => setStartNode(e.target.value)}
          className="bg-slate-800 text-white text-sm px-3 py-1.5 rounded border border-slate-600 w-48"
        />
        <span className="text-slate-500">→</span>
        <input
          placeholder="终点节点ID (如 1F-elevator)"
          value={endNode}
          onChange={e => setEndNode(e.target.value)}
          className="bg-slate-800 text-white text-sm px-3 py-1.5 rounded border border-slate-600 w-48"
        />
        <button onClick={handlePlanPath} className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-500">
          规划路径
        </button>
        {selectedRoute && (
          <button onClick={() => setSelectedRoute(null)} className="bg-slate-700 text-slate-300 px-3 py-1.5 rounded text-sm hover:bg-slate-600">
            清除路径
          </button>
        )}
      </div>

      {/* 地图 */}
      <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
        <HospitalMap
          floor={floor}
          robots={robots}
          selectedRoute={selectedRoute}
          tasks={tasks}
          onNodeClick={(n) => setStartNode(n.id)}
          onRobotClick={(r) => {}}
        />
      </div>
    </div>
  )
}
