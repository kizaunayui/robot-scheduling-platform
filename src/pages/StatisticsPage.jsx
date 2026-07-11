import { useState, useMemo } from 'react'
import { useAppStore } from '../store/AppStore'
import { taskTypeNames, taskStatusConfig } from '../data/mapData'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { FileJson, FileSpreadsheet } from 'lucide-react'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function StatisticsPage() {
  const { tasks, metrics, logs } = useAppStore()
  const [tab, setTab] = useState('charts')
  const [logKeyword, setLogKeyword] = useState('')
  const [logPage, setLogPage] = useState(1)
  const [taskPage, setTaskPage] = useState(1)
  const logPageSize = 10
  const taskPageSize = 8

  // 统计数据
  const stats = useMemo(() => {
    const completed = tasks.filter(t => t.status === '已完成').length
    const pending = tasks.filter(t => t.status === '待派发').length
    const inProgress = tasks.filter(t => t.status === '执行中').length
    const paused = tasks.filter(t => t.status === '已暂停').length
    const cancelled = tasks.filter(t => t.status === '已撤销').length
    return { completed, pending, inProgress, paused, cancelled, total: tasks.length }
  }, [tasks])

  const typeDistribution = useMemo(() => {
    const counts = {}
    tasks.forEach(t => { counts[t.type] = (counts[t.type] || 0) + 1 })
    return Object.entries(counts).map(([type, value]) => ({ name: taskTypeNames[type] || type, value }))
  }, [tasks])

  const statusData = [
    { name: '待派发', value: stats.pending },
    { name: '执行中', value: stats.inProgress },
    { name: '已暂停', value: stats.paused },
    { name: '已完成', value: stats.completed },
    { name: '已撤销', value: stats.cancelled },
  ]

  const robotWorkload = useMemo(() => {
    const counts = {}
    tasks.forEach(t => {
      if (t.robotId) counts[t.robotId] = (counts[t.robotId] || 0) + 1
    })
    return Object.entries(counts)
      .map(([id, count]) => ({ name: id, tasks: count }))
      .sort((a, b) => b.tasks - a.tasks)
  }, [tasks])

  // 日志筛选
  const filteredLogs = useMemo(() =>
    logKeyword ? logs.filter(l => l.message.includes(logKeyword)) : logs
  , [logs, logKeyword])

  const logTotalPages = Math.ceil(filteredLogs.length / logPageSize)
  const pagedLogs = filteredLogs.slice((logPage - 1) * logPageSize, logPage * logPageSize)

  const taskTotalPages = Math.ceil(tasks.length / taskPageSize)
  const pagedTasks = tasks.slice((taskPage - 1) * taskPageSize, taskPage * taskPageSize)

  const estimatedMakespan = metrics.makespan > 0 ? `${metrics.makespan} 步` : '--'

  // 导出功能
  const handleExportJSON = () => {
    const data = { tasks, logs, exportTime: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'scheduling_data.json'; a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportCSV = () => {
    const headers = ['时间', '操作内容']
    const rows = filteredLogs.map(l => [l.time, l.message])
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'scheduling_log.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-white">调度统计与日志</h1>
        <div className="flex gap-2">
          <button onClick={handleExportJSON} className="flex items-center gap-1.5 bg-slate-700 text-slate-300 px-3 py-1.5 rounded text-xs hover:bg-slate-600 transition">
            <FileJson size={14} />导出 JSON
          </button>
          <button onClick={handleExportCSV} className="flex items-center gap-1.5 bg-slate-700 text-slate-300 px-3 py-1.5 rounded text-xs hover:bg-slate-600 transition">
            <FileSpreadsheet size={14} />导出 CSV
          </button>
        </div>
      </div>

      {/* 核心指标 */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: '总任务', value: stats.total, color: 'text-blue-400' },
          { label: '执行中', value: stats.inProgress, color: 'text-indigo-400' },
          { label: '已完成', value: stats.completed, color: 'text-emerald-400' },
          { label: '冲突处理', value: `${metrics.conflictsResolved || 0}/${metrics.totalConflicts || 0}`, color: 'text-amber-400' },
          { label: '利用率', value: `${Math.round((metrics.utilization || 0) * 100)}%`, color: 'text-purple-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-900 rounded-lg p-3 border border-slate-700/60 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-slate-500 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 标签切换 */}
      <div className="flex gap-1 bg-slate-900 rounded-lg p-1 border border-slate-700/60 w-fit">
        {[{ key: 'charts', label: '图表分析' }, { key: 'tasks', label: '任务明细' }, { key: 'logs', label: '操作日志' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-1.5 rounded text-xs font-medium transition ${tab === t.key ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* 图表分析 */}
      {tab === 'charts' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700/60">
              <h3 className="text-sm font-bold text-white mb-3">任务类型分布</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={typeDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {typeDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700/60">
              <h3 className="text-sm font-bold text-white mb-3">任务状态分布</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700/60">
              <h3 className="text-sm font-bold text-white mb-3">机器人工作量排行</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={robotWorkload} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={50} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
                  <Bar dataKey="tasks" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700/60">
              <h3 className="text-sm font-bold text-white mb-3">关键调度指标</h3>
              <div className="space-y-3">
                {[
                  { label: '预计最长耗时', value: estimatedMakespan },
                  { label: '总调度成本', value: metrics.sumOfCosts || 0 },
                  { label: '最大完工时间', value: metrics.makespan || 0 },
                  { label: '冲突处理次数', value: `${metrics.conflictsResolved || 0}/${metrics.totalConflicts || 0}` },
                  { label: '任务完成率', value: stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}%` : '--' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center text-sm py-2 border-b border-slate-800 last:border-0">
                    <span className="text-slate-400">{item.label}</span>
                    <span className="text-white font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 任务明细 */}
      {tab === 'tasks' && (
        <div className="bg-slate-900 rounded-lg border border-slate-700/60 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-800">
              <tr>
                <th className="p-3 text-left text-slate-400 text-xs">ID</th>
                <th className="p-3 text-left text-slate-400 text-xs">类型</th>
                <th className="p-3 text-left text-slate-400 text-xs">名称</th>
                <th className="p-3 text-left text-slate-400 text-xs">起止点</th>
                <th className="p-3 text-left text-slate-400 text-xs">优先级</th>
                <th className="p-3 text-left text-slate-400 text-xs">状态</th>
                <th className="p-3 text-left text-slate-400 text-xs">机器人</th>
                <th className="p-3 text-left text-slate-400 text-xs">评分</th>
                <th className="p-3 text-left text-slate-400 text-xs">进度</th>
              </tr>
            </thead>
            <tbody>
              {pagedTasks.map(t => {
                const sc = taskStatusConfig[t.status] || { label: t.status, color: 'bg-slate-600' }
                return (
                  <tr key={t.id} className="border-t border-slate-700/30 hover:bg-slate-800/40">
                    <td className="p-3 text-white font-mono text-xs">{t.id}</td>
                    <td className="p-3 text-slate-300 text-xs">{taskTypeNames[t.type] || t.type}</td>
                    <td className="p-3 text-slate-300 text-xs">{t.name}</td>
                    <td className="p-3 text-slate-400 text-xs">{t.start} → {t.end}</td>
                    <td className="p-3 text-slate-300 text-xs">{t.priority === 3 ? '高' : t.priority === 2 ? '中' : '低'}</td>
                    <td className="p-3"><span className={`px-1.5 py-0.5 rounded text-xs text-white ${sc.color}`}>{sc.label}</span></td>
                    <td className="p-3 text-slate-400 text-xs">{t.robotId || '-'}</td>
                    <td className="p-3 text-slate-500 text-xs">{t.matchScore || '-'}</td>
                    <td className="p-3">
                      <div className="w-16 bg-slate-700 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${t.progress}%` }} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {taskTotalPages > 1 && (
            <div className="flex justify-center gap-2 p-3 bg-slate-800">
              <button disabled={taskPage <= 1} onClick={() => setTaskPage(p => p - 1)} className="px-3 py-1 bg-slate-700 text-slate-300 rounded disabled:opacity-50 text-xs">上一页</button>
              <span className="px-3 py-1 text-slate-400 text-xs">{taskPage} / {taskTotalPages}</span>
              <button disabled={taskPage >= taskTotalPages} onClick={() => setTaskPage(p => p + 1)} className="px-3 py-1 bg-slate-700 text-slate-300 rounded disabled:opacity-50 text-xs">下一页</button>
            </div>
          )}
        </div>
      )}

      {/* 操作日志 */}
      {tab === 'logs' && (
        <div className="space-y-3">
          <div className="bg-slate-900 rounded-lg p-3 border border-slate-700/60 flex gap-3 items-center">
            <input
              placeholder="搜索日志内容..."
              value={logKeyword}
              onChange={e => { setLogKeyword(e.target.value); setLogPage(1) }}
              className="bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-sm text-white flex-1 focus:border-blue-500 focus:outline-none"
            />
            <span className="text-xs text-slate-500">共 {filteredLogs.length} 条</span>
          </div>

          <div className="bg-slate-900 rounded-lg border border-slate-700/60 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-800">
                <tr>
                  <th className="p-3 text-left text-slate-400 text-xs w-24">时间</th>
                  <th className="p-3 text-left text-slate-400 text-xs">事件详情</th>
                </tr>
              </thead>
              <tbody>
                {pagedLogs.length === 0 && (
                  <tr><td colSpan={2} className="p-6 text-center text-slate-600">暂无日志记录</td></tr>
                )}
                {pagedLogs.map((l, i) => (
                  <tr key={i} className="border-t border-slate-700/30 hover:bg-slate-800/40">
                    <td className="p-3 text-slate-500 font-mono text-xs">{l.time}</td>
                    <td className="p-3 text-slate-300 text-xs">{l.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logTotalPages > 1 && (
              <div className="flex justify-center gap-2 p-3 bg-slate-800">
                <button disabled={logPage <= 1} onClick={() => setLogPage(p => p - 1)} className="px-3 py-1 bg-slate-700 text-slate-300 rounded disabled:opacity-50 text-xs">上一页</button>
                <span className="px-3 py-1 text-slate-400 text-xs">{logPage} / {logTotalPages}</span>
                <button disabled={logPage >= logTotalPages} onClick={() => setLogPage(p => p + 1)} className="px-3 py-1 bg-slate-700 text-slate-300 rounded disabled:opacity-50 text-xs">下一页</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
