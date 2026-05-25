export const initialUsers = [
  { userId: 'U001', username: 'admin', role: '管理员', phone: '13800000001', status: '启用', permissions: ['全部权限', '用户管理', '系统配置', '数据导出'], createdAt: '2026-01-10' },
  { userId: 'U002', username: 'zhangwei', role: '调度员', phone: '13800000002', status: '启用', permissions: ['任务调度', '机器人控制', '任务规划'], createdAt: '2026-02-15' },
  { userId: 'U003', username: 'lina', role: '维护人员', phone: '13800000003', status: '启用', permissions: ['设备维护', '故障处理', '日志查看'], createdAt: '2026-03-01' },
  { userId: 'U004', username: 'wangfang', role: '观察员', phone: '13800000004', status: '启用', permissions: ['数据查看', '报表导出'], createdAt: '2026-03-20' },
  { userId: 'U005', username: 'liuyang', role: '调度员', phone: '13800000005', status: '禁用', permissions: ['任务调度', '机器人控制', '任务规划'], createdAt: '2026-04-05' },
  { userId: 'U006', username: 'chenmin', role: '维护人员', phone: '13800000006', status: '启用', permissions: ['设备维护', '故障处理', '日志查看'], createdAt: '2026-04-18' },
  { userId: 'U007', username: 'zhaolei', role: '观察员', phone: '13800000007', status: '禁用', permissions: ['数据查看', '报表导出'], createdAt: '2026-05-02' },
];

export const RolePermissions = {
  '管理员': ['全部权限', '用户管理', '系统配置', '数据导出'],
  '调度员': ['任务调度', '机器人控制', '任务规划'],
  '维护人员': ['设备维护', '故障处理', '日志查看'],
  '观察员': ['数据查看', '报表导出'],
};

export const RoleColors = {
  '管理员': 'bg-red-100 text-red-800',
  '调度员': 'bg-blue-100 text-blue-800',
  '维护人员': 'bg-green-100 text-green-800',
  '观察员': 'bg-gray-100 text-gray-800',
};
