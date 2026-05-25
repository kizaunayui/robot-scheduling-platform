export const TaskTypeEnum = { DRUG_DELIVERY: '药品配送', SAMPLE_TRANSPORT: '样本转运', INSTRUMENT_TRANSPORT: '器械运输', MEDICAL_WASTE: '医疗废物处理' };
export const TaskStatusEnum = { PENDING: '待执行', IN_PROGRESS: '执行中', COMPLETED: '已完成', ERROR: '异常' };
export const PriorityLevelEnum = { HIGH: '高', MEDIUM: '中', LOW: '低' };

export const initialTasks = [
  { taskId: 'T001', taskType: '药品配送', startLocation: '药房', endLocation: '住院部3楼', priority: 'HIGH', status: 'IN_PROGRESS', estimatedFinishTime: '2026-05-25 10:30', assignedRobot: 'R001', createTime: '2026-05-25 08:00', updateTime: '2026-05-25 08:15' },
  { taskId: 'T002', taskType: '样本转运', startLocation: '门诊采血室', endLocation: '检验科', priority: 'HIGH', status: 'PENDING', estimatedFinishTime: '2026-05-25 11:00', assignedRobot: 'R003', createTime: '2026-05-25 08:30', updateTime: '2026-05-25 08:30' },
  { taskId: 'T003', taskType: '器械运输', startLocation: '消毒中心', endLocation: '手术部', priority: 'HIGH', status: 'IN_PROGRESS', estimatedFinishTime: '2026-05-25 09:45', assignedRobot: 'R004', createTime: '2026-05-25 07:30', updateTime: '2026-05-25 07:45' },
  { taskId: 'T004', taskType: '药品配送', startLocation: '门诊药房', endLocation: '门诊诊室', priority: 'MEDIUM', status: 'COMPLETED', estimatedFinishTime: '2026-05-25 09:00', assignedRobot: 'R005', createTime: '2026-05-25 07:00', updateTime: '2026-05-25 08:50' },
  { taskId: 'T005', taskType: 'MEDICAL_WASTE', startLocation: '住院部5楼', endLocation: '废物处理站', priority: 'LOW', status: 'PENDING', estimatedFinishTime: '2026-05-25 12:00', assignedRobot: null, createTime: '2026-05-25 09:00', updateTime: '2026-05-25 09:00' },
  { taskId: 'T006', taskType: '样本转运', startLocation: '住院部3楼', endLocation: '血库', priority: 'MEDIUM', status: 'ERROR', estimatedFinishTime: '2026-05-25 10:00', assignedRobot: 'R006', createTime: '2026-05-25 08:00', updateTime: '2026-05-25 09:30' },
  { taskId: 'T007', taskType: '药品配送', startLocation: '急诊药房', endLocation: '急诊抢救室', priority: 'HIGH', status: 'IN_PROGRESS', estimatedFinishTime: '2026-05-25 10:15', assignedRobot: 'R008', createTime: '2026-05-25 09:00', updateTime: '2026-05-25 09:10' },
  { taskId: 'T008', taskType: '器械运输', startLocation: '器械库', endLocation: '手术部', priority: 'MEDIUM', status: 'PENDING', estimatedFinishTime: '2026-05-25 13:00', assignedRobot: 'R007', createTime: '2026-05-25 09:30', updateTime: '2026-05-25 09:30' },
  { taskId: 'T009', taskType: '药品配送', startLocation: '药房', endLocation: '住院部5楼', priority: 'LOW', status: 'COMPLETED', estimatedFinishTime: '2026-05-25 08:30', assignedRobot: 'R002', createTime: '2026-05-24 16:00', updateTime: '2026-05-25 08:20' },
  { taskId: 'T010', taskType: '样本转运', startLocation: '血库', endLocation: '检验科', priority: 'MEDIUM', status: 'IN_PROGRESS', estimatedFinishTime: '2026-05-25 11:30', assignedRobot: 'R009', createTime: '2026-05-25 09:45', updateTime: '2026-05-25 10:00' },
  { taskId: 'T011', taskType: '器械运输', startLocation: '住院部2楼', endLocation: '消毒中心', priority: 'LOW', status: 'COMPLETED', estimatedFinishTime: '2026-05-25 09:00', assignedRobot: 'R010', createTime: '2026-05-24 15:00', updateTime: '2026-05-25 08:45' },
  { taskId: 'T012', taskType: 'MEDICAL_WASTE', startLocation: '手术部', endLocation: '废物处理站', priority: 'MEDIUM', status: 'PENDING', estimatedFinishTime: '2026-05-25 14:00', assignedRobot: null, createTime: '2026-05-25 10:00', updateTime: '2026-05-25 10:00' },
];
