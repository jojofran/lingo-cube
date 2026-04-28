# Review Page Design Document

## Overview
独立的复习页面，用于逐个学习打字游戏中拼写错误的单词。

## Architecture

### File Structure
```
lingo_cube_web/src/
├── views/
│   ├── TypingGame.vue    # 打字游戏主组件（移除内联复习逻辑）
│   ├── ReviewPage.vue    # 独立复习页面（新增）
│   └── Home.vue         # 首页
├── router/
│   └── index.ts         # 路由配置（新增 /review 路由）
├── composables/
│   └── useTheme.ts      # 主题切换（复用）
└── components/
    └── CuteDeco.vue     # 可爱主题装饰（复用）
```

### Data Flow
1. **TypingGame** → 游戏结束 → 错误单词存入 `localStorage['failedWords']` → 跳转 `/#/review`
2. **ReviewPage** → 从 `localStorage['failedWords']` 读取 → 逐个展示复习 → 操作结果存 `localStorage['vocab']`

## Features

### 1. Word Display
- 英文单词（大字体，可点击发音）
- 音标（自动生成 `genPhonetic()`）
- 中文释义

### 2. Example Sentences
- **有例句时**：按权重随机展示（`weight` 字段），点击 "Another Example" 切换
- **无例句时**：显示测试语句 `This is test example to show {word}`
- 例句数据结构 `(wordBank.ts:5)`：
  ```typescript
  examples?: { text: string; weight: number }[]
  ```

### 3. Speech Synthesis
- 页面加载时自动发音
- 点击单词/🔊按钮手动发音
- 使用 `SpeechSynthesis API`，语言 `en-US`，语速 0.85

### 4. Actions
| 按钮 | 功能 | 后续行为 |
|------|------|----------|
| 🔊 Speak | 跟读发音 | 无 |
| ✅ Remembered | 标记已记住 | 从当前列表移除，显示下一个词 |
| 📖 Add to Vocab | 加入生词本 | 存入 `localStorage['vocab']`，显示下一个词 |

### 5. Review Flow
```
Start → [Word 1] → Remembered / Add to Vocab → [Word 2] → ... → [Last Word]
         ↓
    All remembered?
    ├─ Yes → 返回 /typing
    └─ No  → 过滤已记住的，继续复习
```

## Theme Support
复用 `useTheme` composable，支持三种主题：
- **Dark**（默认）：深色渐变背景
- **Ins**：柔和粉紫渐变
- **Cute**：薄荷绿 + 粉色

## Storage Schema

### localStorage['failedWords']
```json
[
  { "english": "abandon", "chinese": "放弃，抛弃", "phonetic": "/əˈbændən/" },
  ...
]
```

### localStorage['vocab']
```json
[
  { "english": "abandon", "chinese": "放弃，抛弃", "phonetic": "/əˈbændən/" },
  ...
]
```

## Future Enhancements
- [ ] 生词本页面（查看/删除已收藏单词）
- [ ] 为词库添加真实例句数据
- [ ] 复习模式：拼写测试、选择题、卡片翻转
- [ ] 数据持久化：后端 API 替代 localStorage
- [ ] 复习进度统计（正确率、记忆曲线）

## Changelog
- 2026-04-28: Initial design, extracted review logic from TypingGame.vue to ReviewPage.vue
