import { useState } from 'react';
import { mockLogStats, initialLogs } from '../mock/operationLog';

const statusColors = { '成功': 'bg-green-100 text-green-800', '处理中': 'bg-blue-100 text-blue-800', '失败': 'bg-red-100 text-red-800' };

export default function OperationLogPage() {
  const [logs, setLogs] = useState(initialLogs);
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', robotId: '', taskType: '', status: '' });
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filtered = logs.filter(l => {
    if (filters.robotId && !l.robotId.includes(filters.robotId)) return false;
    if (filters.taskType && l.taskType !== filters.taskType) return false;
    if (filters.status && l.status !== filters.status) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const retry = (logId) => {
    setLogs(prev => prev.map(l => l.logId === logId ? { ...l, status: '处理中' } : l));
  };

  const exportLogs = () => { alert('日志导出成功（模拟）'); };

  return (
    <div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: '今日总任务', value: mockLogStats.todayTotal, trend: mockLogStats.todayTotalTrend, color: 'text-blue-600' },
          { label: '成功率', value: `${mockLogStats.successRate}%`, trend: mockLogStats.successRateTrend, color: 'text-green-600' },
          { label: '处理中', value: mockLogStats.processing, trend: mockLogStats.processingTrend, color: 'text-yellow-600' },
          { label: '异常数', value: mockLogStats.errorCount, trend: mockLogStats.errorCountTrend, color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded shadow p-4 text-center">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-gray-500 mt-1">{s.label}</div>
            <div className={`text-xs mt-1 ${s.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{s.trend}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded shadow p-4 mb-4 flex gap-3 flex-wrap">
        <input type="date" value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} className="border rounded px-2 py-1" />
        <span className="self-center">至</span>
        <input type="date" value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} className="border rounded px-2 py-1" />
        <input placeholder="机器人ID" value={filters.robotId} onChange={e => { setFilters(f => ({ ...f, robotId: e.target.value })); setPage(1); }} className="border rounded px-2 py-1" />
        <select value={filters.taskType} onChange={e => { setFilters(f => ({ ...f, taskType: e.target.value })); setPage(1); }} className="border rounded px-2 py-1">
          <option value="">全部类型</option>
          <option value="药品配送">药品配送</option>
          <option value="样本转运">样本转运</option>
          <option value="器械运输">器械运输</option>
        </select>
        <select value={filters.status} onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }} className="border rounded px-2 py-1">
          <option value="">全部状态</option>
          <option value="成功">成功</option>
          <option value="处理中">处理中</option>
          <option value="失败">失败</option>
        </select>
        <button onClick={exportLogs} className="px-3 py-1 bg-blue-500 text-white rounded ml-auto">导出</button>
      </div>
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">日志ID</th>
              <th className="p-3 text-left">机器人ID</th>
              <th className="p-3 text-left">任务类型</th>
              <th className="p-3 text-left">起点</th>
              <th className="p-3 text-left">终点</th>
              <th className="p-3 text-left">状态</th>
              <th className="p-3 text-left">操作时间</th>
              <th className="p-3 text-left">操作人</th>
              <th className="p-3 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(l => (
              <tr key={l.logId} className="border-t">
                <td className="p-3">{l.logId}</td>
                <td className="p-3">{l.robotId}</td>
                <td className="p-3">{l.taskType}</td>
                <td className="p-3">{l.startPoint}</td>
                <td className="p-3">{l.endPoint}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${statusColors[l.status]}`}>{l.status}</span></td>
                <td className="p-3">{l.operateTime}</td>
                <td className="p-3">{l.operator}</td>
                <td className="p-3">
                  {l.status === '失败' && <button onClick={() => retry(l.logId)} className="px-2 py-1 bg-orange-500 text-white rounded text-xs">重试</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center gap-2 mt-4">
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">上一页</button>
        <span className="px-3 py-1">{page} / {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">下一页</button>
      </div>
    </div>
  );
}
