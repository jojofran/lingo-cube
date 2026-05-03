# T-C: 功能测试覆盖

## C-1 → 主题持久化单元测试
**模块**: mod:theme
**需求**: REQ-003
**对应功能**: F-E-1
**步骤**:
1. 测试 `useTheme()` 初始加载默认值
2. 测试 `cycleTheme()` 后 localStorage 同步
3. 测试刷新后恢复已保存主题
**验证**: `npx vitest run test/composables/ --reporter verbose` 通过

## C-2 → 游戏历史统计测试
**模块**: mod:game-engine
**需求**: —
**对应功能**: F-E-2
**步骤**:
1. 测试多局游戏后 sessionHistory 正确累计
2. 测试 localStorage 读写
**验证**: 测试通过

## C-3 → 收藏单词功能测试
**模块**: mod:game-engine, mod:word-data
**需求**: —
**对应功能**: F-E-3
**步骤**:
1. 测试收藏按钮触发 `addToVocab`
2. 测试收藏状态反馈
**验证**: 测试通过

## C-4 → WordCardDemo 导航 E2E 测试
**模块**: mod:home
**需求**: —
**对应功能**: F-E-4
**步骤**:
1. 测试 Home 页存在 WordCardDemo 链接
2. 测试点击后路由跳转正确
**验证**: Playwright E2E 测试通过

## C-5 → 后端词查找优化测试
**模块**: backend:word-api
**需求**: —
**对应功能**: R-E-3
**步骤**:
1. 测试 O(1) 查找正确性
2. 测试不存在的词返回 404
**验证**: `go test ./...` 通过

## C-6 → SVG 组件单元测试
**模块**: mod:ui-comps
**需求**: —
**对应功能**: R-D-4
**步骤**:
1. 测试 Icon.vue 按 name 渲染正确 SVG
2. 测试 size prop
**验证**: `npx vitest run` 通过
