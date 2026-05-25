import { useState, useRef, useEffect } from 'react';

const floors = ['1楼', '2楼', '3楼'];

const floorData = {
  '1楼': {
    departments: [
      { id: 'd1', name: '门诊大厅', x: 100, y: 120, w: 140, h: 80 },
      { id: 'd2', name: '急诊科', x: 300, y: 80, w: 120, h: 70 },
      { id: 'd3', name: '药房', x: 500, y: 120, w: 100, h: 70 },
      { id: 'd4', name: '检验科', x: 100, y: 280, w: 120, h: 70 },
      { id: 'd5', name: '挂号收费', x: 300, y: 250, w: 120, h: 60 },
    ],
    robots: [
      { id: 'R001', name: '药配送A', x: 520, y: 150, status: 'RUNNING' },
      { id: 'R005', name: '药配送C', x: 200, y: 160, status: 'CHARGING' },
      { id: 'R008', name: '药配送D', x: 340, y: 110, status: 'RUNNING' },
    ],
    routes: [
      { from: { x: 540, y: 155 }, to: { x: 340, y: 270 }, label: '药房→挂号收费' },
    ],
  },
  '2楼': {
    departments: [
      { id: 'd6', name: '住院部2楼', x: 100, y: 100, w: 160, h: 80 },
      { id: 'd7', name: '内科诊室', x: 320, y: 100, w: 120, h: 70 },
      { id: 'd8', name: '外科诊室', x: 500, y: 100, w: 120, h: 70 },
      { id: 'd9', name: '护士站', x: 250, y: 260, w: 100, h: 60 },
    ],
    robots: [
      { id: 'R002', name: '药配送B', x: 160, y: 140, status: 'RUNNING' },
      { id: 'R010', name: '器械C', x: 400, y: 130, status: 'RUNNING' },
    ],
    routes: [
      { from: { x: 180, y: 145 }, to: { x: 290, y: 280 }, label: '住院部→护士站' },
    ],
  },
  '3楼': {
    departments: [
      { id: 'd10', name: '住院部3楼', x: 100, y: 100, w: 160, h: 80 },
      { id: 'd11', name: '手术部', x: 320, y: 80, w: 140, h: 80 },
      { id: 'd12', name: '血库', x: 520, y: 100, w: 100, h: 70 },
      { id: 'd13', name: 'ICU', x: 200, y: 260, w: 120, h: 70 },
      { id: 'd14', name: '消毒中心', x: 420, y: 260, w: 120, h: 70 },
    ],
    robots: [
      { id: 'R003', name: '样本A', x: 560, y: 130, status: 'IDLE' },
      { id: 'R004', name: '器械A', x: 380, y: 120, status: 'RUNNING' },
      { id: 'R006', name: '样本B', x: 250, y: 290, status: 'ERROR' },
    ],
    routes: [
      { from: { x: 390, y: 125 }, to: { x: 470, y: 285 }, label: '手术部→消毒中心' },
      { from: { x: 565, y: 135 }, to: { x: 250, y: 290 }, label: '血库→ICU' },
    ],
  },
};

const robotColors = {
  RUNNING: '#22c55e',
  IDLE: '#6b7280',
  ERROR: '#ef4444',
  CHARGING: '#eab308',
};

const robotStatusText = {
  RUNNING: '运行中',
  IDLE: '待机',
  ERROR: '故障',
  CHARGING: '充电中',
};

