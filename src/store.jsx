import { createContext, useContext, useState, useCallback, useMemo } from 'react';
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
    setTasks(prev => {
      const task = prev.find(t => t.taskId === taskId);
      if (!task) return prev;

      // Smart robot selection: find best available robot
      setRobots(currentRobots => {
        const candidates = currentRobots.filter(r =>
          r.status === 'IDLE' && r.battery > 20
        );
        // Sort by battery descending (prefer highest battery)
        candidates.sort((a, b) => b.battery - a.battery);
        const selected = candidates[0];

        if (selected) {
          // Update the assigned robot status to RUNNING
          const updated = currentRobots.map(r =>
            r.robotId === selected.robotId
              ? { ...r, status: 'RUNNING', taskProgress: 10 }
              : r
          );

          // Update the task with the selected robot
          setTasks(ts => ts.map(t =>
            t.taskId === taskId
              ? { ...t, status: 'IN_PROGRESS', assignedRobot: selected.robotId, updateTime: now() }
              : t
          ));

          // Add log entry
          setLogs(l => [...l, {
            logId: genId('L', l, 'logId'),
            robotId: selected.robotId,
            taskType: task.taskType,
            startPoint: task.startLocation,
            endPoint: task.endLocation,
            status: '处理中',
            operateTime: now(),
            operator: '系统自动',
          }]);

          // Update device monitor
          setDevices(d => d.map(dev =>
            dev.deviceId === `D${selected.robotId.slice(1)}`
              ? { ...dev, status: 'WORKING', lastActiveTime: now() }
              : dev
          ));

          return updated;
        }

        // No available robot — still mark task in progress (manual assign scenario)
        setTasks(ts => ts.map(t =>
          t.taskId === taskId
            ? { ...t, status: 'IN_PROGRESS', assignedRobot: 'R001', updateTime: now() }
            : t
        ));
        setLogs(l => [...l, {
          logId: genId('L', l, 'logId'),
          robotId: 'R001',
          taskType: task.taskType,
          startPoint: task.startLocation,
          endPoint: task.endLocation,
          status: '处理中',
          operateTime: now(),
          operator: '系统自动',
        }]);
        return currentRobots;
      });

      return prev; // actual update happens in nested setTasks
    });
  }, []);

  const cancelTask = useCallback((taskId) => {
    setTasks(prev => prev.map(t =>
      t.taskId === taskId ? { ...t, status: 'ERROR', updateTime: now() } : t
    ));
    const task = tasks.find(t => t.taskId === taskId);
    if (task) {
      setLogs(l => [...l, {
        logId: genId('L', l, 'logId'),
        robotId: task.assignedRobot || '-',
        taskType: task.taskType,
        startPoint: task.startLocation,
        endPoint: task.endLocation,
        status: '失败',
        operateTime: now(),
        operator: '调度员',
      }]);
      // Free up the robot
      if (task.assignedRobot) {
        setRobots(rs => rs.map(r =>
          r.robotId === task.assignedRobot ? { ...r, status: 'IDLE', taskProgress: 0 } : r
        ));
      }
    }
  }, [tasks]);

  const urgentTask = useCallback((taskId) => {
    setTasks(prev => prev.map(t =>
      t.taskId === taskId ? { ...t, priority: 'HIGH', updateTime: now() } : t
    ));
  }, []);

  // ====== ROBOT OPERATIONS ======
  const robotOperate = useCallback((robotId, action) => {
    setRobots(prev => prev.map(r => {
      if (r.robotId !== robotId) return r;
      switch (action) {
        case 'START': {
          setLogs(l => [...l, {
            logId: genId('L', l, 'logId'),
            robotId,
            taskType: '-',
            startPoint: r.currentLocation,
            endPoint: '-',
            status: '成功',
            operateTime: now(),
            operator: '调度员',
          }]);
          setDevices(d => d.map(dev =>
            dev.deviceId === `D${robotId.slice(1)}`
              ? { ...dev, status: 'WORKING', lastActiveTime: now() }
              : dev
          ));
          return { ...r, status: 'RUNNING' };
        }
        case 'PAUSE': {
          setLogs(l => [...l, {
            logId: genId('L', l, 'logId'),
            robotId,
            taskType: '-',
            startPoint: r.currentLocation,
            endPoint: '-',
            status: '成功',
            operateTime: now(),
            operator: '调度员',
          }]);
          setDevices(d => d.map(dev =>
            dev.deviceId === `D${robotId.slice(1)}`
              ? { ...dev, status: 'STANDBY', lastActiveTime: now() }
              : dev
          ));
          return { ...r, status: 'IDLE', taskProgress: 0 };
        }
        case 'RESTART': {
          setLogs(l => [...l, {
            logId: genId('L', l, 'logId'),
            robotId,
            taskType: '-',
            startPoint: r.currentLocation,
            endPoint: '-',
            status: '成功',
            operateTime: now(),
            operator: '调度员',
          }]);
          setDevices(d => d.map(dev =>
            dev.deviceId === `D${robotId.slice(1)}`
              ? { ...dev, status: 'WORKING', batteryLevel: 100, lastActiveTime: now() }
              : dev
          ));
          return { ...r, status: 'RUNNING', battery: 100 };
        }
        case 'LOCATION_UPDATE': {
          const locations = ['药房', '住院部3楼', '门诊大厅', '手术部', '检验科', '急诊科', '消毒中心', '血库'];
          const idx = locations.indexOf(r.currentLocation);
          const newLoc = locations[(idx + 1) % locations.length];
          setLogs(l => [...l, {
            logId: genId('L', l, 'logId'),
            robotId,
            taskType: '-',
            startPoint: r.currentLocation,
            endPoint: newLoc,
            status: '成功',
            operateTime: now(),
            operator: '系统自动',
          }]);
          setDevices(d => d.map(dev =>
            dev.deviceId === `D${robotId.slice(1)}`
              ? { ...dev, area: newLoc, lastActiveTime: now() }
              : dev
          ));
          return { ...r, currentLocation: newLoc };
        }
        default: return r;
      }
    }));
  }, []);

  // ====== DEVICE OPERATIONS ======
  const updateDevice = useCallback((deviceId, updates) => {
    setDevices(prev => prev.map(d =>
      d.deviceId === deviceId ? { ...d, ...updates, lastActiveTime: now() } : d
    ));
  }, []);

  // ====== LOG OPERATIONS ======
  const retryLog = useCallback((logId) => {
    setLogs(prev => prev.map(l => {
      if (l.logId !== logId) return l;
      // Also update the corresponding task status
      setTasks(ts => ts.map(t => {
        if (t.assignedRobot === l.robotId && t.status === 'ERROR') {
          return { ...t, status: 'IN_PROGRESS', updateTime: now() };
        }
        return t;
      }));
      // Update robot status
      setRobots(rs => rs.map(r =>
        r.robotId === l.robotId && r.status === 'ERROR'
          ? { ...r, status: 'RUNNING' }
          : r
      ));
      return { ...l, status: '处理中', operateTime: now() };
    }));
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
    setLogs(l => [...l, {
      logId: genId('L', l, 'logId'),
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
    // State
    tasks, robots, logs, devices, plans,
    // Task ops
    addTask, dispatchTask, cancelTask, urgentTask,
    // Robot ops
    robotOperate,
    // Device ops
    updateDevice,
    // Log ops
    retryLog,
    // Plan ops
    generatePath, optimizePath, linkPlanToTask,
    // Computed
    computedStats,
    // Utils
    exportCSV,
  }), [tasks, robots, logs, devices, plans, addTask, dispatchTask, cancelTask, urgentTask, robotOperate, updateDevice, retryLog, generatePath, optimizePath, linkPlanToTask, computedStats, exportCSV]);

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}
