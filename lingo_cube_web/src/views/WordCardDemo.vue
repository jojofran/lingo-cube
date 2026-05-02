<script setup lang="ts">
import { computed } from 'vue'
import { wordBank, type WordEntry } from './wordBank'
import { useSpeech } from '@/composables/useSpeech'
import { useTheme, type Theme } from '@/composables/useTheme'
import WordCard from '@/components/common/WordCard.vue'
import WordCardEx from '@/components/common/WordCardEx.vue'
import ReviewCard from '@/components/common/ReviewCard.vue'
import WordListItem from '@/components/word/WordListItem.vue'
import CuteDeco from '@/components/CuteDeco.vue'

const { theme, themeLabel } = useTheme()
const themes: Theme[] = ['dark', 'ins', 'cute']

const themeClass = computed(() => {
  if (theme.value === 'ins') return 'theme-ins'
  if (theme.value === 'cute') return 'theme-cute'
  return ''
})

const { speak } = useSpeech()

const demoWord: WordEntry = {
  ...wordBank[0],
  examples: [{ text: 'They had to abandon the project due to lack of funding.', weight: 1 }],
}
const sampleWords = wordBank.slice(0, 5)

function onSpeak(text: string) {
  speak(text)
}
</script>

<template>
  <div :class="['demo-wrapper', themeClass]">
    <CuteDeco />
    <h1 class="demo-title">🎨 Word Card Demo</h1>

    <!-- Theme Picker -->
    <div class="theme-picker">
      <button
        v-for="t in themes"
        :key="t"
        class="theme-btn"
        :class="{ active: theme === t }"
        @click="theme = t"
      >
        {{ t === 'dark' ? '🌙 Dark' : t === 'ins' ? '🌸 INS' : '🍬 Cute' }}
      </button>
    </div>

    <div class="demo-sections">
      <!-- WordCard primary="chinese" (default) -->
      <section class="demo-section">
        <h2 class="section-title">WordCard · Chinese</h2>
        <p class="section-desc">primary="chinese" (default) — Chinese as primary word</p>
        <div class="demo-row">
          <WordCard :word="demoWord" @speak="onSpeak" />
        </div>
      </section>

      <!-- WordCard primary="english" + showSecondary -->
      <section class="demo-section">
        <h2 class="section-title">WordCard · English + Zh</h2>
        <p class="section-desc">primary="english" — English primary, Chinese secondary</p>
        <div class="demo-row">
          <WordCard :word="demoWord" primary="english" @speak="onSpeak" />
        </div>
      </section>

      <!-- WordCard primary="english" showSecondary=false -->
      <section class="demo-section">
        <h2 class="section-title">WordCard · English</h2>
        <p class="section-desc">primary="english" :show-secondary="false" — English only</p>
        <div class="demo-row">
          <WordCard :word="demoWord" primary="english" :show-secondary="false" @speak="onSpeak" />
        </div>
      </section>

      <!-- WordCard showPhonetic=false -->
      <section class="demo-section">
        <h2 class="section-title">WordCard · no phonetic</h2>
        <p class="section-desc">:show-phonetic="false" — Chinese word only</p>
        <div class="demo-row">
          <WordCard :word="demoWord" :show-phonetic="false" @speak="onSpeak" />
        </div>
      </section>

      <!-- WordCard showSpeak=false -->
      <section class="demo-section">
        <h2 class="section-title">WordCard · no speaker</h2>
        <p class="section-desc">:show-speak="false" — Chinese word + phonetic, no TTS icon</p>
        <div class="demo-row">
          <WordCard :word="demoWord" :show-speak="false" />
        </div>
      </section>

      <!-- WordCard with custom slot content -->
      <section class="demo-section">
        <h2 class="section-title">WordCard · with slot</h2>
        <p class="section-desc">Custom content via default slot</p>
        <div class="demo-row">
          <WordCard :word="demoWord" @speak="onSpeak">
            <div class="slot-demo-badge">⭐ extra content via slot</div>
          </WordCard>
        </div>
      </section>

      <!-- WordCardEx (WordCard + example) -->
      <section class="demo-section">
        <h2 class="section-title">WordCardEx</h2>
        <p class="section-desc">WordCard + built-in example section</p>
        <div class="demo-row">
          <WordCardEx :word="demoWord" @speak="onSpeak" />
        </div>
      </section>

      <!-- WordCardEx with custom #example slot -->
      <section class="demo-section">
        <h2 class="section-title">WordCardEx · custom slot</h2>
        <p class="section-desc">Custom #example slot overrides default example</p>
        <div class="demo-row">
          <WordCardEx :word="demoWord" @speak="onSpeak">
            <template #example="{ example }">
              <div class="custom-example">
                <span class="custom-example-icon">💡</span>
                <span>{{ example.text }}</span>
              </div>
            </template>
          </WordCardEx>
        </div>
      </section>

      <!-- ReviewCard (thin wrapper around WordCard) -->
      <section class="demo-section">
        <h2 class="section-title">ReviewCard</h2>
        <p class="section-desc">Thin wrapper — WordCard primary="english" with custom padding</p>
        <div class="demo-row">
          <ReviewCard :word="demoWord" @speak="onSpeak">
            <div class="slot-demo-badge">📖 review actions go here</div>
          </ReviewCard>
        </div>
      </section>

      <!-- WordListItem (compact list) -->
      <section class="demo-section">
        <h2 class="section-title">WordListItem</h2>
        <p class="section-desc">Compact list row — for failed words, vocab lists</p>
        <div class="demo-row">
          <WordListItem v-for="(w, i) in sampleWords" :key="i" :word="w" @speak="onSpeak" />
        </div>
      </section>
    </div>

    <p class="demo-footer">Theme: {{ themeLabel }}</p>
  </div>
