# REQ-013: 游戏历史统计 — 设计文档

> **状态**: 📋 proposed | **优先级**: P1 | **关联任务**: F-E-2
> **模块**: mod:game-engine (gameSession store)

---

## 1. 目标

当前系统仅追踪当次游戏的得分、连击和错词，游戏结束后这些数据就丢失了。用户无法看到：
- 自己一共玩了多少局
- 得分趋势（进步了还是退步了）
- 历史最佳成绩
- 各模式下的表现对比

本需求的目标是在 `gameSession` store 中新增持久化的游戏历史记录，让玩家可以追踪自己的长期表现。

---

## 2. 使用场景

| 场景 | 触发时机 | 显示位置 | 需要的数据 |
|------|----------|----------|-----------|
| 游戏结束 | 每局完成时 | GameFinished 界面（摘要）+ 历史页面（详情） | 当局：得分/连击/模式/正确率/时间 |
| 查看历史 | 用户主动进入 | AchievementsPage（统计概览） | 所有历史：总场次/平均分/最佳成绩/趋势 |
| 模式对比 | 用户主动进入 | AchievementsPage（模式分布） | 各模式：场次/平均分/最佳 |
| 成就联动 | 成就检查时 | useAchievements | 历史数据作为成就触发条件 |

---

## 3. 数据模型

### 3.1 SessionRecord（单局记录）

```ts
interface SessionRecord {
  id: string              // 唯一标识，Date.now().toString()
  date: number            // 时间戳
  mode: GameMode          // 'normal' | 'speed' | 'spell' | 'listen'
  score: number           // 当局得分
  combo: number           // 最大连击
  totalRounds: number     // 总轮数 (当前固定 20)
  correctCount: number    // 正确数
  wrongCount: number      // 错误数
  accuracy: number        // 正确率，0-100
  duration: number        // 耗时（秒），仅 speed 模式有实际意义
}
```

### 3.2 Store 新增状态（`gameSession.ts`）

```ts
const sessionHistory = ref<SessionRecord[]>([])

// Computed
const totalGames = computed(() => sessionHistory.value.length)
const averageScore = computed(() => {
  if (!sessionHistory.value.length) return 0
  return Math.round(sessionHistory.value.reduce((a, b) => a + b.score, 0) / sessionHistory.value.length)
})
const bestScoreEver = computed(() => Math.max(...sessionHistory.value.map(s => s.score), 0))
const bestComboEver = computed(() => Math.max(...sessionHistory.value.map(s => s.combo), 0))
```

### 3.3 localStorage 持久化

```ts
const STORAGE_KEY = 'lingo-session-history'
const MAX_RECORDS = 200 // 防溢出，保留最近 200 局

function loadHistory(): SessionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveHistory(records: SessionRecord[]) {
  const trimmed = records.slice(-MAX_RECORDS)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
}
```

---

## 4. store API 变更

### 新增方法

```ts
function recordSession(result: {
  score: number
  maxCombo: number
  mode: GameMode
  totalRounds: number
  correctCount: number
  wrongCount: number
  duration?: number
}): void {
  const record: SessionRecord = {
    id: Date.now().toString(),
    date: Date.now(),
    ...result,
    accuracy: result.totalRounds > 0
      ? Math.round((result.correctCount / result.totalRounds) * 100)
      : 0,
  }
  sessionHistory.value = [...sessionHistory.value, record]
  saveHistory(sessionHistory.value)
}
```

### 调用时机

现有 `TypingGame.vue` 的 `next()` 函数中，游戏结束时调用：

```ts
// 当前：
gameSession.recordGame(gameSession.score, gameSession.combo)

// 改为：
gameSession.recordSession({
  score: gameSession.score,
  maxCombo: gameSession.maxCombo,
  mode: gameSession.mode,
  totalRounds: TOTAL_ROUNDS,
  correctCount: correctCount,   // 需要在游戏循环中累计
  wrongCount: gameSession.failedWords.length,
})
```

---

## 5. UI 展示方案

### 5.1 AchievementsPage 集成

在现有成就网格上方新增**统计概览卡**：

```
┌──────────────────────────────────┐
│  📊 Your Statistics              │
│                                  │
│  总场次   平均分   最佳得分  最高连击 │
│   47      183      415       12   │
│                                  │
│  ━━━━━━ 得分趋势 ━━━━━━           │
│  ▁▃▂▅▄▇▆▆▇█▇▇                   │
│  最近 12 局                       │
└──────────────────────────────────┘
```

### 5.2 得分趋势可视化的两种选型

| 方案 | 复杂度 | 优点 | 缺点 |
|------|--------|------|------|
| **A. 纯 CSS 条形图** | 低 | 零依赖，现有样式即可 | 精度有限，无 Tooltip |
| **B. 集成 Chart.js 轻量** | 中 | 交互式，可 hover 看详情 | 额外包体积 ~20KB gzip |

**推荐方案 A**（本期实现）：用 div 模拟条形图，高度按比例映射得分，CSS 变量控制颜色。如果后续需要交互再升级方案 B。

```vue
<div class="trend-chart">
  <div
    v-for="(s, i) in recentScores"
    :key="s.id"
    class="trend-bar"
    :style="{ height: (s.score / maxScore * 100) + '%' }"
    :title="`#${i+1}: ${s.score}分`"
  />
</div>
```

---

## 6. 迁移策略

1. **Phase 1**: 新增 store 状态 + localStorage 读写（无 UI 变更）
2. **Phase 2**: `TypingGame.vue` 的 `next()` 中调用 `recordSession()`
3. **Phase 3**: AchievementsPage 集成统计概览
4. **Phase 4**: （可选）提取 SessionRecord 类型到 `types/game.ts`

Phase 1+2 可并行，但建议先 Phase 1（纯数据层）再 Phase 2（接入点），方便单独验证。

---

## 7. 不做的范围

- ❌ 不删除旧 `recordGame` 方法（向前兼容，后续标记 `@deprecated`）
- ❌ 不做数据导出/分享功能
- ❌ 不做服务端同步（纯 localStorage）
- ❌ 不做 Chart.js 等第三方图表库（首次用纯 CSS）
- ❌ 不做单局回放（per-frame 数据量太大）
- ❌ 不做 WPM/CPM 统计（需要额外时间追踪，另案处理）

---

## 8. 数据结构兼容性

### 旧的 `scoreHistory` / `bestCombo`

当前 store 已有字段：
```ts
const scoreHistory = ref<number[]>([])  // 仅存得分数组
const bestCombo = ref(0)                // 最佳连击
```

迁移计划：
- `scoreHistory` 不再写入（由 `sessionHistory` 替代），保留仅用于已存数据的读取
- `bestCombo` 不再单独维护（改从 `sessionHistory` computed）
- 标记 `@deprecated`，下个迭代清理

### localStorage key 冲突

旧 key `lingo-achievements-stats` 不受影响（存储成就用统计数据）。
新 key `lingo-session-history` 独立存储，不冲突。

---

## 9. 验证

```
npm run build                        # 类型检查 + 构建通过
人工确认:
  - 玩一局后关闭页面，重新打开，历史数据仍在
  - AchievementsPage 显示统计概览
  - 多次游戏后得分趋势图正确
  - 旧数据兼容（scoreHistory 不报错）
```
