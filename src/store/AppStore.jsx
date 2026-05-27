import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { gridMap, gridRobots, gridTasks } from '../data/mapData';
import {
  optimizeSchedule,
  planAllPaths,
  calculateMetrics,
  typeName,
} from '../utils/simulator';

const AppStoreContext = createContext(null);

// 辅助：生成日志时间戳
function now() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

// 用户数据（保持不变）
const initialUsers = [
  { userId: 'U001', username: 'admin', role: '管理员', phone: '13800000001', status: '启用', permissions: ['全部权限', '用户管理', '系统配置', '数据导出'], createdAt: '2026-01-10' },
  { userId: 'U002', username: 'zhangwei', role: '调度员', phone: '13800000002', status: '启用', permissions: ['任务调度', '机器人控制', '任务规划'], createdAt: '2026-02-15' },
  { userId: 'U003', username: 'lina', role: '维护人员', phone: '13800000003', status: '启用', permissions: ['设备维护', '故障处理', '日志查看'], createdAt: '2026-03-01' },
  { userId: 'U004', username: 'wangfang', role: '观察员', phone: '13800000004', status: '启用', permissions: ['数据查看', '报表导出'], createdAt: '2026-03-20' },
  { userId: 'U005', username: 'liuyang', role: '调度员', phone: '13800000005', status: '禁用', permissions: ['任务调度', '机器人控制', '任务规划'], createdAt: '2026-04-05' },
];

