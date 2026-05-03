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
