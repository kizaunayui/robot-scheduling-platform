import { useState } from 'react';
import { initialPlans, TaskTypeEnum, Priority, TaskStatus } from '../mock/taskPlan';

const statusColors = {
  PENDING: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
};

export default function TaskPlanPage() {
  const [plans, setPlans] = useState(initialPlans);
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState('');
  const pageSize = 5;
  const totalPages = Math.ceil(plans.length / pageSize);
  const paged = plans.slice((page - 1) * pageSize, page * pageSize);

  const generatePath = (taskId) => {
    setMessage(`任务 ${taskId} 路径已生成：起点 → 中转点A → 终点，预计耗时 12 分钟`);
    setTimeout(() => setMessage(''), 3000);
  };

  const optimizePath = (taskId) => {
    setPlans(prev => prev.map(p => p.taskId === taskId ? { ...p, status: 'IN_PROGRESS' } : p));
    setMessage(`任务 ${taskId} 路径已优化，节省约 3 分钟`);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div>
      {message && <div className="mb-4 p-2 bg-blue-100 text-blue-800 rounded">{message}</div>}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">任务ID</th>
              <th className="p-3 text-left">任务类型</th>
              <th className="p-3 text-left">起点</th>
              <th className="p-3 text-left">终点</th>
              <th className="p-3 text-left">优先级</th>
              <th className="p-3 text-left">创建时间</th>
              <th className="p-3 text-left">状态</th>
              <th className="p-3 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(t => (
              <tr key={t.taskId} className="border-t">
                <td className="p-3">{t.taskId}</td>
                <td className="p-3">{TaskTypeEnum[t.taskType]}</td>
                <td className="p-3">{t.startPoint}</td>
                <td className="p-3">{t.endPoint}</td>
                <td className="p-3">{Priority[t.priority]}</td>
                <td className="p-3">{t.createTime}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${statusColors[t.status]}`}>{TaskStatus[t.status]}</span></td>
                <td className="p-3 space-x-1">
                  <button onClick={() => generatePath(t.taskId)} className="px-2 py-1 bg-blue-500 text-white rounded text-xs">生成路径</button>
                  <button onClick={() => optimizePath(t.taskId)} className="px-2 py-1 bg-green-500 text-white rounded text-xs">优化路径</button>
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
