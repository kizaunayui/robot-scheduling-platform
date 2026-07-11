/**
 * simulator.js — 核心调度算法（从 Python simulator.py 移植）
 * 纯前端实现，不依赖后端
 */

// ========== 基础工具函数 ==========

function manhattan(a, b) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

function posAt(path, t) {
  return path[Math.min(t, path.length - 1)];
}

function nextCells(pos, cols, rows, obstacles) {
  const [x, y] = pos;
  const cells = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1], [x, y]];
  return cells.filter(
    (p) => p[0] >= 0 && p[0] < cols && p[1] >= 0 && p[1] < rows && !obstacles.has(`${p[0]},${p[1]}`)
  );
}

function blocked(prev, nxt, t, constraints) {
  for (const c of constraints) {
    if (c.type === 'vertex' && c.loc[0] === nxt[0] && c.loc[1] === nxt[1] && c.time === t) return true;
    if (
      c.type === 'edge' &&
      c.from[0] === prev[0] && c.from[1] === prev[1] &&
      c.to[0] === nxt[0] && c.to[1] === nxt[1] &&
      c.time === t
    ) return true;
  }
  return false;
}

// ========== A* 搜索 ==========

export function astar(start, goal, constraints, startTime, mapData) {
  const obstacles = new Set(mapData.obstacles.map((o) => `${o[0]},${o[1]}`));
  const { cols, rows } = mapData;

  const openSet = [[manhattan(start, goal), 0, startTime, start, null]];
  const best = new Map();
  const parent = new Map();
  const startKey = `${start[0]},${start[1]},${startTime}`;
  best.set(startKey, 0);

  while (openSet.length > 0) {
    openSet.sort((a, b) => a[0] - b[0]);
    const [, g, t, pos, prevState] = openSet.shift();
    const stateKey = `${pos[0]},${pos[1]},${t}`;

    if (parent.has(stateKey)) continue;
    parent.set(stateKey, prevState);

    if (pos[0] === goal[0] && pos[1] === goal[1]) {
      return rebuildFromParent(parent, stateKey);
    }

    for (const nxt of nextCells(pos, cols, rows, obstacles)) {
      const nt = t + 1;
      if (blocked(pos, nxt, nt, constraints)) continue;
      const ng = g + 1 + (nxt[0] === pos[0] && nxt[1] === pos[1] ? 0.15 : 0);
      const nKey = `${nxt[0]},${nxt[1]},${nt}`;
      if (ng < (best.get(nKey) ?? 999999)) {
        best.set(nKey, ng);
        openSet.push([ng + manhattan(nxt, goal), ng, nt, nxt, stateKey]);
      }
    }
  }
  return [];
}

function rebuildFromParent(parent, stateKey) {
  const out = [];
  let sk = stateKey;
  while (sk) {
    const parts = sk.split(',');
    out.push([parseInt(parts[0]), parseInt(parts[1])]);
    sk = parent.get(sk);
  }
  return out.reverse();
}

// ========== 路径规划 ==========

function route(agent, constraints, mapData) {
  const first = astar(agent.start, agent.pickup, constraints, 0, mapData);
  if (!first.length) return [];
  const second = astar(agent.pickup, agent.goal, constraints, first.length - 1, mapData);
  if (!second.length) return [];
  return [...first, ...second.slice(1)];
}

// ========== 冲突检测 ==========

export function firstConflict(paths) {
  const ids = Object.keys(paths);
  const maxLen = Math.max(...ids.map((id) => paths[id].length), 0);
  for (let t = 0; t < maxLen; t++) {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = ids[i], b = ids[j];
        const pa = posAt(paths[a], t);
        const pb = posAt(paths[b], t);
        if (pa[0] === pb[0] && pa[1] === pb[1]) {
          return { type: 'vertex', a, b, loc: [...pa], time: t };
        }
        if (t > 0) {
          const paPrev = posAt(paths[a], t - 1);
          const pbPrev = posAt(paths[b], t - 1);
          if (
            paPrev[0] === pb[0] && paPrev[1] === pb[1] &&
            pbPrev[0] === pa[0] && pbPrev[1] === pa[1]
          ) {
            return {
              type: 'edge', a, b,
              aFrom: [...paPrev], aTo: [...pa],
              bFrom: [...pbPrev], bTo: [...pb],
              time: t,
            };
          }
        }
      }
    }
  }
  return null;
}

function toConstraint(conflict, agentId) {
  if (conflict.type === 'vertex') {
    return { type: 'vertex', loc: conflict.loc, time: conflict.time };
  }
  const isA = agentId === conflict.a;
  return {
    type: 'edge',
    from: isA ? conflict.aFrom : conflict.bFrom,
    to: isA ? conflict.aTo : conflict.bTo,
    time: conflict.time,
  };
}

// ========== CBS 多机器人冲突消解 ==========

