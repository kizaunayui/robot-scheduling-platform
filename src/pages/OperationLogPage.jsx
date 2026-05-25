import { useState, useMemo } from 'react';
import { useStore } from '../store';

const statusColors = { '成功': 'bg-green-100 text-green-800', '处理中': 'bg-blue-100 text-blue-800', '失败': 'bg-red-100 text-red-800' };

export default function OperationLogPage() {
  const { logs, retryLog, exportCSV, computedStats } = useStore();
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', robotId: '', taskType: '', status: '' });
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filtered = useMemo(() => logs.filter(l => {
    if (filters.robotId && !l.robotId.includes(filters.robotId)) return false;
    if (filters.taskType && l.taskType !== filters.taskType) return false;
    if (filters.status && l.status !== filters.status) return false;
    if (filters.dateFrom) {
      const logDate = l.operateTime?.split(' ')[0];
      if (logDate && logDate < filters.dateFrom) return false;
    }
    if (filters.dateTo) {
      const logDate = l.operateTime?.split(' ')[0];
      if (logDate && logDate > filters.dateTo) return false;
    }
    return true;
  }), [logs, filters]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleRetry = (logId) => {
    retryLog(logId);
  };

  const handleExport = () => {
    const csvData = filtered.map(l => ({
      日志ID: l.logId,
      机器人ID: l.robotId,
      任务类型: l.taskType,
      起点: l.startPoint,
      终点: l.endPoint,
      状态: l.status,
      操作时间: l.operateTime,
      操作人: l.operator,
    }));
    exportCSV(csvData, 'operation_log_export.csv');
  };

  const stats = [
    { label: '今日总任务', value: computedStats.totalLogs, trend: '+12%', color: 'text-blue-600' },
    { label: '成功率', value: `${computedStats.successRate}%`, trend: '+2.1%', color: 'text-green-600' },
    { label: '处理中', value: computedStats.processingLogs, trend: '-1', color: 'text-yellow-600' },
    { label: '异常数', value: computedStats.errorLogs, trend: '+1', color: 'text-red-600' },
  ];

  return (
    <div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded shadow p-4 text-center">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-gray-500 mt-1">{s.label}</div>
            <div className={`text-xs mt-1 ${s.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{s.trend}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded shadow p-4 mb-4 flex gap-3 flex-wrap">
        <div className="flex items-center gap-1">
          <input type="date" value={filters.dateFrom} onChange={e => { setFilters(f => ({ ...f, dateFrom: e.target.value })); setPage(1); }} className="border rounded px-2 py-1" />
          <span className="text-sm text-gray-500">至</span>
          <input type="date" value={filters.dateTo} onChange={e => { setFilters(f => ({ ...f, dateTo: e.target.value })); setPage(1); }} className="border rounded px-2 py-1" />
        </div>
        <input placeholder="机器人ID" value={filters.robotId} onChange={e => { setFilters(f => ({ ...f, robotId: e.target.value })); setPage(1); }} className="border rounded px-2 py-1" />
        <select value={filters.taskType} onChange={e => { setFilters(f => ({ ...f, taskType: e.target.value })); setPage(1); }} className="border rounded px-2 py-1">
          <option value="">全部类型</option>
          <option value="药品配送">药品配送</option>
          <option value="样本转运">样本转运</option>
          <option value="器械运输">器械运输</option>
          <option value="医疗废物处理">医疗废物处理</option>
        </select>
        <select value={filters.status} onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }} className="border rounded px-2 py-1">
          <option value="">全部状态</option>
          <option value="成功">成功</option>
          <option value="处理中">处理中</option>
          <option value="失败">失败</option>
        </select>
        <button onClick={handleExport} className="px-3 py-1 bg-blue-500 text-white rounded ml-auto">导出 CSV</button>
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
                  {l.status === '失败' && <button onClick={() => handleRetry(l.logId)} className="px-2 py-1 bg-orange-500 text-white rounded text-xs">重试</button>}
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
