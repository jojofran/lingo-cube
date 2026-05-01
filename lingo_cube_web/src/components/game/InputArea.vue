<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  userInput: string
  inputClass: string
  isDisabled: boolean
  isSpeed: boolean
}>()

const emit = defineEmits<{
  'update:userInput': [value: string]
  submit: []
  keydown: [e: KeyboardEvent]
}>()

const localInput = computed({
  get: () => props.userInput,
  set: (value: string) => emit('update:userInput', value),
})
</script>

<template>
  <div class="input-area">
    <form class="input-row" @submit.prevent="emit('submit')">
      <input
        id="typing-input"
        v-model="localInput"
        :class="['typing-input', inputClass]"
        type="text"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        :placeholder="isSpeed ? 'Type fast...' : 'Type in English...'"
        :disabled="isDisabled"
        @keydown="emit('keydown', $event)"
      />
      <button
        type="submit"
        class="enter-btn"
        :disabled="!userInput.trim() || isDisabled"
        :class="{ 'btn-ok': inputClass === 'input-correct', 'btn-bad': inputClass === 'input-wrong' }"
      >
        Confirm
      </button>
    </form>
  </div>
</template>

<style scoped>
.input-area {
  width: 100%;
  max-width: 420px;
  box-sizing: border-box;
}
.input-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}
.typing-input {
  width: 100%;
  box-sizing: border-box;
  padding: 16px 24px;
  font-size: 1.25rem;
  letter-spacing: 3px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  border: 2px solid var(--input-border);
  border-radius: 16px;
  background: var(--input-bg);
  color: var(--input-text);
  outline: none;
  transition: all 0.3s;
  text-align: left;
}
.typing-input::placeholder {
  color: var(--input-placeholder);
  font-size: 0.9rem;
  letter-spacing: 1px;
}
.typing-input:focus {
  border-color: var(--accent);
  box-shadow: var(--input-focus-shadow);
}
.input-correct {
  border-color: var(--state-correct) !important;
  background: var(--state-correct-bg) !important;
  box-shadow: 0 0 24px var(--state-correct)55 !important;
}
.input-wrong {
  border-color: var(--state-wrong) !important;
  background: var(--state-wrong-bg) !important;
  box-shadow: 0 0 24px var(--state-wrong)55 !important;
}

.enter-btn {
  padding: 12px 36px;
  border-radius: 14px;
  border: 2px solid var(--accent);
  background: #fff;
  color: var(--enter-btn-color);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 6px;
  letter-spacing: 1.5px;
}
.enter-btn:not(:disabled):hover {
  background: var(--enter-btn-hover-bg);
  border-color: var(--accent-hover);
}
.enter-btn:disabled {
  border-color: var(--enter-btn-disabled-border);
  background: var(--enter-btn-disabled-bg);
  color: var(--enter-btn-disabled-color);
  cursor: default;
}
.btn-ok {
  border-color: var(--state-correct) !important;
  background: var(--state-correct-bg) !important;
  color: var(--state-correct) !important;
}
.btn-bad {
  border-color: var(--state-wrong) !important;
  background: var(--state-wrong-bg) !important;
  color: var(--state-wrong) !important;
}
</style>
