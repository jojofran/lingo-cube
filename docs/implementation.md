# Cute Theme Background Decorations - Implementation Documentation

## Overview
Added hand-drawn decorative elements to the Cute theme background as soft, translucent overlays that complement the existing `cute-deco` orb-based decorations without affecting other themes.

## Files Modified

### 1. `src/views/Home.vue`
- **Added**: `.cute-hand-drawn` layer with 5 hand-drawn decorative elements
- **Position**: Directly under `.game-wrapper` (outside `.select-screen`) to ensure full viewport coverage
- **Structure**:
  ```html
  <div class="cute-hand-drawn">
    <div class="hand-item h1" />
    <div class="hand-item h2" />
    <div class="hand-item h3" />
    <div class="hand-item h4" />
    <div class="hand-item h5" />
  </div>
  ```

### 2. `src/styles.css`
- **Added**: CSS custom properties for Cute theme hand-drawn decorations
- **Variables**:
  - `--hand-h1`: `#7cc5b0` (main mint/teal)
  - `--hand-h2`: `#f5a0b0` (soft pink)
  - `--hand-h3`: `#c8a0d0` (lavender)
  - `--hand-h4`: `#ffd93d` (warm yellow)
  - `--hand-h5`: `#ff8fab` (soft coral)

### 3. `src/style.css`
- **Updated**: `--cute-deco-display: block` (was already set)
- **No changes** to existing Cute theme variables (kept for backward compatibility)

## Implementation Details

### CSS Classes (in Home.vue scoped styles)

```css
.cute-hand-drawn {
  pointer-events: none;
  z-index: 0;
  position: fixed;    /* Full viewport coverage */
  inset: 0;
  overflow: hidden;
  display: var(--cute-deco-display, block);
}

.hand-item {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);       /* Soft, ethereal effect */
  opacity: 0.18;            /* Subtle presence */
  will-change: transform;   /* Performance optimization */
}

/* Five hand-drawn elements with unique positions and colors */
.h1 { 
  width: 22%; height: 22%; 
  background: var(--hand-h1, #7cc5b0); 
  top: 8%; left: 6%; 
  animation: float1 12s ease-in-out infinite; 
}
.h2 { 
  width: 14%; height: 14%; 
  background: var(--hand-h2, #f5a0b0); 
  top: 82%; left: 82%; 
  animation: float2 10s ease-in-out infinite; 
}
.h3 { 
  width: 18%; height: 18%; 
  background: var(--hand-h3, #c8a0d0); 
  top: 12%; left: 88%; 
  animation: float3 14s ease-in-out infinite; 
}
.h4 { 
  width: 10%; height: 10%; 
  background: var(--hand-h4, #ffd93d); 
  top: 86%; left: 14%; 
  animation: float4 9s ease-in-out infinite; 
}
.h5 { 
  width: 16%; height: 16%; 
  background: var(--hand-h5, #ff8fab); 
  top: 50%; left: 50%; 
  animation: float5 16s ease-in-out infinite; 
}
```

### Animation Keyframes

```css
@keyframes float1 {
  0%, 100% { transform: translateY(0) rotate(12deg) scale(1.3); }
  50% { transform: translateY(-20px) rotate(18deg) scale(1.43); }
}
@keyframes float2 {
  0%, 100% { transform: translateY(0) rotate(-10deg) scale(0.9); }
  50% { transform: translateY(-14px) rotate(-15deg) scale(0.95); }
}
/* ... similar for float3, float4, float5 ... */
```

## Design Decisions

### 1. Positioning Strategy
- **Problem**: Fixed-position elements inside relative parents become constrained
- **Solution**: Move `.cute-hand-drawn` to be a direct child of `.game-wrapper` (no relative positioning)
- **Result**: Elements now cover the entire viewport as intended

### 2. Visual Properties
- **Blur**: 40px creates soft, dreamy glow (softer than orb's 60px)
- **Opacity**: 0.18 keeps decorations subtle and non-intrusive
- **Animation**: Float effects with gentle rotation for organic feel

### 3. Theme Isolation
- Only activates when `--cute-deco-display: block` (which is the default for Cute theme)
- Dark and Ins themes show nothing (default `display: none`)
- No impact on existing orb decorations or other theme elements

### 4. Performance Optimizations
- `will-change: transform` on hand items
- Uses `transform` and `opacity` only for animations (GPU-accelerated)
- Reasonable animation durations (9-16s) to avoid distraction

## Visual Hierarchy

```
.game-wrapper (z-index: auto)
├── .cute-hand-drawn (z-index: 0)  ← NEW
│   ├── .hand-item.h1
│   ├── .hand-item.h2
│   ├── .hand-item.h3
│   ├── .hand-item.h4
│   └── .hand-item.h5
├── .theme-orbs (z-index: 0, display: none for Cute)
├── .orb (z-index: 0, display: none for Cute)
├── .CuteDeco (z-index: 0)
├── .game-header (z-index: 1)
├── .select-screen / .playing-screen (z-index: auto)
└── .theme-toggle-global (z-index: 200, fixed)
```

## Testing Checklist

- [x] Cute theme shows hand-drawn decorations on Home page
- [x] Dark theme shows no decorations (default display: none)
- [x] Ins theme shows no decorations (default display: none)
- [x] Decorations don't interfere with clickable elements
- [x] Decorations visible on all screen sizes
- [x] Animation runs smoothly (no jank)
- [x] No impact on TypingGame.vue when navigating from Home

## Customization Guide

### Adjusting Appearance
To modify the decorations, edit these CSS variables in `.theme-cute` block:

```css
--cute-deco-display: block;  /* or 'none' to hide */

/* Color palette */
--hand-h1: #7cc5b0;  /* main accent */
--hand-h2: #f5a0b0;  /* secondary */
--hand-h3: #c8a0d0;  /* tertiary */
--hand-h4: #ffd93d;  /* highlight */
--hand-h5: #ff8fab;  /* accent */
```

### Adjusting Animation
```css
/* Speed: lower = slower */
animation: float1 12s ease-in-out infinite;  /* 12s duration */

/* Intensity: adjust translate values */
transform: translateY(-20px) rotate(18deg) scale(1.43);  /* -20px = amplitude */
```

### Adjusting Opacity/Size
```css
.hand-item {
  opacity: 0.18;      /* 0.0 = invisible, 0.5 = more visible */
  filter: blur(40px); /* smaller = sharper, larger = softer */
}
```

## Browser Support
- CSS custom properties (variables): Modern browsers
- `inset` shorthand: Modern browsers (use `top/right/bottom/left` for legacy)
- `will-change`: Widely supported
- `backdrop-filter` (on toggle button): Check caniuse; may need fallbacks

## Fallback for Older Browsers
If CSS variables aren't supported, the hardcoded colors provide graceful degradation:
```css
.h1 { background: #7cc5b0; }  /* Fallback */
.h1 { background: var(--hand-h1, #7cc5b0); }  /* With fallback */
```

## Maintenance Notes
- The 5-element set is visually balanced; adding/removing elements requires repositioning
- All sizes are percentage-based (%), making it responsive
- Animations use `ease-in-out` for natural movement
- The `:not(.theme-orbs)` selector on `.home > *` prevents z-index conflicts

## Commit History
- `feat(cute-theme): add hand-drawn background decorations` - Added decorative elements
- `fix: remove misnamed Chinese '文档' directory` - Fixed directory naming
- `feat: extract global theme system` - Base theme architecture
- `feat: flex fullscreen layout` - Layout foundation