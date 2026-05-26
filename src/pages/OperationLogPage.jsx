import { useState, useMemo } from 'react'
import { useAppStore } from '../store/AppStore'

const statusColors = { '成功': 'bg-green-600', '处理中': 'bg-blue-600', '失败': 'bg-red-600' }

export default function OperationLogPage() {
  const { logs, addLog } = useAppStore()
  const [filters, setFilters] = useState({ robotId: '', taskType: '', status: '' })
  const [page, setPage] = useState(1)
  const pageSize = 8

  const filtered = useMemo(() => logs.filter(l => {
    if (filters.robotId && !l.robotId.includes(filters.robotId)) return false
    if (filters.taskType && l.taskType !== filters.taskType) return false
    if (filters.status && l.status !== filters.status) return false
    return true
  }), [logs, filters])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const stats = useMemo(() => {
    const total = logs.length
    const success = logs.filter(l => l.status === '成功').length
    const processing = logs.filter(l => l.status === '处理中').length
    const failed = logs.filter(l => l.status === '失败').length
    const rate = total > 0 ? ((success / total) * 100).toFixed(1) : 0
    return { total, success, processing, failed, rate }
  }, [logs])

  const handleRetry = (log) => {
    addLog({
      robotId: log.robotId,
      taskType: log.taskType,
      action: '重试操作',
      detail: log.detail,
      status: '处理中',
      operator: '调度员',
    })
  }

  const handleExport = () => {
    const headers = ['日志ID', '机器人ID', '任务类型', '操作', '详情', '状态', '时间', '操作人']
    const rows = filtered.map(l => [l.logId, l.robotId, l.taskType, l.action, l.detail, l.status, l.operateTime, l.operator])
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'operation_log.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">📝 操作日志</h1>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '总日志', value: stats.total, color: 'text-blue-400' },
          { label: '成功率', value: `${stats.rate}%`, color: 'text-green-400' },
          { label: '处理中', value: stats.processing, color: 'text-yellow-400' },
          { label: '失败', value: stats.failed, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-900 rounded-lg p-4 border border-slate-700 text-center">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-slate-400 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-lg p-3 border border-slate-700 flex gap-3 flex-wrap items-center">
        <input placeholder="机器人ID" value={filters.robotId} onChange={e => { setFilters(f => ({ ...f, robotId: e.target.value })); setPage(1) }} className="bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-sm text-white w-32" />
        <select value={filters.taskType} onChange={e => { setFilters(f => ({ ...f, taskType: e.target.value })); setPage(1) }} className="bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-sm text-white">
          <option value="">全部类型</option>
          {['药品配送', '样本转运', '器械运输', '医疗废物处理'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filters.status} onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1) }} className="bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-sm text-white">
          <option value="">全部状态</option>
          {['成功', '处理中', '失败'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={handleExport} className="ml-auto px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">📥 导出CSV</button>
      </div>

      <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800">
            <tr>
              <th className="p-3 text-left text-slate-300">日志ID</th>
              <th className="p-3 text-left text-slate-300">机器人</th>
              <th className="p-3 text-left text-slate-300">类型</th>
              <th className="p-3 text-left text-slate-300">操作</th>
              <th className="p-3 text-left text-slate-300">详情</th>
              <th className="p-3 text-left text-slate-300">状态</th>
              <th className="p-3 text-left text-slate-300">时间</th>
              <th className="p-3 text-left text-slate-300">操作人</th>
              <th className="p-3 text-left text-slate-300">操作</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(l => (
              <tr key={l.logId} className="border-t border-slate-700/50">
                <td className="p-3 text-white">{l.logId}</td>
                <td className="p-3 text-slate-300">{l.robotId}</td>
                <td className="p-3 text-slate-300">{l.taskType}</td>
                <td className="p-3 text-slate-300">{l.action}</td>
                <td className="p-3 text-slate-400 text-xs">{l.detail}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded text-xs text-white ${statusColors[l.status]}`}>{l.status}</span></td>
                <td className="p-3 text-slate-400 text-xs">{l.operateTime}</td>
                <td className="p-3 text-slate-400">{l.operator}</td>
                <td className="p-3">
                  {l.status === '失败' && <button onClick={() => handleRetry(l)} className="px-2 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700">重试</button>}
                </td>
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
