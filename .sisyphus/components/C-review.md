# C-review: 复习组件

复习场景专用组件。

## ReviewSessionCard → C-review-1
**文件**: components/review/ReviewSessionCard.vue (151行)
**模块**: mod:review
**作用**: 完整复习会话卡片。封装 ReviewCard + Got it/Vocab 按钮 + 进度 + 导航。
**用法**:
```vue
<ReviewSessionCard :words="failedWords" @complete="onComplete" />
```
| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `words` | `WordEntry[]` | `[]` | 待复习单词列表 |

| Event | 载荷 | 说明 |
|-------|------|------|
| `complete` | 无 | 全部复习完成时触发 |

**内部逻辑**:
- 自动给无例句的词注入 mock 例句
- `Got it` → 标记已记住，跳到下一词
- `Vocab` → 加入生词本（useVocabBook），跳到下一词
- 全部记住后触发 `complete`
