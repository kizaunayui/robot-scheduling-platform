// 调度算法层 - 智能任务分配与路径规划
import { mapNodes, mapEdges } from '../data/mapData';

// ========== 路径规划 (BFS/Dijkstra) ==========

// 构建邻接表
function buildAdjList(nodes, edges) {
  const adjList = new Map();
  nodes.forEach(n => adjList.set(n.id, []));
  edges.forEach(e => {
    if (!adjList.has(e.from)) adjList.set(e.from, []);
    if (!adjList.has(e.to)) adjList.set(e.to, []);
    adjList.get(e.from).push({ to: e.to, cost: e.cost || 1, distance: e.distance || 100, isElevator: e.isElevator });
    adjList.get(e.to).push({ to: e.from, cost: e.cost || 1, distance: e.distance || 100, isElevator: e.isElevator });
  });
  return adjList;
}

// Dijkstra 最短路径
export function findShortestPath(startId, endId) {
  const adjList = buildAdjList(mapNodes, mapEdges);

  const dist = new Map();
  const prev = new Map();
  const visited = new Set();
  const pq = []; // priority queue [{id, dist}]

  mapNodes.forEach(n => dist.set(n.id, Infinity));
  dist.set(startId, 0);
  pq.push({ id: startId, d: 0 });

  while (pq.length > 0) {
    pq.sort((a, b) => a.d - b.d);
    const { id: current } = pq.shift();
    if (visited.has(current)) continue;
    visited.add(current);

    if (current === endId) break;

    const neighbors = adjList.get(current) || [];
    for (const { to, cost } of neighbors) {
      if (visited.has(to)) continue;
      const newDist = dist.get(current) + cost;
      if (newDist < dist.get(to)) {
        dist.set(to, newDist);
        prev.set(to, current);
        pq.push({ id: to, d: newDist });
      }
    }
  }

  // 重建路径
  if (dist.get(endId) === Infinity) {
    return { path: [], distance: 0, time: 0, energy: 0, risk: 'low', reachable: false };
  }

  const path = [];
  let c = endId;
  while (c) {
    path.unshift(c);
    c = prev.get(c);
  }

  const totalDist = dist.get(endId);
  return {
    path,
    distance: Math.round(totalDist * 10), // 米
    time: Math.round(totalDist * 10 / 60), // 分钟 (假设1m/s)
    energy: Math.round(totalDist * 2), // 电量消耗百分比
    risk: totalDist > 10 ? 'high' : totalDist > 5 ? 'medium' : 'low',
    reachable: true,
  };
}

// 生成多条路径方案
export function findMultiplePaths(startId, endId) {
  const routeA = findShortestPath(startId, endId);
  if (!routeA.reachable) return { routeA, routeB: { ...routeA }, routeC: { ...routeA } };

  routeA.label = '最优路径A';

  // 备用路径B：模拟绕路（增加某些边代价）
  const altEdges = mapEdges.map(e => ({
    ...e,
    cost: e.cost * (1.2 + Math.random() * 0.3),
  }));
  const adjListB = new Map();
  mapNodes.forEach(n => adjListB.set(n.id, []));
  altEdges.forEach(e => {
    adjListB.get(e.from)?.push({ to: e.to, cost: e.cost });
    adjListB.get(e.to)?.push({ to: e.from, cost: e.cost });
  });

  const distB = new Map();
  const prevB = new Map();
  const visitedB = new Set();
  const pqB = [];
  mapNodes.forEach(n => distB.set(n.id, Infinity));
  distB.set(startId, 0);
  pqB.push({ id: startId, d: 0 });

  while (pqB.length > 0) {
    pqB.sort((a, b) => a.d - b.d);
    const { id: cur } = pqB.shift();
    if (visitedB.has(cur)) continue;
    visitedB.add(cur);
    if (cur === endId) break;
    for (const { to, cost } of (adjListB.get(cur) || [])) {
      if (visitedB.has(to)) continue;
      const nd = distB.get(cur) + cost;
      if (nd < distB.get(to)) { distB.set(to, nd); prevB.set(to, cur); pqB.push({ id: to, d: nd }); }
    }
  }

  const pathB = [];
  let cb = endId;
  while (cb) { pathB.unshift(cb); cb = prevB.get(cb); }
  const routeB = {
    label: '备用路径B',
    path: pathB,
    distance: Math.round(distB.get(endId) * 10),
    time: Math.round(routeA.time * 1.3),
    energy: Math.round(routeA.energy * 1.2),
    risk: 'medium',
    reachable: distB.get(endId) !== Infinity,
  };

  // 应急路径C
  const routeC = {
    label: '应急路径C',
    path: routeA.path,
    distance: Math.round(routeA.distance * 1.5),
    time: Math.round(routeA.time * 1.6),
    energy: Math.round(routeA.energy * 1.4),
    risk: 'high',
    reachable: true,
  };

  return { routeA, routeB, routeC };
}

