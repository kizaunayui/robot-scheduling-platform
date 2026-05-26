import { useState, useMemo } from 'react'
import { useAppStore } from '../store/AppStore'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

export default function TaskStatisticsPage() {
  const { tasks, robots } = useAppStore()
  const [page, setPage] = useState(1)
  const pageSize = 5

  const stats = useMemo(() => {
    const completed = tasks.filter(t => t.status === 'COMPLETED').length
    const pending = tasks.filter(t => t.status === 'PENDING').length
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length
    const error = tasks.filter(t => t.status === 'ERROR').length
    return { completed, pending, inProgress, error, total: tasks.length }
  }, [tasks])

  const typeDistribution = useMemo(() => {
    const counts = {}
    tasks.forEach(t => { counts[t.taskType] = (counts[t.taskType] || 0) + 1 })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [tasks])

  const robotWorkload = useMemo(() => {
    const counts = {}
    tasks.forEach(t => {
      if (t.assignedRobot) {
        counts[t.assignedRobot] = (counts[t.assignedRobot] || 0) + 1
      }
    })
    return Object.entries(counts)
      .map(([id, count]) => ({ name: id, tasks: count }))
      .sort((a, b) => b.tasks - a.tasks)
      .slice(0, 8)
  }, [tasks])

  const statusData = [
    { name: '待执行', value: stats.pending },
    { name: '执行中', value: stats.inProgress },
    { name: '已完成', value: stats.completed },
    { name: '异常', value: stats.error },
  ]

  const totalPages = Math.ceil(tasks.length / pageSize)
  const paged = tasks.slice((page - 1) * pageSize, page * pageSize)

  const statusLabel = { COMPLETED: '已完成', IN_PROGRESS: '执行中', PENDING: '待执行', ERROR: '异常' }
  const statusColor = { COMPLETED: 'bg-green-600', IN_PROGRESS: 'bg-blue-600', PENDING: 'bg-slate-600', ERROR: 'bg-red-600' }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">📈 任务统计</h1>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '总任务', value: stats.total, color: 'text-blue-400' },
          { label: '已完成', value: stats.completed, color: 'text-green-400' },
          { label: '待处理', value: stats.pending, color: 'text-yellow-400' },
          { label: '异常', value: stats.error, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-900 rounded-lg p-4 border border-slate-700 text-center">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-slate-400 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <h3 className="text-sm font-bold text-white mb-3">📊 任务类型分布</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={typeDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {typeDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <h3 className="text-sm font-bold text-white mb-3">📊 任务状态分布</h3>
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

      <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
        <h3 className="text-sm font-bold text-white mb-3">🏆 机器人工作量排行</h3>
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

      <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
        <div className="p-3 bg-slate-800 flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">任务明细</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-800">
            <tr>
              <th className="p-3 text-left text-slate-300">ID</th>
              <th className="p-3 text-left text-slate-300">类型</th>
              <th className="p-3 text-left text-slate-300">起点</th>
              <th className="p-3 text-left text-slate-300">终点</th>
              <th className="p-3 text-left text-slate-300">状态</th>
              <th className="p-3 text-left text-slate-300">机器人</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(t => (
              <tr key={t.taskId} className="border-t border-slate-700/50">
                <td className="p-3 text-white">{t.taskId}</td>
                <td className="p-3 text-slate-300">{t.taskType}</td>
                <td className="p-3 text-slate-300">{t.startLocation}</td>
                <td className="p-3 text-slate-300">{t.endLocation}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded text-xs text-white ${statusColor[t.status]}`}>{statusLabel[t.status]}</span></td>
                <td className="p-3 text-slate-300">{t.assignedRobot || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-center gap-2 p-3 bg-slate-800">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 bg-slate-700 text-slate-300 rounded disabled:opacity-50 text-xs">上一页</button>
          <span className="px-3 py-1 text-slate-400 text-xs">{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 bg-slate-700 text-slate-300 rounded disabled:opacity-50 text-xs">下一页</button>
        </div>
      </div>
    </div>
  )
}
