import { onUnmounted } from 'vue';

let audioCtx: AudioContext | null = null;
const sounds: Record<string, HTMLAudioElement> = {};

export function useAudio() {
  function initAudio(audioUrls: Record<string, string>) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      audioCtx = null;
    }

    Object.entries(audioUrls).forEach(([name, url]) => {
      sounds[name] = new Audio(url);
    });
  }

  function playSound(name: string) {
    const sound = sounds[name];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {});
    }
  }

  function tone(
    freq: number,
    start: number,
    dur: number,
    type: OscillatorType = 'sine',
    vol = 0.15
  ) {
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = vol;

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const startTime = audioCtx.currentTime + start;
    osc.start(startTime);
    osc.stop(startTime + dur);

    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  function playFail() {
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    gain.gain.value = 0.12;

    osc.frequency.setValueAtTime(280, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(180, audioCtx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.25);

    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  function playFinish() {
    const frequencies = [523.25, 587.33, 659.25, 783.99, 1046.5];
    frequencies.forEach((freq, i) => {
      tone(freq, i * 0.12, 0.4);
    });
  }

  onUnmounted(() => {
    if (audioCtx && audioCtx.state !== 'closed') {
      audioCtx.close();
      audioCtx = null;
    }
  });

  return {
    initAudio,
    playSound,
    tone,
    playFail,
    playFinish,
  };
}
