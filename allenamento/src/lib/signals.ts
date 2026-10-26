let audio: AudioContext | null = null

/** Bip breve a fine timer (solo se attivato nelle impostazioni). */
export function beep(times = 1) {
  try {
    audio ??= new AudioContext()
    if (audio.state === 'suspended') void audio.resume()
    const ctx = audio
    for (let i = 0; i < times; i++) {
      const start = ctx.currentTime + i * 0.22
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.4, start + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16)
      osc.connect(gain).connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.18)
    }
  } catch {
    // Audio non disponibile: pazienza.
  }
}

export function vibrate(pattern: number | number[] = 200) {
  if ('vibrate' in navigator) navigator.vibrate(pattern)
}
