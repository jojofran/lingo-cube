# T-A: 单元测试

## A-1 → useScoring 单元测试
**用例**:
1. 正确输入 → 加分
2. 错误输入 → 不加分
3. combo 连续正确 → 累加
4. 错误打断 → 重置
**验证**: `npx vitest run test/composables/useScoring.test.ts`

## A-2 → useTimer 单元测试
**用例**:
1. `start()` → 时间减少
2. `pause()` → 时间暂停
3. `reset()` → 时间重置
4. 时间到 → 触发回调
**验证**: `npx vitest run test/composables/useTimer.test.ts`

## A-3 → useWordProvider 单元测试
**用例**:
1. 获取随机词 → 返回 `WordEntry`
2. 指定数量 → 对应数量
3. 空词库 → 优雅降级
**验证**: `npx vitest run test/composables/useWordProvider.test.ts`

## A-4 → GamePlay 组件测试
**用例**:
1. 接收 props → 正确渲染
2. `@submit` 事件 → 触发
3. `@speak` 事件 → 触发
**验证**: `npx vitest run test/components/GamePlay.test.ts`
