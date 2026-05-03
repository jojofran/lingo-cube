# C-word: 单词组件

单词展示相关的原子组件。

## WordSpeaker → C-word-1
**文件**: components/word/WordSpeaker.vue (41行)
**模块**: mod:speech, mod:ui-comps
**作用**: 通用 TTS 喇叭按钮。SVG 图标，播放时脉冲动画。消除全项目 SVG 重复。
**用法**:
```vue
<WordSpeaker :speaking="bool" @speak="onSpeak" />
```
| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `speaking` | `boolean` | `false` | 播放中状态，触发脉冲动画 |

| Event | 载荷 | 触发时机 |
|-------|------|---------|
| `speak` | 无 | 点击按钮时 |

**CSS 变量依赖**: `--text-muted`(默认色), `--accent`(hover), `--btn-bg`(hover背景), `--speak-active-color`(播放中)

---

## WordListItem → C-word-2
**文件**: components/word/WordListItem.vue (63行)
**模块**: mod:ui-comps, mod:word-data
**作用**: 紧凑单词列表行。布局：[🔊] 中文 音标 英文。
**用法**:
```vue
<WordListItem :word="entry" :speaking="false" @speak="onSpeak" />
```
| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `word` | `WordEntry` | (必填) | 单词数据 |
| `speaking` | `boolean` | `false` | 喇叭播放中 |

| Event | 载荷 | 说明 |
|-------|------|------|
| `speak` | `text: string` | 点击喇叭时 |

**视觉样式**:
- 背景: `transparent`（由父容器提供）
- 分隔: `border-bottom: 1px solid var(--card-border)`
- 悬停: 无（由父容器提供 `.list-row:hover`）

**关联容器规则**：WordListItem 本身透明，父容器应提供 `background: var(--card-bg) + border-radius + overflow: hidden`。
