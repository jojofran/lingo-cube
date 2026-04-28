# Word Bank Module Design Documentation

## Overview
The Word Bank module is a standalone vocabulary database containing 297 IELTS words with auto-generated phonetic transcriptions. It provides the core data for the typing practice game.

## Module Structure

```
lingo_cube_web/src/
└── views/
    └── wordBank.ts      # Word data models, phonetic generator, utilities
```

## Data Structures

### WordEntry Interface
```typescript
interface WordEntry {
  english: string        // English word (required)
  chinese: string       // Chinese translation (required)
  phonetic: string     // Phonetic transcription (auto-generated)
  examples?: {         // Example sentences (optional)
    text: string       // Example sentence
    weight: number     // Difficulty weight
  }[]
}
```

**Fields**:
- `english`: Primary key - the word to spell
- `chinese`: Chinese meaning/translation for prompting
- `phonetic`: IPA phonetic transcription (auto-generated via `genPhonetic()`)
- `examples`: Optional usage examples with difficulty weights

## Phonetic Generation Algorithm

### `genPhonetic(w: string): string`

The phonetic generator converts English words to IPA (International Phonetic Alphabet) transcription.

#### Consonant Digraphs
| Input | Output | Description |
|-------|--------|-------------|
| `sh`  | `ʃ`    | voiceless postalveolar fricative |
| `ch`  | `tʃ`   | voiceless postalveolar affricate |
| `th`  | `θ`    | voiceless dental fricative |
| `ph`  | `f`    | fricative |
| `ck`  | `k`    | stop |
| `dg`  | `dʒ`   | voiced postalveolar affricate |
| `j`   | `dʒ`   | voiced postalveolar affricate |

#### Special Endings
| Pattern | Output | Condition |
|---------|--------|----------|
| `-tion` | `ʃən`  | word final |
| `-sion` | `ʒən`  | word final |
| `-ture` | `tʃər` | word final |
| `-sure` | `ʒər`  | word final |
| `-cial` | `ʃəl`  | always |
| `-tial` | `ʃəl`  | always |

#### Vowel Patterns
| Letter | Context | Output |
|--------|---------|--------|
| `a` | +i/y | `eɪ` (as in "make") |
| `a` | +u | `ɔː` (as in "cause") |
| `a` | +r | `ɑː` or `ər` |
| `e` | any | `ɛ` or `ɪ` |
| `i` | +e | `aɪ` (as in "time") |
| `o` | +i | `ɔɪ` (as in "boy") |
| `o` | +u | `aʊ` (as in "now") |

#### Silent Letters
- Silent `e` at word final (e.g., "make" → `/meɪk/`)

#### Algorithm Implementation
```typescript
function genPhonetic(w: string): string {
  const word = w.toLowerCase()
  let i = 0, out = ''
  const peek = (n: number) => word[i + n] || ''
  const eat = (n: number) => { i += n; return n }

  while (i < word.length) {
    const c = word[i]
    const n = peek(1), nn = peek(2)

    // Consonant digraphs
    if (c === 's' && n === 'h') { out += 'ʃ'; eat(2); continue }
    if (c === 'c' && n === 'h') { out += 'tʃ'; eat(2); continue }
    // ... more rules

    // Silent e
    if (c === 'e' && i === word.length - 1 && word.length > 3) { eat(1); continue }

    // Vowels
    if ('aeiou'.includes(c)) {
      // vowel mapping logic
    }

    // Consonants
    // consonant mapping logic
  }
  return '/' + out + '/'
}
```

## Word Bank Contents

### Statistics
- **Total Words**: 297
- **Categories**: IELTS academic vocabulary
- **Difficulty**: Intermediate to Advanced (B2-C1)
- **Coverage**: Common high-frequency academic words

### Sample Words
| English | Chinese | Phonetic |
|---------|---------|---------|
| abandon | 放弃，抛弃 | `/əˈbændən/` |
| absorb | 吸收，理解 | `/əbˈsɔːb/` |
| abstract | 抽象的，摘要 | `/ˈæbstrækt/` |
| abundant | 丰富的，充裕的 | `/əˈbʌndənt/` |
| access | 通道，进入，获取 | `/ˈækses/` |
| accomplish | 完成实现 | `/əˈkʌmplɪʃ/` |
| accurate | 精确的，准确的 | `/ˈækjərət/` |
| achieve | 达到，获得 | `/əˈtʃiːv/` |
| acknowledge | 承认，确认，感谢 | `/əkˈnɒlɪdʒ/` |
| acquire | 获得，习得 | `/əˈkwaɪə/` |

## Utility Functions

### `shuffleWords(arr: WordEntry[]): WordEntry[]`
Fisher-Yates shuffle algorithm for randomizing word order.

```typescript
export function shuffleWords(arr: WordEntry[]): WordEntry[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
```

### `pickRandom(arr: WordEntry[], count: number): WordEntry[]`
Returns a random subset of words.

