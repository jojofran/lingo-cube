# F-E: 功能增强

## E-1 → 主题持久化
**模块**: mod:theme
**需求**: REQ-003
**原理**: 刷新页面后主题重置为 dark，应将选中的主题保存到 localStorage。
**步骤**:
1. 修改 `composables/useTheme.ts`
   - `init` 时从 `localStorage` 读取 `lingo-theme`
   - 写 `cycleTheme` 时保存到 `localStorage`
   - 默认值 `'dark'`
2. 运行 `npm run build`
**验证**: 刷新页面主题保持，切主题后刷新仍在，`npm run build` 通过

## E-2 → 游戏历史统计
**模块**: mod:game-engine
**需求**: REQ-013
**设计**: designs/REQ-013-game-history.md
**原理**: 当前仅追踪当次游戏得分/combo/错词，缺乏历史记录（总场次、得分趋势、最佳成绩）。
**步骤**:
1. 在 `gameSession` store 中新增 `sessionHistory` 数组 + `SessionRecord` 类型
2. 实现 localStorage 读写（key: `lingo-session-history`, max: 200 条）
3. 新增 `recordSession()` 方法替代旧的 `recordGame()`
4. 每局结束后在 `TypingGame.vue` 的 `next()` 中调用 `recordSession()`
5. 在 AchievementsPage 展示统计概览（总场次/平均分/最佳得分/最高连击）和得分趋势图（纯 CSS 条形图）
6. 运行 `npm run build`
**验证**: `npm run build` 通过，多局游戏后历史数据持久化且可读

## E-3 → 游戏内收藏单词
**模块**: mod:game-engine, mod:word-data
**需求**: —
**原理**: 游戏中只能通过答错来加入复习，缺少主动收藏单词到生词本的机制。
**步骤**:
1. 在 GamePlay / GameFinished 中添加"收藏"按钮
2. 调用 `useVocabBook.addToVocab()` 收藏
3. 收藏状态反馈（toast 或颜色变化）
4. 运行 `npm run build`
**验证**: `npm run build` 通过，游戏中可收藏单词，生词本有新增词

## E-4 → WordCardDemo 导航链接
**模块**: mod:home
**需求**: —
**原理**: WordCardDemo 页面已开发（路由 `/word-demo`），但 Home 页无导航入口。
**步骤**:
1. 在 `Home.vue` 中添加 WordCardDemo 链接
2. 遵循现有 `game-link` 样式
3. 运行 `npm run build`
**验证**: Home 页可见新链接，点击可跳转，`npm run build` 通过
