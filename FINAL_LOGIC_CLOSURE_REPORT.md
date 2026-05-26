# robot-scheduling-platform 融合报告

## 软著核心

从 simulator.py 移植了 A*搜索、CBS多机器人冲突消解、机器人评分（skills/capacity/container/battery/distance/priority）、任务全生命周期调度（创建→派发→加急→撤销→推进→完成）、动态统计指标共11个核心函数，9个页面全部对接真实状态流。

## 一句话

调度平台已实现创建任务→推荐机器人→派发→路径→地图→统计→日志的完整业务闭环，构建部署通过。

## 不足

机器人移动为路径展示而非实时动画，数据刷新后重置，无真实后端通信。

## 构建产物

- CSS: 23.00 kB (gzip: 5.00 kB)
- JS: 662.63 kB (gzip: 195.61 kB)
- 构建时间: <1s
- 访问地址: https://kizaunayui.github.io/robot-scheduling-platform/
