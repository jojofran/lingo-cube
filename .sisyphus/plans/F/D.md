# F-D: 复习会话

## D-1 → ReviewSessionCard 组件 + 生词本
**模块**: mod:review
**需求**: REQ-011
**步骤**:
1. 创建 `composables/useVocabBook.ts` — 生词本 CRUD，localStorage 持久化
2. 创建 `components/review/ReviewSessionCard.vue` — 封装复习交互（Got it / Vocab / 进度）
3. 简化 `ReviewPage.vue` — 使用 ReviewSessionCard 替代内联逻辑
**验证**: `npm run build`

## D-2 → 生词本复习页
**模块**: mod:review
**需求**: REQ-012
**步骤**:
1. 新建 `VocabReviewPage.vue`
2. 从 `useVocabBook` 读取生词列表
3. 使用 `ReviewSessionCard` 进行复习
4. 路由 `/vocab-review`
5. 在 Home 和 ReviewPage 添加入口
**验证**: `npm run build`
