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
  box-shadow: 0 0 30px rgba(77, 150, 255, 0.15);
}
.input-correct {
  border-color: #6bcb77 !important;
  background: rgba(107, 203, 119, 0.1) !important;
  box-shadow: 0 0 24px rgba(107, 203, 119, 0.25) !important;
}
.input-wrong {
  border-color: #ff6b6b !important;
  background: rgba(255, 107, 107, 0.1) !important;
  box-shadow: 0 0 24px rgba(255, 107, 107, 0.25) !important;
}

.enter-btn {
  padding: 12px 36px;
  border-radius: 14px;
  border: 2px solid var(--accent);
  background: #fff;
  color: #1a3d7a;
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
  background: #eef4ff;
  border-color: var(--accent-hover);
}
.enter-btn:disabled {
  border-color: #c0d0e8;
  background: #f5f7fa;
  color: #a0b0c8;
  cursor: default;
}
.btn-ok {
  border-color: #6bcb77 !important;
  background: #f0faf2 !important;
  color: #2d7a38 !important;
}
.btn-bad {
  border-color: #ff6b6b !important;
  background: #fef0f0 !important;
  color: #b33a3a !important;
}
</style>
