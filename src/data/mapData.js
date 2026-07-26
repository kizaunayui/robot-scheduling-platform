// 网格地图数据（01 zip 调度逻辑）
export const gridMap = {
  cols: 24,
  rows: 16,
  locations: {
    '药房': [2, 2],
    '检验科': [12, 2],
    '手术区': [21, 3],
    '住院区A': [3, 13],
    '住院区B': [13, 13],
    '消毒供应室': [21, 12],
    '充电站': [2, 14],
    '门诊大厅': [7, 10],
    'ICU': [18, 8],
  },
  obstacles: [
    [7,3],[8,3],[9,3],[10,3],[11,3],[13,3],[14,3],[15,3],
    [5,7],[6,7],[7,7],[8,7],[9,7],[10,7],[12,7],[13,7],[14,7],
    [17,5],[17,6],[17,7],[17,9],[17,10],[17,11],
    [4,12],[5,12],[6,12],[7,12],[8,12],[15,12],[16,12],[17,12],[18,12],
  ],
};

// 网格地图上的初始机器人（4台异构）
export const gridRobots = [
  { id: 'R-01', name: '药品配送一号', type: '药品配送机器人', pos: [2, 14], speed: 1.2, capacity: 10, container: 'normal', battery: 86, skills: ['medicine', 'meal'], status: 'idle', area: '住院区' },
  { id: 'R-02', name: '冷链标本一号', type: '标本冷链机器人', pos: [12, 2], speed: 1.0, capacity: 6, container: 'cold', battery: 78, skills: ['specimen', 'medicine'], status: 'idle', area: '检验科' },
  { id: 'R-03', name: '器械重载一号', type: '器械重载机器人', pos: [21, 12], speed: 0.8, capacity: 25, container: 'sealed', battery: 64, skills: ['instrument', 'linen'], status: 'idle', area: '手术区' },
  { id: 'R-04', name: '被服运输一号', type: '被服运输机器人', pos: [3, 13], speed: 0.9, capacity: 18, container: 'large', battery: 52, skills: ['linen', 'meal'], status: 'idle', area: '住院区' },
];

// 网格地图上的初始任务
export const gridTasks = [
  { id: 'T-001', type: 'medicine', name: '药品配送', start: '药房', end: '住院区A', weight: 4, priority: 2, status: '待派发', robotId: null, progress: 0 },
  { id: 'T-002', type: 'specimen', name: '标本送检', start: '住院区B', end: '检验科', weight: 2, priority: 3, status: '待派发', robotId: null, progress: 0 },
  { id: 'T-003', type: 'instrument', name: '器械回收', start: '手术区', end: '消毒供应室', weight: 14, priority: 2, status: '待派发', robotId: null, progress: 0 },
];

// 全体机器人的最大载重（新建任务重量校验的上限）
export const maxRobotCapacity = Math.max(...gridRobots.map((r) => r.capacity));

// 任务类型中文名
export const taskTypeNames = {
  medicine: '药品配送',
  specimen: '标本送检',
  instrument: '器械运输',
  linen: '被服运输',
  meal: '餐食配送',
};

// 任务状态中文名和颜色
export const taskStatusConfig = {
  '待派发': { label: '待派发', color: 'bg-slate-600', text: 'text-slate-300' },
  '加急': { label: '加急', color: 'bg-orange-600', text: 'text-orange-300' },
  '执行中': { label: '执行中', color: 'bg-blue-600', text: 'text-blue-300' },
  '已暂停': { label: '已暂停', color: 'bg-orange-600', text: 'text-orange-200' },
  '已完成': { label: '已完成', color: 'bg-green-600', text: 'text-green-300' },
  '已撤销': { label: '已撤销', color: 'bg-red-600', text: 'text-red-300' },
};
