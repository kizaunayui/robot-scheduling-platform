import { useState } from 'react';
import { defaultConfigs, ResponsibleArea, TaskPriority, TaskType, PathPreference } from '../mock/robotConfig';

export default function RobotConfigPage() {
  const [configs, setConfigs] = useState(defaultConfigs);
  const [selectedRobot, setSelectedRobot] = useState('R001');
  const [message, setMessage] = useState('');
  const config = configs[selectedRobot];

  const update = (field, value) => {
    setConfigs(prev => ({ ...prev, [selectedRobot]: { ...prev[selectedRobot], [field]: value } }));
  };

  const save = () => { setMessage('配置已保存！'); setTimeout(() => setMessage(''), 2000); };
  const restore = () => { setConfigs(prev => ({ ...prev, [selectedRobot]: defaultConfigs[selectedRobot] })); setMessage('已恢复默认配置！'); setTimeout(() => setMessage(''), 2000); };
  const testPath = () => { setMessage(`路径测试成功：${config.taskStartPoint} → ${config.taskEndPoint}，预计耗时 8 分钟`); setTimeout(() => setMessage(''), 3000); };

  const Select = ({ label, value, options, field }) => (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <select value={value} onChange={e => update(field, e.target.value)} className="w-full border rounded px-2 py-1">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const Input = ({ label, value, field, type = 'text' }) => (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input type={type} value={value} onChange={e => update(field, type === 'number' ? Number(e.target.value) : e.target.value)} className="w-full border rounded px-2 py-1" />
    </div>
  );

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        <label className="font-medium">选择机器人：</label>
        <select value={selectedRobot} onChange={e => setSelectedRobot(e.target.value)} className="border rounded px-2 py-1">
          {Object.keys(defaultConfigs).map(id => <option key={id} value={id}>{id}</option>)}
        </select>
      </div>
      {message && <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">{message}</div>}
      <div className="bg-white rounded shadow p-4 grid grid-cols-2 gap-4">
        <Select label="负责区域" value={config.responsibleArea} options={ResponsibleArea} field="responsibleArea" />
        <Input label="最大载重(kg)" value={config.maxLoad} field="maxLoad" type="number" />
        <Input label="最大速度(m/s)" value={config.maxSpeed} field="maxSpeed" type="number" />
        <Input label="充电阈值(%)" value={config.chargeThreshold} field="chargeThreshold" type="number" />
        <Input label="负责人" value={config.responsiblePerson} field="responsiblePerson" />
        <Select label="任务优先级" value={config.taskPriority} options={TaskPriority} field="taskPriority" />
        <Select label="任务类型" value={config.taskType} options={TaskType} field="taskType" />
        <Input label="上午开始" value={config.morningStart} field="morningStart" />
        <Input label="上午结束" value={config.morningEnd} field="morningEnd" />
        <Input label="下午开始" value={config.afternoonStart} field="afternoonStart" />
        <Input label="下午结束" value={config.afternoonEnd} field="afternoonEnd" />
        <Input label="任务起点" value={config.taskStartPoint} field="taskStartPoint" />
        <Input label="任务终点" value={config.taskEndPoint} field="taskEndPoint" />
        <Select label="路径偏好" value={config.pathPreference} options={PathPreference} field="pathPreference" />
      </div>
      <div className="mt-4 space-x-2">
        <button onClick={save} className="px-4 py-2 bg-blue-500 text-white rounded">保存配置</button>
        <button onClick={restore} className="px-4 py-2 bg-gray-500 text-white rounded">恢复默认</button>
        <button onClick={testPath} className="px-4 py-2 bg-green-500 text-white rounded">测试路径</button>
      </div>
    </div>
  );
}
