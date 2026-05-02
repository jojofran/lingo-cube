# Word Card 组件库

## 设计原则

1. **所见即所听** — 看不到的东西绝不发音，每个发音操作都有可见的交互元素
2. **单层封装** — 基础组件（WordCard）提供核心能力，高阶组件（WordCardEx/ReviewCard）只在基础之上加内容，不改变行为
3. **CSS 变量驱动** — 所有颜色/视觉属性通过 CSS 变量控制，组件不硬编码

---

## 架构总览

```
components/
├── common/
│   ├── WordCard.vue          ← 基础单词卡片
│   ├── WordCardEx.vue        ← WordCard + 例句区
│   └── ReviewCard.vue        ← WordCardEx 英文主词版
├── word/
│   ├── WordSpeaker.vue       ← 通用 TTS 喇叭按钮
│   └── WordListItem.vue      ← 紧凑单词列表行
├── review/
│   └── ReviewSessionCard.vue ← 复习会话卡片（Got it / Vocab / 进度）
└── game/
    ├── ModeSelect.vue        ← 模式选择
    ├── GamePlay.vue          ← 游戏主界面
    └── ... (其他游戏组件)

composables/
├── useVocabBook.ts           ← 生词本 CRUD（localStorage）
├── useAchievements.ts        ← 成就系统（localStorage）
├── useSpeech.ts              ← TTS 语音
├── useTheme.ts               ← 主题管理（全局单例）
└── ...

stores/
└── gameSession.ts            ← Pinia store（游戏状态）
```

---

## 组件 API

### WordSpeaker.vue (41行)

最基础的 TTS 按钮，消除全项目 SVG 重复。

```vue
<WordSpeaker :speaking="bool" @speak="onSpeak" />
```

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `speaking` | `boolean` | `false` | 播放中状态，触发脉冲动画 |

| Event | 载荷 | 触发时机 |
|-------|------|---------|
| `speak` | 无 | 点击按钮时 |

**CSS 变量依赖**: `--text-muted` (默认色), `--accent` (hover), `--speak-active-color` (播放中)

---

### WordCard.vue (189行)

基础单词卡片。点击卡片/喇叭播单词，喇叭 `@click.stop` 防止事件冒泡。

```vue
<WordCard
  :word="entry"
  primary="chinese"            <!-- 'chinese' | 'english' -->
  :show-phonetic="true"
  :show-speak="true"
  :show-secondary="true"
  :animatable="false"
  :shake-active="false"
  :burst-active="false"
  :speaking="false"
  @speak="onSpeak"
>
  <div>自定义底部内容</div>      <!-- 通过 default slot 扩展 -->
</WordCard>
```

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `word` | `WordEntry \| null` | (必填) | 单词数据 |
| `primary` | `'chinese' \| 'english'` | `'chinese'` | 主词语言 |
| `showPhonetic` | `boolean` | `true` | 是否显示音标 |
| `showSpeak` | `boolean` | `true` | 是否显示喇叭 |
| `showSecondary` | `boolean` | `true` | primary=english 时是否显示中文副词 |
| `animatable` | `boolean` | — | 启用 shake/burst 动画 |
| `shakeActive` | `boolean` | — | 抖动动画（需要 animatable） |
| `burstActive` | `boolean` | — | 爆发动画（需要 animatable） |
| `speaking` | `boolean` | — | 喇叭播放中状态 |

| Slot | 绑定数据 | 说明 |
|------|---------|------|
| `default` | 无 | 卡片底部扩展内容 |

| Event | 载荷 | 触发时机 |
|-------|------|---------|
| `speak` | `word: string` | 点击卡片或喇叭时 |

**交互规则**:
- 点击卡片正文 → 播单词（`onCardClick`）
- 点击喇叭 → 播单词（`@click.stop` 阻止冒泡防双重触发）

**渲染模式**:

| primary | showSecondary | 显示 |
|---------|---------------|------|
| `chinese` | — | 中文（大字）+ 音标 |
| `english` | `true` | 英文（大字）+ 音标 + 中文副词 |
| `english` | `false` | 英文（大字）+ 音标 |

**CSS 变量依赖**: `--word-color`, `--word-secondary-color`, `--phonetic-color`, `--chinese-text-shadow`, `--card-bg`, `--card-border`, `--prompt-hover-border`, `--prompt-hover-bg`, `--text-muted`(喇叭)

---

### WordCardEx.vue (89行)

WordCard + 例句区。例句区有自己的喇叭，行为不干扰 WordCard。

