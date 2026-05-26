import { useState } from 'react'
import { useAppStore } from '../store/AppStore'
import { taskTypeNames, taskStatusConfig, gridMap } from '../data/mapData'

const priorityColors = { 3: 'text-red-400', 2: 'text-yellow-400', 1: 'text-green-400' }
const priorityLabels = { 3: '高', 2: '中', 1: '低' }

export default function TaskQueuePage() {
  const { tasks, robots, dispatchTask, rushTask, cancelTask, progressTask, completeTask } = useAppStore()
  const [filter, setFilter] = useState('ALL')
  const [sort, setSort] = useState('priority')
  const [showCreate, setShowCreate] = useState(false)
  const [newTask, setNewTask] = useState({ type: 'medicine', start: '药房', end: '住院区A', weight: 3, priority: 1 })

  const locationNames = Object.keys(gridMap.locations)

  const filtered = tasks
    .filter(t => filter === 'ALL' || t.status === filter)
    .sort((a, b) => {
      if (sort === 'priority') return b.priority - a.priority
      if (sort === 'status') {
        const order = { '执行中': 0, '加急': 1, '待派发': 2, '已完成': 3, '已撤销': 4 }
        return (order[a.status] ?? 5) - (order[b.status] ?? 5)
      }
      return a.id.localeCompare(b.id)
    })

  const handleCreate = () => {
    dispatchTask(newTask)
    setShowCreate(false)
    setNewTask({ type: 'medicine', start: '药房', end: '住院区A', weight: 3, priority: 1 })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">📋 任务队列管理</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowCreate(!showCreate)} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-500">
            + 创建任务
          </button>
        </div>
      </div>

      {/* 创建任务表单 */}
      {showCreate && (
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <h3 className="text-sm font-bold text-white mb-3">创建新任务（自动推荐机器人）</h3>
          <div className="grid grid-cols-5 gap-3">
            <select value={newTask.type} onChange={e => setNewTask(p => ({ ...p, type: e.target.value }))} className="bg-slate-800 text-white text-sm px-3 py-2 rounded border border-slate-600">
              {Object.entries(taskTypeNames).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={newTask.start} onChange={e => setNewTask(p => ({ ...p, start: e.target.value }))} className="bg-slate-800 text-white text-sm px-3 py-2 rounded border border-slate-600">
              {locationNames.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <select value={newTask.end} onChange={e => setNewTask(p => ({ ...p, end: e.target.value }))} className="bg-slate-800 text-white text-sm px-3 py-2 rounded border border-slate-600">
              {locationNames.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <input type="number" min="1" max="30" value={newTask.weight} onChange={e => setNewTask(p => ({ ...p, weight: e.target.value }))} className="bg-slate-800 text-white text-sm px-3 py-2 rounded border border-slate-600" placeholder="重量(kg)" />
            <select value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: parseInt(e.target.value) }))} className="bg-slate-800 text-white text-sm px-3 py-2 rounded border border-slate-600">
              <option value={3}>高优先级</option>
              <option value={2}>中优先级</option>
              <option value={1}>低优先级</option>
            </select>
          </div>
          <button onClick={handleCreate} className="mt-3 bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-500">确认创建并派发</button>
        </div>
      )}

      {/* 筛选排序 */}
      <div className="flex gap-3">
        {['ALL', '待派发', '加急', '执行中', '已完成', '已撤销'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded text-xs ${filter === f ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
            {f === 'ALL' ? '全部' : f}
          </button>
        ))}
        <select value={sort} onChange={e => setSort(e.target.value)} className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded border border-slate-600 ml-auto">
          <option value="priority">按优先级</option>
          <option value="status">按状态</option>
        </select>
      </div>

      {/* 任务列表 */}
      <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800 text-slate-400 text-xs">
              <th className="px-4 py-3 text-left">任务ID</th>
              <th className="px-4 py-3 text-left">类型</th>
              <th className="px-4 py-3 text-left">名称</th>
              <th className="px-4 py-3 text-left">起止点</th>
              <th className="px-4 py-3 text-left">重量</th>
              <th className="px-4 py-3 text-left">优先级</th>
              <th className="px-4 py-3 text-left">状态</th>
              <th className="px-4 py-3 text-left">机器人</th>
              <th className="px-4 py-3 text-left">评分</th>
              <th className="px-4 py-3 text-left">进度</th>
              <th className="px-4 py-3 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(task => {
              const sc = taskStatusConfig[task.status] || { label: task.status, color: 'bg-slate-600', text: 'text-slate-300' }
              return (
                <tr key={task.id} className="border-t border-slate-800 hover:bg-slate-800/50">
                  <td className="px-4 py-3 text-white font-mono">{task.id}</td>
                  <td className="px-4 py-3 text-slate-300">{taskTypeNames[task.type] || task.type}</td>
                  <td className="px-4 py-3 text-slate-300">{task.name}</td>
                  <td className="px-4 py-3 text-slate-300">{task.start} → {task.end}</td>
                  <td className="px-4 py-3 text-slate-400">{task.weight}kg</td>
                  <td className={`px-4 py-3 font-medium ${priorityColors[task.priority]}`}>{priorityLabels[task.priority]}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${sc.color} ${sc.text}`}>{sc.label}</span></td>
                  <td className="px-4 py-3 text-slate-300">{task.robotId || '-'}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{task.matchScore ? `${task.matchScore}` : '-'}</td>
                  <td className="px-4 py-3">
                    <div className="w-20 bg-slate-700 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${task.progress}%` }} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {(task.status === '待派发' || task.status === '加急') && (
                        <button onClick={() => dispatchTask({ type: task.type, name: task.name, start: task.start, end: task.end, weight: task.weight, priority: task.priority })} className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-500">派发</button>
                      )}
                      {task.status !== '已完成' && task.status !== '已撤销' && (
                        <button onClick={() => rushTask(task.id)} className="bg-orange-600 text-white px-2 py-1 rounded text-xs hover:bg-orange-500">加急</button>
                      )}
                      {task.status === '执行中' && (
                        <button onClick={() => progressTask(task.id)} className="bg-indigo-600 text-white px-2 py-1 rounded text-xs hover:bg-indigo-500">推进</button>
                      )}
                      {task.status === '执行中' && (
                        <button onClick={() => completeTask(task.id)} className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-500">完成</button>
                      )}
                      {(task.status === '待派发' || task.status === '加急' || task.status === '执行中') && (
                        <button onClick={() => cancelTask(task.id)} className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs hover:bg-slate-600">撤销</button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
