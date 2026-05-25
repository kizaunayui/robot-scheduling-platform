export const mockLogStats = {
  todayTotal: 32,
  successRate: 93.75,
  processing: 5,
  errorCount: 3,
  todayTotalTrend: '+12%',
  successRateTrend: '+2.1%',
  processingTrend: '-1',
  errorCountTrend: '+1',
};

export const initialLogs = [
  { logId: 'L001', robotId: 'R001', taskType: '药品配送', startPoint: '药房', endPoint: '住院部3楼', status: '成功', operateTime: '2026-05-25 08:50', operator: '系统自动' },
  { logId: 'L002', robotId: 'R003', taskType: '样本转运', startPoint: '门诊采血室', endPoint: '检验科', status: '成功', operateTime: '2026-05-25 09:20', operator: '系统自动' },
  { logId: 'L003', robotId: 'R004', taskType: '器械运输', startPoint: '消毒中心', endPoint: '手术部', status: '处理中', operateTime: '2026-05-25 09:45', operator: '系统自动' },
  { logId: 'L004', robotId: 'R006', taskType: '样本转运', startPoint: '住院部5楼', endPoint: '血库', status: '失败', operateTime: '2026-05-25 09:30', operator: '系统自动' },
  { logId: 'L005', robotId: 'R008', taskType: '药品配送', startPoint: '急诊药房', endPoint: '急诊抢救室', status: '处理中', operateTime: '2026-05-25 10:15', operator: '张伟' },
  { logId: 'L006', robotId: 'R005', taskType: '药品配送', startPoint: '门诊药房', endPoint: '门诊诊室', status: '成功', operateTime: '2026-05-25 08:50', operator: '系统自动' },
  { logId: 'L007', robotId: 'R002', taskType: '药品配送', startPoint: '药房', endPoint: '住院部5楼', status: '成功', operateTime: '2026-05-25 08:20', operator: '系统自动' },
  { logId: 'L008', robotId: 'R010', taskType: '器械运输', startPoint: '住院部2楼', endPoint: '消毒中心', status: '成功', operateTime: '2026-05-25 08:45', operator: '系统自动' },
  { logId: 'L009', robotId: 'R009', taskType: '样本转运', startPoint: '血库', endPoint: '检验科', status: '处理中', operateTime: '2026-05-25 10:00', operator: '李娜' },
  { logId: 'L010', robotId: 'R001', taskType: '药品配送', startPoint: '药房', endPoint: '住院部3楼', status: '失败', operateTime: '2026-05-25 07:30', operator: '系统自动' },
  { logId: 'L011', robotId: 'R004', taskType: '器械运输', startPoint: '器械库', endPoint: '手术部', status: '成功', operateTime: '2026-05-24 16:30', operator: '系统自动' },
  { logId: 'L012', robotId: 'R003', taskType: '样本转运', startPoint: '住院部3楼', endPoint: '检验科', status: '失败', operateTime: '2026-05-24 15:00', operator: '系统自动' },
];
