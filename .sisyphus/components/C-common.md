# C-common: 通用组件

跨页面复用的基础组件。

## WordCard → C-common-1
**文件**: components/common/WordCard.vue (189行)
**模块**: mod:ui-comps
**作用**: 基础单词卡片。显示中文或英文主词 + 音标 + 副词 + 可选喇叭。支持 shake/burst 动画。
**用法**:
```vue
<WordCard :word="entry" primary="chinese" @speak="onSpeak" />
```
| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `word` | `WordEntry \| null` | (必填) | 单词数据 |
| `primary` | `'chinese' \| 'english'` | `'chinese'` | 主词语言 |
| `showPhonetic` | `boolean` | `true` | 是否显示音标 |
| `showSpeak` | `boolean` | `true` | 是否显示喇叭 |
| `showSecondary` | `boolean` | `true` | primary=english 时显示中文副词 |
| `animatable` | `boolean` | — | 启用 shake/burst 动画 |
| `shakeActive` | `boolean` | — | 抖动动画（需 animatable） |
| `burstActive` | `boolean` | — | 爆发动画（需 animatable） |
| `speaking` | `boolean` | — | 喇叭播放中状态 |

| Slot | 绑定 | 说明 |
|------|------|------|
| `default` | 无 | 卡片底部扩展内容 |

| Event | 载荷 | 触发时机 |
|-------|------|---------|
| `speak` | `word: string` | 点击卡片或喇叭时 |

**CSS 变量依赖**: `--word-color`, `--word-secondary-color`, `--phonetic-color`, `--chinese-text-shadow`, `--card-bg`, `--card-border`, `--prompt-hover-border`, `--prompt-hover-bg`, `--text-muted`(喇叭)

---

## WordCardEx → C-common-2
**文件**: components/common/WordCardEx.vue (94行)
**模块**: mod:ui-comps
**作用**: WordCard + 例句区。例句有自己的喇叭，独立于 WordCard 的 TTS。
**用法**:
```vue
<WordCardEx :word="entry" example-index="0" @speak="onSpeak" />
```
完全继承 WordCard 的 props/events/slots。新增：
| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `exampleIndex` | `number` | `0` | 显示第几个例句 |

| Slot | 绑定 | 说明 |
|------|------|------|
| `#example` | `{ example: { text, weight } }` | 完全接管例句渲染 |

**CSS 变量依赖**: WordCard 全部 + `--example-bg`, `--example-text`, `--text-muted`(label)

---

## ReviewCard → C-common-3
**文件**: components/common/ReviewCard.vue (36行)
**模块**: mod:ui-comps
**作用**: WordCardEx 英文主词版。`primary` 固定为 `english`，padding/radius 不同。薄封装仅 36 行。
**用法**:
```vue
<ReviewCard :word="entry" @speak="onSpeak" />
```
完全继承 WordCardEx 的 props/events/slots。
**差异**: `primary` 固定 `"english"`; `padding: 28px 20px`; `border-radius: var(--card-radius, 24px)`

---

## BackButton → C-common-4
**文件**: components/common/BackButton.vue (14行)
**模块**: mod:ui-comps
**作用**: 固定定位的返回按钮（左箭头图标），`<router-link>` 跳转到指定路径。
**用法**:
```vue
<BackButton to="/" />
```
| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `to` | `string` | (必填) | 路由路径 |

**CSS 变量依赖**: `--toggle-border`, `--toggle-bg`, `--text-primary`, `--accent`(hover)

---

## ThemeToggle → C-common-5
**文件**: components/common/ThemeToggle.vue (11行)
**模块**: mod:theme
**作用**: 固定定位的圆形主题切换按钮。调用 `useTheme().cycleTheme()` 循环 dark→ins→cute。
**用法**: `<ThemeToggle />`（无 props/events，全局单例）
**CSS 变量依赖**: `--toggle-border`, `--toggle-bg`, `--toggle-hover-border`, `--toggle-hover-bg`, `--card-shadow`

---

## AchievementToast → C-common-6
**文件**: components/common/AchievementToast.vue (110行)
**模块**: mod:game-engine (消费 useAchievements)
**作用**: 成就解锁时显示通知弹窗（图标+标签），自动消失。
**用法**: `<AchievementToast />`（无 props，内部监听 useAchievements().toasts）
**CSS 变量依赖**: `--card-bg`, `--card-border`, `--card-shadow`, `--accent`

---

## CuteDeco → C-common-7
**文件**: components/CuteDeco.vue (156行)
**模块**: mod:theme, mod:ui-comps
**作用**: Cute 主题的 SVG 手绘浮动装饰。所有页面必须加，cute 下显示，其他模式 `display:none`。
**用法**:
```vue
<CuteDeco />
```
（无 props/events）
**CSS 变量依赖**: `--cute-deco-display` (style.css 定义: cute=block, 其他=none)

---

## WordList → C-common-8
**文件**: components/common/WordList.vue (~65行)
**模块**: mod:ui-comps, mod:word-data
**作用**: 通用单词列表容器。内嵌 WordListItem，统一管理列表样式（背景/边框/圆角/悬停）。支持 `#action` 插槽添加行内操作按钮。
**用法**:
```vue
<WordList :words="entries" :speaking-word="activeWord" @word-click="onClick" @speak="onSpeak">
  <template #action="{ word }">
    <button @click="remove(word.english)">Remove</button>
  </template>
</WordList>
```
| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `words` | `WordEntry[]` | (必填) | 单词数据数组 |
| `maxWidth` | `number` | `460` | 列表最大宽度 |
| `speakingWord` | `string \| null` | — | 当前播放中的单词 english，传入后由内部传给 WordListItem |

| Slot | 绑定 | 说明 |
|------|------|------|
| `#action` | `{ word: WordEntry }` | 每行右侧操作区 |

| Event | 载荷 | 触发时机 |
|-------|------|---------|
| `word-click` | `word: WordEntry` | 点击某行时 |
| `speak` | `text: string` | WordListItem emit 透传 |

**关联**: 内部使用 `WordListItem`，自动覆写其 `max-width`/`margin-bottom`/`border-radius` 以适配容器。
**CSS 变量依赖**: `--card-bg`, `--card-border`, `--card-radius`, `--card-shadow`, `--stat-bg`
