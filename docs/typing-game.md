# Typing Game Module Design Documentation

## Overview
The Typing Game is the core gameplay feature - an IELTS vocabulary typing practice game with two game modes, audio feedback, and visual celebrations.

## Module Structure

```
lingo_cube_web/src/
└── views/
    └── TypingGame.vue       # Main game component (~1210 lines)
```

## Game Architecture

### Screen States
```typescript
type Screen = 'select' | 'playing' | 'finished'
type GameMode = 'normal' | 'speed'
type WordResult = 'correct' | 'wrong' | null
```

### Core Constants
```typescript
const TOTAL_ROUNDS = 20      // Words per game session
const SPEED_TIME = 8        // Seconds per word in speed mode
```

## Game Modes

### Normal Mode (Library)
- No time pressure
- Learn at your own pace
- Score: 10 base + combo bonus (max 20)
- Auto-TTS pronunciation on each word

### Speed Mode
- 8 second timer per word
- Time bonus: +2 points per remaining second
- Score: 15 base + combo bonus + time bonus
- Higher difficulty = higher scores

## Scoring System

### Points Calculation
| Mode | Base Score | Combo Bonus | Time Bonus |
|------|------------|-------------|------------|
| Normal | 10 | min(combo × 2, 20) | N/A |
| Speed | 15 | min(combo × 2, 20) | timeLeft × 2 |

### Grade Thresholds
| Score | Grade | Emoji |
|-------|-------|-------|
| ≥400 | Legendary | 🏆 🌟 |
| ≥250 | Excellent | 🔥 🎉 |
| ≥150 | Good Job | 👍 ✨ |
| <150 | Keep Practicing | 💪 📖 |

### Combo System
- Combo increments on correct answers
- Resets to 0 on wrong answer
- Max combo tracked for final stats
- Visual fire effect when combo ≥ 5

## Input Validation

### Submission Logic
```typescript
function submit() {
  const input = userInput.value.trim().toLowerCase()
  const target = currentWord.value.english.toLowerCase()
  
  if (input === target) {
    // Correct: award points, trigger confetti
    combo++
    score += base + Math.min(combo * 2, 20)
    launchConfetti()
  } else {
    // Wrong: reset combo, show answer
    combo = 0
    failedWords.push(currentWord)
  }
}
```

### Key Features
- Case-insensitive comparison
- Auto-TTS pronunciation (optional click)
- Auto-focus after each word
- Enter key submits input

## Visual Feedback

### Animations
| Event | Animation | Effect |
|-------|-----------|--------|
| Correct | burst | Scale + brightness |
| Wrong | shake | Horizontal shake |
| Timer warning | Color change | Green → Yellow → Red |
| Combo ≥5 | fire-glow | Orange text shadow |
| Round complete | fly-top | Fly from top |
| Wrong result | fly-side | Fly from right |
| Game finish | confetti | Canvas particle system |

### Progress Indicators
- **Dots**: 20 dots showing progress
  - Gray: not started
  - Blue: current
  - Green: completed
  - Red: failed

## Audio System

### Sound Effects (Web Audio API)
| Event | Sound |
|-------|-------|
| Correct | great.mp3, excellent.wav, amazing.mp3, unbelievable.wav, next.wav |
| Wrong | Triangle wave tone (280Hz→180Hz) |
| Finish | C major arpeggio (C5→E5→G5→C6) |

### Speech Synthesis
- Uses Web Speech API
- Language: en-US
- Rate: 0.85 (slightly slow)
- Auto-plays on each new word

### Confetti Particle System
- Canvas-based (z-index: 100)
- 120 particles per burst
- 8-color palette: red, yellow, green, blue, orange, purple, teal, pink
- Physics: gravity + rotation + fade

## UI Components

### Select Screen
- Mode selection buttons (Library/Speed)
- Word bank info display
- Animated background orbs (Dark theme)

### Playing Screen
- Mode badge
- Stats row: Score, Combo/Correct, Progress
- Timer ring (Speed mode only)
- Prompt card with Chinese + phonetic
- Result bar with feedback
- Input field + submit button
- Progress dots