// ========== 任务分配算法 ==========

// 计算机器人到目标的综合评分
function scoreRobot(robot, task, nodeMap) {
  let score = 0;

  // 1. 状态匹配 (40分)
  if (robot.status === 'idle') score += 40;
  else if (robot.status === 'running') score += 10;
  else if (robot.status === 'charging') score -= 20;
  else if (robot.status === 'error') score -= 100;

  // 2. 类型匹配 (30分)
  if (robot.type === task.taskType) score += 30;
  else if (task.taskType === '药品配送' && robot.type === '药品配送') score += 25;
  else score += 5;

  // 3. 电量充足 (20分)
  if (robot.battery > 60) score += 20;
  else if (robot.battery > 40) score += 10;
  else if (robot.battery > 20) score += 5;
  else score -= 10;

  // 4. 距离接近 (10分) - 简化为楼层匹配
  const startNode = nodeMap.get(task.startNodeId);
  if (startNode && robot.floor === startNode.floor) score += 10;

  return score;
}

// 智能任务分配
export function allocateTask(task, robots) {
  const nodeMap = new Map(mapNodes.map(n => [n.id, n]));

  // 找到起始节点ID
  const startNode = mapNodes.find(n => n.name === task.startLocation || n.id === task.startNodeId);
  const endNode = mapNodes.find(n => n.name === task.endLocation || n.id === task.endNodeId);

  if (!startNode || !endNode) {
    return { robot: null, path: null, reason: '无法找到起止节点' };
  }

  // 对每个可用机器人评分
  const scored = robots
    .filter(r => r.status !== 'error')
    .map(r => ({
      robot: r,
      score: scoreRobot(r, { ...task, startNodeId: startNode.id }, nodeMap),
    }))
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return { robot: null, path: null, reason: '无可用机器人' };

  const best = scored[0];
  const path = findShortestPath(startNode.id, endNode.id);

  return {
    robot: best.robot,
    path,
    score: best.score,
    reason: `分配给${best.robot.name}（评分${best.score}）`,
  };
}

// ========== 冲突检测 ==========

export function detectConflicts(robots) {
  const conflicts = [];
  const runningRobots = robots.filter(r => r.status === 'running' && r.taskId);

  for (let i = 0; i < runningRobots.length; i++) {
    for (let j = i + 1; j < runningRobots.length; j++) {
      const r1 = runningRobots[i];
      const r2 = runningRobots[j];

      // 同楼层 + 相近位置 → 潜在冲突
      if (r1.floor === r2.floor) {
        const dist = Math.hypot(r1.x - r2.x, r1.y - r2.y);
        if (dist < 100) {
          conflicts.push({
            id: `conflict-${r1.id}-${r2.id}`,
            robot1: r1,
            robot2: r2,
            type: '路径交叉',
            severity: dist < 50 ? 'high' : 'medium',
            location: `${r1.floor}层`,
            resolved: false,
          });
        }
      }
    }
  }
  return conflicts;
}

// ========== 负载均衡 ==========

export function calculateLoadBalance(robots) {
  const typeLoad = {};
  robots.forEach(r => {
    if (!typeLoad[r.type]) typeLoad[r.type] = { total: 0, busy: 0 };
    typeLoad[r.type].total++;
    if (r.status === 'running') typeLoad[r.type].busy++;
  });

  return Object.entries(typeLoad).map(([type, data]) => ({
    type,
    total: data.total,
    busy: data.busy,
    idle: data.total - data.busy,
    utilization: data.total > 0 ? Math.round((data.busy / data.total) * 100) : 0,
  }));
}

// ========== 紧急任务插队 ==========

export function prioritizeTask(task, queue) {
  if (task.priority !== 'HIGH') return queue;

  // 高优先级任务插到队列最前面
  const newQueue = [task, ...queue.filter(t => t.taskId !== task.taskId)];
  return newQueue;
}

// ========== 指标计算 ==========

export function calculateMetrics(path, robot) {
  if (!path?.reachable) return null;

  const distanceKm = (path.distance / 1000).toFixed(2);
  const timeMin = path.time;
  const energyConsumption = path.energy;
  const riskLevel = path.risk;

  // 预计到达时间
  const now = new Date();
  const eta = new Date(now.getTime() + timeMin * 60000);
  const etaStr = `${String(eta.getHours()).padStart(2, '0')}:${String(eta.getMinutes()).padStart(2, '0')}`;

  return {
    distance: `${path.distance}m (${distanceKm}km)`,
    time: `${timeMin}分钟`,
    energy: `${energyConsumption}%`,
    risk: riskLevel,
    eta: etaStr,
    efficiency: robot ? Math.round((robot.speed / 1.5) * 100) : 80,
  };
}
