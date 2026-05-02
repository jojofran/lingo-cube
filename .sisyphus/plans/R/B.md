# R-B: 性能优化

## B-1 → shallowRef 优化大对象
**模块**: mod:game-engine
**需求**: REQ-007
**原理**: `shallowRef` 避免深层 `reactive` 代理，大对象可节省 60%+ 开销
**步骤**:
1. `wordBank` 改 `shallowRef`（内容只读）
2. `failedWords` 等大数组检查是否可用 `shallowRef`
**验证**: `npm run build`

## B-2 → v-memo 优化渲染
**模块**: mod:game-engine
**需求**: REQ-007
**步骤**:
1. PromptCard 静态内容（音标、中文）加 `v-memo`
2. StatsRow 静态统计加 `v-memo`
**验证**: `npm run build`

## B-3 → 组件懒加载
**模块**: mod:game-engine
**需求**: REQ-007
**步骤**:
1. `GameFinished` → `defineAsyncComponent` 懒加载
2. 添加加载占位
**验证**: `npm run build` 检查是否生成单独 chunk
