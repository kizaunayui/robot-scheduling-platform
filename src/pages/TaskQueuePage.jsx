import { useState } from 'react'
import { useAppStore } from '../store/AppStore'

const statusColors = {
  PENDING: 'bg-slate-700 text-slate-300',
  IN_PROGRESS: 'bg-blue-900 text-blue-300',
  COMPLETED: 'bg-green-900 text-green-300',
  ERROR: 'bg-red-900 text-red-300',
}
const statusLabels = { PENDING: '待执行', IN_PROGRESS: '执行中', COMPLETED: '已完成', ERROR: '异常' }
const priorityColors = { HIGH: 'text-red-400', MEDIUM: 'text-yellow-400', LOW: 'text-green-400' }
const priorityLabels = { HIGH: '高', MEDIUM: '中', LOW: '低' }

export default function TaskQueuePage() {
  const { tasks, addTask, updateTask, dispatchTask, robots, addLog } = useAppStore()
  const [filter, setFilter] = useState('ALL')
  const [sort, setSort] = useState('priority')
  const [showCreate, setShowCreate] = useState(false)
  const [newTask, setNewTask] = useState({ taskType: '药品配送', startLocation: '', endLocation: '', priority: 'MEDIUM' })

  const filtered = tasks
    .filter(t => filter === 'ALL' || t.status === filter)
    .sort((a, b) => {
      if (sort === 'priority') {
        const order = { HIGH: 0, MEDIUM: 1, LOW: 2 }
        return (order[a.priority] || 2) - (order[b.priority] || 2)
      }
      if (sort === 'status') {
        const order = { IN_PROGRESS: 0, PENDING: 1, ERROR: 2, COMPLETED: 3 }
        return (order[a.status] || 3) - (order[b.status] || 3)
      }
      return a.taskId.localeCompare(b.taskId)
    })

  const handleCreate = () => {
    if (!newTask.startLocation || !newTask.endLocation) return
    const task = {
      taskId: `T${String(tasks.length + 1).padStart(3, '0')}`,
      ...newTask,
      status: 'PENDING',
      assignedRobot: null,
      createTime: new Date().toLocaleString(),
      estimatedFinishTime: '-',
      progress: 0,
    }
    addTask(task)
    addLog({ robotId: '-', taskType: task.taskType, action: '任务创建', detail: `${task.startLocation}→${task.endLocation}`, status: '成功', operator: '手动创建' })
    setShowCreate(false)
    setNewTask({ taskType: '药品配送', startLocation: '', endLocation: '', priority: 'MEDIUM' })
  }

  const handleDispatch = (taskId) => {
    dispatchTask(taskId)
    addLog({ robotId: '-', taskType: '-', action: '任务派发', detail: `派发任务${taskId}`, status: '成功', operator: '系统自动' })
  }

  const handleUrgent = (taskId) => {
    updateTask(taskId, { priority: 'HIGH' })
    addLog({ robotId: '-', taskType: '-', action: '加急处理', detail: `任务${taskId}升级为高优先级`, status: '成功', operator: '手动操作' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">📋 任务队列管理</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-500">
          + 创建任务
        </button>
      </div>

      {/* 创建任务表单 */}
      {showCreate && (
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <h3 className="text-sm font-bold text-white mb-3">创建新任务</h3>
          <div className="grid grid-cols-4 gap-3">
            <select value={newTask.taskType} onChange={e => setNewTask(p => ({ ...p, taskType: e.target.value }))} className="bg-slate-800 text-white text-sm px-3 py-2 rounded border border-slate-600">
              {['药品配送', '样本转运', '器械运输', '医疗废物处理'].map(t => <option key={t}>{t}</option>)}
            </select>
            <input placeholder="起点" value={newTask.startLocation} onChange={e => setNewTask(p => ({ ...p, startLocation: e.target.value }))} className="bg-slate-800 text-white text-sm px-3 py-2 rounded border border-slate-600" />
            <input placeholder="终点" value={newTask.endLocation} onChange={e => setNewTask(p => ({ ...p, endLocation: e.target.value }))} className="bg-slate-800 text-white text-sm px-3 py-2 rounded border border-slate-600" />
            <select value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))} className="bg-slate-800 text-white text-sm px-3 py-2 rounded border border-slate-600">
              <option value="HIGH">高优先级</option>
              <option value="MEDIUM">中优先级</option>
              <option value="LOW">低优先级</option>
            </select>
          </div>
          <button onClick={handleCreate} className="mt-3 bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-500">确认创建</button>
        </div>
      )}

      {/* 筛选排序 */}
      <div className="flex gap-3">
        {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'ERROR'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded text-xs ${filter === f ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
            {f === 'ALL' ? '全部' : statusLabels[f]}
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
              <th className="px-4 py-3 text-left">起止点</th>
              <th className="px-4 py-3 text-left">优先级</th>
              <th className="px-4 py-3 text-left">状态</th>
              <th className="px-4 py-3 text-left">机器人</th>
              <th className="px-4 py-3 text-left">进度</th>
              <th className="px-4 py-3 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(task => (
              <tr key={task.taskId} className="border-t border-slate-800 hover:bg-slate-800/50">
                <td className="px-4 py-3 text-white">{task.taskId}</td>
                <td className="px-4 py-3 text-slate-300">{task.taskType}</td>
                <td className="px-4 py-3 text-slate-300">{task.startLocation} → {task.endLocation}</td>
                <td className={`px-4 py-3 font-medium ${priorityColors[task.priority]}`}>{priorityLabels[task.priority]}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${statusColors[task.status]}`}>{statusLabels[task.status]}</span></td>
                <td className="px-4 py-3 text-slate-300">{task.assignedRobot || '-'}</td>
                <td className="px-4 py-3">
                  <div className="w-20 bg-slate-700 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${task.progress}%` }} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {task.status === 'PENDING' && (
                      <button onClick={() => handleDispatch(task.taskId)} className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-500">派发</button>
                    )}
                    {task.status !== 'COMPLETED' && (
                      <button onClick={() => handleUrgent(task.taskId)} className="bg-orange-600 text-white px-2 py-1 rounded text-xs hover:bg-orange-500">加急</button>
                    )}
                    {task.status === 'PENDING' && (
                      <button onClick={() => updateTask(task.taskId, { status: 'COMPLETED', progress: 100 })} className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs hover:bg-slate-600">取消</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
