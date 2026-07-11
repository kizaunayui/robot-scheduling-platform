import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { gridMap, gridRobots, gridTasks } from '../data/mapData';
import {
  optimizeSchedule,
  planAllPaths,
  calculateMetrics,
  typeName,
  scoreRobot,
} from '../utils/simulator';

const AppStoreContext = createContext(null);

function now() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

export function AppStoreProvider({ children }) {
  const [robots, setRobots] = useState(gridRobots.map((r) => ({ ...r })));
  const [tasks, setTasks] = useState(gridTasks.map((t) => ({ ...t })));
  const [paths, setPaths] = useState({});
  const [conflicts, setConflicts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [totalConflicts, setTotalConflicts] = useState(0);
  const [resolvedConflicts, setResolvedConflicts] = useState(0);
  const [simulationRunning, setSimulationRunning] = useState(false);

  const addLog = useCallback((message) => {
    setLogs((prev) => [{ time: now(), message }, ...prev].slice(0, 120));
  }, []);

  const baseMetrics = calculateMetrics(tasks, robots, paths);
  const metrics = { ...baseMetrics, totalConflicts, conflictsResolved: resolvedConflicts };
  const mapData = gridMap;

  // 派发任务（新建任务+立即调度）
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

      const updatedTasks = [...tasks, newTask];
      const updatedRobots = robots.map((r) => ({ ...r }));

      const result = optimizeSchedule(updatedTasks, updatedRobots, mapData);
      const pathResult = planAllPaths(result.tasks, result.robots, mapData);

      setTasks(result.tasks);
      setRobots(result.robots);
      setPaths(pathResult.paths);
      setConflicts(pathResult.conflicts);
      setSimulationRunning(result.tasks.some((task) => task.status === '执行中'));
      if (pathResult.conflicts.length > 0) {
        setTotalConflicts((prev) => prev + pathResult.conflicts.length);
        setResolvedConflicts((prev) => prev + pathResult.conflicts.length);
      }

      addLog(`新增任务 ${newTask.id}：${newTask.name}`);
      result.logs.forEach((l) => addLog(l));
      if (pathResult.conflicts.length > 0) {
        addLog(`检测到 ${pathResult.conflicts.length} 个路径冲突，已自动消解`);
      }
    },
    [tasks, robots, mapData, addLog]
  );

  // 派发已有任务（不创建新任务）
  const dispatchExistingTask = useCallback(
    (taskId) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      if (task.status !== '待派发' && task.status !== '加急') return;

      const updatedTasks = tasks.map((t) => ({ ...t }));
      const updatedRobots = robots.map((r) => ({ ...r }));

      const result = optimizeSchedule(updatedTasks, updatedRobots, mapData);
      const pathResult = planAllPaths(result.tasks, result.robots, mapData);

      setTasks(result.tasks);
      setRobots(result.robots);
      setPaths(pathResult.paths);
      setConflicts(pathResult.conflicts);
      setSimulationRunning(result.tasks.some((item) => item.status === '执行中'));
      if (pathResult.conflicts.length > 0) {
        setTotalConflicts((prev) => prev + pathResult.conflicts.length);
        setResolvedConflicts((prev) => prev + pathResult.conflicts.length);
      }

      const dispatched = result.tasks.find((t) => t.id === taskId);
      if (dispatched && dispatched.status === '执行中') {
        addLog(`${taskId} 已派发给 ${dispatched.robotId}，原因：${(dispatched.matchReasons || []).join('、')}`);
      } else {
        addLog(`${taskId} 派发失败：无可用机器人`);
      }
      result.logs.forEach((l) => addLog(l));
      if (pathResult.conflicts.length > 0) {
        addLog(`检测到 ${pathResult.conflicts.length} 个路径冲突，已自动消解`);
      }
    },
    [tasks, robots, mapData, addLog]
  );

  // 批量优化调度
  const handleOptimizeSchedule = useCallback(() => {
    const updatedTasks = tasks.map((t) => ({ ...t }));
    const updatedRobots = robots.map((r) => ({ ...r }));

    const result = optimizeSchedule(updatedTasks, updatedRobots, mapData);
    const pathResult = planAllPaths(result.tasks, result.robots, mapData);

    setTasks(result.tasks);
    setRobots(result.robots);
    setPaths(pathResult.paths);
    setConflicts(pathResult.conflicts);
    if (pathResult.conflicts.length > 0) {
      setTotalConflicts((prev) => prev + pathResult.conflicts.length);
      setResolvedConflicts((prev) => prev + pathResult.conflicts.length);
    }

    addLog('执行批量优化调度');
    result.logs.forEach((l) => addLog(l));
    return { ...result, paths: pathResult.paths };
  }, [tasks, robots, mapData, addLog]);

  const startSimulation = useCallback(() => {
    const result = handleOptimizeSchedule();
    const hasRunningTasks = result.tasks.some((task) => task.status === '执行中');
    setSimulationRunning(hasRunningTasks);
    addLog(hasRunningTasks ? '调度仿真开始运行' : '当前没有可运行的任务');
  }, [handleOptimizeSchedule, addLog]);

  const pauseSimulation = useCallback(() => {
    setSimulationRunning(false);
    addLog('调度仿真已暂停');
  }, [addLog]);

  const toggleSimulation = useCallback(() => {
    if (simulationRunning) pauseSimulation();
    else startSimulation();
  }, [simulationRunning, pauseSimulation, startSimulation]);

  // 机器人操作
  const robotAction = useCallback(
    (robotId, action) => {
      const robot = robots.find((item) => item.id === robotId);
      if (!robot) return;

      if (action === 'pause') {
        const updatedTasks = tasks.map((task) =>
          task.id === robot.taskId ? { ...task, status: '已暂停' } : { ...task }
        );
        const updatedRobots = robots.map((item) =>
          item.id === robotId ? { ...item, status: 'paused' } : { ...item }
        );
        const pathResult = planAllPaths(updatedTasks, updatedRobots, mapData);
        setTasks(updatedTasks);
        setRobots(updatedRobots);
        setPaths(pathResult.paths);
        setConflicts(pathResult.conflicts);
        addLog(robot.taskId ? `${robotId} 已暂停，任务 ${robot.taskId} 同步暂停` : `${robotId} 已暂停`);
        return;
      }

      if (action === 'start') {
        if (robot.status === 'paused' && robot.taskId) {
          const updatedTasks = tasks.map((task) =>
            task.id === robot.taskId ? { ...task, status: '执行中' } : { ...task }
          );
          const updatedRobots = robots.map((item) =>
            item.id === robotId ? { ...item, status: 'busy' } : { ...item }
          );
          const pathResult = planAllPaths(updatedTasks, updatedRobots, mapData);
          setTasks(updatedTasks);
          setRobots(updatedRobots);
          setPaths(pathResult.paths);
          setConflicts(pathResult.conflicts);
          setSimulationRunning(true);
          addLog(`${robotId} 已继续执行任务 ${robot.taskId}`);
        } else {
          setRobots((prev) => prev.map((item) =>
            item.id === robotId
              ? { ...item, status: 'idle', battery: robot.status === 'charging' ? 100 : item.battery }
              : item
          ));
          addLog(robot.status === 'charging' ? `${robotId} 已完成充电并恢复空闲` : `${robotId} 已启动`);
        }
        return;
      }

      if (action === 'charge') {
        if (robot.taskId) {
          const updatedTasks = tasks.map((task) =>
            task.id === robot.taskId
              ? { ...task, status: '待派发', robotId: null, matchScore: undefined, matchReasons: undefined }
              : { ...task }
          );
          const updatedRobots = robots.map((item) =>
            item.id === robotId
              ? { ...item, status: 'charging', taskId: undefined, pos: [...gridMap.locations['充电站']] }
              : { ...item }
          );
          const result = optimizeSchedule(updatedTasks, updatedRobots, mapData);
          const pathResult = planAllPaths(result.tasks, result.robots, mapData);
          setTasks(result.tasks);
          setRobots(result.robots);
          setPaths(pathResult.paths);
          setConflicts(pathResult.conflicts);
          setSimulationRunning((running) => running && result.tasks.some((task) => task.status === '执行中'));
          addLog(`${robotId} 已回充，任务 ${robot.taskId} 已重新排队并尝试改派`);
          result.logs.forEach((message) => addLog(message));
        } else {
          setRobots((prev) => prev.map((item) =>
            item.id === robotId
              ? { ...item, status: 'charging', pos: [...gridMap.locations['充电站']] }
              : item
          ));
          addLog(`${robotId} 已前往充电站`);
        }
        return;
      }

      if (action === 'fault') {
        // 检查机器人是否有正在执行的任务
        if (robot.taskId) {
          // 有任务：重调度
          const updatedTasks = tasks.map((t) => {
            if (t.id === robot.taskId) {
              return { ...t, status: '待派发', robotId: null, matchScore: undefined, matchReasons: undefined };
            }
            return { ...t };
          });

          const updatedRobots = robots.map((r) => {
            if (r.id === robotId) {
              return { ...r, status: 'error', taskId: undefined };
            }
            return { ...r };
          });

          // 重新调度
          const result = optimizeSchedule(updatedTasks, updatedRobots, mapData);
          const pathResult = planAllPaths(result.tasks, result.robots, mapData);

          setTasks(result.tasks);
          setRobots(result.robots);
          setPaths(pathResult.paths);
          setConflicts(pathResult.conflicts);
          if (pathResult.conflicts.length > 0) {
            setTotalConflicts((prev) => prev + pathResult.conflicts.length);
            setResolvedConflicts((prev) => prev + pathResult.conflicts.length);
          }

          addLog(`机器人 ${robotId} 故障，任务 ${robot.taskId} 已触发重调度`);
          result.logs.forEach((l) => addLog(l));
          if (pathResult.conflicts.length > 0) {
            addLog(`检测到 ${pathResult.conflicts.length} 个路径冲突，已自动消解`);
          }
        } else {
          // 空闲机器人：只改变状态
          setRobots((prev) =>
            prev.map((r) => {
              if (r.id !== robotId) return r;
              return { ...r, status: 'error' };
            })
          );
          addLog(`${robotId} 执行操作：fault`);
        }
      } else if (action === 'recover') {
        setRobots((prev) =>
          prev.map((r) => {
            if (r.id !== robotId) return r;
            return { ...r, status: 'idle', taskId: undefined };
          })
        );
        addLog(`${robotId} 执行操作：recover`);
      }
    },
    [robots, tasks, mapData, addLog]
  );

  // 任务操作
  const rushTask = useCallback(
    (taskId) => {
      const updatedTasks = tasks.map((t) => {
        if (t.id !== taskId) return t;
        return { ...t, priority: 3, status: t.status === '待派发' ? '加急' : t.status };
      });
      const updatedRobots = robots.map((r) => ({ ...r }));
      const result = optimizeSchedule(updatedTasks, updatedRobots, mapData);
      const pathResult = planAllPaths(result.tasks, result.robots, mapData);

      setTasks(result.tasks);
      setRobots(result.robots);
      setPaths(pathResult.paths);
      setConflicts(pathResult.conflicts);
      if (pathResult.conflicts.length > 0) {
        setTotalConflicts((prev) => prev + pathResult.conflicts.length);
        setResolvedConflicts((prev) => prev + pathResult.conflicts.length);
      }

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
      if (pathResult.conflicts.length > 0) {
        setTotalConflicts((prev) => prev + pathResult.conflicts.length);
        setResolvedConflicts((prev) => prev + pathResult.conflicts.length);
      }

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
      if (pathResult.conflicts.length > 0) {
        setTotalConflicts((prev) => prev + pathResult.conflicts.length);
        setResolvedConflicts((prev) => prev + pathResult.conflicts.length);
      }

      addLog(`${taskId} 已完成并归档`);
    },
    [tasks, robots, mapData, addLog]
  );

  // 路径规划
  const planRoutes = useCallback(() => {
    const pathResult = planAllPaths(tasks, robots, mapData);
    setPaths(pathResult.paths);
    setConflicts(pathResult.conflicts);
    if (pathResult.conflicts.length > 0) {
      setTotalConflicts((prev) => prev + pathResult.conflicts.length);
      setResolvedConflicts((prev) => prev + pathResult.conflicts.length);
    }
    addLog(`路径规划完成，共 ${Object.keys(pathResult.paths).length} 条路径`);
    return pathResult;
  }, [tasks, robots, mapData, addLog]);

  // 重置仿真
  const resetSimulation = useCallback(() => {
    setRobots(gridRobots.map((r) => ({ ...r })));
    setTasks(gridTasks.map((t) => ({ ...t })));
    setPaths({});
    setConflicts([]);
    setLogs([]);
    setTotalConflicts(0);
    setResolvedConflicts(0);
    setSimulationRunning(false);
    addLog('仿真已重置');
  }, [addLog]);

  const advanceSimulation = useCallback((fixedStep = null) => {
    setTasks((prevTasks) => {
      const robotUpdates = new Map();
      const completedRobotIds = [];
      let updated = false;

      const nextTasks = prevTasks.map((task) => {
        if (task.status !== '执行中') return task;
        const step = fixedStep ?? (Math.floor(Math.random() * 8) + 6);
        const newProgress = Math.min(100, task.progress + step);
        const path = task.robotId ? paths[task.robotId] : null;
        const nextPos = path?.length
          ? path[Math.min(path.length - 1, Math.floor((newProgress / 100) * path.length))]
          : null;

        if (task.robotId) {
          robotUpdates.set(task.robotId, { progress: newProgress, pos: nextPos });
          if (newProgress >= 100) completedRobotIds.push(task.robotId);
        }

        updated = true;
        if (newProgress >= 100) {
          setTimeout(() => addLog(`任务已完成并归档：${task.id}`), 0);
          return { ...task, status: '已完成', progress: 100 };
        }
        return { ...task, progress: newProgress };
      });

      if (!updated) return prevTasks;

      setRobots((prevRobots) => prevRobots.map((robot) => {
        const update = robotUpdates.get(robot.id);
        if (!update) return robot;
        return {
          ...robot,
          pos: update.pos || robot.pos,
          battery: Math.max(10, robot.battery - 0.4),
          status: update.progress >= 100 ? 'idle' : 'busy',
          taskId: update.progress >= 100 ? undefined : robot.taskId,
        };
      }));

      if (completedRobotIds.length > 0) {
        setPaths((prevPaths) => {
          const nextPaths = { ...prevPaths };
          completedRobotIds.forEach((robotId) => delete nextPaths[robotId]);
          return nextPaths;
        });
      }

      if (!nextTasks.some((task) => task.status === '执行中')) {
        setTimeout(() => setSimulationRunning(false), 0);
      }
      return nextTasks;
    });
  }, [paths, addLog]);

  const stepSimulation = useCallback(() => {
    if (simulationRunning) return;
    if (!tasks.some((task) => task.status === '执行中')) {
      addLog('当前没有可单步推进的执行中任务');
      return;
    }
    advanceSimulation(10);
    addLog('仿真已单步推进 10%');
  }, [simulationRunning, tasks, advanceSimulation, addLog]);

  // 只有在“运行”状态下才自动推进任务。
  useEffect(() => {
    if (!simulationRunning) return undefined;
    const interval = setInterval(() => advanceSimulation(), 2000);
    return () => clearInterval(interval);
  }, [simulationRunning, advanceSimulation]);

  // 获取任务推荐理由
  const getRecommendation = useCallback(
    (task) => {
      const available = robots.filter((r) => r.status === 'idle');
      if (available.length === 0) return null;

      let bestScore = -Infinity;
      let bestRobot = null;
      let bestReasons = [];

      for (const robot of available) {
        const { score, reasons } = scoreRobot(robot, task, mapData);
        if (score > bestScore) {
          bestScore = score;
          bestRobot = robot;
          bestReasons = reasons;
        }
      }

      return bestRobot && bestScore > -1000
        ? { robot: bestRobot, score: bestScore, reasons: bestReasons }
        : null;
    },
    [robots, mapData]
  );

  const value = {
    robots,
    tasks,
    paths,
    conflicts,
    logs,
    metrics,
    mapData,
    simulationRunning,

    dispatchTask,
    dispatchExistingTask,
    optimizeSchedule: handleOptimizeSchedule,
    startSimulation,
    pauseSimulation,
    toggleSimulation,
    stepSimulation,
    rushTask,
    cancelTask,
    progressTask,
    completeTask,
    robotAction,
    planRoutes,
    resetSimulation,
    addLog,
    getRecommendation,
  };

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider');
  return ctx;
}
