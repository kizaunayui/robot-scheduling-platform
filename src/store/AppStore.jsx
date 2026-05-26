import { createContext, useContext, useState, useCallback } from 'react';
import { initialRobots } from '../data/mapData';
import { allocateTask, detectConflicts, calculateLoadBalance, findShortestPath, findMultiplePaths } from '../utils/scheduling';

const AppStoreContext = createContext(null);

// 初始任务数据
const initialTasks = [
  { taskId: 'T001', taskType: '药品配送', startLocation: '药房', endLocation: '住院部3楼', priority: 'HIGH', status: 'IN_PROGRESS', estimatedFinishTime: '2026-05-25 10:30', assignedRobot: 'R001', createTime: '2026-05-25 08:00', progress: 65 },
  { taskId: 'T002', taskType: '样本转运', startLocation: '门诊采血室', endLocation: '检验科', priority: 'HIGH', status: 'PENDING', estimatedFinishTime: '2026-05-25 11:00', assignedRobot: 'R003', createTime: '2026-05-25 08:30', progress: 0 },
  { taskId: 'T003', taskType: '器械运输', startLocation: '消毒中心', endLocation: '手术部', priority: 'HIGH', status: 'IN_PROGRESS', estimatedFinishTime: '2026-05-25 09:45', assignedRobot: 'R004', createTime: '2026-05-25 07:30', progress: 80 },
  { taskId: 'T004', taskType: '药品配送', startLocation: '门诊药房', endLocation: '门诊诊室', priority: 'MEDIUM', status: 'COMPLETED', estimatedFinishTime: '2026-05-25 09:00', assignedRobot: 'R005', createTime: '2026-05-25 07:00', progress: 100 },
  { taskId: 'T005', taskType: '医疗废物处理', startLocation: '住院部5楼', endLocation: '废物处理站', priority: 'LOW', status: 'PENDING', estimatedFinishTime: '2026-05-25 12:00', assignedRobot: null, createTime: '2026-05-25 09:00', progress: 0 },
  { taskId: 'T006', taskType: '样本转运', startLocation: '住院部3楼', endLocation: '血库', priority: 'MEDIUM', status: 'ERROR', estimatedFinishTime: '2026-05-25 10:00', assignedRobot: 'R006', createTime: '2026-05-25 08:00', progress: 30 },
  { taskId: 'T007', taskType: '药品配送', startLocation: '急诊药房', endLocation: '急诊抢救室', priority: 'HIGH', status: 'IN_PROGRESS', estimatedFinishTime: '2026-05-25 10:15', assignedRobot: 'R008', createTime: '2026-05-25 09:00', progress: 55 },
  { taskId: 'T008', taskType: '器械运输', startLocation: '器械库', endLocation: '手术部', priority: 'MEDIUM', status: 'PENDING', estimatedFinishTime: '2026-05-25 13:00', assignedRobot: 'R007', createTime: '2026-05-25 09:30', progress: 0 },
  { taskId: 'T009', taskType: '药品配送', startLocation: '药房', endLocation: '住院部5楼', priority: 'LOW', status: 'COMPLETED', estimatedFinishTime: '2026-05-25 08:30', assignedRobot: 'R002', createTime: '2026-05-24 16:00', progress: 100 },
  { taskId: 'T010', taskType: '样本转运', startLocation: '血库', endLocation: '检验科', priority: 'MEDIUM', status: 'IN_PROGRESS', estimatedFinishTime: '2026-05-25 11:30', assignedRobot: 'R009', createTime: '2026-05-25 09:45', progress: 40 },
  { taskId: 'T011', taskType: '器械运输', startLocation: '住院部2楼', endLocation: '消毒中心', priority: 'LOW', status: 'COMPLETED', estimatedFinishTime: '2026-05-25 09:00', assignedRobot: 'R010', createTime: '2026-05-24 15:00', progress: 100 },
  { taskId: 'T012', taskType: '医疗废物处理', startLocation: '手术部', endLocation: '废物处理站', priority: 'MEDIUM', status: 'PENDING', estimatedFinishTime: '2026-05-25 14:00', assignedRobot: null, createTime: '2026-05-25 10:00', progress: 0 },
];

// 初始日志
const initialLogs = [
  { logId: 'L001', robotId: 'R001', taskType: '药品配送', action: '任务派发', detail: '药房→住院部3楼', status: '成功', operateTime: '2026-05-25 08:50', operator: '系统自动' },
  { logId: 'L002', robotId: 'R003', taskType: '样本转运', action: '任务完成', detail: '门诊采血室→检验科', status: '成功', operateTime: '2026-05-25 09:20', operator: '系统自动' },
  { logId: 'L003', robotId: 'R004', taskType: '器械运输', action: '任务执行', detail: '消毒中心→手术部', status: '处理中', operateTime: '2026-05-25 09:45', operator: '系统自动' },
  { logId: 'L004', robotId: 'R006', taskType: '样本转运', action: '任务异常', detail: '住院部5楼→血库', status: '失败', operateTime: '2026-05-25 09:30', operator: '系统自动' },
  { logId: 'L005', robotId: 'R008', taskType: '药品配送', action: '任务派发', detail: '急诊药房→急诊抢救室', status: '处理中', operateTime: '2026-05-25 10:15', operator: '张伟' },
  { logId: 'L006', robotId: 'R005', taskType: '药品配送', action: '任务完成', detail: '门诊药房→门诊诊室', status: '成功', operateTime: '2026-05-25 08:50', operator: '系统自动' },
  { logId: 'L007', robotId: 'R002', taskType: '药品配送', action: '任务完成', detail: '药房→住院部5楼', status: '成功', operateTime: '2026-05-25 08:20', operator: '系统自动' },
  { logId: 'L008', robotId: 'R010', taskType: '器械运输', action: '任务完成', detail: '住院部2楼→消毒中心', status: '成功', operateTime: '2026-05-25 08:45', operator: '系统自动' },
];