</template>

<style scoped>
.demo-wrapper {
  min-height: 100vh;
  background: var(--bg-gradient, linear-gradient(135deg, #0f0c29, #302b63, #24243e));
  color: var(--text-primary, #fff);
  padding: 32px 16px 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans GB', 'Noto Sans SC', system-ui, -apple-system, sans-serif;
  transition: background 0.4s;
}

.demo-title {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: 2px;
  margin-bottom: 20px;
  color: var(--title-color, #fff);
  background: var(--title-gradient, linear-gradient(90deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff));
  -webkit-background-clip: text;
  -webkit-text-fill-color: var(--title-fill);
  background-clip: text;
}

/* Theme Picker */
.theme-picker {
  display: flex;
  gap: 8px;
  margin-bottom: 40px;
  flex-wrap: wrap;
  justify-content: center;
}

.theme-btn {
  padding: 10px 20px;
  border-radius: 12px;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
  backdrop-filter: var(--card-blur, blur(20px));
}

.theme-btn:hover {
  border-color: var(--accent);
  background: var(--btn-bg);
}

.theme-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* Sections */
.demo-sections {
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 100%;
  max-width: 560px;
}

.demo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.section-desc {
  font-size: 0.8rem;
  color: var(--text-dim);
  margin-bottom: 16px;
}

.demo-row {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Demo card wrapper */
.demo-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 16px;
  width: 100%;
  max-width: 420px;
}

.demo-footer {
  margin-top: 40px;
  font-size: 0.8rem;
  color: var(--text-muted);
  letter-spacing: 1px;
}

/* Slot demo badge */
.slot-demo-badge {
  margin-top: 4px;
  padding: 10px;
  border-radius: 10px;
  background: var(--example-bg);
  font-size: 0.85rem;
  color: var(--text-muted);
  text-align: center;
}

/* Custom example slot demo */
.custom-example {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  margin-top: 8px;
  border-radius: 10px;
  background: rgba(255, 107, 107, 0.08);
  font-size: 0.9rem;
  color: var(--text-primary);
  line-height: 1.5;
}
.custom-example-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 480px) {
  .demo-wrapper {
    padding: 20px 12px 40px;
  }
  .demo-title {
    font-size: 1.5rem;
  }
  .theme-btn {
    padding: 8px 16px;
    font-size: 0.8rem;
  }
}
</style>