export function cbs(agents, mapData) {
  const constraints = {};
  agents.forEach((a) => { constraints[a.id] = []; });

  const paths = {};
  agents.forEach((a) => {
    paths[a.id] = route(a, constraints[a.id], mapData);
  });

  const heap = [[sumCosts(paths), 0, paths, constraints]];
  const conflicts = [];
  let seq = 1;

  while (heap.length > 0 && conflicts.length < 60) {
    heap.sort((a, b) => a[0] - b[0]);
    const [, , curPaths, curConstraints] = heap.shift();
    const conflict = firstConflict(curPaths);
    if (!conflict) return { paths: curPaths, conflicts };
    conflicts.push(conflict);

    for (const agentId of [conflict.a, conflict.b]) {
      const newConstraints = JSON.parse(JSON.stringify(curConstraints));
      newConstraints[agentId].push(toConstraint(conflict, agentId));
      const newPaths = JSON.parse(JSON.stringify(curPaths));
      const agent = agents.find((a) => a.id === agentId);
      const newPath = route(agent, newConstraints[agentId], mapData);
      if (newPath.length > 0) {
        newPaths[agentId] = newPath;
        heap.push([sumCosts(newPaths), seq++, newPaths, newConstraints]);
      }
    }
  }
  return { paths, conflicts };
}

function sumCosts(paths) {
  return Object.values(paths).reduce((s, p) => s + Math.max(0, p.length - 1), 0);
}

// ========== 机器人评分 ==========

export function scoreRobot(robot, task, mapData) {
  if (!robot.skills.includes(task.type)) return { score: -1000, reasons: ['类型不匹配'] };
  if (task.weight > robot.capacity) return { score: -1000, reasons: ['载重不足'] };

  const loc = mapData.locations[task.start];
  let score =
    robot.battery * 0.35 +
    robot.speed * 8 +
    task.priority * 12 -
    manhattan(robot.pos, loc);

  const reasons = ['任务能力匹配', '载重满足'];
  if (task.type === 'specimen' && robot.container === 'cold') {
    score += 20;
    reasons.push('冷链舱位匹配');
  }
  if (task.type === 'instrument' && robot.container === 'sealed') {
    score += 16;
    reasons.push('密闭舱位匹配');
  }
  if (robot.battery > 70) reasons.push('电量充足');

  return { score, reasons };
}

// ========== 任务类型名称 ==========

export function typeName(taskType) {
  const map = {
    medicine: '药品配送',
    specimen: '标本送检',
    instrument: '器械运输',
    linen: '被服运输',
    meal: '餐食配送',
  };
  return map[taskType] || '物流任务';
}

// ========== 调度优化 ==========

export function optimizeSchedule(tasks, robots, mapData) {
  const available = {};
  robots.forEach((r) => {
    if (r.status === 'idle' || r.status === '空闲') available[r.id] = r;
  });

  const sortedTasks = [...tasks].sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));
  const logs = [];

  for (const task of sortedTasks) {
    if (task.status !== '待派发' && task.status !== '加急') continue;

    let bestScore = -Infinity;
    let bestRobot = null;
    let bestReasons = [];

    for (const robot of Object.values(available)) {
      const { score, reasons } = scoreRobot(robot, task, mapData);
      if (score > bestScore) {
        bestScore = score;
        bestRobot = robot;
        bestReasons = reasons;
      }
    }

    if (!bestRobot || bestScore <= -999) continue;

    task.robotId = bestRobot.id;
    task.status = '执行中';
    task.matchScore = Math.round(bestScore * 10) / 10;
    task.matchReasons = bestReasons;
    bestRobot.status = 'busy';
    bestRobot.taskId = task.id;
    delete available[bestRobot.id];

    logs.push(`${task.id} 派发给 ${bestRobot.id}，原因：${bestReasons.join('、')}`);
  }

  return { tasks, robots, logs };
}

// ========== 路径规划（所有执行中任务） ==========

export function planAllPaths(tasks, robots, mapData) {
  const agents = [];
  const loc = mapData.locations;

  for (const task of tasks) {
    if (task.status !== '执行中' || !task.robotId) continue;
    const robot = robots.find((r) => r.id === task.robotId);
    if (!robot) continue;
    agents.push({
      id: robot.id,
      start: [...robot.pos],
      pickup: [...loc[task.start]],
      goal: [...loc[task.end]],
      priority: task.priority,
    });
  }

  if (agents.length === 0) return { paths: {}, conflicts: [] };
  return cbs(agents, mapData);
}

// ========== 统计指标 ==========

export function calculateMetrics(tasks, robots, paths) {
  const running = tasks.filter((t) => t.status === '执行中');
  const completed = tasks.filter((t) => t.status === '已完成');
  const pathValues = Object.values(paths || {});
  return {
    totalTasks: tasks.length,
    runningTasks: running.length,
    completedTasks: completed.length,
    onlineRobots: robots.filter((r) => r.status !== 'fault').length,
    utilization: Math.round((running.length / Math.max(robots.length, 1)) * 100) / 100,
    conflictsResolved: 0,
    sumOfCosts: pathValues.reduce((s, p) => s + Math.max(0, p.length - 1), 0),
    makespan: Math.max(...pathValues.map((p) => Math.max(0, p.length - 1)), 0),
  };
}
