import { useState } from 'react'
import { useAppStore } from '../store/AppStore'
import { taskTypeNames } from '../data/mapData'

export default function RobotConfigPage() {
  const { robots } = useAppStore()
  const [selectedRobot, setSelectedRobot] = useState(robots[0]?.id || '')
  const [saved, setSaved] = useState(false)

  const robot = robots.find(r => r.id === selectedRobot)
  const containerNames = { normal: '标准舱', cold: '冷链舱', sealed: '密闭舱', large: '大型舱' }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">⚙️ 机器人配置管理</h1>

      <div className="grid grid-cols-4 gap-6">
        {/* 左侧：机器人列表 */}
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <h2 className="text-sm font-bold text-white mb-3">机器人列表（{robots.length}台）</h2>
          <div className="space-y-1">
            {robots.map(r => (
              <button
                key={r.id}
                onClick={() => { setSelectedRobot(r.id); setSaved(false); }}
                className={`w-full text-left px-3 py-2 rounded text-sm ${
                  selectedRobot === r.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div>{r.id} - {r.name}</div>
                <div className="text-xs opacity-60">{r.type}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 右侧：配置详情 */}
        <div className="col-span-3 bg-slate-900 rounded-lg p-6 border border-slate-700">
          {robot ? (
            <>
              <h2 className="text-lg font-bold text-white mb-4">
                配置: {robot.id} - {robot.name}
              </h2>

              <div className="grid grid-cols-2 gap-6">
                {/* 基本信息 */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-300 border-b border-slate-700 pb-2">基本信息</h3>
                  {[
                    { label: '机器人ID', value: robot.id },
                    { label: '名称', value: robot.name },
                    { label: '类型', value: robot.type },
                    { label: '当前区域', value: robot.area },
                    { label: '当前位置', value: `[${robot.pos.join(', ')}]` },
                    { label: '运行速度', value: `${robot.speed} m/s` },
                    { label: '当前状态', value: robot.status },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between text-sm">
                      <span className="text-slate-400">{item.label}</span>
                      <span className="text-white">{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* 能力配置 */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-300 border-b border-slate-700 pb-2">能力配置</h3>
                  {[
                    { label: '最大载重', value: `${robot.capacity} kg` },
                    { label: '舱位类型', value: containerNames[robot.container] || robot.container },
                    { label: '当前电量', value: `${robot.battery}%` },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between text-sm">
                      <span className="text-slate-400">{item.label}</span>
                      <span className="text-white">{item.value}</span>
                    </div>
                  ))}

                  <div>
                    <span className="text-sm text-slate-400 block mb-2">任务技能</span>
                    <div className="flex gap-2 flex-wrap">
                      {robot.skills.map(s => (
                        <span key={s} className="px-3 py-1 bg-indigo-900/50 text-indigo-300 rounded text-sm">
                          {taskTypeNames[s] || s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 电量可视化 */}
                  <div>
                    <span className="text-sm text-slate-400 block mb-2">电量状态</span>
                    <div className="w-full bg-slate-700 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full flex items-center justify-center text-xs text-white font-bold ${robot.battery > 60 ? 'bg-green-500' : robot.battery > 30 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${robot.battery}%` }}
                      >
                        {robot.battery}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-700">
                <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded text-sm hover:bg-blue-500">
                  保存配置
                </button>
                {saved && <span className="text-green-400 text-sm self-center">✓ 已保存</span>}
              </div>
            </>
          ) : (
            <p className="text-slate-500">请选择一个机器人</p>
          )}
        </div>
      </div>
    </div>
  )
}
