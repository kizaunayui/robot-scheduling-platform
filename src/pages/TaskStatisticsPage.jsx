import { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { mockStatistics, taskTypeDistribution, completionTrend, taskDetails } from '../mock/taskStatistics';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
const statusColors = { '已完成': 'bg-green-100 text-green-800', '执行中': 'bg-blue-100 text-blue-800', '待执行': 'bg-gray-100 text-gray-800', '异常': 'bg-red-100 text-red-800' };

export default function TaskStatisticsPage() {
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(taskDetails.length / pageSize);
  const paged = taskDetails.slice((page - 1) * pageSize, page * pageSize);

  const exportData = () => {
    alert('导出功能：task_statistics_export.csv 已生成（模拟）');
  };

  return (
    <div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: '今日完成数', value: mockStatistics.todayCompleted, color: 'text-green-600' },
          { label: '待处理数', value: mockStatistics.pendingTasks, color: 'text-yellow-600' },
          { label: '异常数', value: mockStatistics.errorTasks, color: 'text-red-600' },
          { label: '在线率', value: `${mockStatistics.onlineRate}%`, color: 'text-blue-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded shadow p-4 text-center">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded shadow p-4">
          <h3 className="font-medium mb-2">任务类型分布</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={taskTypeDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {taskTypeDistribution.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded shadow p-4">
          <h3 className="font-medium mb-2">任务类型分布（柱状图）</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={taskTypeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white rounded shadow p-4 mb-6">
        <h3 className="font-medium mb-2">完成趋势（近7天）</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={completionTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="completed" stroke="#10b981" name="已完成" />
            <Line type="monotone" dataKey="total" stroke="#3b82f6" name="总任务" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded shadow overflow-hidden mb-4">
        <div className="p-3 bg-gray-50 flex justify-between items-center">
          <h3 className="font-medium">任务明细</h3>
          <button onClick={exportData} className="px-3 py-1 bg-blue-500 text-white rounded text-sm">导出</button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">类型</th>
              <th className="p-3 text-left">起点</th>
              <th className="p-3 text-left">终点</th>
              <th className="p-3 text-left">状态</th>
              <th className="p-3 text-left">完成时间</th>
              <th className="p-3 text-left">机器人</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(t => (
              <tr key={t.id} className="border-t">
                <td className="p-3">{t.id}</td>
                <td className="p-3">{t.type}</td>
                <td className="p-3">{t.start}</td>
                <td className="p-3">{t.end}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${statusColors[t.status]}`}>{t.status}</span></td>
                <td className="p-3">{t.time}</td>
                <td className="p-3">{t.robot}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center gap-2">
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">上一页</button>
        <span className="px-3 py-1">{page} / {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">下一页</button>
      </div>
    </div>
  );
}
