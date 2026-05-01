import { ref, onUnmounted, Ref } from 'vue'

interface ConfettiParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  rotation: number
  rv: number
  life: number
}

interface UseConfettiReturn {
  canvasRef: Ref<HTMLCanvasElement | null>
  launchConfetti: () => void
  stopConfetti: () => void
}

export function useConfetti(): UseConfettiReturn {
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  let confetti: ConfettiParticle[] = []
  let animating = false

  const palette = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff922b', '#cc5de8', '#20c997', '#f06595']

  const launchConfetti = () => {
    animating = true
    const canvas = canvasRef.value
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Spawn 120 particles
    confetti = Array.from({ length: 120 }, () => {
      const size = Math.random() * 8 + 4 // 4-12px
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.3 - 20,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 3 + 2,
        size,
        color: palette[Math.floor(Math.random() * palette.length)],
        rotation: Math.random() * Math.PI * 2,
        rv: (Math.random() - 0.5) * 0.2,
        life: Math.floor(Math.random() * 61) + 100 // 100-160
      }
    })

    const drawConfetti = () => {
      if (!animating) return

      const currentCanvas = canvasRef.value
      if (!currentCanvas) {
        animating = false
        return
      }

      const currentCtx = currentCanvas.getContext('2d')
      if (!currentCtx) {
        animating = false
        return
      }

      // Clear canvas
      currentCtx.clearRect(0, 0, currentCanvas.width, currentCanvas.height)

      // Update particles
      const updatedConfetti = confetti.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        rotation: p.rotation + p.rv,
        life: p.life - 1
      }))

      // Filter dead particles
      confetti = updatedConfetti.filter(p => p.life > 0)

      // Render live particles
      confetti.forEach(p => {
        currentCtx.save()
        currentCtx.translate(p.x, p.y)
        currentCtx.rotate(p.rotation)
        currentCtx.globalAlpha = Math.min(1, p.life / 60)
        currentCtx.fillStyle = p.color
        currentCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
        currentCtx.restore()
      })

      // Continue animation if particles remain
      if (confetti.length > 0 && animating) {
        requestAnimationFrame(drawConfetti)
      } else {
        animating = false
      }
    }

    requestAnimationFrame(drawConfetti)
  }

  const stopConfetti = () => {
    animating = false
    confetti = []
    const canvas = canvasRef.value
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
  }

  onUnmounted(() => {
    stopConfetti()
  })

  return {
    canvasRef,
    launchConfetti,
    stopConfetti
  }
}