// 初始设备
const initialDevices = [
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

// 初始用户
const initialUsers = [
  { userId: 'U001', username: 'admin', role: '管理员', phone: '13800000001', status: '启用', permissions: ['全部权限', '用户管理', '系统配置', '数据导出'], createdAt: '2026-01-10' },
  { userId: 'U002', username: 'zhangwei', role: '调度员', phone: '13800000002', status: '启用', permissions: ['任务调度', '机器人控制', '任务规划'], createdAt: '2026-02-15' },
  { userId: 'U003', username: 'lina', role: '维护人员', phone: '13800000003', status: '启用', permissions: ['设备维护', '故障处理', '日志查看'], createdAt: '2026-03-01' },
  { userId: 'U004', username: 'wangfang', role: '观察员', phone: '13800000004', status: '启用', permissions: ['数据查看', '报表导出'], createdAt: '2026-03-20' },
  { userId: 'U005', username: 'liuyang', role: '调度员', phone: '13800000005', status: '禁用', permissions: ['任务调度', '机器人控制', '任务规划'], createdAt: '2026-04-05' },
];

export function AppStoreProvider({ children }) {
  // === Robots ===
  const [robots, setRobots] = useState(initialRobots.map(r => ({ ...r })));
  const updateRobot = useCallback((id, updates) => {
    setRobots(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  // === Tasks ===
  const [tasks, setTasks] = useState(initialTasks.map(t => ({ ...t })));
  const addTask = useCallback((task) => {
    setTasks(prev => [...prev, task]);
  }, []);
  const updateTask = useCallback((taskId, updates) => {
    setTasks(prev => prev.map(t => t.taskId === taskId ? { ...t, ...updates } : t));
  }, []);
  const dispatchTask = useCallback((taskId) => {
    setTasks(prev => prev.map(t => {
      if (t.taskId !== taskId) return t;
      const result = allocateTask(t, robots);
      if (result.robot) {
        setRobots(rPrev => rPrev.map(r => r.id === result.robot.id ? { ...r, status: 'running', taskId } : r));
        return { ...t, status: 'IN_PROGRESS', assignedRobot: result.robot.id };
      }
      return t;
    }));
  }, [robots]);

  // === Logs ===
  const [logs, setLogs] = useState(initialLogs.map(l => ({ ...l })));
  const addLog = useCallback((log) => {
    const now = new Date();
    const time = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setLogs(prev => [{ ...log, logId: `L${String(prev.length + 1).padStart(3, '0')}`, operateTime: time }, ...prev.slice(0, 99)]);
  }, []);

  // === Devices ===
  const [devices, setDevices] = useState(initialDevices.map(d => ({ ...d })));
  const updateDevice = useCallback((deviceId, updates) => {
    setDevices(prev => prev.map(d => d.deviceId === deviceId ? { ...d, ...updates } : d));
  }, []);

  // === Users ===
  const [users, setUsers] = useState(initialUsers.map(u => ({ ...u })));
  const updateUser = useCallback((userId, updates) => {
    setUsers(prev => prev.map(u => u.userId === userId ? { ...u, ...updates } : u));
  }, []);

  // === Conflicts ===
  const [conflicts, setConflicts] = useState([]);
  const refreshConflicts = useCallback(() => {
    setConflicts(detectConflicts(robots, tasks));
  }, [robots, tasks]);

  // === Load Balance ===
  const loadBalance = calculateLoadBalance(robots);

  // === Path Planning ===
  const planPath = useCallback((startId, endId) => {
    return findShortestPath(startId, endId);
  }, []);
  const planMultiplePaths = useCallback((startId, endId) => {
    return findMultiplePaths(startId, endId);
  }, []);

  // === Allocate ===
  const smartAllocate = useCallback((task) => {
    return allocateTask(task, robots);
  }, [robots]);

  const value = {
    robots, setRobots, updateRobot,
    tasks, setTasks, addTask, updateTask, dispatchTask,
    logs, setLogs, addLog,
    devices, setDevices, updateDevice,
    users, setUsers, updateUser,
    conflicts, refreshConflicts,
    loadBalance,
    planPath, planMultiplePaths, smartAllocate,
  };

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider');
  return ctx;
}
