import { useStore } from '../store';
import { quickLinks, systemStatus } from '../mock/dashboard';
import { RobotStatusEnum } from '../mock/robotStatus';

const statusColor = {
  '进行中': 'text-blue-600',
  '已完成': 'text-green-600',
  '异常': 'text-red-600',
  '待执行': 'text-gray-600',
};

function StatCard({ label, value, icon, color }) {
  return (
    <div className={`bg-white rounded-lg shadow p-5 flex items-center gap-4 border-l-4 ${color}`}>
      <div className="text-3xl">{icon}</div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-gray-500 text-sm">{label}</div>
      </div>
    </div>
  );
}

function Progress({ value, color }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 rounded h-2">
        <div className={`h-2 rounded ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-sm text-gray-600 w-10 text-right">{value}%</span>
    </div>
  );
}

export default function DashboardPage({ onNavigate }) {
  const { tasks, robots, devices, computedStats } = useStore();

  const stats = {
    todayTasks: tasks.length,
    onlineRobots: computedStats.onlineRobots,
    errorDevices: computedStats.errorDevices,
    urgentTasks: computedStats.urgentTasks,
  };

  // Recent tasks from actual task data
  const recentTasks = tasks.slice(0, 5).map(t => ({
    id: t.taskId,
    name: `${t.startLocation}→${t.endLocation} ${t.taskType}`,
    robot: t.assignedRobot || '未分配',
    status: t.status === 'IN_PROGRESS' ? '进行中' : t.status === 'COMPLETED' ? '已完成' : t.status === 'ERROR' ? '异常' : '待执行',
    time: t.updateTime?.split(' ')[1] || t.createTime?.split(' ')[1] || '-',
  }));

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="今日任务数" value={stats.todayTasks} icon="📋" color="border-blue-500" />
        <StatCard label="在线机器人数" value={stats.onlineRobots} icon="🤖" color="border-green-500" />
        <StatCard label="异常设备数" value={stats.errorDevices} icon="⚠️" color="border-red-500" />
        <StatCard label="紧急任务数" value={stats.urgentTasks} icon="🔥" color="border-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近任务动态 */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold mb-4">📜 最近任务动态</h2>
          <div className="space-y-3">
            {recentTasks.map(t => (
              <div key={t.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="text-xs text-gray-400">机器人 {t.robot} · {t.time}</div>
                </div>
                <span className={`text-sm font-medium ${statusColor[t.status] || 'text-gray-600'}`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 系统运行状态 */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold mb-4">🖥️ 系统运行状态</h2>
          <div className="space-y-5">
            <div>
              <div className="text-sm text-gray-600 mb-1">CPU 使用率</div>
              <Progress value={systemStatus.cpu} color="bg-blue-500" />
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">内存使用率</div>
              <Progress value={systemStatus.memory} color="bg-green-500" />
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">网络带宽</div>
              <Progress value={systemStatus.network} color="bg-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* 快捷入口 */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="text-lg font-semibold mb-4">⚡ 快捷入口</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickLinks.map(link => (
            <button
              key={link.key}
              onClick={() => onNavigate && onNavigate(link.key)}
              className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gray-50 hover:bg-blue-50 transition"
            >
              <span className="text-2xl">{link.icon}</span>
              <span className="text-sm font-medium">{link.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
