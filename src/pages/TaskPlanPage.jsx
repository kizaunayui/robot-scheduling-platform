import { useState } from 'react';
import { useStore } from '../store';
import { TaskTypeEnum, Priority, TaskStatus } from '../mock/taskPlan';

const statusColors = {
  PENDING: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
};

export default function TaskPlanPage() {
  const { plans, generatePath, optimizePath, linkPlanToTask } = useStore();
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState('');
  const [pathResults, setPathResults] = useState({});
  const [optimizeResults, setOptimizeResults] = useState({});
  const pageSize = 5;
  const totalPages = Math.ceil(plans.length / pageSize);
  const paged = plans.slice((page - 1) * pageSize, page * pageSize);

  const handleGenerate = (taskId) => {
    const result = generatePath(taskId);
    if (result) {
      setPathResults(prev => ({ ...prev, [taskId]: result }));
      setMessage(`✅ 任务 ${taskId} 路径已生成`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleOptimize = (taskId) => {
    const result = optimizePath(taskId);
    if (result) {
      setOptimizeResults(prev => ({ ...prev, [taskId]: result }));
      setMessage(`✅ 任务 ${taskId} 路径已优化`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleLink = (planId) => {
    linkPlanToTask(planId);
    setMessage(`✅ 任务规划 ${planId} 已关联到任务队列`);
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
                  <button onClick={() => handleGenerate(t.taskId)} className="px-2 py-1 bg-blue-500 text-white rounded text-xs">生成路径</button>
                  <button onClick={() => handleOptimize(t.taskId)} className="px-2 py-1 bg-green-500 text-white rounded text-xs">优化路径</button>
                  <button onClick={() => handleLink(t.taskId)} className="px-2 py-1 bg-purple-500 text-white rounded text-xs">关联任务</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Path Results */}
      {Object.keys(pathResults).length > 0 && (
        <div className="mt-4 space-y-3">
          {Object.entries(pathResults).map(([taskId, r]) => (
            <div key={taskId} className="bg-white rounded shadow p-4">
              <h3 className="font-medium mb-2">📌 任务 {taskId} 路径详情</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div><span className="text-gray-500">路径节点：</span>{r.nodes.join(' → ')}</div>
                <div><span className="text-gray-500">预计距离：</span>{r.distance}</div>
                <div><span className="text-gray-500">预计耗时：</span>{r.time}</div>
                <div><span className="text-gray-500">电量消耗：</span>{r.battery}</div>
                <div><span className="text-gray-500">风险等级：</span><span className={r.risk === '中' ? 'text-orange-500' : 'text-green-500'}>{r.risk}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Optimize Results */}
      {Object.keys(optimizeResults).length > 0 && (
        <div className="mt-4 space-y-3">
          {Object.entries(optimizeResults).map(([taskId, r]) => (
            <div key={taskId} className="bg-white rounded shadow p-4">
              <h3 className="font-medium mb-2">⚡ 任务 {taskId} 优化对比</h3>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="text-green-600 font-bold">-{r.savedTime}</div>
                  <div className="text-gray-500 text-xs">节省时间</div>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="text-blue-600 font-bold">-{r.savedDistance}</div>
                  <div className="text-gray-500 text-xs">减少距离</div>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded">
                  <div className="text-purple-600 font-bold">{r.riskReduction}</div>
                  <div className="text-gray-500 text-xs">风险变化</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center gap-2 mt-4">
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">上一页</button>
        <span className="px-3 py-1">{page} / {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">下一页</button>
      </div>
    </div>
  );
}