```vue
<WordCardEx
  :word="entry"
  :example-index="0"
  primary="chinese"
  @speak="onSpeak"
>
  <div>底部操作区</div>

  <!-- 完全接管例句渲染 -->
  <template #example="{ example }">
    <div class="my-example">{{ example.text }}</div>
  </template>
</WordCardEx>
```

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| 继承 WordCard 所有 props | | | |
| `exampleIndex` | `number` | `0` | 显示第几个例句 |

| Slot | 绑定数据 | 说明 |
|------|---------|------|
| `default` | 无 | 卡片底部扩展内容（透传 WordCard slot） |
| `#example` | `{ example: { text, weight } }` | 完全接管例句渲染 |

| Event | 载荷 | 说明 |
|-------|------|------|
| `speak` | `text: string` | 透传 WordCard 的 speak，加例句喇叭的 speak |

**交互规则**:
- 点击卡片正文 → 播**单词**（由 WordCard.onCardClick 处理）
- 点击 WordCard 喇叭 → 播**单词**
- 点击例句区喇叭 → 播**例句**（`@click.stop` 阻止冒泡）
- 无 `#example` slot 时默认渲染 Example 标签 + 斜体文本 + 喇叭

---

### ReviewCard.vue (45行)

WordCardEx 的英文主词版，不同 padding/border-radius。薄封装仅 45 行。

```vue
<ReviewCard :word="entry" @speak="onSpeak">
  <div>Got it / Vocab 按钮</div>
</ReviewCard>
```

完全继承 WordCardEx 的 props/events/slots。区别仅在于：
- `primary` 固定为 `"english"`
- `padding: 28px 20px`（WordCard 默认 `20px 28px 16px`）
- `border-radius: var(--card-radius, 24px)`（WordCard 默认 `20px`）

---

### ReviewSessionCard.vue (components/review/)

复习会话卡片 — 封装完整的复习交互（Got it / Vocab / 进度 / 导航）。

```vue
<ReviewSessionCard
  :words="failedWords"
  @complete="onComplete"
/>
```

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `words` | `WordEntry[]` | `[]` | 待复习的单词列表 |
| `onComplete` | `() => void` | — | 全部复习完成时的回调 |

| Event | 载荷 | 说明 |
|-------|------|------|
| `complete` | 无 | 全部完成时触发 |

**内部逻辑**:
- 自动给无例句的词注入 mock 例句
- `Got it` → 标记已记住，跳到下一词
- `Vocab` → 加入生词本（localStorage），跳到下一词
- 全部记住后触发 `complete` 事件
- 用 `useVocabBook` 管理生词本持久化

---

### useVocabBook (composables/)

生词本 CRUD 工具，localStorage 持久化。

```ts
const { getVocab, addToVocab, removeFromVocab, isInVocab } = useVocabBook()

addToVocab(word)        // 添加，返回是否成功（重复返回 false）
removeFromVocab('word') // 删除，返回是否成功
isInVocab('word')       // 查询是否已收录
getVocab()              // 获取全部生词
```

---

### WordListItem.vue (47行)

紧凑列表行，用于错词列表/生词本等场景。

```vue
<WordListItem
  :word="entry"
  :speaking="false"
  @speak="onSpeak"
/>
```

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `word` | `WordEntry` | (必填) | 单词数据 |
| `speaking` | `boolean` | `false` | 喇叭播放中 |

| Event | 载荷 | 说明 |
|-------|------|------|
| `speak` | `text: string` | 点击喇叭时 |

**布局**: `[🔊] 中文 英文`（喇叭在左，中文在中间，英文右对齐）

---

## CSS 变量体系

定义在 `style.css` 中，分三套主题值：

### 主题色卡

| 变量 | Dark | INS | Cute |
|------|------|-----|------|
| `--word-color` | `#ffd93d` | `#667eea` | `#7cc5b0` |
| `--word-secondary-color` | `rgba(255,255,255,0.75)` | `rgba(45,52,54,0.7)` | `rgba(74,74,74,0.7)` |
| `--phonetic-color` | `rgba(255,255,255,0.55)` | `rgba(45,52,54,0.55)` | `rgba(74,74,74,0.55)` |
| `--chinese-text-shadow` | `0 0 50px rgba(77,150,255,0.3)` | `none` | `none` |
| `--card-bg` | `rgba(255,255,255,0.07)` | `rgba(255,255,255,0.82)` | `rgba(255,255,255,0.88)` |
| `--card-border` | `rgba(255,255,255,0.1)` | `rgba(0,0,0,0.06)` | `rgba(0,0,0,0.05)` |

