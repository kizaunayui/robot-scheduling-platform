import { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { initialTasks } from './mock/taskQueue';
import { initialRobots } from './mock/robotStatus';
import { initialLogs } from './mock/operationLog';
import { initialDevices } from './mock/deviceMonitor';
import { initialPlans } from './mock/taskPlan';

const StoreContext = createContext(null);

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

function genId(prefix, arr, key = 'id') {
  const max = arr.reduce((m, item) => {
    const num = parseInt((item[key] || item.taskId || item.logId || item.deviceId || '').replace(/\D/g, ''), 10);
    return num > m ? num : m;
  }, 0);
  return `${prefix}${String(max + 1).padStart(3, '0')}`;
}

function now() {
  return new Date().toLocaleString('zh-CN', { hour12: false });
}

export function StoreProvider({ children }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [robots, setRobots] = useState(initialRobots);
  const [logs, setLogs] = useState(initialLogs);
  const [devices, setDevices] = useState(initialDevices);
  const [plans, setPlans] = useState(initialPlans);

  // Refs to access latest state without closure issues
  const tasksRef = useRef(tasks);
  const robotsRef = useRef(robots);
  const logsRef = useRef(logs);
  const devicesRef = useRef(devices);
  useEffect(() => { tasksRef.current = tasks; }, [tasks]);
  useEffect(() => { robotsRef.current = robots; }, [robots]);
  useEffect(() => { logsRef.current = logs; }, [logs]);
  useEffect(() => { devicesRef.current = devices; }, [devices]);

  // ====== TASK OPERATIONS ======
  const addTask = useCallback((task) => {
    setTasks(prev => {
      const newTask = {
        taskId: genId('T', prev, 'taskId'),
        ...task,
        status: 'PENDING',
        assignedRobot: null,
        createTime: now(),
        updateTime: now(),
      };
      return [...prev, newTask];
    });
  }, []);

  const dispatchTask = useCallback((taskId) => {
    const currentTasks = tasksRef.current;
    const currentRobots = robotsRef.current;
    const task = currentTasks.find(t => t.taskId === taskId);
    if (!task) return;

    // Smart robot selection: find best available robot
    const candidates = currentRobots.filter(r => r.status === 'IDLE' && r.battery > 20);
    candidates.sort((a, b) => b.battery - a.battery);
    const selected = candidates[0];

    if (selected) {
      setRobots(prev => prev.map(r =>
        r.robotId === selected.robotId
          ? { ...r, status: 'RUNNING', taskProgress: 10 }
          : r
      ));
      setTasks(prev => prev.map(t =>
        t.taskId === taskId
          ? { ...t, status: 'IN_PROGRESS', assignedRobot: selected.robotId, updateTime: now() }
          : t
      ));
      setLogs(prev => [...prev, {
        logId: genId('L', prev, 'logId'),
        robotId: selected.robotId,
        taskType: task.taskType,
        startPoint: task.startLocation,
        endPoint: task.endLocation,
        status: '处理中',
        operateTime: now(),
        operator: '系统自动',
      }]);
      setDevices(prev => prev.map(dev =>
        dev.deviceId === `D${selected.robotId.slice(1)}`
          ? { ...dev, status: 'WORKING', lastActiveTime: now() }
          : dev
      ));
    } else {
      setTasks(prev => prev.map(t =>
        t.taskId === taskId
          ? { ...t, status: 'IN_PROGRESS', assignedRobot: 'R001', updateTime: now() }
          : t
      ));
      setLogs(prev => [...prev, {
        logId: genId('L', prev, 'logId'),
        robotId: 'R001',
        taskType: task.taskType,
        startPoint: task.startLocation,
        endPoint: task.endLocation,
        status: '处理中',
        operateTime: now(),
        operator: '系统自动',
      }]);
    }
  }, []);

  const cancelTask = useCallback((taskId) => {
    const currentTasks = tasksRef.current;
    const task = currentTasks.find(t => t.taskId === taskId);
    if (!task) return;

    setTasks(prev => prev.map(t =>
      t.taskId === taskId ? { ...t, status: 'ERROR', updateTime: now() } : t
    ));
    setLogs(prev => [...prev, {
      logId: genId('L', prev, 'logId'),
      robotId: task.assignedRobot || '-',
      taskType: task.taskType,
      startPoint: task.startLocation,
      endPoint: task.endLocation,
      status: '失败',
      operateTime: now(),
      operator: '调度员',
    }]);
    if (task.assignedRobot) {
      setRobots(prev => prev.map(r =>
        r.robotId === task.assignedRobot ? { ...r, status: 'IDLE', taskProgress: 0 } : r
      ));
    }
  }, []);

  const urgentTask = useCallback((taskId) => {
    setTasks(prev => prev.map(t =>
      t.taskId === taskId ? { ...t, priority: 'HIGH', updateTime: now() } : t
    ));
  }, []);

  // ====== ROBOT OPERATIONS ======
  const robotOperate = useCallback((robotId, action) => {
    const currentRobots = robotsRef.current;
    const robot = currentRobots.find(r => r.robotId === robotId);
    if (!robot) return;

    const locations = ['药房', '住院部3楼', '门诊大厅', '手术部', '检验科', '急诊科', '消毒中心', '血库'];

    switch (action) {
      case 'START': {
        setRobots(prev => prev.map(r =>
          r.robotId === robotId ? { ...r, status: 'RUNNING' } : r
        ));
        setLogs(prev => [...prev, {
          logId: genId('L', prev, 'logId'),
          robotId,
          taskType: '-',
          startPoint: robot.currentLocation,
          endPoint: '-',
          status: '成功',
          operateTime: now(),
          operator: '调度员',
        }]);
        setDevices(prev => prev.map(dev =>
          dev.deviceId === `D${robotId.slice(1)}`
            ? { ...dev, status: 'WORKING', lastActiveTime: now() }
            : dev
        ));
        break;
      }
      case 'PAUSE': {
        setRobots(prev => prev.map(r =>
          r.robotId === robotId ? { ...r, status: 'IDLE', taskProgress: 0 } : r
        ));
        setLogs(prev => [...prev, {
          logId: genId('L', prev, 'logId'),
          robotId,
          taskType: '-',
          startPoint: robot.currentLocation,
          endPoint: '-',
          status: '成功',
          operateTime: now(),
          operator: '调度员',
        }]);
        setDevices(prev => prev.map(dev =>
          dev.deviceId === `D${robotId.slice(1)}`
            ? { ...dev, status: 'STANDBY', lastActiveTime: now() }
            : dev
        ));
        break;
      }
      case 'RESTART': {
        setRobots(prev => prev.map(r =>
          r.robotId === robotId ? { ...r, status: 'RUNNING', battery: 100 } : r
        ));
        setLogs(prev => [...prev, {
          logId: genId('L', prev, 'logId'),
          robotId,
          taskType: '-',
          startPoint: robot.currentLocation,
          endPoint: '-',
          status: '成功',
          operateTime: now(),
          operator: '调度员',
        }]);
        setDevices(prev => prev.map(dev =>
          dev.deviceId === `D${robotId.slice(1)}`
            ? { ...dev, status: 'WORKING', batteryLevel: 100, lastActiveTime: now() }
            : dev
        ));
        break;
      }
      case 'LOCATION_UPDATE': {
        const idx = locations.indexOf(robot.currentLocation);
        const newLoc = locations[(idx + 1) % locations.length];
        setRobots(prev => prev.map(r =>
          r.robotId === robotId ? { ...r, currentLocation: newLoc } : r
        ));
        setLogs(prev => [...prev, {
          logId: genId('L', prev, 'logId'),
          robotId,
          taskType: '-',
          startPoint: robot.currentLocation,
          endPoint: newLoc,
          status: '成功',
          operateTime: now(),
          operator: '系统自动',
        }]);
        setDevices(prev => prev.map(dev =>
          dev.deviceId === `D${robotId.slice(1)}`
            ? { ...dev, area: newLoc, lastActiveTime: now() }
            : dev
        ));
        break;
      }
      default: break;
    }
  }, []);

  // ====== DEVICE OPERATIONS ======
  const updateDevice = useCallback((deviceId, updates) => {
    setDevices(prev => prev.map(d =>
      d.deviceId === deviceId ? { ...d, ...updates, lastActiveTime: now() } : d
    ));
  }, []);

  // ====== LOG OPERATIONS ======
  const retryLog = useCallback((logId) => {
    const currentLogs = logsRef.current;
    const log = currentLogs.find(l => l.logId === logId);
    if (!log) return;

    setLogs(prev => prev.map(l =>
      l.logId === logId ? { ...l, status: '处理中', operateTime: now() } : l
    ));
    setTasks(prev => prev.map(t => {
      if (t.assignedRobot === log.robotId && t.status === 'ERROR') {
        return { ...t, status: 'IN_PROGRESS', updateTime: now() };
      }
      return t;
    }));
    setRobots(prev => prev.map(r =>
      r.robotId === log.robotId && r.status === 'ERROR'
        ? { ...r, status: 'RUNNING' }
        : r
    ));
  }, []);

  // ====== PLAN OPERATIONS ======
  const generatePath = useCallback((taskId) => {
    const plan = plans.find(p => p.taskId === taskId);
    if (!plan) return null;
    const distance = (Math.random() * 500 + 200).toFixed(0);
    const time = (Math.random() * 10 + 5).toFixed(0);
    const battery = (Math.random() * 15 + 5).toFixed(1);
    const risk = Math.random() > 0.7 ? '中' : '低';
    return {
      nodes: [plan.startPoint, '中转点A', plan.endPoint],
      distance: `${distance}m`,
      time: `${time}分钟`,
      battery: `${battery}%`,
      risk,
    };
  }, [plans]);

  const optimizePath = useCallback((taskId) => {
    const plan = plans.find(p => p.taskId === taskId);
    if (!plan) return null;
    const savedTime = (Math.random() * 5 + 1).toFixed(0);
    const savedDistance = (Math.random() * 150 + 50).toFixed(0);
    const riskReduction = Math.random() > 0.5 ? '中→低' : '低→低';
    setPlans(prev => prev.map(p =>
      p.taskId === taskId ? { ...p, status: 'IN_PROGRESS' } : p
    ));
    return { savedTime: `${savedTime}分钟`, savedDistance: `${savedDistance}m`, riskReduction };
  }, [plans]);

  const linkPlanToTask = useCallback((planId) => {
    const plan = plans.find(p => p.taskId === planId);
    if (!plan) return;
    addTask({
      taskType: plan.taskType === 'DRUG_DELIVERY' ? '药品配送'
        : plan.taskType === 'SAMPLE_TRANSPORT' ? '样本转运'
        : plan.taskType === 'INSTRUMENT_TRANSPORT' ? '器械运输'
        : '医疗废物处理',
      startLocation: plan.startPoint,
      endLocation: plan.endPoint,
      priority: plan.priority,
      estimatedFinishTime: new Date(Date.now() + 3600000).toLocaleString('zh-CN', { hour12: false }),
    });
    setLogs(prev => [...prev, {
      logId: genId('L', prev, 'logId'),
      robotId: '-',
      taskType: plan.taskType,
      startPoint: plan.startPoint,
      endPoint: plan.endPoint,
      status: '处理中',
      operateTime: now(),
      operator: '调度员',
    }]);
  }, [plans, addTask]);

  // ====== COMPUTED STATS ======
  const computedStats = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStr = todayStart.toISOString().slice(0, 10);

    const todayTasks = tasks.filter(t => t.createTime && t.createTime.includes(todayStr)).length || tasks.length;
    const onlineRobots = robots.filter(r => r.status === 'RUNNING' || r.status === 'IDLE').length;
    const errorDevices = devices.filter(d => d.status === 'FAULT').length;
    const urgentTasks = tasks.filter(t => t.priority === 'HIGH' && t.status !== 'COMPLETED').length;

    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
    const pendingTasks = tasks.filter(t => t.status === 'PENDING').length;
    const errorTasks = tasks.filter(t => t.status === 'ERROR').length;
    const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;

    const totalLogs = logs.length;
    const successLogs = logs.filter(l => l.status === '成功').length;
    const successRate = totalLogs > 0 ? ((successLogs / totalLogs) * 100).toFixed(1) : 0;
    const processingLogs = logs.filter(l => l.status === '处理中').length;
    const errorLogs = logs.filter(l => l.status === '失败').length;

    return {
      todayTasks,
      onlineRobots,
      errorDevices,
      urgentTasks,
      completedTasks,
      pendingTasks,
      errorTasks,
      inProgressTasks,
      totalLogs,
      successRate,
      processingLogs,
      errorLogs,
    };
  }, [tasks, robots, devices, logs]);

  // ====== CSV EXPORT ======
  const exportCSV = useCallback((data, filename) => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const value = useMemo(() => ({
    tasks, robots, logs, devices, plans,
    addTask, dispatchTask, cancelTask, urgentTask,
    robotOperate,
    updateDevice,
    retryLog,
    generatePath, optimizePath, linkPlanToTask,
    computedStats,
    exportCSV,
  }), [tasks, robots, logs, devices, plans, addTask, dispatchTask, cancelTask, urgentTask, robotOperate, updateDevice, retryLog, generatePath, optimizePath, linkPlanToTask, computedStats, exportCSV]);

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}
