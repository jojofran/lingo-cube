# R-A: Pinia 集成

## A-1 → 集成 gameSession store 到 TypingGame
**模块**: mod:game-engine
**需求**: REQ-002
**步骤**:
1. TypingGame.vue import `useGameSessionStore`
2. 迁移 `score`, `combo`, `currentIndex`, `mode` 到 store
3. 替换 `selectMode(m)` → `gameSession.setMode(m)`
4. 替换计分逻辑 → `gameSession.recordGame()`
**验证**: `npm run build`

## A-2 → 移除组件内独立状态
**模块**: mod:game-engine
**需求**: REQ-002
**步骤**:
1. 删除 TypingGame.vue 中 `score`, `combo`, `currentIndex` 的 `ref()` 定义
2. 引用改为 `gameSession.score`, `gameSession.combo`
3. 模板中所有 props 绑定改为 store 状态
**验证**: `vue-tsc --noEmit`

## A-3 → 验证跨组件状态共享
**模块**: mod:game-engine, mod:review
**需求**: REQ-002
**步骤**:
1. ReviewPage 通过 store 获取游戏结果（替代 localStorage）
2. 确保 TypingGame → ReviewPage 状态流转正常
3. 全量构建验证
**验证**: `npm run build` + 人工测试完整流程