### 变量语义

```
--word-color              主词色 — 卡片上最突出的文本
--word-secondary-color    副词色 — 另一个语言的翻译文本
--phonetic-color          音标色 — 音标文本
--card-bg                 卡片背景 — 毛玻璃效果
--card-border             卡片边框
--chinese-text-shadow     主词阴影 — 仅 dark 主题有蓝色辉光
```

### 添加新主题

在 `style.css` 新增 `.theme-xxx` 块，覆盖上述变量即可：

```css
.theme-xxx {
  --word-color: #your-color;
  --word-secondary-color: rgba(...);
  --phonetic-color: rgba(...);
  --card-bg: rgba(...);
  --card-border: rgba(...);
  --chinese-text-shadow: ...;
}
```

---

## 字号规范

| 元素 | 字号 | 说明 |
|------|------|------|
| 主词 | `clamp(1.5rem, 5vw, 2.4rem)` | 响应式，默认 ~24px |
| 音标 | `1.3rem` | 约 20px |
| 副词 | `1.3rem` | 约 20px |
| 例句文字 | `0.95rem` | 约 15px，斜体 |
| 例句标签 | `0.7rem` | 约 11px，大写 |

---

## 选择指南

| 需求 | 用什么 |
|------|--------|
| 游戏中展示中文词 | `WordCard primary="chinese"` |
| 复习/回顾展示英文词 | `ReviewCard` 或 `WordCard primary="english"` |
| 单词+例句展示 | `WordCardEx` |
| 自定义例句样式 | `WordCardEx` + `#example` slot |
| 纯展示无交互 | `WordCard :show-speak="false"` |
| 错词列表/生词本 | `WordListItem` |
| 需要自定义底部内容 | 任意组件 + `default` slot |
| 只需要一个 TTS 按钮 | `WordSpeaker` |
| 复习会话 | `ReviewSessionCard` |

---

## 游戏模式

定义在 `types/game.ts`:

| 模式 | 值 | 描述 | 计分 |
|------|-----|------|------|
| Normal | `'normal'` | 显示中文，输入英文，无计时 | base 10 + combo bonus |
| Speed | `'speed'` | 显示中文，输入英文，8秒计时 | base 15 + combo + time bonus |
| Spell | `'spell'` | 显示中文+音标，输入英文，无计时 | base 12 + combo bonus |
| Listen | `'listen'` | TTS 播英文，听写，无计时 | base 15 + combo bonus |

**模式标识色**（`--mode-badge-normal/speed/spell/listen-*`）: 已全部定义在 style.css 三主题中。

---

## Theme 使用规则

### 核心机制

CSS 变量是主题适配的核心。三套主题变量定义在 `style.css` 中：
- `:root { }` — dark 主题（默认）  
- `.theme-ins { }` — INS 主题
- `.theme-cute { }` — Cute 主题

组件内部通过 `var(--xxx)` 引用变量，不硬编码任何颜色值。

### 接入新页面

```ts
// 1. 用 useTheme() 获取主题状态（单例，全局共享）
import { useTheme } from '@/composables/useTheme'
const { theme } = useTheme()

// 2. 计算 theme class
const themeClass = computed(() => 
  theme.value === 'ins' ? 'theme-ins' : 
  theme.value === 'cute' ? 'theme-cute' : ''
)
```

```vue
<!-- 3. theme class 加在根元素上，用数组语法（与 Home 一致） -->
<div :class="['page-wrapper', themeClass]">

  <!-- 4. Cute 主题装饰（必须加） -->
  <CuteDeco />

  <!-- 页面内容，CSS 变量自动级联 -->
</div>
```

### 关键约束

| 规则 | 说明 |
|------|------|
| **使用全局 theme** | 调用 `useTheme()` 获取单例，不要用本地 `ref` 管理主题 |
| **CuteDeco 组件** | 所有页面都要加 `<CuteDeco />`（cute 模式下显示 SVG 装饰，其他模式 `display:none`） |
| **数组 class 语法** | 用 `:class="['wrapper', themeClass]"` 而不是 `:class="wrapper" :class="themeClass"` |
| **CSS 变量引用** | 页面内的颜色用 `var(--card-bg)`、`var(--text-primary)` 等，不要硬编码 |
| **scoped 不阻隔变量** | CSS 自定义属性穿透 scoped，组件可以安全使用 `var(--xxx)` |
| **`--cute-deco-display`** | 已在 style.css 定义（cute 主题 `block`，其他 `none`），CuteDeco 组件通过此变量控制可见性 |
