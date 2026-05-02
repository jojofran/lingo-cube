// FEATURE: F-B-1
import { ref, computed } from 'vue'

export interface Achievement {
  id: string
  label: string
  icon: string
  desc: string
  check: () => boolean
}

export interface PlayStats {
  gamesPlayed: number
  bestCombo: number
  bestScore: number
  modesPlayed: string[]
}

const STORAGE_KEY = 'lingo-achievements'
const STATS_KEY = 'lingo-achievements-stats'

function loadUnlocked(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function saveUnlocked(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch { /* noop */ }
}

function loadStats(): PlayStats {
  try {
    const raw = localStorage.getItem(STATS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as PlayStats
      return {
        gamesPlayed: parsed.gamesPlayed ?? 0,
        bestCombo: parsed.bestCombo ?? 0,
        bestScore: parsed.bestScore ?? 0,
        modesPlayed: Array.isArray(parsed.modesPlayed) ? parsed.modesPlayed : [],
      }
    }
  } catch { /* noop */ }
  return { gamesPlayed: 0, bestCombo: 0, bestScore: 0, modesPlayed: [] }
}

function saveStats(s: PlayStats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(s))
  } catch { /* noop */ }
}

let instance: ReturnType<typeof createAchievements> | null = null

export interface ToastItem {
  id: string
  icon: string
  label: string
}

function createAchievements() {
  const unlockedIds = ref<string[]>(loadUnlocked())
  const stats = ref<PlayStats>(loadStats())
  const toasts = ref<ToastItem[]>([])

  const definitions: Achievement[] = [
    {
      id: 'first_game',
      label: 'First Steps',
      icon: '🎮',
      desc: 'Complete your first game',
      check: () => stats.value.gamesPlayed >= 1,
    },
    {
      id: 'combo_5',
      label: 'On Fire',
      icon: '🔥',
      desc: 'Reach a 5× combo',
      check: () => stats.value.bestCombo >= 5,
    },
    {
      id: 'combo_10',
      label: 'Unstoppable',
      icon: '⚡',
      desc: 'Reach a 10× combo',
      check: () => stats.value.bestCombo >= 10,
    },
    {
      id: 'score_200',
      label: 'Scorer',
      icon: '📊',
      desc: 'Score 200+ in a game',
      check: () => stats.value.bestScore >= 200,
    },
    {
      id: 'score_400',
      label: 'Legendary',
      icon: '🏆',
      desc: 'Score 400+ in a game',
      check: () => stats.value.bestScore >= 400,
    },
    {
      id: 'spell_mode',
      label: 'Spelling Bee',
      icon: '✍️',
      desc: 'Complete a spelling mode game',
      check: () => stats.value.modesPlayed.includes('spell'),
    },
    {
      id: 'listen_mode',
      label: 'Audiophile',
      icon: '🎧',
      desc: 'Complete a listening mode game',
      check: () => stats.value.modesPlayed.includes('listen'),
    },
    {
      id: 'speed_mode',
      label: 'Speed Demon',
      icon: '⚡',
      desc: 'Complete a speed mode game',
      check: () => stats.value.modesPlayed.includes('speed'),
    },
  ]

  function mergeStats(playStats: PlayStats): PlayStats {
    return {
      gamesPlayed: stats.value.gamesPlayed + playStats.gamesPlayed,
      bestCombo: Math.max(stats.value.bestCombo, playStats.bestCombo),
      bestScore: Math.max(stats.value.bestScore, playStats.bestScore),
      modesPlayed: [...new Set([...stats.value.modesPlayed, ...playStats.modesPlayed])],
    }
  }

  function evaluateNewlyUnlocked(): Achievement[] {
    const newlyUnlocked: Achievement[] = []
    for (const def of definitions) {
      if (!unlockedIds.value.includes(def.id) && def.check()) {
        unlockedIds.value = [...unlockedIds.value, def.id]
        newlyUnlocked.push(def)
      }
    }
    return newlyUnlocked
  }

  function checkAll(playStats: PlayStats): Achievement[] {
    stats.value = mergeStats(playStats)
    saveStats(stats.value)
    const newlyUnlocked = evaluateNewlyUnlocked()
    saveUnlocked(unlockedIds.value)
    for (const ach of newlyUnlocked) {
      toasts.value.push({ id: ach.id, icon: ach.icon, label: ach.label })
    }
    return newlyUnlocked
  }

  const getUnlocked = computed(() => unlockedIds.value)

  const getDisplayList = computed(() =>
    definitions.map((def) => ({
      ...def,
      unlocked: unlockedIds.value.includes(def.id),
    }))
  )

  const totalUnlocked = computed(() => unlockedIds.value.length)
  const totalAchievements = definitions.length
  const isAllUnlocked = computed(() => unlockedIds.value.length >= definitions.length)

  return {
    definitions,
    unlockedIds,
    stats,
    toasts,
    getUnlocked,
    getDisplayList,
    totalUnlocked,
    totalAchievements,
    isAllUnlocked,
    checkAll,
  }
}

export function useAchievements() {
  if (!instance) {
    instance = createAchievements()
  }
  return instance
}
