import { useState } from 'react';
import { useStore } from '../store';
import { TaskTypeEnum, TaskStatusEnum, PriorityLevelEnum } from '../mock/taskQueue';

const statusColors = {
  PENDING: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  ERROR: 'bg-red-100 text-red-800',
};

export default function TaskQueuePage() {
  const { tasks, robots, addTask, dispatchTask, cancelTask, urgentTask } = useStore();
  const [filters, setFilters] = useState({ type: '', status: '', priority: '', keyword: '' });
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ taskType: '药品配送', startLocation: '', endLocation: '', priority: 'MEDIUM', estimatedFinishTime: '' });
  const pageSize = 5;

  const filtered = tasks.filter(t => {
    if (filters.type && t.taskType !== filters.type) return false;
    if (filters.status && t.status !== filters.status) return false;
    if (filters.priority && t.priority !== filters.priority) return false;
    if (filters.keyword && !t.taskId.includes(filters.keyword) && !t.startLocation.includes(filters.keyword) && !t.endLocation.includes(filters.keyword)) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleAdd = () => {
    if (!newTask.startLocation || !newTask.endLocation) return;
    addTask(newTask);
    setNewTask({ taskType: '药品配送', startLocation: '', endLocation: '', priority: 'MEDIUM', estimatedFinishTime: '' });
    setShowAdd(false);
  };

  const availableRobots = robots.filter(r => r.status === 'IDLE' && r.battery > 20);

  return (
    <div>
      <div className="bg-white rounded shadow p-4 mb-4 flex gap-3 flex-wrap items-center">
        <select value={filters.type} onChange={e => { setFilters(f => ({ ...f, type: e.target.value })); setPage(1); }} className="border rounded px-2 py-1">
          <option value="">全部类型</option>
          {Object.entries(TaskTypeEnum).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filters.status} onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }} className="border rounded px-2 py-1">
          <option value="">全部状态</option>
          {Object.entries(TaskStatusEnum).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filters.priority} onChange={e => { setFilters(f => ({ ...f, priority: e.target.value })); setPage(1); }} className="border rounded px-2 py-1">
          <option value="">全部优先级</option>
          {Object.entries(PriorityLevelEnum).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input placeholder="关键词搜索..." value={filters.keyword} onChange={e => { setFilters(f => ({ ...f, keyword: e.target.value })); setPage(1); }} className="border rounded px-2 py-1" />
        <button onClick={() => setShowAdd(!showAdd)} className="ml-auto px-4 py-1 bg-blue-500 text-white rounded">+ 新增任务</button>
      </div>

      {showAdd && (
        <div className="bg-white rounded shadow p-4 mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">任务类型</label>
            <select value={newTask.taskType} onChange={e => setNewTask(t => ({ ...t, taskType: e.target.value }))} className="w-full border rounded px-2 py-1">
              {Object.values(TaskTypeEnum).map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">优先级</label>
            <select value={newTask.priority} onChange={e => setNewTask(t => ({ ...t, priority: e.target.value }))} className="w-full border rounded px-2 py-1">
              {Object.entries(PriorityLevelEnum).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">起点</label>
            <input value={newTask.startLocation} onChange={e => setNewTask(t => ({ ...t, startLocation: e.target.value }))} className="w-full border rounded px-2 py-1" placeholder="如：药房" />
          </div>
          <div>
            <label className="block text-sm mb-1">终点</label>
            <input value={newTask.endLocation} onChange={e => setNewTask(t => ({ ...t, endLocation: e.target.value }))} className="w-full border rounded px-2 py-1" placeholder="如：住院部3楼" />
          </div>
          <div>
            <label className="block text-sm mb-1">预计完成时间</label>
            <input value={newTask.estimatedFinishTime} onChange={e => setNewTask(t => ({ ...t, estimatedFinishTime: e.target.value }))} className="w-full border rounded px-2 py-1" placeholder="如：2026-05-25 15:00" />
          </div>
          <div className="flex items-end">
            <button onClick={handleAdd} className="px-4 py-1 bg-green-500 text-white rounded">确认添加</button>
          </div>
          <div className="col-span-2 text-xs text-gray-500">
            可用机器人：{availableRobots.length > 0 ? availableRobots.map(r => `${r.robotId}(${r.battery}%)`).join('、') : '暂无空闲机器人'}
          </div>
        </div>
      )}

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">任务ID</th>
              <th className="p-3 text-left">类型</th>
              <th className="p-3 text-left">起点</th>
              <th className="p-3 text-left">终点</th>
              <th className="p-3 text-left">优先级</th>
              <th className="p-3 text-left">状态</th>
              <th className="p-3 text-left">预计完成</th>
              <th className="p-3 text-left">分配机器人</th>
              <th className="p-3 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(t => (
              <tr key={t.taskId} className="border-t">
                <td className="p-3">{t.taskId}</td>
                <td className="p-3">{TaskTypeEnum[t.taskType] || t.taskType}</td>
                <td className="p-3">{t.startLocation}</td>
                <td className="p-3">{t.endLocation}</td>
                <td className="p-3">{PriorityLevelEnum[t.priority]}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${statusColors[t.status]}`}>{TaskStatusEnum[t.status]}</span></td>
                <td className="p-3">{t.estimatedFinishTime}</td>
                <td className="p-3">{t.assignedRobot || '未分配'}</td>
                <td className="p-3 space-x-1">
                  {t.status === 'PENDING' && <button onClick={() => dispatchTask(t.taskId)} className="px-2 py-1 bg-blue-500 text-white rounded text-xs">调度</button>}
                  {t.status !== 'COMPLETED' && <button onClick={() => cancelTask(t.taskId)} className="px-2 py-1 bg-red-500 text-white rounded text-xs">取消</button>}
                  <button onClick={() => urgentTask(t.taskId)} className="px-2 py-1 bg-orange-500 text-white rounded text-xs">加急</button>
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
