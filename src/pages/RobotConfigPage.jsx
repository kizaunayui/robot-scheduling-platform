import { useState } from 'react'
import { useAppStore } from '../store/AppStore'

const defaultConfigs = {
  R001: { responsibleArea: '住院部', maxLoad: 20, maxSpeed: 1.5, chargeThreshold: 20, taskPriority: 'HIGH', taskType: '药品配送', pathPreference: '最短路径' },
  R002: { responsibleArea: '住院部', maxLoad: 15, maxSpeed: 1.2, chargeThreshold: 25, taskPriority: 'MEDIUM', taskType: '药品配送', pathPreference: '最快路径' },
  R003: { responsibleArea: '门诊部', maxLoad: 10, maxSpeed: 2.0, chargeThreshold: 15, taskPriority: 'HIGH', taskType: '样本转运', pathPreference: '最少人流路径' },
  R004: { responsibleArea: '手术部', maxLoad: 30, maxSpeed: 1.0, chargeThreshold: 30, taskPriority: 'HIGH', taskType: '器械运输', pathPreference: '最短路径' },
  R005: { responsibleArea: '门诊部', maxLoad: 20, maxSpeed: 1.5, chargeThreshold: 20, taskPriority: 'MEDIUM', taskType: '药品配送', pathPreference: '最快路径' },
  R006: { responsibleArea: '住院部', maxLoad: 10, maxSpeed: 1.8, chargeThreshold: 20, taskPriority: 'LOW', taskType: '样本转运', pathPreference: '最少人流路径' },
  R007: { responsibleArea: '手术部', maxLoad: 25, maxSpeed: 1.2, chargeThreshold: 25, taskPriority: 'MEDIUM', taskType: '器械运输', pathPreference: '最短路径' },
  R008: { responsibleArea: '门诊部', maxLoad: 18, maxSpeed: 1.6, chargeThreshold: 20, taskPriority: 'HIGH', taskType: '药品配送', pathPreference: '最快路径' },
  R009: { responsibleArea: '住院部', maxLoad: 12, maxSpeed: 1.4, chargeThreshold: 20, taskPriority: 'MEDIUM', taskType: '样本转运', pathPreference: '最短路径' },
  R010: { responsibleArea: '住院部', maxLoad: 22, maxSpeed: 1.3, chargeThreshold: 25, taskPriority: 'LOW', taskType: '医疗废物处理', pathPreference: '最少人流路径' },
}

export default function RobotConfigPage() {
  const { robots, updateRobot } = useAppStore()
  const [configs, setConfigs] = useState(defaultConfigs)
  const [selectedRobot, setSelectedRobot] = useState('R001')
  const [saved, setSaved] = useState(false)

  const config = configs[selectedRobot] || {}

  const handleChange = (key, value) => {
    setConfigs(prev => ({
      ...prev,
      [selectedRobot]: { ...prev[selectedRobot], [key]: value },
    }))
    setSaved(false)
  }

  const handleSave = () => {
    const cfg = configs[selectedRobot]
    updateRobot(selectedRobot, { speed: cfg.maxSpeed })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleBatchSave = () => {
    Object.entries(configs).forEach(([id, cfg]) => {
      updateRobot(id, { speed: cfg.maxSpeed })
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">⚙️ 机器人配置管理</h1>

      <div className="grid grid-cols-4 gap-6">
        {/* 左侧：机器人列表 */}
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <h2 className="text-sm font-bold text-white mb-3">机器人列表</h2>
          <div className="space-y-1">
            {robots.map(r => (
              <button
                key={r.id}
                onClick={() => { setSelectedRobot(r.id); setSaved(false); }}
                className={`w-full text-left px-3 py-2 rounded text-sm ${
                  selectedRobot === r.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {r.id} - {r.name}
              </button>
            ))}
          </div>
        </div>

        {/* 右侧：配置表单 */}
        <div className="col-span-3 bg-slate-900 rounded-lg p-6 border border-slate-700">
          <h2 className="text-lg font-bold text-white mb-4">配置: {selectedRobot} - {robots.find(r => r.id === selectedRobot)?.name}</h2>

          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'responsibleArea', label: '负责区域', type: 'select', options: ['手术部', '住院部', '门诊部'] },
              { key: 'maxLoad', label: '最大载重(kg)', type: 'number' },
              { key: 'maxSpeed', label: '最大速度(m/s)', type: 'number' },
              { key: 'chargeThreshold', label: '充电阈值(%)', type: 'number' },
              { key: 'taskPriority', label: '任务优先级', type: 'select', options: ['LOW', 'MEDIUM', 'HIGH'] },
              { key: 'taskType', label: '任务类型', type: 'select', options: ['药品配送', '样本转运', '器械运输', '医疗废物处理'] },
              { key: 'pathPreference', label: '路径偏好', type: 'select', options: ['最短路径', '最快路径', '最少人流路径'] },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-xs text-slate-400 mb-1">{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    value={config[field.key] || ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    className="w-full bg-slate-800 text-white text-sm px-3 py-2 rounded border border-slate-600"
                  >
                    {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input
                    type="number"
                    value={config[field.key] || ''}
                    onChange={e => handleChange(field.key, parseFloat(e.target.value))}
                    className="w-full bg-slate-800 text-white text-sm px-3 py-2 rounded border border-slate-600"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded text-sm hover:bg-blue-500">
              保存配置
            </button>
            <button onClick={handleBatchSave} className="bg-green-600 text-white px-6 py-2 rounded text-sm hover:bg-green-500">
              批量应用
            </button>
            {saved && <span className="text-green-400 text-sm self-center">✓ 已保存</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
