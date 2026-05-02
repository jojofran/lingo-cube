# T-B: E2E 测试

## B-1 → E2E 游戏流程测试
**用例**:
1. 模式选择 → 进入游戏
2. 打字输入 → 提交 → 下一词
3. 游戏结束 → 显示结果 → 复习/重玩
**验证**: `npx vitest run test/e2e/game-flow.test.ts`
