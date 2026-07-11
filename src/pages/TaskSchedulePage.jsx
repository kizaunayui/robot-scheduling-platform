import { useState } from 'react'
import { useAppStore } from '../store/AppStore'
import { taskTypeNames, taskStatusConfig, gridMap } from '../data/mapData'
import { Plus, Send, Zap, X, CheckCircle, ChevronRight } from 'lucide-react'

const priorityColors = { 3: 'text-red-400', 2: 'text-yellow-400', 1: 'text-green-400' }
const priorityLabels = { 3: '高', 2: '中', 1: '低' }

export default function TaskSchedulePage() {
  const { tasks, dispatchTask, dispatchExistingTask, rushTask, cancelTask, completeTask, getRecommendation } = useAppStore()
  const [filter, setFilter] = useState('ALL')
  const [newTask, setNewTask] = useState({ type: 'medicine', start: '药房', end: '住院区A', weight: 3, priority: 1 })
  const [formError, setFormError] = useState('')

  const locationNames = Object.keys(gridMap.locations)

  const filtered = tasks
    .filter(t => filter === 'ALL' || t.status === filter)
    .sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id))

  const handleCreate = () => {
    if (newTask.start === newTask.end) {
      setFormError('起点和终点不能相同，请重新选择。')
      return
    }
    if (Number(newTask.weight) < 1 || Number(newTask.weight) > 30) {
      setFormError('任务重量需在 1–30 kg 之间。')
      return
    }
    dispatchTask(newTask)
    setFormError('')
    setNewTask({ type: 'medicine', start: '药房', end: '住院区A', weight: 3, priority: 1 })
  }

  // 获取每条待派发任务的推荐信息
  const getTaskRecommendation = (task) => {
    if (task.status !== '待派发' && task.status !== '加急') return null
    return getRecommendation(task)
  }

  const taskTypes = [
    { key: 'medicine', label: '药品配送' },
    { key: 'specimen', label: '标本送检' },
    { key: 'instrument', label: '器械回收' },
    { key: 'linen', label: '被服运输' },
    { key: 'meal', label: '大件转运' },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">任务调度中心</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* 左侧：新建任务表单 */}
        <div className="space-y-4 xl:col-span-4">
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700/60">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Plus size={16} className="text-blue-400" />新建任务
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">任务类型</label>
                <select value={newTask.type} onChange={e => setNewTask(p => ({ ...p, type: e.target.value }))} className="w-full bg-slate-800 text-white text-sm px-3 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none">
                  {taskTypes.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">起点</label>
                  <select value={newTask.start} onChange={e => setNewTask(p => ({ ...p, start: e.target.value }))} className="w-full bg-slate-800 text-white text-sm px-3 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none">
                    {locationNames.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">终点</label>
                  <select value={newTask.end} onChange={e => setNewTask(p => ({ ...p, end: e.target.value }))} className="w-full bg-slate-800 text-white text-sm px-3 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none">
                    {locationNames.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">重量 (kg)</label>
                  <input type="number" min="1" max="30" value={newTask.weight} onChange={e => setNewTask(p => ({ ...p, weight: e.target.value }))} className="w-full bg-slate-800 text-white text-sm px-3 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">优先级</label>
                  <select value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: parseInt(e.target.value) }))} className="w-full bg-slate-800 text-white text-sm px-3 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none">
                    <option value={3}>高优先级</option>
                    <option value={2}>中优先级</option>
                    <option value={1}>低优先级</option>
                  </select>
                </div>
              </div>
              {formError && <p role="alert" className="rounded border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">{formError}</p>}
              <button onClick={handleCreate} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-500 transition font-medium">
                <Send size={14} />创建并派发
              </button>
            </div>
          </div>

          {/* 筛选器 */}
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700/60">
            <h3 className="text-xs font-bold text-slate-400 mb-3">状态筛选</h3>
            <div className="flex flex-wrap gap-2">
              {['ALL', '待派发', '加急', '执行中', '已暂停', '已完成', '已撤销'].map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`px-2.5 py-1 rounded text-xs transition ${filter === f ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                  {f === 'ALL' ? '全部' : f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：任务列表 */}
        <div className="space-y-3 xl:col-span-8">
          {filtered.length === 0 && (
            <div className="bg-slate-900 rounded-lg p-8 border border-slate-700/60 text-center text-slate-500">暂无任务</div>
          )}
          {filtered.map(task => {
            const sc = taskStatusConfig[task.status] || { label: task.status, color: 'bg-slate-600', text: 'text-slate-300' }
            const rec = getTaskRecommendation(task)
            return (
              <div key={task.id} className="bg-slate-900 rounded-lg p-4 border border-slate-700/60 hover:border-slate-600 transition">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-white font-bold text-sm">{task.id}</span>
                      <span className="text-slate-400 text-sm">{task.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs ${sc.color} ${sc.text}`}>{sc.label}</span>
                      <span className={`text-xs ${priorityColors[task.priority]}`}>{priorityLabels[task.priority]}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>{taskTypeNames[task.type] || task.type}</span>
                      <span>{task.start} → {task.end}</span>
                      <span>{task.weight}kg</span>
                      {task.robotId && <span className="text-blue-400">分配: {task.robotId}</span>}
                      {task.matchScore && <span className="text-slate-400">评分: {task.matchScore}</span>}
                    </div>

                    {/* 推荐信息 */}
                    {rec && (
                      <div className="mt-2 flex items-center gap-2 text-xs bg-slate-800/60 rounded px-2.5 py-1.5">
                        <ChevronRight size={12} className="text-blue-400" />
                        <span className="text-slate-400">推荐:</span>
                        <span className="text-blue-400 font-medium">{rec.robot.name}</span>
                        <span className="text-slate-500">({rec.reasons.join('、')})</span>
                      </div>
                    )}
                    {!rec && (task.status === '待派发' || task.status === '加急') && (
                      <div className="mt-2 rounded border border-amber-500/25 bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-300">
                        当前无匹配的空闲机器人，任务将保留在队列中。
                      </div>
                    )}

                    {/* 进度条 */}
                    {(task.status === '执行中' || task.status === '已暂停') && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 bg-slate-700 rounded-full h-1.5 max-w-xs">
                          <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${task.progress}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{task.progress}%</span>
                      </div>
                    )}
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex shrink-0 flex-wrap gap-1.5">
                    {(task.status === '待派发' || task.status === '加急') && (
                      <button onClick={() => dispatchExistingTask(task.id)} disabled={!rec} className="flex items-center gap-1 bg-blue-600 text-white px-2.5 py-1 rounded text-xs hover:bg-blue-500 transition disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500">
                        <Send size={12} />{rec ? '派发' : '暂无可用'}
                      </button>
                    )}
                    {task.status !== '已完成' && task.status !== '已撤销' && (
                      <button onClick={() => rushTask(task.id)} className="flex items-center gap-1 bg-amber-600 text-white px-2.5 py-1 rounded text-xs hover:bg-amber-500 transition">
                        <Zap size={12} />加急
                      </button>
                    )}
                    {task.status === '执行中' && (
                      <button onClick={() => completeTask(task.id)} className="flex items-center gap-1 bg-emerald-600 text-white px-2.5 py-1 rounded text-xs hover:bg-emerald-500 transition">
                        <CheckCircle size={12} />完成
                      </button>
                    )}
                    {(task.status === '待派发' || task.status === '加急' || task.status === '执行中' || task.status === '已暂停') && (
                      <button onClick={() => cancelTask(task.id)} className="flex items-center gap-1 bg-slate-700 text-slate-300 px-2.5 py-1 rounded text-xs hover:bg-slate-600 transition">
                        <X size={12} />撤销
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
