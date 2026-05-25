import { useState } from 'react';
import { initialDevices, DeviceStatusEnum, DeviceAreaEnum } from '../mock/deviceMonitor';

const statusColors = {
  WORKING: 'bg-green-100 text-green-800',
  CHARGING: 'bg-yellow-100 text-yellow-800',
  FAULT: 'bg-red-100 text-red-800',
  STANDBY: 'bg-gray-100 text-gray-800',
};

export default function DeviceMonitorPage() {
  const [devices] = useState(initialDevices);
  const [filters, setFilters] = useState({ deviceId: '', deviceName: '', status: '', area: '' });
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filtered = devices.filter(d => {
    if (filters.deviceId && !d.deviceId.includes(filters.deviceId)) return false;
    if (filters.deviceName && !d.deviceName.includes(filters.deviceName)) return false;
    if (filters.status && d.status !== filters.status) return false;
    if (filters.area && d.area !== filters.area) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div className="bg-white rounded shadow p-4 mb-4 flex gap-3 flex-wrap">
        <input placeholder="设备ID" value={filters.deviceId} onChange={e => { setFilters(f => ({ ...f, deviceId: e.target.value })); setPage(1); }} className="border rounded px-2 py-1" />
        <input placeholder="设备名称" value={filters.deviceName} onChange={e => { setFilters(f => ({ ...f, deviceName: e.target.value })); setPage(1); }} className="border rounded px-2 py-1" />
        <select value={filters.status} onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }} className="border rounded px-2 py-1">
          <option value="">全部状态</option>
          {Object.entries(DeviceStatusEnum).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filters.area} onChange={e => { setFilters(f => ({ ...f, area: e.target.value })); setPage(1); }} className="border rounded px-2 py-1">
          <option value="">全部区域</option>
          {DeviceAreaEnum.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">设备ID</th>
              <th className="p-3 text-left">设备名称</th>
              <th className="p-3 text-left">状态</th>
              <th className="p-3 text-left">电量</th>
              <th className="p-3 text-left">区域</th>
              <th className="p-3 text-left">最后活跃</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(d => (
              <tr key={d.deviceId} className="border-t">
                <td className="p-3">{d.deviceId}</td>
                <td className="p-3">{d.deviceName}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${statusColors[d.status]}`}>{DeviceStatusEnum[d.status]}</span></td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded h-2">
                      <div className={`h-2 rounded ${d.batteryLevel < 20 ? 'bg-red-500' : d.batteryLevel < 50 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${d.batteryLevel}%` }} />
                    </div>
                    {d.batteryLevel}%
                  </div>
                </td>
                <td className="p-3">{d.area}</td>
                <td className="p-3">{d.lastActiveTime}</td>
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
