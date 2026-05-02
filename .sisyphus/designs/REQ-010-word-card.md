# REQ-010: 通用单词卡片组件 — 设计文档

> **状态**: 📋 proposed | **优先级**: P0 | **关联任务**: R-C-1
> **模块**: mod:ui-comps, mod:game-engine

---

## 1. 目标

将 `components/game/PromptCard.vue` 抽取为通用组件 `components/common/WordCard.vue`，使其脱离游戏场景依赖，可在 ReviewPage、Home 等任意页面复用。

## 2. 使用场景

| 场景 | 位置 | 需要功能 |
|------|------|----------|
| 游戏进行中 | TypingGame → GamePlay | 显示中文+音标, TTS 喇叭, 抖动/爆发动画 |
| 错词复习 | ReviewPage | 显示中文+音标, TTS 喇叭, 无动画 |
| 首页词汇展示 | Home.vue | 显示中文+音标, 无喇叭, 无动画, 底部附加信息 |

## 3. API 设计

```ts
interface WordCardProps {
  word: WordEntry
  showPhonetic?: boolean       // default true
  showSpeak?: boolean          // default true
  animatable?: boolean         // 是否启用 shake/burst class, default false
  shakeActive?: boolean        // 仅在 animatable=true 时生效
  burstActive?: boolean        // 仅在 animatable=true 时生效
}
```

```vue
<!-- 游戏场景 -->
<WordCard
  :word="currentWord"
  :animatable="true"
  :shake-active="shakeActive"
  :burst-active="burstActive"
  @speak="speak"
/>

<!-- 复习场景 -->
<WordCard :word="word" @speak="speak" />

<!-- 首页定制场景 -->
<WordCard :word="dailyWord" :show-speak="false">
  <template #default>
    <div class="extra-info">今日词 · 已学 5 次</div>
  </template>
</WordCard>
```

## 4. Slot 设计

| Slot | 用途 | 示例 |
|------|------|------|
| `default` | 卡片底部附加内容 | 自定义统计、标签 |
| `action` | 替换右上角喇叭图标 | 收藏按钮、分享按钮 |

## 5. 主题适配 — 逐主题提取配色

### 原则

不要一刀切用一个全局变量值。每个主题的背景色、强调色不同，同一个 `rgba(255,255,255,0.55)` 在深色背景上可读，在浅色/彩色背景上可能完全看不清。必须**逐个主题审查并提取**合适的值。

### 需要提取的变量

| 变量 | 含义 | 需要逐主题审查看什么 |
|------|------|---------------------|
| `--wordcard-text-shadow` | 中文文字阴影 | 当前主题背景是否够干净，阴影是提升层次还是多余 |
| `--wordcard-phonetic-color` | 音标颜色 | 在主题背景上对比度是否达标（WCAG AA 建议 4.5:1） |
| `--wordcard-border` | 卡片边框色 | 与主题背景融合度 |
| `--wordcard-bg` | 卡片背景 | 透明/毛玻璃 vs 实色 vs 各主题差异 |
| `--wordcard-hover-border` | 悬停边框强调 | 强调程度各主题是否一致 |
| `--wordcard-speak-color` | 喇叭图标默认色 | 在深色/浅色背景上是否都能看清 |
| `--wordcard-speak-active` | 喇叭播放中颜色 | 播放状态颜色在主题中是否足够醒目 |

### 当前三个主题的实况分析

**dark 主题**（深色渐变背景 `#0f0c29 → #302b63 → #24243e`）：
- 卡面色: 当前 `rgba(255,255,255,0.04)`, 毛玻璃效果
- 音标色: 当前 `rgba(255,255,255,0.55)` → 深色底上可读性 OK
- 文字阴影: 当前 `0 0 50px rgba(77,150,255,0.3)` → 深色底上增强层次感
- ⚠️ `rgba(255,255,255,0.55)` 在深色底上可读，但不能照搬到浅色主题

**ins 主题**（浅色渐变背景，偏白/米色）：
- 卡面色推测: 需要浅色卡片（白色或半透明白）vs 深色文字
- ⚠️ 音标色如果沿用 `rgba(255,255,255,0.55)` → 浅色背景上完全消失
- 需要独立值: 音标色改成 `rgba(0,0,0,0.45)` 或类似

**cute 主题**（暖色/粉色渐变背景）：
- 卡面色推测: 浅粉色半透或白色
- 文字阴影可能需要暖色系 `rgba(255,150,200,0.3)` 而非蓝色
- ⚠️ 喇叭 active 色如果沿用 `#ffd93d` 与粉色底融合度要看实际效果

### 实施方式

在 `style.css` 中声明三套值：

```css
/* dark 主题 */
.word-card { --wc-text-shadow: 0 0 50px rgba(77,150,255,0.3); }

/* ins 主题 */
.theme-ins .word-card { --wc-text-shadow: none; }

/* cute 主题 */
.theme-cute .word-card { --wc-text-shadow: 0 0 30px rgba(255,150,200,0.3); }
```

WordCard 内部统一引用 `var(--wc-*)`，用 fallback 值兜底。**提取时不能直接抄 dark 的值，必须切到每个主题下实际预览再定。**

## 6. 迁移策略

1. 新建 WordCard → 确保独立可运行
2. GamePlay.vue 引入 WordCard 替代 PromptCard
3. 如果无其他引用，删除 PromptCard.vue
4. 如果 ReviewPage/Home 后续接入，单独 PR

## 7. 不做的范围

- ❌ 不添加 i18n（当前只有中文）
- ❌ 不做运行时主题引擎（沿用 CSS 变量体系即可，但变量值须按 §5 逐主题提取）
- ❌ 不做 SSR 兼容（GitHub Pages 静态托管）

## 8. 验证

```
npm run build                # 类型检查 + 构建通过
人工确认:
  - 游戏中显示/动画/喇叭正常
  - 无 console error
```
