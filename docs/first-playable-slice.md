# 首个可玩版本规格说明书

> **文档目标**：定义一个紧凑、可执行的首个可玩版本范围，供编排者分派任务使用。

---

## 1. 目标

交付一个**本地双人的、桌面网页端的、具有明确合作游戏循环**的《疯狂兔子人》风格原型。两名玩家通过键盘分别操控两只笨拙滚动的兔子，穿越三个短小的训练关卡，目标是让两只兔子都滚进虫洞通关。胡萝卜作为可选收集品提供风险奖励，抓取则作为合作物理的第一步。

此版本的核心验证点：
- 两名玩家能在 30 秒内理解各自操控方式
- 物理手感"笨拙但可控"，能形成肌肉记忆
- 三个关卡构成有节奏的双人训练序列
- 胜负流程清晰、无死锁

### 1.1 快速验证命令

```bash
# 验证测试通过
npm test -- --run

# 验证构建成功
npm run build

# 启动开发服务器进行手动测试
npm run dev
```

---

## 2. 当前仓库状态

### 2.1 已实现模块

| 模块 | 文件 | 状态 |
|------|------|------|
| 主游戏循环 | `src/Game.ts` | ✅ 完整，包含关卡加载、胜负判定、UI 绑定 |
| 玩家控制器 | `src/entities/Player.ts` | ✅ 完整，包含滚动、踢腿、动画同步 |
| 玩家调参 | `src/entities/playerTuning.ts` | ✅ 已提取，参数集中管理 |
| 踢腿物理 | `src/entities/kickPhysics.ts` | ✅ 完整，包含探针、冲量计算 |
| 玩家动画 | `src/entities/playerAnimation.ts` | ✅ 完整 |
| 相机控制器 | `src/camera/CameraController.ts` | ✅ 完整，包含预测、平滑、下落补偿 |
| 游戏状态机 | `src/game/gameState.ts` | ✅ 完整，包含 playing/cleared/failed/respawning |
| 反馈文案 | `src/game/feedback.ts` | ✅ 完整，中文文案 |
| 关卡数据 | `src/levels/levelData.ts` | ✅ 三个训练关卡已配置 |
| 关卡类型 | `src/levels/types.ts` | ✅ 定义完整 |
| 关卡目标 | `src/levels/levelGoals.ts` | ✅ 出口判定（胡萝卜不再为硬门槛） |
| 关卡进程 | `src/levels/levelProgression.ts` | ✅ 关卡索引规范化、通关判定 |
| 地面实体 | `src/entities/Ground.ts` | ✅ 完整 |
| 胡萝卜实体 | `src/entities/Carrot.ts` | ✅ 完整 |
| 出口虫洞 | `src/entities/ExitPortal.ts` | ✅ 新增（未追踪） |
| 单人输入控制 | `src/controls/InputController.ts` | ✅ 保留兼容测试 |
| 双人输入控制 | `src/controls/MultiInputController.ts` | ✅ 完整 |
| 物理世界 | `src/physics/PhysicsWorld.ts` | ✅ 完整 |
| 入口 | `src/main.ts` | ✅ 完整 |
| HTML/CSS | `index.html` | ✅ 完整，包含 HUD、胜负弹窗 |
| 单元测试 | `src/**/__tests__/*.test.ts` | ✅ 覆盖关键模块 |

### 2.2 工作目录变更

**已修改文件（未暂存）：**
- `index.html`, `src/Game.ts`, `src/entities/Player.ts`, `src/entities/Carrot.ts`, `src/entities/Ground.ts`, `src/entities/kickPhysics.ts`, `src/entities/__tests__/kickPhysics.test.ts`

**新增文件（未追踪）：**
- `src/entities/ExitPortal.ts` — 出口虫洞视觉与动画
- `src/camera/` — 相机控制器及测试
- `src/game/` — 游戏状态机、反馈文案及测试
- `src/entities/playerTuning.ts` — 玩家参数提取
- `src/controls/MultiInputController.ts` — 多人输入控制器
- `src/levels/` — 关卡系统重构
- `docs/plans/2026-03-17-level-system-*.md` — 关卡系统设计与实现
- `docs/plans/2026-03-18-super-bunny-man-replica-*.md` — 设计与实现计划

### 2.3 依赖栈

