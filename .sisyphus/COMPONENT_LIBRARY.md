# Word Card 组件库

> **⚠️ 使用规则**：新增或使用组件前，必须先查本组件库（`.sisyphus/components/`）。如果 API 或样式不满足需求，优先扩展现有组件，不要新建重复组件。

---

## 设计原则

1. **所见即所听** — 看不到的东西绝不发音，每个发音操作都有可见的交互元素
2. **单层封装** — 基础组件（WordCard）提供核心能力，高阶组件（WordCardEx/ReviewCard）只在基础之上加内容，不改变行为
3. **CSS 变量驱动** — 所有颜色/视觉属性通过 CSS 变量控制，组件不硬编码

---

## 快速索引

> 完整表格（含每个组件的作用描述）→ **`.sisyphus/components/index.md`**

| 分类 | 文件 | 组件数 |
|------|------|--------|
| 通用组件 (common/) | [C-common.md](components/C-common.md) | 8 |
| 游戏组件 (game/) | [C-game.md](components/C-game.md) | 8 |
| 单词组件 (word/) | [C-word.md](components/C-word.md) | 2 |
| 复习组件 (review/) | [C-review.md](components/C-review.md) | 1 |
| Composable | [C-composable.md](components/C-composable.md) | 8 |

---

## 选择指南

| 需求 | 用什么 | 详情 |
|------|--------|------|
| 游戏中展示中文词 | `WordCard primary="chinese"` | C-common-1 |
| 复习/回顾展示英文词 | `ReviewCard` 或 `WordCard primary="english"` | C-common-3 |
| 单词+例句展示 | `WordCardEx` | C-common-2 |
| 自定义例句样式 | `WordCardEx` + `#example` slot | C-common-2 |
| 纯展示无交互 | `WordCard :show-speak="false"` | C-common-1 |
| 错词列表/生词本 | `WordListItem`（单行）或 `WordList`（容器） | C-word-2 / C-common-8 |
| 列表中点击弹出单词卡片 | `WordList :show-card-on-click="true"` | C-common-8 |
| 单词列表（含行操作） | `WordList` + `#action` slot | C-common-8 |
| 需要自定义底部内容 | 任意组件 + `default` slot | — |
| 只需要一个 TTS 按钮 | `WordSpeaker` | C-word-1 |
| 复习会话 | `ReviewSessionCard` | C-review-1 |
| 返回按钮 | `BackButton` | C-common-4 |
| 主题切换 | `ThemeToggle` | C-common-5 |
| 成就通知 | `AchievementToast` | C-common-6 |
| Cute装饰 | `CuteDeco` | C-common-7 |

---

## CSS 变量体系

定义在 `style.css` 中，分三套主题值。完整色卡见 style.css，核心变量：

| 变量 | 含义 |
|------|------|
| `--word-color` | 主词色 — 卡片上最突出的文本 |
| `--word-secondary-color` | 副词色 — 另一个语言的翻译文本 |
| `--phonetic-color` | 音标色 |
| `--card-bg` | 卡片背景 — 毛玻璃效果 |
| `--card-border` | 卡片边框 |

### 添加新主题

在 `style.css` 新增 `.theme-xxx` 块，覆盖上述变量即可。

---

## 字号规范

| 元素 | 字号 |
|------|------|
| 主词 | `clamp(1.5rem, 5vw, 2.4rem)` |
| 音标/副词 | `1.3rem` |
| 例句文字 | `0.95rem`（斜体） |

---

## Theme 使用规则

### 核心机制
- CSS 变量是主题适配的核心。三套主题变量在 `style.css` 中定义。
- 组件内部通过 `var(--xxx)` 引用变量，不硬编码任何颜色值。

### 接入新页面
```ts
import { useTheme } from '@/composables/useTheme'
const { theme } = useTheme()
const themeClass = computed(() =>
  theme.value === 'ins' ? 'theme-ins' :
  theme.value === 'cute' ? 'theme-cute' : ''
)
```
```vue
<div :class="['page-wrapper', themeClass]">
  <CuteDeco />
  <!-- 页面内容 -->
</div>
```

### 关键约束
| 规则 | 说明 |
|------|------|
| **使用全局 theme** | 调用 `useTheme()` 获取单例，不要用本地 `ref` 管理主题 |
| **CuteDeco 组件** | 所有页面都要加 `<CuteDeco />` |
| **数组 class 语法** | `:class="['wrapper', themeClass]"`，不要双绑 |
| **CSS 变量引用** | 颜色用 `var(--card-bg)`，不要硬编码 |
| **scoped 不阻隔变量** | CSS 自定义属性穿透 scoped |
| **flex gap 优先** | 间距用 `gap`，不要 `margin-top` + 兄弟选择器 |
| **WordListItem 音标** | 列表展示单词时必须包含音标字段 |

---

## 组件新增 & 修改规范

### 新增组件
1. 🔍 查 `components/index.md` 是否有相似组件，能通过 props/slots 扩展就不要新建
2. 🔍 查 `style.css` 所需 CSS 变量是否已存在
3. 🔍 查 `types/` 所需类型是否已定义
4. 按分类目录存放，遵循 props/events/slots 模式
5. 注册到 `components/index.md` + 对应分类文件 + 选择指南

### 修改组件（关键规则）
> **修改已有组件时，必须同步更新对应文档，否则视为不完整。**

| 修改类型 | 必须更新的文档 |
|---------|---------------|
| 新增 prop | 对应分类文件（C-xxx.md）的 props 表 |
| 新增 event / slot | 对应分类文件（C-xxx.md）的 events/slots 表 |
| 修改交互行为 | 对应分类文件的**交互规则**段落 |
| 修改视觉样式 | 对应分类文件的**视觉样式**表 + CSS 变量依赖 |
| 修改组件行数 | 分类文件顶部的行数标注 |

**检查清单**（修改后逐项确认）：
- [ ] `components/index.md` 中组件作用描述是否准确
- [ ] `components/C-xxx.md` 中 props/events/slots 表是否与实际代码一致
- [ ] `COMPONENT_LIBRARY.md` 的「选择指南」是否需要更新
- [ ] **如果有新样式变量** → `style.css` 中是否为三个主题都定义了值
