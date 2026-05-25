export const mockStatistics = {
  todayCompleted: 24,
  pendingTasks: 8,
  errorTasks: 3,
  onlineRate: 85.7,
};

export const taskTypeDistribution = [
  { name: '药品配送', value: 45 },
  { name: '样本转运', value: 28 },
  { name: '器械运输', value: 18 },
  { name: '医疗废物处理', value: 9 },
];

export const completionTrend = [
  { date: '05-19', completed: 18, total: 22 },
  { date: '05-20', completed: 22, total: 25 },
  { date: '05-21', completed: 15, total: 20 },
  { date: '05-22', completed: 28, total: 30 },
  { date: '05-23', completed: 20, total: 24 },
  { date: '05-24', completed: 26, total: 28 },
  { date: '05-25', completed: 24, total: 32 },
];

export const taskDetails = [
  { id: 1, type: '药品配送', start: '药房', end: '住院部3楼', status: '已完成', time: '2026-05-25 08:50', robot: 'R001' },
  { id: 2, type: '样本转运', start: '门诊采血室', end: '检验科', status: '已完成', time: '2026-05-25 09:20', robot: 'R003' },
  { id: 3, type: '器械运输', start: '消毒中心', end: '手术部', status: '执行中', time: '2026-05-25 09:45', robot: 'R004' },
  { id: 4, type: '药品配送', start: '急诊药房', end: '急诊抢救室', status: '执行中', time: '2026-05-25 10:15', robot: 'R008' },
  { id: 5, type: '样本转运', start: '住院部5楼', end: '血库', status: '异常', time: '2026-05-25 09:30', robot: 'R006' },
  { id: 6, type: '药品配送', start: '门诊药房', end: '门诊诊室', status: '已完成', time: '2026-05-25 08:50', robot: 'R005' },
  { id: 7, type: '医疗废物处理', start: '住院部5楼', end: '废物处理站', status: '待执行', time: '-', robot: '未分配' },
  { id: 8, type: '器械运输', start: '器械库', end: '手术部', status: '待执行', time: '-', robot: 'R007' },
  { id: 9, type: '样本转运', start: '血库', end: '检验科', status: '执行中', time: '2026-05-25 10:00', robot: 'R009' },
  { id: 10, type: '药品配送', start: '药房', end: '住院部5楼', status: '已完成', time: '2026-05-25 08:20', robot: 'R002' },
];