- **运行时**：TypeScript + Three.js + cannon-es + Vite
- **测试**：Vitest + jsdom（Playwright 已安装但未启用）
- **构建**：`npm run build`（TypeScript 检查 + Vite 打包）

---

## 3. 首个可玩版本范围

### 3.1 核心循环

```
[加载关卡] → [双人合作进行中(playing)] → [两只兔子都到达出口] → [显示过关弹窗] → [加载下一关]
                        ↓
                [任意一只兔子掉落低于 fallLimit]
                        ↓
                  [显示失败弹窗] → [重开当前关(R/点击)]
```

### 3.2 输入映射

| 按键 | 行为 |
|------|------|
| A / D | 玩家1 左右滚动 |
| Space | 玩家1 蹬腿 |
| W | 玩家1 抓住队友/地形 |
| ← / → | 玩家2 左右滚动 |
| Enter / Right Shift | 玩家2 蹬腿 |
| ↑ | 玩家2 抓住队友/地形 |
| R | 重开当前关卡 |
| Space | 过关后进入下一关/重新开始 |

### 3.3 胜负条件

- **胜利**：两名玩家的碰撞体都进入出口虫洞半径内 → 关卡通过
- **失败**：任一玩家 Y 坐标低于关卡 `fallLimit` → 团队失败
- **胡萝卜**：可选收集，不影响通关，仅作为 HUD 统计
- **抓取**：玩家可抓住另一只兔子，或在近距离内抓住地形形成约束

---

## 4. 范围界定

### 4.1 本次范围内

1. **玩家物理手感**：滚动扭矩、空中控制、踢腿冲量、落地衰减、角速度钳制
2. **相机系统**：跟随、预测、下落补偿、平滑阻尼
3. **游戏状态机**：playing / cleared / failed / respawning 四态切换
4. **三个训练关卡**：
   - 1-1 翻滚热身：平缓斜坡，单一胡萝卜
   - 1-2 失衡恢复：落差平台，需要踢腿恢复
   - 1-3 节奏连滚：连续斜坡、可选胡萝卜奖励
5. **本地双人合作**：双兔子、共享镜头、双人同步过关/失败
6. **最小抓取物理**：抓队友、抓地形、基础约束生命周期
7. **UI/HUD**：胡萝卜计数、计时器、关卡指示、胜负弹窗、双人操作提示
8. **单元测试**：输入、调参、关卡目标、相机计算、游戏状态、抓取规则

### 4.2 本次范围外

| 功能 | 原因 |
|------|------|
| 完整搬运/拖拽手感 | 还未做更精细的协作调参 |
| 检查点/中途复活 | 目前仍是整队重开 |
| 世界地图/章节选择 | 当前三个关卡已足够验证核心循环 |
| 复杂机关（车辆、传送带） | 超出首个原型范围 |
| 音效/音乐管线 | 后续版本添加 |
| 移动端触控 | 仅桌面网页 |

---

## 5. 验收标准

### 5.1 功能验收

- [ ] 运行 `npm run dev`，游戏可启动，无控制台错误
- [ ] 玩家1/玩家2 都可独立滚动、蹬腿、抓取
- [ ] 相机跟随两名玩家，分离时能拉远视野
- [ ] 三个关卡均可通过双人合作到达出口通关
- [ ] 胡萝卜可收集但不影响通关条件
- [ ] 任一玩家掉落时显示失败弹窗，R 或按钮可重开
- [ ] 过关后显示通关弹窗，Space 或按钮进入下一关
- [ ] 第三关通关后显示"训练世界完成"，可重新开始
- [ ] 抓队友与抓地形都能在真实浏览器里触发

### 5.2 质量验收

- [x] `npm test -- --run` 全部通过（13 测试文件 / 61 测试用例）
- [x] `npm run build` 无 TypeScript 错误
- [ ] 三个关卡均可被熟练玩家在 30 秒内通关
- [ ] 新玩家可在 60 秒内理解操控方式

### 5.3 手感验收（主观）

- [ ] 玩家移动"笨拙但可学习"，不是随机失控
- [ ] 踢腿时机有缓冲窗口，手感宽松
- [ ] 落地后旋转被衰减，便于恢复控制
- [ ] 相机不产生眩晕感
- [ ] 抓取约束不会造成明显的物理爆炸或抖动

---

## 6. 工程工作流

### 6.1 模块依赖图

