export const TaskTypeEnum = { DRUG_DELIVERY: '药品配送', SAMPLE_TRANSPORT: '样本转运', INSTRUMENT_TRANSPORT: '器械运输', LINEN_TRANSPORT: '布草运输' };
export const Priority = { HIGH: '高', MEDIUM: '中', LOW: '低' };
export const TaskStatus = { PENDING: '待执行', IN_PROGRESS: '执行中', COMPLETED: '已完成' };

export const initialPlans = [
  { taskId: 'P001', taskType: 'DRUG_DELIVERY', startPoint: '药房', endPoint: '住院部3楼', priority: 'HIGH', createTime: '2026-05-25 08:00', status: 'IN_PROGRESS' },
  { taskId: 'P002', taskType: 'SAMPLE_TRANSPORT', startPoint: '门诊采血室', endPoint: '检验科', priority: 'HIGH', createTime: '2026-05-25 08:15', status: 'PENDING' },
  { taskId: 'P003', taskType: 'INSTRUMENT_TRANSPORT', startPoint: '消毒中心', endPoint: '手术部', priority: 'HIGH', createTime: '2026-05-25 07:30', status: 'IN_PROGRESS' },
  { taskId: 'P004', taskType: 'DRUG_DELIVERY', startPoint: '门诊药房', endPoint: '门诊诊室', priority: 'MEDIUM', createTime: '2026-05-25 08:30', status: 'COMPLETED' },
  { taskId: 'P005', taskType: 'LINEN_TRANSPORT', startPoint: '洗衣房', endPoint: '住院部各楼层', priority: 'LOW', createTime: '2026-05-25 09:00', status: 'PENDING' },
  { taskId: 'P006', taskType: 'SAMPLE_TRANSPORT', startPoint: '住院部5楼', endPoint: '血库', priority: 'MEDIUM', createTime: '2026-05-25 08:45', status: 'PENDING' },
  { taskId: 'P007', taskType: 'DRUG_DELIVERY', startPoint: '急诊药房', endPoint: '急诊抢救室', priority: 'HIGH', createTime: '2026-05-25 09:10', status: 'IN_PROGRESS' },
  { taskId: 'P008', taskType: 'INSTRUMENT_TRANSPORT', startPoint: '器械库', endPoint: '手术部', priority: 'MEDIUM', createTime: '2026-05-25 09:30', status: 'PENDING' },
  { taskId: 'P009', taskType: 'DRUG_DELIVERY', startPoint: '药房', endPoint: '住院部5楼', priority: 'LOW', createTime: '2026-05-24 16:00', status: 'COMPLETED' },
  { taskId: 'P010', taskType: 'LINEN_TRANSPORT', startPoint: '住院部2楼', endPoint: '洗衣房', priority: 'LOW', createTime: '2026-05-25 10:00', status: 'PENDING' },
];