```typescript
export function pickRandom(arr: WordEntry[], count: number): WordEntry[] {
  return shuffleWords(arr).slice(0, count)
}
```

## API Integration

### Word Bank API (Backend)
| Endpoint | Method | Description |
|---------|--------|-------------|
| `/api/words` | GET | Get all words |
| `/api/words/random?count=n` | GET | Get n random words |
| `/api/words/:english` | GET | Get specific word |

### Frontend API Client
```typescript
// api/word.ts
async function fetchRandomWords(count: number): Promise<WordEntry[]> {
  try {
    const res = await fetch(`${API_BASE}/words/random?count=${count}`, { 
      signal: AbortSignal.timeout(5000) 
    })
    return (await res.json()).data.words
  } catch {
    // Fallback to local word bank
    return pickRandom(wordBank, count)
  }
}
```

### Fallback Strategy
1. **Primary**: Remote API (5 second timeout)
2. **Fallback**: Local `wordBank` array
3. **Cache**: `localStorage['lingo_words']` (optional enhancement)

## Data Flow

```
wordBank.ts (source)
    │
    ▼
pickRandom/shuffleWords (select words)
    │
    ▼
TypingGame.vue (game component)
    │
    ▼
Game Session (20 rounds)
```

## Extension Points

### 1. Difficulty Tagging
Add level field for filtering:
```typescript
interface WordEntry {
  level: 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
}
```

### 2. Audio Pronunciation
Add audio URLs:
```typescript
interface WordEntry {
  audioUrl?: string  // MP3 pronunciation URL
}
```

### 3. Category Sorting
Add category field:
```typescript
interface WordEntry {
  category: 'academic' | 'business' | 'technology' | 'general'
}
```

### 4. Word Frequency
Add frequency data for better difficulty balancing:
```typescript
interface WordEntry {
  frequency: number  // 1-100 scale
}
```

## Performance Considerations

### Current Implementation
- **Load Time**: ~297 words load instantly
- **Phonetic Generation**: Computed on initialization (lazy)
- **Memory**: Minimal (~50KB)
- **Search**: O(n) linear scan

### Optimization Options (if needed)
1. **Virtual Scrolling**: For 1000+ words
2. **Web Worker**: For phonetic computation offload
3. **Index**: Add hash map for O(1) lookups
4. **Caching**: Cache generated phonetics in localStorage

## Error Handling

### Phonetic Generation Edge Cases
- Unknown characters → pass through as-is
- Empty input → return `//`
- Very long words (>20 chars) → may have accuracy issues

### Data Validation
```typescript
function validateWord(word: WordEntry): boolean {
  return !!word.english && 
         !!word.chinese && 
         word.english.length > 0 &&
         word.english.length < 20
}
```

## Testing Checklist

- [x] All 297 words have valid english/chinese
- [x] All words have auto-generated phonetic
- [x] Phonetic format: `/IPA/` (with slashes)
- [x] Shuffle produces random order
- [x] pickRandom returns correct count
- [x] No duplicate words
- [x] No empty fields

## Maintenance Notes

### Adding New Words
1. Add to `rawBank` array in alphabetical order
2. Ensure `english` is lowercase
3. Include Chinese translation with commas for multiple meanings
4. Run build to verify phonetic generation

### Updating Phonetics
The `genPhonetic()` function is heuristic-based and may produce occasional inaccuracies. For production:
1. Maintain a manual override dictionary for common exceptions
2. Or integrate with a pronunciation API

## Related Files

| File | Purpose |
|------|---------|
| `src/views/wordBank.ts` | Word data & utilities |
| `src/api/word.ts` | API client with fallback |
| `src/views/TypingGame.vue` | Word consumer |
| `lingo_cube_server/service/wordbank.go` | Backend word service |

## Commit History
- `feat: add 200+ IELTS words with phonetic` - Initial word bank
- `fix: correct phonetic generation` - IPA improvements
- `feat: add word bank API endpoints` - Backend integration

还是有问题，在不改变当前布局的情况下，以typing界面为参考，统一主题管理，在相同主题不同界面统一管理
1. 统一返回按钮和切换主题按钮样式和布局，只不过根据情况选择是否展示
2. 统一大标题副标题样式
3. 统一主卡片样式，内嵌卡片样式
4. 统一声音播放等各种通用图标
5. 按钮样式跟随主题特色
6. 注意单词和音标的对齐




3. "回滚到ebfdddf9b7638b589a40c3946252d74162ea3873"
4. "各个节目的返回和切换主题按钮没有统一，参考review,且注意功能的正确性"
5. "Home.vue的切换按钮也和其他界面一样放到右上角，也统一出来"
6. "home界面不在右上角啊"
7. "review界面，单词前面加一个空白span对冲被播放按钮挤占的空间，使其一直居中"


Home.vue的切换按钮也和其他界面一样放到右上角，也统一出来