```
main.ts
  └─ Game.ts
       ├─ Player.ts ─┬─ playerTuning.ts
       │             ├─ kickPhysics.ts
       │             └─ playerAnimation.ts
       ├─ CameraController.ts
       ├─ Ground.ts / Carrot.ts / ExitPortal.ts
       ├─ PhysicsWorld.ts
       ├─ InputController.ts / MultiInputController.ts
       ├─ levelData.ts / levelGoals.ts / levelProgression.ts
       ├─ gameState.ts / grabRules.ts / grabAnchor.ts
       └─ feedback.ts
```

### 6.2 关键调参文件

| 文件 | 参数 |
|------|------|
| `src/entities/playerTuning.ts` | 滚动扭矩、踢腿力度、空中控制、衰减系数 |
| `src/camera/CameraController.ts` | 预测距离、平滑系数、下落补偿 |
| `src/levels/levelData.ts` | 关卡几何、胡萝卜位置、出口位置 |

---

## 7. 推荐分派顺序

| 优先级 | 任务 | 预估 | 依赖 |
|--------|------|------|------|
| P0 | 验证当前版本可运行、测试通过 | 0.5h | 无 |
| P1 | 双人抓取稳定性与携带调参 | 1-2h | P0 |
| P1 | 多人相机参数微调 | 0.5h | P0 |
| P2 | 协作关卡几何调整（需要双人配合） | 1h | P1 |
| P2 | UI 文案与玩家识别强化 | 0.5h | P0 |
| P3 | 添加简单粒子效果（踢腿/收集/抓取/过关） | 2h | P1 |
| P3 | 添加占位音效钩子 | 1h | P1 |

---

## 8. 风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 物理参数不稳定 | 手感退化、玩家挫败 | 每次调参后手动测试所有关卡 |
| 双人相机在分离时表现不佳 | 玩家无法预判地形 | 为每个关卡单独测试相机缩放与跟随 |
| 抓取约束不稳定 | 出现抖动、穿模、爆炸力 | 优先保持约束数量最少并做人工联机前试玩 |
| 过度拟合单个测试者 | 参数对他人不友好 | 多人试玩、收集反馈 |
| 过早添加功能 | 范围蔓延、延迟交付 | 严格遵守范围界定 |

---

## 9. 后续里程碑

1. **M2: 搬运与协作物理** — 强化抓取、拖拽、共同滚动手感
2. **M3: 协作关卡语法** — 扩展真正需要双人配合的障碍与目标物
3. **M4: 反馈打磨** — 完整音效、粒子、屏幕特效

---

## 10. 附录：文件清单

### 已追踪核心文件

- `src/Game.ts` — 主游戏循环
- `src/entities/Player.ts` — 玩家控制器
- `src/entities/playerTuning.ts` — 玩家参数
- `src/entities/kickPhysics.ts` — 踢腿物理
- `src/entities/playerAnimation.ts` — 玩家动画
- `src/entities/Ground.ts` — 地面实体
- `src/entities/Carrot.ts` — 胡萝卜实体
- `src/entities/ExitPortal.ts` — 出口虫洞
- `src/camera/CameraController.ts` — 相机控制器
- `src/game/gameState.ts` — 游戏状态机
- `src/game/feedback.ts` — 反馈文案
- `src/levels/levelData.ts` — 关卡数据
- `src/levels/types.ts` — 关卡类型
- `src/levels/levelGoals.ts` — 关卡目标判定
- `src/levels/levelProgression.ts` — 关卡进程
- `src/controls/InputController.ts` — 单人兼容输入控制
- `src/controls/MultiInputController.ts` — 双人输入控制
- `src/game/grabRules.ts` — 抓队友规则
- `src/game/grabAnchor.ts` — 抓地形锚点选择
- `src/physics/PhysicsWorld.ts` — 物理世界
- `src/main.ts` — 入口
- `index.html` — HTML/CSS

### 测试文件

- `src/entities/__tests__/*.test.ts`
- `src/camera/__tests__/CameraController.test.ts`
- `src/game/__tests__/*.test.ts`
- `src/levels/__tests__/*.test.ts`
- `src/controls/__tests__/InputController.test.ts`

---

**文档版本**：1.2
**更新日期**：2026-03-18
**维护者**：工程团队
**最后验证**：2026-03-18 (10 测试文件 / 52 测试用例通过，构建成功)
