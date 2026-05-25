export const DeviceStatusEnum = { WORKING: '工作中', CHARGING: '充电中', FAULT: '故障', STANDBY: '待命' };
export const DeviceAreaEnum = ['住院部3楼', '充电区A', '维修区', '门诊大厅', '药房', '手术部', '检验科', '急诊科'];

export const initialDevices = [
  { deviceId: 'D001', deviceName: '药房AGV-01', status: 'WORKING', batteryLevel: 78, area: '药房', lastActiveTime: '2026-05-25 10:20' },
  { deviceId: 'D002', deviceName: '住院部AGV-01', status: 'WORKING', batteryLevel: 55, area: '住院部3楼', lastActiveTime: '2026-05-25 10:18' },
  { deviceId: 'D003', deviceName: '检验科AGV-01', status: 'STANDBY', batteryLevel: 92, area: '检验科', lastActiveTime: '2026-05-25 09:50' },
  { deviceId: 'D004', deviceName: '手术部AGV-01', status: 'WORKING', batteryLevel: 33, area: '手术部', lastActiveTime: '2026-05-25 10:22' },
  { deviceId: 'D005', deviceName: '充电区AGV-01', status: 'CHARGING', batteryLevel: 15, area: '充电区A', lastActiveTime: '2026-05-25 10:00' },
  { deviceId: 'D006', deviceName: '住院部AGV-02', status: 'FAULT', batteryLevel: 60, area: '维修区', lastActiveTime: '2026-05-25 09:30' },
  { deviceId: 'D007', deviceName: '门诊AGV-01', status: 'STANDBY', batteryLevel: 88, area: '门诊大厅', lastActiveTime: '2026-05-25 10:10' },
  { deviceId: 'D008', deviceName: '急诊AGV-01', status: 'WORKING', batteryLevel: 45, area: '急诊科', lastActiveTime: '2026-05-25 10:25' },
  { deviceId: 'D009', deviceName: '充电区AGV-02', status: 'CHARGING', batteryLevel: 22, area: '充电区A', lastActiveTime: '2026-05-25 10:05' },
  { deviceId: 'D010', deviceName: '住院部AGV-03', status: 'WORKING', batteryLevel: 70, area: '住院部3楼', lastActiveTime: '2026-05-25 10:15' },
];
