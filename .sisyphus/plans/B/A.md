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
