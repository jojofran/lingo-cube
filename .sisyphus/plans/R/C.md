# R-C: 通用组件化（WordCard）

## C-1 → 提取 PromptCard 为通用 WordCard 组件
**模块**: mod:ui-comps, mod:game-engine
**需求**: REQ-010
**步骤**:
1. 新建 `components/common/WordCard.vue`
   - 从 `components/game/PromptCard.vue` 复制核心 UI（中文、音标、TTS 喇叭图标）
   - 新增 props: `word` (WordEntry), `showPhonetic` (boolean, default true), `showSpeak` (boolean, default true)
   - 新增 slots: `default`（卡片底部附加内容）、`action`（右上角替换喇叭的定制操作）
   - 保留 `shake`/`burst` CSS class 绑定（可通过 props 控制开关）
2. GamePlay.vue 中替换 `PromptCard` 为 `WordCard`
   - 调整 props 映射（WordCard 接收 `word` 而非拆分多个 prop）
3. 移动相关 CSS 变量到全局 `style.css`（如 `--chinese-text-shadow`, `--phonetic-color`）
4. `PromptCard.vue` 保留为对 `WordCard` 的轻量封装（或直接删除若 GamePlay 不再引用）
**验证**: `npm run build`
