export const dashboardStats = {
  todayTasks: 24,
  onlineRobots: 7,
  errorDevices: 1,
  urgentTasks: 3,
};

export const recentTasks = [
  { id: 'T001', name: '药房→住院部3楼 药品配送', robot: 'R001', status: '进行中', time: '10:30' },
  { id: 'T002', name: '门诊采血室→检验科 样本转运', robot: 'R003', status: '已完成', time: '09:20' },
  { id: 'T003', name: '消毒中心→手术部 器械运输', robot: 'R004', status: '进行中', time: '09:45' },
  { id: 'T004', name: '急诊药房→急诊抢救室 药品配送', robot: 'R008', status: '进行中', time: '10:15' },
  { id: 'T005', name: '住院部5楼→血库 样本转运', robot: 'R006', status: '异常', time: '09:30' },
];

export const systemStatus = {
  cpu: 42,
  memory: 68,
  network: 35,
};

export const quickLinks = [
  { key: 'taskQueue', label: '任务队列', icon: '📋' },
  { key: 'robotStatus', label: '机器人状态', icon: '🤖' },
  { key: 'taskPlan', label: '任务规划', icon: '🗺️' },
  { key: 'deviceMonitor', label: '设备监控', icon: '📡' },
];
