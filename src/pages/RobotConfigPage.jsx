import { useState } from 'react';
import { defaultConfigs, ResponsibleArea, TaskPriority, TaskType, PathPreference } from '../mock/robotConfig';

export default function RobotConfigPage() {
  const [configs, setConfigs] = useState(defaultConfigs);
  const [selectedRobot, setSelectedRobot] = useState('R001');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const config = configs[selectedRobot];

  const validate = (field, value) => {
    const errs = { ...errors };
    if (field === 'maxLoad' && (value < 0 || value === '')) {
      errs.maxLoad = '最大载重不能为负数';
    } else {
      delete errs.maxLoad;
    }
    if (field === 'maxSpeed' && (value < 0 || value === '')) {
      errs.maxSpeed = '最大速度不能为负数';
    } else {
      delete errs.maxSpeed;
    }
    if (field === 'chargeThreshold' && (value < 0 || value > 100 || value === '')) {
      errs.chargeThreshold = '充电阈值必须在 0-100 之间';
    } else {
      delete errs.chargeThreshold;
    }
    setErrors(errs);
  };

  const update = (field, value) => {
    validate(field, value);
    setConfigs(prev => ({ ...prev, [selectedRobot]: { ...prev[selectedRobot], [field]: value } }));
  };

  const save = () => {
    if (Object.keys(errors).length > 0) {
      setMessage('⚠️ 请修正配置错误后再保存');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    if (config.maxLoad < 0) { setMessage('⚠️ 最大载重不能为负数'); return; }
    if (config.maxSpeed < 0) { setMessage('⚠️ 最大速度不能为负数'); return; }
    if (config.chargeThreshold < 0 || config.chargeThreshold > 100) { setMessage('⚠️ 充电阈值必须在 0-100'); return; }
    setMessage('✅ 配置已保存！');
    setTimeout(() => setMessage(''), 2000);
  };

  const restore = () => {
    setConfigs(prev => ({ ...prev, [selectedRobot]: { ...defaultConfigs[selectedRobot] } }));
    setErrors({});
    setMessage('✅ 已恢复默认配置！');
    setTimeout(() => setMessage(''), 2000);
  };

  const testPath = () => {
    const distance = (Math.random() * 800 + 200).toFixed(0);
    const time = (Math.random() * 15 + 3).toFixed(0);
    const battery = (Math.random() * 12 + 3).toFixed(1);
    setMessage(`✅ 路径测试成功：${config.taskStartPoint} → ${config.taskEndPoint}，距离 ${distance}m，预计耗时 ${time} 分钟，预计电量消耗 ${battery}%`);
    setTimeout(() => setMessage(''), 5000);
  };

  const Select = ({ label, value, options, field }) => (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <select value={value} onChange={e => update(field, e.target.value)} className="w-full border rounded px-2 py-1">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const Input = ({ label, value, field, type = 'text', min, max }) => (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        value={value}
        min={min}
        max={max}
        onChange={e => update(field, type === 'number' ? Number(e.target.value) : e.target.value)}
        className={`w-full border rounded px-2 py-1 ${errors[field] ? 'border-red-500' : ''}`}
      />
      {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
    </div>
  );

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        <label className="font-medium">选择机器人：</label>
        <select value={selectedRobot} onChange={e => { setSelectedRobot(e.target.value); setErrors({}); }} className="border rounded px-2 py-1">
          {Object.keys(defaultConfigs).map(id => <option key={id} value={id}>{id}</option>)}
        </select>
      </div>
      {message && <div className={`mb-4 p-2 rounded ${message.includes('⚠️') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{message}</div>}
      <div className="bg-white rounded shadow p-4 grid grid-cols-2 gap-4">
        <Select label="负责区域" value={config.responsibleArea} options={ResponsibleArea} field="responsibleArea" />
        <Input label="最大载重(kg)" value={config.maxLoad} field="maxLoad" type="number" min={0} />
        <Input label="最大速度(m/s)" value={config.maxSpeed} field="maxSpeed" type="number" min={0} />
        <Input label="充电阈值(%)" value={config.chargeThreshold} field="chargeThreshold" type="number" min={0} max={100} />
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
