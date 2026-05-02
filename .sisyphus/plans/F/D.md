# F-D: 复习会话

## D-1 → ReviewSessionCard 组件 + 生词本
**模块**: mod:review
**需求**: REQ-011
**步骤**:
1. 创建 `composables/useVocabBook.ts` — 生词本 CRUD，localStorage 持久化
2. 创建 `components/review/ReviewSessionCard.vue` — 封装复习交互（Got it / Vocab / 进度）
3. 简化 `ReviewPage.vue` — 使用 ReviewSessionCard 替代内联逻辑
**验证**: `npm run build`

## D-2 → 生词本管理页
**模块**: mod:review
**需求**: REQ-011
**步骤**:
1. 新建 `VocabBookPage.vue`
2. 展示已收藏的生词列表（WordListItem）
3. 支持从生词本删除
4. 支持点击跳转到复习
**验证**: `npm run build`
