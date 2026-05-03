# C-game: 游戏组件

游戏场景专用组件。

## ModeSelect → C-game-1
**文件**: components/game/ModeSelect.vue (186行)
**模块**: mod:game-engine
**作用**: 模式选择界面，显示 4 个模式按钮（normal/speed/spell/listen），每个带图标+描述。
**用法**:
```vue
<ModeSelect :total-rounds="20" :word-bank-count="220" @select-mode="onSelect" />
```
| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `totalRounds` | `number` | (必填) | 总轮数 |
| `wordBankCount` | `number` | (必填) | 词库总数 |

| Event | 载荷 | 说明 |
|-------|------|------|
| `select-mode` | `GameMode` | 用户选择模式 |

**CSS 变量依赖**: `--card-bg`, `--card-blur`, `--card-border`, `--select-desc-color`, `--mode-badge-*`, `--orb-*`

---

## GamePlay → C-game-2
**文件**: components/game/GamePlay.vue (204行)
**模块**: mod:game-engine
**作用**: 游戏主界面 orchestrator，组合 StatsRow/TimerRing/WordCard/ResultBar/InputArea/ProgressDots。
**用法**:
```vue
<GamePlay :mode="mode" :score="score" :current-word="word" @submit="..." @speak="..." />
```
所有 props 从父组件传入（透传 TypingGame.vue 的状态）。
**CSS 变量依赖**: `--mode-badge-*`

---

## StatsRow → C-game-3
**文件**: components/game/StatsRow.vue (78行)
**模块**: mod:game-engine
**作用**: 三格统计条：得分/连击+🔥动画/当前轮次。
**用法**:
```vue
<StatsRow :score="score" :combo="combo" :current-index="idx" :total-rounds="20" />
```
**CSS 变量依赖**: `--stat-bg`, `--stat-border`, `--stat-text`, `--text-primary`

---

## TimerRing → C-game-4
**文件**: components/game/TimerRing.vue (61行)
**模块**: mod:game-engine
**作用**: SVG 圆形倒计时动画，speed 模式专用。红色<3s。
**用法**:
```vue
<TimerRing :time-left="8" :total-time="8" :color="timerColor" />
```
**CSS 变量依赖**: `--timer-ring-bg`

---

## InputArea → C-game-5
**文件**: components/game/InputArea.vue (134行)
**模块**: mod:game-engine
**作用**: 打字输入框 + 确认按钮。v-model 双向绑定。
**用法**:
```vue
<InputArea v-model="userInput" :disabled="!!result" :input-class="inputClass" @submit="$emit('submit')" />
```
**CSS 变量依赖**: `--input-bg`, `--input-border`, `--input-text`, `--input-placeholder`, `--input-focus-shadow`, `--enter-btn-*`, `--state-correct`, `--state-wrong`

---

## ResultBar → C-game-6
**文件**: components/game/ResultBar.vue (92行)
**模块**: mod:game-engine
**作用**: 正确/错误结果提示条，带 fly-in/out 动画 + 答案显示。
**用法**:
```vue
<ResultBar :result="result" :result-msg="msg" :current-word="word" />
```
**CSS 变量依赖**: `--state-correct`, `--state-correct-bg`, `--state-wrong`, `--state-wrong-bg`, `--result-answer-color`, `--result-answer-strong-color`

---

## ProgressDots → C-game-7
**文件**: components/game/ProgressDots.vue (62行)
**模块**: mod:game-engine
**作用**: 圆点进度指示器。绿(正确)/蓝(当前)/红(错误)三色。
**用法**:
```vue
<ProgressDots :total="20" :current="currentIndex" :failed-indices="failedIndices" />
```
**CSS 变量依赖**: `--dot-done-bg`, `--dot-current-bg`, `--dot-current-shadow`, `--dot-fail-bg`

---

## GameFinished → C-game-8
**文件**: components/game/GameFinished.vue (248行)
**模块**: mod:game-engine
**作用**: 游戏结束画面。展示得分/最佳连击/正确率 + 错词列表 + 重玩/复习按钮。
**用法**:
```vue
<GameFinished :score="score" :max-combo="c" :failed-words="words" :total-rounds="20" :grade="grade" @restart="..." @review="..." @speak="..." />
```
**CSS 变量依赖**: `--card-bg`, `--card-blur`, `--card-border`, `--stat-bg`, `--stat-border`, `--stat-text`, `--accent`, `--accent-hover`, `--accent-tertiary`, `--word-color`, `--text-dim`
