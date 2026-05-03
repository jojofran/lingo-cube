# C-composable: 可组合函数

业务逻辑可复用 composable。

## useSpeech → C-comp-1
**文件**: composables/useSpeech.ts (56行)
**模块**: mod:speech
**作用**: TTS 语音合成。封装 Web Speech API，返回 `speak(text)` / `cancel()` / `speaking`(响应式)。
**返回**:
```ts
const { speak, cancel, speaking } = useSpeech()
```
**注意**: Chrome SpeechSynthesis 有 cancel→speak 时序问题，内部已用 setTimeout(0) 修复（B-A-2）。

---

## useTheme → C-comp-2
**文件**: composables/useTheme.ts (29行)
**模块**: mod:theme
**作用**: 全局主题单例。`theme` ref 为 `'dark' | 'ins' | 'cute'`。`cycleTheme()` 循环切换。
**用法**:
```ts
const { theme, themeLabel, themeShort, cycleTheme } = useTheme()
```
**规则**:
- 全局单例，所有页面共享同一个 ref
- 不要用本地 `ref` 管理主题
- 主题 class 通过 computed 派生后加到根元素

---

## useAudio → C-comp-3
**文件**: composables/useAudio.ts (101行)
**模块**: mod:audio
**作用**: 音效播放。基于 Web AudioContext。需先调用 `initAudio()` 注册音频资源。
**用法**:
```ts
const { initAudio, playSound, playFail, playFinish } = useAudio()
initAudio({ great: soundGreat, excellent: soundExcellent, amazing: soundAmazing, ... })
```

---

## useTimer → C-comp-4
**文件**: composables/useTimer.ts (41行)
**模块**: mod:game-engine
**作用**: 倒计时。speed 模式专用。
**用法**:
```ts
const { timeLeft, startTimer, stopTimer } = useTimer()
startTimer(seconds, onTimeout)
```

---

## useConfetti → C-comp-5
**文件**: composables/useConfetti.ts (128行)
**模块**: mod:confetti
**作用**: Canvas 彩纸庆祝动画。正确/完成时触发。
**用法**:
```ts
const { canvasRef, launchConfetti } = useConfetti()
// 模板中: <canvas ref="canvasRef" class="confetti-layer" />
```

---

## useWordProvider → C-comp-6
**文件**: composables/useWordProvider.ts (32行)
**模块**: mod:word-data
**作用**: 词库获取。优先从 API 获取随机词，失败 fallback 到本地 wordBank 随机选取。
**用法**:
```ts
const { fetchWords, wordList } = useWordProvider()
await fetchWords(count) // 填充 wordList
```

---

## useVocabBook → C-comp-7
**文件**: composables/useVocabBook.ts (36行)
**模块**: mod:review
**作用**: 生词本 CRUD。localStorage 持久化。
**用法**:
```ts
const { getVocab, addToVocab, removeFromVocab, isInVocab } = useVocabBook()
addToVocab(word)        // 添加，重复返回 false
removeFromVocab('word') // 删除
isInVocab('word')       // 查询
getVocab()              // 全部
```

---

## useAchievements → C-comp-8
**文件**: composables/useAchievements.ts (194行)
**模块**: mod:game-engine
**作用**: 成就系统。8 个成就定义 + localStorage 解锁状态 + 通知队列。
**用法**:
```ts
const achievements = useAchievements()
const newlyUnlocked = achievements.checkAll({ gamesPlayed, bestCombo, bestScore, modesPlayed })
```
**返回**:
```ts
{ getDisplayList, totalUnlocked, totalAchievements, isAllUnlocked, toasts, checkAll, definitions }
```
