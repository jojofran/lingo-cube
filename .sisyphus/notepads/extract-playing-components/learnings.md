# Learnings

## Component Extraction from TypingGame.vue

### Files Created
All 7 files in `lingo_cube_web/src/components/game/`:
- `GamePlay.vue` — orchestrator composing all child components
- `PromptCard.vue` — Chinese word prompt with speak icon
- `StatsRow.vue` — 3 stat boxes (Score, Combo/Correct, Round/Progress)
- `TimerRing.vue` — SVG circle timer (speed mode only)
- `InputArea.vue` — text input + Confirm button
- `ResultBar.vue` — correct/wrong result with fly-in/out transitions
- `ProgressDots.vue` — dot indicators for progress

### Type Safety
- All props use `defineProps<>()` with full TypeScript types
- Imports use `import type` (type-only imports) per task spec
- Types imported from `@/types`

### CSS Variable Usage
- All components use `var(--xxx)` from style.css for theming
- No hardcoded theme colors in component CSS
- No `.theme-ins` or `.theme-cute` overrides in child components
- Theme-specific overrides remain in TypingGame.vue where they belong

### Props Design
- Each child receives only the props it needs
- No shared mutable state between children — parent is single source of truth
- v-model pattern via `computed` get/set with `update:userInput` emit for InputArea.vue

### Event Flow
- All components emit upward via typed emits
- GamePlay.vue acts as transparent pass-through for all events (`submit`, `speak`, `update:userInput`, `keydown`)
- InputArea.vue handles the v-model `<input>` binding locally via computed get/set
- PromptCard.vue extracts `word.english` from the WordEntry and emits it as string

### Animations Preserved
- `shake` (PromptCard.vue)
- `burst` (PromptCard.vue)
- `fire-glow` (StatsRow.vue)
- `speak-pulse` (PromptCard.vue)
- `fly-top` / `fly-side` (ResultBar.vue with Vue `<Transition>`)
- `fire-glow` (StatsRow.vue)

### Verification
- `vue-tsc --noEmit` passes with zero type errors

## 2026-05-02 GameFinished Component Extraction

### File Created
- `src/components/game/GameFinished.vue` — finish screen with stats, failed words review, and action buttons

### Template Extracted
- Extracted from TypingGame.vue lines ~322-370: the `<div v-if="screen === 'finished'" class="finish-screen">` block
- Removed `v-if` — parent controls visibility by conditional rendering
- Emoji (🎊) and grade.label display preserved
- 3 stat boxes: Total Score, Best Combo, Accuracy
- Failed words list with scroll detection and scroll-hint
- Play Again + Review buttons with disabled state

### Props (all from parent, no refs)
- `score: number`, `maxCombo: number`, `failedWords: WordEntry[]`, `totalRounds: number`
- `grade: { label: string, emoji: string }`
- `failedAtBottom: boolean` — synced via watcher; component manages scroll-to-bottom detection internally

### Emits
- `restart` → Play Again button
- `review` → Review button
- `speak(word: string)` → mini speak buttons on failed items

### CSS Variables Used
- All colors via `var(--xxx)`: `--card-bg`, `--card-blur`, `--card-border`, `--card-shadow`
- `--stat-bg`, `--stat-border`, `--stat-text`
- `--text-primary`, `--text-dim`
- `--word-color`, `--accent-tertiary` (finish-num gradient)
- `--accent`, `--accent-hover` (restart button)
- No theme-specific `.theme-ins`/`.theme-cute` CSS included
- Box shadows use generic `rgba(0,0,0,0.12)` instead of theme-specific colored shadows

### Key Decisions
- `localFailedAtBottom` ref synced from prop via `watch()` — allows parent to reset on restart
- `.review-btn:hover` uses `filter: brightness(0.9)` instead of hardcoded darker color
- `.review-btn:disabled` uses `opacity: 0.4` instead of hardcoded `#ccc`
- `scrollbar-color` uses `var(--card-border)` for cross-theme support
- `finish-label` uses `var(--stat-text)` (matching StatsRow.vue pattern) rather than hardcoded rgba
