// Original sounds, synthesised live with WebAudio — no audio files, nothing to load.
// A soft chime for a found difference, a dull buzz for a wrong click, a little arpeggio when a
// level is cleared and a fanfare when the game is won. Created lazily on the first user gesture,
// so browsers that block audio before interaction never complain.

export function createSound() {
  let context = null;
  let muted = false;

  function ensure() {
    if (context === null) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();
      } catch {
        context = undefined;
      }
    }
    if (context && context.state === 'suspended') context.resume();
    return context || null;
  }

  function tone(freq, start, duration, type, volume) {
    const audio = ensure();
    if (!audio) return;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, audio.currentTime + start);
    gain.gain.setValueAtTime(0, audio.currentTime + start);
    gain.gain.linearRampToValueAtTime(volume, audio.currentTime + start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + start + duration);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(audio.currentTime + start);
    oscillator.stop(audio.currentTime + start + duration + 0.05);
  }

  return {
    unlock() {
      ensure();
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    isMuted() {
      return muted;
    },
    found() {
      if (muted) return;
      tone(880, 0, 0.22, 'sine', 0.16);
      tone(1318.5, 0.07, 0.3, 'sine', 0.14);
    },
    wrong() {
      if (muted) return;
      tone(160, 0, 0.18, 'sawtooth', 0.07);
      tone(120, 0.05, 0.2, 'sawtooth', 0.06);
    },
    hint() {
      if (muted) return;
      tone(659.3, 0, 0.16, 'triangle', 0.12);
      tone(987.8, 0.08, 0.2, 'triangle', 0.1);
    },
    levelClear() {
      if (muted) return;
      [523.3, 659.3, 784, 1046.5].forEach((freq, index) => tone(freq, index * 0.09, 0.28, 'triangle', 0.13));
    },
    win() {
      if (muted) return;
      [523.3, 659.3, 784, 1046.5, 784, 1046.5, 1318.5].forEach((freq, index) =>
        tone(freq, index * 0.11, 0.34, 'triangle', 0.13),
      );
    },
    tick() {
      if (muted) return;
      tone(1046.5, 0, 0.06, 'square', 0.03);
    },
  };
}