export function AppStoreProvider({ children }) {
  // === Robots ===
  const [robots, setRobots] = useState(gridRobots.map((r) => ({ ...r })));

  // === Tasks ===
  const [tasks, setTasks] = useState(gridTasks.map((t) => ({ ...t })));

  // === Paths & Conflicts ===
  const [paths, setPaths] = useState({});
  const [conflicts, setConflicts] = useState([]);

  // === Logs ===
  const [logs, setLogs] = useState([]);

  const addLog = useCallback((message) => {
    setLogs((prev) => [{ time: now(), message }, ...prev].slice(0, 80));
  }, []);

  // === Metrics（动态计算） ===
  const metrics = calculateMetrics(tasks, robots, paths);

  // === 地图数据 ===
  const mapData = gridMap;

  // === 派发任务（创建+自动推荐） ===
  const dispatchTask = useCallback(
    (data) => {
      const newTask = {
        id: `T-${String(tasks.length + 1).padStart(3, '0')}`,
        type: data.type || 'medicine',
        name: data.name || typeName(data.type || 'medicine'),
        start: data.start || '药房',
        end: data.end || '住院区A',
        weight: parseFloat(data.weight) || 3,
        priority: parseInt(data.priority) || 1,
        status: '待派发',
        robotId: null,
        progress: 0,
      };

      // 先添加任务，再执行调度
      const updatedTasks = [...tasks, newTask];
      const updatedRobots = robots.map((r) => ({ ...r }));

      const result = optimizeSchedule(updatedTasks, updatedRobots, mapData);

      // 规划路径
      const pathResult = planAllPaths(result.tasks, result.robots, mapData);

      setTasks(result.tasks);
      setRobots(result.robots);
      setPaths(pathResult.paths);
      setConflicts(pathResult.conflicts);

      addLog(`新增任务 ${newTask.id}：${newTask.name}`);
      result.logs.forEach((l) => addLog(l));
      if (pathResult.conflicts.length > 0) {
        addLog(`检测到 ${pathResult.conflicts.length} 个路径冲突，已自动消解`);
      }
    },
    [tasks, robots, mapData, addLog]
  );

  // === 批量优化调度 ===
  const handleOptimizeSchedule = useCallback(() => {
    const updatedTasks = tasks.map((t) => ({ ...t }));
    const updatedRobots = robots.map((r) => ({ ...r }));

    const result = optimizeSchedule(updatedTasks, updatedRobots, mapData);
    const pathResult = planAllPaths(result.tasks, result.robots, mapData);

    setTasks(result.tasks);
    setRobots(result.robots);
    setPaths(pathResult.paths);
    setConflicts(pathResult.conflicts);

    addLog('执行批量优化调度');
    result.logs.forEach((l) => addLog(l));
  }, [tasks, robots, mapData, addLog]);

  // === 机器人操作 ===
  const robotAction = useCallback(
    (robotId, action) => {
      setRobots((prev) =>
        prev.map((r) => {
          if (r.id !== robotId) return r;
          const updated = { ...r };
          if (action === 'pause') updated.status = 'paused';
          else if (action === 'start') updated.status = 'idle';
          else if (action === 'charge') {
            updated.status = 'charging';
            updated.pos = [...gridMap.locations['充电站']];
          } else if (action === 'locate') {
            // 定位到当前位置（无变化）
          }
          return updated;
        })
      );
      addLog(`${robotId} 执行操作：${action}`);
    },
    [addLog]
  );

  // === 任务操作 ===
  const rushTask = useCallback(
    (taskId) => {
      const updatedTasks = tasks.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          priority: 3,
          status: t.status === '待派发' ? '加急' : t.status,
        };
      });
      const updatedRobots = robots.map((r) => ({ ...r }));
      const result = optimizeSchedule(updatedTasks, updatedRobots, mapData);
      const pathResult = planAllPaths(result.tasks, result.robots, mapData);

      setTasks(result.tasks);
      setRobots(result.robots);
      setPaths(pathResult.paths);
      setConflicts(pathResult.conflicts);

      addLog(`${taskId} 已加急，触发重新调度`);
      result.logs.forEach((l) => addLog(l));
    },
    [tasks, robots, mapData, addLog]
  );

  const cancelTask = useCallback(
    (taskId) => {
      let taskToCancel = null;
      const updatedTasks = tasks.map((t) => {
        if (t.id !== taskId) return t;
        taskToCancel = t;
        return { ...t, status: '已撤销', progress: 0, robotId: null };
      });

      const updatedRobots = robots.map((r) => {
        if (taskToCancel && r.id === taskToCancel.robotId) {
          return { ...r, status: 'idle', taskId: undefined };
        }
        return { ...r };
      });

      const pathResult = planAllPaths(updatedTasks, updatedRobots, mapData);
      setTasks(updatedTasks);
      setRobots(updatedRobots);
      setPaths(pathResult.paths);
      setConflicts(pathResult.conflicts);

      addLog(`${taskId} 已撤销`);
    },
    [tasks, robots, mapData, addLog]
  );

  const progressTask = useCallback(
    (taskId) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          const newProgress = Math.min(100, t.progress + Math.floor(Math.random() * 20) + 10);
          return { ...t, progress: newProgress };
        })
      );
      addLog(`${taskId} 进度更新`);
    },
    [addLog]
  );

  const completeTask = useCallback(
    (taskId) => {
      let completedTask = null;
      const updatedTasks = tasks.map((t) => {
        if (t.id !== taskId) return t;
        completedTask = t;
        return { ...t, status: '已完成', progress: 100 };
      });

      const updatedRobots = robots.map((r) => {
        if (completedTask && r.id === completedTask.robotId) {
          const endPos = gridMap.locations[completedTask.end];
          return {
            ...r,
            status: 'idle',
            pos: endPos ? [...endPos] : r.pos,
            battery: Math.max(5, r.battery - 8),
            taskId: undefined,
          };
        }
        return { ...r };
      });

      const pathResult = planAllPaths(updatedTasks, updatedRobots, mapData);
      setTasks(updatedTasks);
      setRobots(updatedRobots);
      setPaths(pathResult.paths);
      setConflicts(pathResult.conflicts);

      addLog(`${taskId} 已完成并归档`);
    },
    [tasks, robots, mapData, addLog]
  );

  // === 路径规划 ===
  const planRoutes = useCallback(() => {
    const pathResult = planAllPaths(tasks, robots, mapData);
    setPaths(pathResult.paths);
    setConflicts(pathResult.conflicts);
    addLog(`路径规划完成，共 ${Object.keys(pathResult.paths).length} 条路径`);
    return pathResult;
  }, [tasks, robots, mapData, addLog]);

  // === 模拟自动任务推进和位置更新 Ticker ===
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prevTasks) => {
        let updated = false;
        const nextTasks = prevTasks.map((t) => {
          if (t.status !== '执行中') return t;
          const step = Math.floor(Math.random() * 8) + 6;
          const newProgress = Math.min(100, t.progress + step);

          // 更新机器人位置
          if (t.robotId) {
            setPaths((prevPaths) => {
              const path = prevPaths[t.robotId];
              if (path && path.length > 0) {
                const stepIndex = Math.min(path.length - 1, Math.floor((newProgress / 100) * path.length));
                const nextPos = path[stepIndex];
                setRobots((prevRobots) =>
                  prevRobots.map((r) =>
                    r.id === t.robotId
                      ? {
                          ...r,
                          pos: nextPos,
                          battery: Math.max(10, r.battery - 0.4),
                          status: newProgress >= 100 ? 'idle' : 'busy',
                          taskId: newProgress >= 100 ? undefined : r.taskId,
                        }
                      : r
                  )
                );
              }
              return prevPaths;
            });
          }

          updated = true;
          if (newProgress >= 100) {
            setTimeout(() => {
              addLog(`🎉 任务已完成并归档：${t.id}`);
            }, 0);
            return { ...t, status: '已完成', progress: 100 };
          }
          return { ...t, progress: newProgress };
        });
        return updated ? nextTasks : prevTasks;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [addLog]);

  // === Users（保持不变） ===
  const [users, setUsers] = useState(initialUsers.map((u) => ({ ...u })));
  const updateUser = useCallback((userId, updates) => {
    setUsers((prev) => prev.map((u) => (u.userId === userId ? { ...u, ...updates } : u)));
  }, []);

  // === 设备数据（从 robots 同步） ===
  const devices = robots.map((r) => ({
    deviceId: r.id,
    deviceName: r.name,
    status: r.status === 'idle' ? 'STANDBY' : r.status === 'busy' ? 'WORKING' : r.status === 'charging' ? 'CHARGING' : r.status === 'paused' ? 'STANDBY' : 'FAULT',
    batteryLevel: r.battery,
    area: r.area,
    lastActiveTime: now(),
  }));

  const value = {
    // 核心数据
    robots,
    tasks,
    paths,
    conflicts,
    logs,
    metrics,
    mapData,
    devices,
    users,

    // 任务操作
    dispatchTask,
    optimizeSchedule: handleOptimizeSchedule,
    rushTask,
    cancelTask,
    progressTask,
    completeTask,

    // 机器人操作
    robotAction,

    // 路径规划
    planRoutes,

    // 日志
    addLog,

    // 用户管理
    updateUser,
  };

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider');
  return ctx;
}
