export const RobotStatusEnum = {
  RUNNING: '运行中',
  IDLE: '待机',
  ERROR: '故障',
  CHARGING: '充电中',
};

export const initialRobots = [
  { robotId: 'R001', name: '药配送机器人A', type: '药品配送', currentLocation: '药房', status: 'RUNNING', battery: 78, taskProgress: 65 },
  { robotId: 'R002', name: '药配送机器人B', type: '药品配送', currentLocation: '住院部3楼', status: 'RUNNING', battery: 55, taskProgress: 40 },
  { robotId: 'R003', name: '样本转运机器人A', type: '样本转运', currentLocation: '检验科', status: 'IDLE', battery: 92, taskProgress: 0 },
  { robotId: 'R004', name: '器械运输机器人A', type: '器械运输', currentLocation: '手术部', status: 'RUNNING', battery: 33, taskProgress: 80 },
  { robotId: 'R005', name: '药配送机器人C', type: '药品配送', currentLocation: '门诊大厅', status: 'CHARGING', battery: 15, taskProgress: 0 },
  { robotId: 'R006', name: '样本转运机器人B', type: '样本转运', currentLocation: '住院部5楼', status: 'ERROR', battery: 60, taskProgress: 30 },
  { robotId: 'R007', name: '器械运输机器人B', type: '器械运输', currentLocation: '消毒中心', status: 'IDLE', battery: 88, taskProgress: 0 },
  { robotId: 'R008', name: '药配送机器人D', type: '药品配送', currentLocation: '急诊科', status: 'RUNNING', battery: 45, taskProgress: 55 },
  { robotId: 'R009', name: '样本转运机器人C', type: '样本转运', currentLocation: '血库', status: 'CHARGING', battery: 22, taskProgress: 0 },
  { robotId: 'R010', name: '器械运输机器人C', type: '器械运输', currentLocation: '住院部2楼', status: 'RUNNING', battery: 70, taskProgress: 25 },
];
