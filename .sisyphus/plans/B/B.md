# B-B 列表项样式修复

## B-B-1 → WordListItem 添加背景色和边框，统一列表容器模式
**模块**: mod:ui-comps (WordListItem), mod:word-data, mod:review
**需求**: —

**根因分析**:
1. WordListItem 当前 `background: transparent`，仅靠 `border-bottom` 分割。对比 WordCard 有 `--card-bg + border + border-radius: 20px`，显得单薄。
2. VocabReviewPage 的 `vocab-list` 容器无背景/边框/圆角，WordListItem 在其中呈现为裸行。
3. WordBankManager 的 `wbm-list` 容器有背景和圆角，但 WordListItem 本身仍无 hover 效果。
4. 参考 WordCardEx 的 example 区：`background: var(--example-bg); border-radius: 12px; border: 1px solid var(--card-border)`。

**修复方案**:

1. **WordListItem.vue** — 添加背景色和 hover：
   ```diff
   + .list-item { background: var(--card-bg); border-radius: 12px; }
   + .list-item:hover { background: var(--stat-bg); }
   ```

2. **VocabReviewPage.vue** — `vocab-list` 容器添加卡片样式：
   ```diff
   + .vocab-list { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--card-radius, 16px); overflow: hidden; }
   ```

3. **WordBankManager.vue** — 已有容器样式，无需改动。

**验证**: `npm run build` 通过。三套主题下列表项背景色正确，hover 效果正常。

## B-B-2 → 修复滚动时背景色不匹配（height→min-height）
**模块**: mod:ui-comps (ReviewPage, VocabReviewPage, TypingGame)
**需求**: —

**根因分析**:
当 `.review-wrapper` / `.game-wrapper` 使用 `height: 100vh` 时，元素被固定为视口高度。内容溢出滚动时，`background: var(--bg-gradient)` 只覆盖初始视口区域，滚动区域无渐变背景。

**修复方案**:
将 `height: 100vh; height: 100dvh;` 改为 `min-height: 100vh; min-height: 100dvh;`，使容器高度随内容扩展，背景渐变覆盖整个滚动区域。

涉及文件：
1. **ReviewPage.vue** line 62: `height: 100vh; height: 100dvh;` → `min-height: 100vh; min-height: 100dvh;`
2. **VocabReviewPage.vue** line 94: `min-height: 100vh; height: 100dvh;` → `min-height: 100vh; min-height: 100dvh;`
3. **TypingGame.vue** line 299-300: `height: 100vh; height: 100dvh;` → `min-height: 100vh; min-height: 100dvh;`

**验证**: `npx vue-tsc --noEmit` 通过，滚动时背景渐变完整覆盖。