### Finished Screen
- Grade display with emoji
- Final stats: Score, Best Combo, Accuracy
- Failed words review list
- Restart and mode choice buttons

## Theme System

### Three Themes
| Theme | Background | Accent | Description |
|-------|-------------|--------|-------------|
| Dark | #0f0c29→#302b63→#24243e | #4d96ff | Default gradient |
| Ins | #fce4ec→#f3e5f5 gradient | #667eea | Light purple/pink |
| Cute | #fdf0f5 | #7cc5b0 | Mint pink |

### Theme-Specific Styles
Each theme overrides CSS variables:
- `--bg-gradient`: Background
- `--text-primary`, `--text-dim`: Text colors
- `--card-bg`, `--card-border`, `--card-shadow`: Card styling
- `--stat-bg`, `--stat-border`: Stats styling
- `--input-bg`, `--input-border`: Input styling
- `--accent`: Accent color
- `.theme-toggle-global`, `.back-icon`: Button styling

### Theme Toggle
- Fixed position: top-right (16px)
- Circular button (40px)
- Cycles: dark → ins → cute
- Persisted via Vue composable

## Data Flow

```
User selects mode
    │
    ▼
fetchRandomWords(20) or local shuffle
    │
    ▼
Display Chinese prompt + phonetic
    │
    ▼
User types input + submits
    │
    ▼─┬─ Correct ──→ Score + Combo + Confetti
    │                   │
    │                   ▼
    │               Next word / Finish
    │
    └─ Wrong ──→ Show answer + Reset combo
                    │
                    ▼
                Next word / Finish
```

## Mobile Responsiveness

### Breakpoint: 768px
| Element | Desktop | Mobile |
|---------|---------|--------|
| Header | Visible | Hidden |
| Input | 420px max | Full width |
| Stats | Row layout | Compact |
| Timer | 88px | 56px |
| Theme toggle | 16px | 12px |

## API Integration

### Word Bank Fetch
```typescript
async function selectMode(m: GameMode) {
  try {
    wordList.value = await fetchRandomWords(TOTAL_ROUNDS)
  } catch {
    wordList.value = shuffleWords(wordBank).slice(0, TOTAL_ROUNDS)
  }
}
```

### Fallback Chain
1. Remote API (via `/api/words/random?n=20`)
2. Local `wordBank` array (fallback)

## Performance Considerations

### Lazy Initialization
- Audio context created on mount
- Words fetched only when mode selected
- Canvas confetti only rendered when needed

### Cleanup
```typescript
onUnmounted(() => {
  clearInterval(timer!)
  animating = false
  confetti = []
  audioCtx?.close()
})
```

## Extension Points

### Difficulty Filtering
```typescript
// Future: filter by word level
const filtered = wordBank.filter(w => w.level === targetLevel)
```

### Custom Word Lists
```typescript
// Future: user can upload custom word lists
const customBank = loadCustomWords()
```

### Statistics Tracking
```typescript
// Future: save scores to localStorage
saveScore({ date, score, wpm, accuracy, theme, mode })
```

## Component Props (Input)
The component receives theme state from external composable:

```typescript
const { theme, themeLabel, themeShort, cycleTheme } = useTheme()
```

## Related Files

| File | Purpose |
|------|---------|
| `src/views/wordBank.ts` | Word data source |
| `src/api/word.ts` | API client with fallback |
| `src/composables/useTheme.ts` | Theme state management |
| `src/components/CuteDeco.vue` | Theme decorations |
| `src/style.css` | Global CSS variables |
| `lingo_cube_server/handler/word.go` | Backend word API |

## Commit History
- `feat: add typing game core mechanics` - Initial implementation
- `feat: add speed mode with timer` - Speed mode
- `feat: add audio feedback` - Sound effects
- `feat: add confetti celebration` - Visual effects
- `feat: add theme system` - Theme support
- `fix: mobile responsive layout` - Mobile optimization