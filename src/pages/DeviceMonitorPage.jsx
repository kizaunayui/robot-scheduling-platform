import { useState, useMemo } from 'react'
import { useAppStore } from '../store/AppStore'

const statusInfo = {
  WORKING: { label: '运行中', color: 'bg-green-600', dot: 'bg-green-500' },
  STANDBY: { label: '待机', color: 'bg-slate-600', dot: 'bg-slate-400' },
  CHARGING: { label: '充电中', color: 'bg-yellow-600', dot: 'bg-yellow-500' },
  FAULT: { label: '故障', color: 'bg-red-600', dot: 'bg-red-500' },
}

export default function DeviceMonitorPage() {
  const { devices, robots } = useAppStore()
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')

  const filtered = useMemo(() =>
    filterStatus ? devices.filter(d => d.status === filterStatus) : devices
  , [devices, filterStatus])

  const stats = useMemo(() => {
    const working = devices.filter(d => d.status === 'WORKING').length
    const standby = devices.filter(d => d.status === 'STANDBY').length
    const charging = devices.filter(d => d.status === 'CHARGING').length
    const fault = devices.filter(d => d.status === 'FAULT').length
    return { working, standby, charging, fault, total: devices.length }
  }, [devices])

  const containerNames = { normal: '标准舱', cold: '冷链舱', sealed: '密闭舱', large: '大型舱' }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">📡 设备监控</h1>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '运行中', value: stats.working, color: 'text-green-400', bg: 'bg-green-600/20', status: 'WORKING' },
          { label: '待机', value: stats.standby, color: 'text-slate-400', bg: 'bg-slate-600/20', status: 'STANDBY' },
          { label: '充电中', value: stats.charging, color: 'text-yellow-400', bg: 'bg-yellow-600/20', status: 'CHARGING' },
          { label: '故障', value: stats.fault, color: 'text-red-400', bg: 'bg-red-600/20', status: 'FAULT' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-lg p-4 border border-slate-700 text-center cursor-pointer hover:border-slate-500`} onClick={() => setFilterStatus(filterStatus === s.status ? '' : s.status)}>
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-slate-400 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-3">
          {filtered.map(d => {
            const robot = robots.find(r => r.id === d.deviceId)
            return (
              <div key={d.deviceId} className={`bg-slate-900 rounded-lg p-4 border cursor-pointer hover:border-slate-500 ${selectedDevice?.deviceId === d.deviceId ? 'border-blue-500' : 'border-slate-700'}`} onClick={() => setSelectedDevice(d)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${statusInfo[d.status]?.dot}`} />
                    <div>
                      <div className="text-white font-medium">{d.deviceName}</div>
                      <div className="text-slate-400 text-xs">{d.deviceId} · {d.area}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-700 rounded-full h-2">
                          <div className={`h-2 rounded-full ${d.batteryLevel < 20 ? 'bg-red-500' : d.batteryLevel < 50 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${d.batteryLevel}%` }} />
                        </div>
                        <span className="text-sm text-slate-300 w-10">{d.batteryLevel}%</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs text-white ${statusInfo[d.status]?.color}`}>{statusInfo[d.status]?.label}</span>
                  </div>
                </div>
                {robot && (
                  <div className="flex gap-2 mt-2">
                    {robot.skills.map(s => (
                      <span key={s} className="px-1.5 py-0.5 bg-indigo-900/50 text-indigo-300 rounded text-xs">{s}</span>
                    ))}
                    <span className="px-1.5 py-0.5 bg-slate-700 text-slate-400 rounded text-xs">{containerNames[robot.container] || robot.container}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <h3 className="text-sm font-bold text-white mb-3">📋 设备详情</h3>
          {selectedDevice ? (() => {
            const robot = robots.find(r => r.id === selectedDevice.deviceId)
            return (
              <div className="space-y-3 text-sm">
                <div><span className="text-slate-400">设备ID：</span><span className="text-white">{selectedDevice.deviceId}</span></div>
                <div><span className="text-slate-400">设备名称：</span><span className="text-white">{selectedDevice.deviceName}</span></div>
                <div><span className="text-slate-400">状态：</span><span className={`ml-1 px-2 py-0.5 rounded text-xs text-white ${statusInfo[selectedDevice.status]?.color}`}>{statusInfo[selectedDevice.status]?.label}</span></div>
                <div><span className="text-slate-400">电量：</span><span className="text-white">{selectedDevice.batteryLevel}%</span></div>
                <div><span className="text-slate-400">区域：</span><span className="text-white">{selectedDevice.area}</span></div>
                {robot && (
                  <>
                    <div><span className="text-slate-400">位置：</span><span className="text-white">[{robot.pos.join(',')}]</span></div>
                    <div><span className="text-slate-400">速度：</span><span className="text-white">{robot.speed}m/s</span></div>
                    <div><span className="text-slate-400">载重：</span><span className="text-white">{robot.capacity}kg</span></div>
                    <div><span className="text-slate-400">舱位：</span><span className="text-white">{containerNames[robot.container] || robot.container}</span></div>
                    <div><span className="text-slate-400">技能：</span><span className="text-white">{robot.skills.join(', ')}</span></div>
                  </>
                )}
              </div>
            )
          })() : (
            <p className="text-slate-500 text-sm">点击设备查看详情</p>
          )}
        </div>
      </div>
    </div>
  )
}
