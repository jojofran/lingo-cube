# B-A Bug 修复

## B-A-1 修复 CuteDeco 在 Home 页面不显示
**模块**: mod:theme, mod:home
**需求**: REQ-003

**根因**: Home.vue scoped CSS 规则 `.home > *:not(.theme-orbs):not(.theme-toggle-global)` 设置了 `position: relative; z-index: 1`。由于 Vue scoped CSS 会让子组件根元素带上父组件的 data attribute，此规则命中 `<CuteDeco />` 的根元素 `<div class="cute-deco">`，覆盖了全局 `.cute-deco` 的 `position: fixed`，导致容器 collapse 为零高度（所有 SVG 子元素均为 `position: absolute`），装饰不可见。

**修复方案**: 在 Home.vue 的 `:not()` 链中添加 `:not(.cute-deco)`，排除 CuteDeco 组件。

```diff
- .home > *:not(.theme-orbs):not(.theme-toggle-global) {
+ .home > *:not(.theme-orbs):not(.theme-toggle-global):not(.cute-deco) {
```

**验证**: `npm run build` 通过。cute 主题下 Home 页面显示 SVG 装饰。

## B-A-2 重复播放不生效
**模块**: mod:game-engine
**需求**: REQ-001

**根因**: Chrome SpeechSynthesis API 的已知问题：`cancel()` 后立即调用 `speak()` 不会生效，新 utterance 被静默忽略。需要至少一个 event loop tick 的延迟来"重新武装"合成器。

**修复方案**: 在 `useSpeech.ts` 中，`synth.cancel()` 后将 `synth.speak(utterance)` 包裹在 `setTimeout(0)` 中。

```diff
-    synth.cancel()
-    const utterance = ...
-    synth.speak(utterance)
+    synth.cancel()
+    speaking.value = false
+    setTimeout(() => {
+      const utterance = ...
+      synth.speak(utterance)
+    }, 0)
```

**验证**: 在任意界面连续点击喇叭按钮，每次都能正常发音。

## B-A-3 主页排版不整齐
**模块**: mod:home
**需求**: REQ-003

**根因**: `.game-link` 卡片没有固定宽度（只有 padding 没有 width/max-width），导致卡片宽度随文字长度变化。标题 `font-size: 3rem` 过大，与下方卡片间距不协调。

**修复方案**: 
1. `.game-link` 加 `width: 100%; max-width: 300px;` 统一卡片宽度
2. 标题字号从 `3rem` 减到 `2.6rem`
3. 副标题间距从 `40px` 减到 `32px`

```diff
-  .game-link { padding: 24px 36px; }
+  .game-link { padding: 20px 32px; width: 100%; max-width: 300px; }
-  .theme-title { font-size: 3rem; }
+  .theme-title { font-size: 2.6rem; }
-  .subtitle { margin: 0 0 40px; }
+  .subtitle { margin: 0 0 32px; }
```

**验证**: 三个导航卡片宽度一致，页面视觉协调。
