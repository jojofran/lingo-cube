# R-D: 代码质量清理

## D-1 → 删除死代码 useScoring.ts
**模块**: mod:game-engine
**需求**: —
**原理**: `useScoring.ts` 未被任何源文件引用，评分逻辑已完全迁移至 `gameSession` Pinia store。
**步骤**:
1. 确认 `useScoring.ts` 无任何 import（已确认）
2. 删除 `src/composables/useScoring.ts`
3. 运行 `npm run build` 验证无类型/构建错误
**验证**: `grep -r "useScoring" src/` 无结果，`npm run build` 通过

## D-2 → 统一主题 class 书写模式
**模块**: mod:theme
**需求**: REQ-003
**原理**: 7 个页面有 3 种不同主题 class 写法（computed、inline ternary、inline object），需统一为数组语法。
**步骤**:
1. 确认统一目标：`:class="['wrapper', themeClass]"` 其中 `themeClass = computed(...)`
2. 修改 `TypingGame.vue` — 当前为对象语法
3. 修改 `ReviewPage.vue` — 当前为数组+三元
4. 验证其他页面已统一（Home, Achievements, WordBankManager, VocabReviewPage, WordCardDemo 已使用 computed）
5. 运行 `npm run build`
**注意**: 依赖 R-D-4（SVG提取）和 R-D-5（字体提取）完成后再执行，避免重复修改。
**验证**: `npm run build`

## D-3 → 移除 ReviewPage localStorage 兜底
**模块**: mod:review
**需求**: REQ-002
**原理**: ReviewPage 既有 `gameSession.failedWords` 直读，又保留了 `localStorage.getItem('failedWords')` 兜底。gameSession store 已稳定，兜底代码冗余。
**步骤**:
1. 删除 `ReviewPage.vue` 中 `localStorage` 相关代码（第24-27行 try/catch 块）
2. 仅保留 `gameSession.failedWords` 作为单词来源
3. 运行 `npm run build`
**验证**: 无 localStorage 引用，`npm run build` 通过

## D-4 → 提取内联 SVG 到共享组件
**模块**: mod:ui-comps
**需求**: —
**原理**: WordBankManager.vue 和 VocabReviewPage.vue 中直接内联 SVG 路径，应提取为 Icon.vue 共享组件。
**步骤**:
1. 创建 `src/components/common/Icon.vue`
   - Props: `name: string`（图标名）, `size?: number`
   - 根据 name 渲染对应 SVG
   - 使用 `currentColor` 跟随主题
2. 替换 `WordBankManager.vue` 中的内联 SVG（搜索图标、关闭图标、喇叭图标）
3. 替换 `VocabReviewPage.vue` 中的内联 SVG（删除图标）
4. 运行 `npm run build`
**验证**: `npm run build` 通过，三套主题下图标颜色正常

## D-5 → 字体家族提取到全局 CSS
**模块**: mod:ui-comps
**需求**: —
**原理**: 每个组件的 `<style scoped>` 都重复声明 `font-family: 'PingFang SC', 'Microsoft YaHei', ...`，应在 `style.css` 统一声明。
**步骤**:
1. 确认 `style.css` 的 `body {}` 已包含 font-family（第291行已存在）
2. 删除各组件 scoped style 中的 font-family 声明
   - `TypingGame.vue` (第291行)
   - `Home.vue`
   - `ReviewPage.vue` (第69行)
   - `VocabReviewPage.vue` (第102行)
   - `WordBankManager.vue` (第221行)
   - 等
3. 运行 `npm run build`
**验证**: `npm run build` 通过，全局 font-family 生效

## D-6 → 提取 WordList 共享组件 + 修复 WordListItem 布局
**模块**: mod:ui-comps, mod:word-data
**需求**: —
**原理**: VocabReviewPage 和 WordBankManager 各自维护重复的词列表结构（`.vocab-list`/`.wbm-list` + v-for + WordListItem），样式高度相似。提取为共享 WordList 组件消除重复。同时修复 WordListItem 中英文/中文位置顺序。
**步骤**:
1. 修复 WordListItem — 交换英文/中文 DOM 顺序，CSS 对齐调整（英文左对齐 primary，中文右对齐 secondary → `--text-dim`）
2. 创建 `src/components/common/WordList.vue` — 接受 `words`, `maxWidth`, `speakingWord` props，`word-click`/`speak` events，`#action` slot
3. 更新 `VocabReviewPage.vue` — 用 WordList 替换手动 v-for，删除 `.vocab-list`/`.vocab-row` CSS
4. 更新 `WordBankManager.vue` — 用 WordList 替换手动 v-for，删除 `.wbm-list`/`.wbm-list-row` CSS
5. 更新 COMPONENT_LIBRARY.md 及组件索引
**验证**: `npx vue-tsc --noEmit` 通过
