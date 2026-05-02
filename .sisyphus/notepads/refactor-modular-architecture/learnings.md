# Refactor Modular Architecture — Learnings

## 2026-05-02 Phase 0 Complete
- Types extracted to src/types/ (word.ts, game.ts, index.ts)
- ThemeToggle and BackButton shared components created
- wordBank.ts imports + re-exports WordEntry from @/types
- api/word.ts imports from @/types
- All 3 pages use shared components
- Build passes: vue-tsc clean, npm run build succeeds
- Commit: 9353605

## 2026-05-02 Phase 1: Deep Integration (this task)
- Replaced ALL inline implementations in TypingGame.vue with 6 composables
- Script went from 328 lines to 183 lines (removed 145 lines of inline logic)
- Template (1047 lines total) — ZERO changes, fully preserved

### Composables integration:
- `useAudio` — initAudio, playSound, playFail, playFinish (replaced inline audioCtx/sounds/tone)
- `useSpeech` — speak, speaking (readonly), cancel (replaced inline synth + speak)
- `useTimer` — timeLeft, startTimer, stopTimer (replaced inline timer setInterval)
- `useConfetti` — canvasRef, launchConfetti (replaced inline confetti[] + drawConfetti)
- `useScoring` — score, combo, maxCombo, grade, praise, regret, onCorrect, onWrong, resetScore, failedWords
- `useWordProvider` — fetchWords, wordList (replaced inline API+fallback logic)

### Fixes applied to composables:
1. **useScoring.ts**: `grade` changed from plain string to `{ label, emoji }` object — template uses `grade.label`
2. **useScoring.ts**: `onCorrect` timeLeft bonus now conditional on `isSpeed` (was always adding `timeLeft * 2`, causing ~16 extra points per word in normal mode)
3. **useWordProvider.ts**: Removed `readonly()` from `wordList` return — `DeepReadonly<WordEntry>` incompatible with `onWrong(word: WordEntry)`

### Key integration patterns:
- Praise sound mapping: composable's `praise()` returns string only; local `praiseToSound` record maps text → sound name, then `playSound()` called manually
- `onCorrect(isSpeed, isSpeed ? timeLeft : 0)` — pass 0 for timeLeft in normal mode to avoid unintended bonus
- `onMounted` calls `initAudio({ great, excellent, amazing, unbelievable, next })` with Vite-imported audio URLs
- No `onUnmounted` needed — all 6 composables register their own cleanup hooks

### Removed imports:
- `shuffleWords`, `type WordEntry` from `./wordBank`
- `fetchRandomWords` from `@/api/word`
- `onUnmounted` from `vue`
- All audio/speech/timer/confetti/scoring inline vars

### Build: vue-tsc --noEmit passes, npm run build passes (110 modules, 1.4s)

## 2026-05-02 Phase 2: Remove Theme Overrides from TypingGame.vue

### Changes Made:
- **TypingGame.vue**: Removed ~327 lines (921→594)
  - Deleted ALL `.game-wrapper.theme-ins` blocks (~130 lines)
  - Deleted ALL `.game-wrapper.theme-cute` blocks (~150 lines)
  - Deleted `@media (max-width: 768px)` CSS variable redefinition block (17 lines)
  - Deleted duplicate `.cute-deco`/`.deco-*`/`@keyframes deco-float` styles (28 lines)
  - Fixed `.game-title` to use `var(--title-gradient)`, `var(--title-fill)`, `var(--title-color)` from style.css
  - Fixed `.game-subtitle` to use `var(--text-muted)`

- **style.css**: Added ~90 lines of semantic/component-level CSS variable tokens
  - New variable groups: enter-btn, state-correct/wrong, timer-ring-bg, prompt-hover, speak-active-color, chinese-text-shadow, input-focus-shadow, result-answer, progress-dots, mode-badge
  - Each group defined for :root, .theme-ins, .theme-cute

- **6 sub-components fixed** — hardcoded theme colors → CSS variables:
  - GamePlay.vue: `.mode-badge.normal/.speed` → `var(--mode-badge-*)`
  - TimerRing.vue: `.timer-bg stroke` → `var(--timer-ring-bg)`
  - PromptCard.vue: hover, speak-icon speaking, chinese-word text-shadow → vars
  - InputArea.vue: focus shadow, enter-btn colors, btn-ok/btn-bad → vars
  - ResultBar.vue: result-bar colors, result-answer → vars
  - ProgressDots.vue: dot.done/current/fail → vars

### Key Discovery:
TypingGame.vue scoped CSS for child-component classes (`.mode-btn`, `.select-card`, `.prompt-card`, `.typing-input`, `.finish-stat`, etc.) was already **dead code** — Vue scoped CSS does not penetrate child component boundaries. The sub-components (ModeSelect, GamePlay, GameFinished) each have their own `<style scoped>` blocks that actually render. The theme overrides in TypingGame.vue were never applying to these child elements.

The actual theme switching works via CSS custom property inheritance: `.game-wrapper.theme-ins` sets the theme class, and CSS variables from `style.css` `.theme-ins {}` cascade down through ALL child components' scoped CSS.

### Build: vue-tsc --noEmit passes, npm run build passes (137 modules, 1.72s)
