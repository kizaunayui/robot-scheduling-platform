import { useState } from 'react';
import { useStore } from '../store';
import { RobotStatusEnum } from '../mock/robotStatus';

const statusColors = {
  RUNNING: 'bg-green-100 text-green-800',
  IDLE: 'bg-gray-100 text-gray-800',
  ERROR: 'bg-red-100 text-red-800',
  CHARGING: 'bg-yellow-100 text-yellow-800',
};

export default function RobotStatusPage() {
  const { robots, robotOperate } = useStore();
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(robots.length / pageSize);
  const paged = robots.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">机器人ID</th>
              <th className="p-3 text-left">名称</th>
              <th className="p-3 text-left">类型</th>
              <th className="p-3 text-left">当前位置</th>
              <th className="p-3 text-left">状态</th>
              <th className="p-3 text-left">电量</th>
              <th className="p-3 text-left">任务进度</th>
              <th className="p-3 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(r => (
              <tr key={r.robotId} className="border-t">
                <td className="p-3">{r.robotId}</td>
                <td className="p-3">{r.name}</td>
                <td className="p-3">{r.type}</td>
                <td className="p-3">{r.currentLocation}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${statusColors[r.status]}`}>
                    {RobotStatusEnum[r.status]}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded h-2">
                      <div className={`h-2 rounded ${r.battery < 20 ? 'bg-red-500' : r.battery < 50 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${r.battery}%` }} />
                    </div>
                    {r.battery}%
                  </div>
                </td>
                <td className="p-3">
                  <div className="w-24 bg-gray-200 rounded h-2">
                    <div className="bg-blue-500 h-2 rounded" style={{ width: `${r.taskProgress}%` }} />
                  </div>
                </td>
                <td className="p-3 space-x-1">
                  <button onClick={() => robotOperate(r.robotId, 'START')} className="px-2 py-1 bg-green-500 text-white rounded text-xs">启动</button>
                  <button onClick={() => robotOperate(r.robotId, 'PAUSE')} className="px-2 py-1 bg-yellow-500 text-white rounded text-xs">暂停</button>
                  <button onClick={() => robotOperate(r.robotId, 'RESTART')} className="px-2 py-1 bg-blue-500 text-white rounded text-xs">重启</button>
                  <button onClick={() => robotOperate(r.robotId, 'LOCATION_UPDATE')} className="px-2 py-1 bg-purple-500 text-white rounded text-xs">定位更新</button>
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
