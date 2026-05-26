import { useState, useMemo } from 'react'
import { useAppStore } from '../store/AppStore'

export default function OperationLogPage() {
  const { logs } = useAppStore()
  const [filters, setFilters] = useState({ keyword: '' })
  const [page, setPage] = useState(1)
  const pageSize = 10

  const filtered = useMemo(() =>
    filters.keyword
      ? logs.filter(l => l.message.includes(filters.keyword))
      : logs
  , [logs, filters])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleExport = () => {
    const headers = ['时间', '操作内容']
    const rows = filtered.map(l => [l.time, l.message])
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

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 text-center">
          <div className="text-3xl font-bold text-blue-400">{logs.length}</div>
          <div className="text-slate-400 text-sm mt-1">总日志数</div>
        </div>
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 text-center">
          <div className="text-3xl font-bold text-green-400">{logs.filter(l => l.message.includes('完成')).length}</div>
          <div className="text-slate-400 text-sm mt-1">完成操作</div>
        </div>
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 text-center">
          <div className="text-3xl font-bold text-yellow-400">{logs.filter(l => l.message.includes('派发') || l.message.includes('调度')).length}</div>
          <div className="text-slate-400 text-sm mt-1">调度操作</div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-lg p-3 border border-slate-700 flex gap-3 flex-wrap items-center">
        <input
          placeholder="搜索日志内容..."
          value={filters.keyword}
          onChange={e => { setFilters({ keyword: e.target.value }); setPage(1) }}
          className="bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-sm text-white flex-1"
        />
        <button onClick={handleExport} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">📥 导出CSV</button>
      </div>

      <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800">
            <tr>
              <th className="p-3 text-left text-slate-300 w-24">时间</th>
              <th className="p-3 text-left text-slate-300">操作内容</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr><td colSpan={2} className="p-6 text-center text-slate-500">暂无日志记录</td></tr>
            )}
            {paged.map((l, i) => (
              <tr key={i} className="border-t border-slate-700/50 hover:bg-slate-800/50">
                <td className="p-3 text-slate-400 font-mono text-xs">{l.time}</td>
                <td className="p-3 text-slate-300">{l.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-3 bg-slate-800">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 bg-slate-700 text-slate-300 rounded disabled:opacity-50 text-xs">上一页</button>
            <span className="px-3 py-1 text-slate-400 text-xs">{page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 bg-slate-700 text-slate-300 rounded disabled:opacity-50 text-xs">下一页</button>
          </div>
        )}
      </div>
    </div>
  )
}