export default function CampusMapPage() {
  const [floor, setFloor] = useState('1楼');
  const [selected, setSelected] = useState(null);
  const data = floorData[floor];

  const handleDeptClick = (dept) => {
    const robotsHere = data.robots.filter(r =>
      Math.abs(r.x - (dept.x + dept.w / 2)) < dept.w / 2 + 20 &&
      Math.abs(r.y - (dept.y + dept.h / 2)) < dept.h / 2 + 20
    );
    setSelected({
      type: 'department',
      name: dept.name,
      robotCount: robotsHere.length,
      taskCount: Math.floor(Math.random() * 5) + 1,
    });
  };

  const handleRobotClick = (e, robot) => {
    e.stopPropagation();
    setSelected({
      type: 'robot',
      name: robot.name,
      id: robot.id,
      status: robotStatusText[robot.status],
      statusKey: robot.status,
    });
  };

  return (
    <div className="space-y-4">
      {/* 楼层切换 */}
      <div className="flex gap-2">
        {floors.map(f => (
          <button
            key={f}
            onClick={() => { setFloor(f); setSelected(null); }}
            className={`px-4 py-2 rounded text-sm font-medium ${floor === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        {/* 地图区域 */}
        <div className="flex-1 bg-white rounded-lg shadow p-4">
          <svg width="100%" viewBox="0 0 700 400" className="border rounded">
            {/* 背景 */}
            <rect x="0" y="0" width="700" height="400" fill="#f8fafc" />

            {/* 连接线（走廊） */}
            <line x1="170" y1="200" x2="300" y2="200" stroke="#cbd5e1" strokeWidth="8" />
            <line x1="300" y1="150" x2="300" y2="300" stroke="#cbd5e1" strokeWidth="8" />
            <line x1="420" y1="200" x2="550" y2="200" stroke="#cbd5e1" strokeWidth="8" />

            {/* 任务路线（虚线） */}
            {data.routes.map((r, i) => (
              <g key={i}>
                <line x1={r.from.x} y1={r.from.y} x2={r.to.x} y2={r.to.y}
                  stroke="#3b82f6" strokeWidth="2" strokeDasharray="6,4" />
                <text x={(r.from.x + r.to.x) / 2} y={(r.from.y + r.to.y) / 2 - 8}
                  fontSize="10" fill="#3b82f6" textAnchor="middle">{r.label}</text>
              </g>
            ))}

            {/* 科室 */}
            {data.departments.map(d => (
              <g key={d.id} onClick={() => handleDeptClick(d)} className="cursor-pointer">
                <rect x={d.x} y={d.y} width={d.w} height={d.h}
                  fill="#e0e7ff" stroke="#6366f1" strokeWidth="2" rx="6" />
                <text x={d.x + d.w / 2} y={d.y + d.h / 2 + 5}
                  fontSize="13" fill="#3730a3" textAnchor="middle" fontWeight="600">
                  {d.name}
                </text>
              </g>
            ))}

            {/* 机器人 */}
            {data.robots.map(r => (
              <g key={r.id} onClick={(e) => handleRobotClick(e, r)} className="cursor-pointer">
                <circle cx={r.x} cy={r.y} r="12" fill={robotColors[r.status]}
                  stroke="white" strokeWidth="2" />
                <text x={r.x} y={r.y + 4} fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">
                  {r.id.slice(1)}
                </text>
                <text x={r.x} y={r.y - 18} fontSize="10" fill="#374151" textAnchor="middle">
                  {r.name}
                </text>
              </g>
            ))}
          </svg>

          {/* 图例 */}
          <div className="flex gap-4 mt-3 text-xs text-gray-600">
            {Object.entries(robotStatusText).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full inline-block" style={{ background: robotColors[k] }} />
                {v}
              </div>
            ))}
            <div className="flex items-center gap-1">
              <span className="w-6 border-t-2 border-blue-400 border-dashed inline-block" />
              任务路线
            </div>
          </div>
        </div>

        {/* 详情面板 */}
        <div className="w-56 bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-sm mb-3">📍 详情信息</h3>
          {selected ? (
            <div className="space-y-2 text-sm">
              {selected.type === 'department' ? (
                <>
                  <div><span className="text-gray-500">科室：</span>{selected.name}</div>
                  <div><span className="text-gray-500">机器人：</span>{selected.robotCount} 台</div>
                  <div><span className="text-gray-500">当前任务：</span>{selected.taskCount} 个</div>
                </>
              ) : (
                <>
                  <div><span className="text-gray-500">机器人：</span>{selected.name}</div>
                  <div><span className="text-gray-500">ID：</span>{selected.id}</div>
                  <div>
                    <span className="text-gray-500">状态：</span>
                    <span className="ml-1 px-2 py-0.5 rounded text-xs"
                      style={{ background: robotColors[selected.statusKey] + '22', color: robotColors[selected.statusKey] }}>
                      {selected.status}
                    </span>
                  </div>
                </>
              )}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">点击科室或机器人查看详情</p>
          )}
        </div>
      </div>
    </div>
  );
}
