// src/engine/SoundManager.js
// Procedural Web Audio API sound manager — no asset files needed

class SoundManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.enabled = true;
    this.volume = 0.6;
    this._lastLowEnergy = 0;
    this._initialized = false;
    this.bgmInterval = null;
    this.bgmGainNode = null;
  }

  // Must be called after a user gesture (e.g. Start Game click)
  init() {
    if (this._initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 1.0;
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
      this._initialized = true;

      // Resume AudioContext when tab regains focus
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && this.ctx?.state === 'suspended') {
          this.ctx.resume();
        }
      });
    } catch (e) {
      console.warn('AudioContext init failed:', e);
    }
  }

  _ensureCtx() {
    if (!this._initialized) return false;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.enabled;
  }

  // ─── Core Helpers ───────────────────────────────────────────────────────

  _playTone({ freq = 440, endFreq = null, type = 'sine', duration = 0.2, gain = 0.25, delay = 0 }) {
    if (!this._ensureCtx()) return;
    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== null) {
      osc.frequency.linearRampToValueAtTime(endFreq, now + duration);
    }
    gainNode.gain.setValueAtTime(gain, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gainNode);
    gainNode.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + duration + 0.01);
  }

  _playNoise({ filterType = 'bandpass', filterFreq = 800, q = 1, duration = 0.1, gain = 0.2, delay = 0 }) {
    if (!this._ensureCtx()) return;
    const now = this.ctx.currentTime + delay;
    const bufferSize = Math.ceil(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = filterFreq;
    filter.Q.value = q;

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(gain, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.sfxGain);
    source.start(now);
    source.stop(now + duration + 0.01);
  }

  _playChord(freqs, type = 'sine', duration = 0.4, gain = 0.15) {
    freqs.forEach((freq, i) => {
      this._playTone({ freq, type, duration, gain, delay: i * 0.05 });
    });
  }

  _playArpeggio(freqs, type = 'sine', noteDuration = 0.15, gain = 0.25) {
    freqs.forEach((freq, i) => {
      this._playTone({ freq, type, duration: noteDuration, gain, delay: i * (noteDuration * 0.7) });
    });
  }

  // ─── Unit Actions ────────────────────────────────────────────────────────

  playUnitAttack(unitType) {
    switch (unitType) {
      case 'triangle':
        this._playTone({ freq: 880, endFreq: 440, type: 'sine', duration: 0.08, gain: 0.3 });
        break;
      case 'square':
        this._playTone({ freq: 200, type: 'square', duration: 0.12, gain: 0.2 });
        break;
      case 'pentagon':
        this._playTone({ freq: 300, endFreq: 150, type: 'sawtooth', duration: 0.25, gain: 0.25 });
        break;
      case 'hexagon':
        this._playTone({ freq: 600, endFreq: 300, type: 'sine', duration: 0.3, gain: 0.2 });
        break;
      case 'circle':
        this._playTone({ freq: 523, endFreq: 659, type: 'sine', duration: 0.4, gain: 0.15 });
        break;
      default:
        this._playTone({ freq: 500, duration: 0.1, gain: 0.2 });
    }
  }

  playUnitPlaced() {
    this._playTone({ freq: 440, endFreq: 660, type: 'sine', duration: 0.15, gain: 0.3 });
  }

  playUnitUpgraded() {
    this._playChord([261.6, 329.6, 392.0], 'sine', 0.4, 0.2); // C-E-G chord
  }

  playUnitSold() {
    this._playTone({ freq: 440, endFreq: 220, type: 'sine', duration: 0.2, gain: 0.25 });
  }

  playTauntActivated() {
    this._playTone({ freq: 150, type: 'square', duration: 0.5, gain: 0.3 });
  }

  playViscousTrapPlaced() {
    this._playNoise({ filterType: 'lowpass', filterFreq: 400, q: 2, duration: 0.3, gain: 0.3 });
  }

  playHealPulse() {
    this._playTone({ freq: 523, endFreq: 659, type: 'sine', duration: 0.4, gain: 0.12 });
  }

  // ─── Enemy Events ─────────────────────────────────────────────────────────

  playEnemyHit() {
    this._playNoise({ filterType: 'bandpass', filterFreq: 800, q: 3, duration: 0.05, gain: 0.25 });
  }

  playEnemyDeath(isBoss = false) {
    if (isBoss) {
      this._playTone({ freq: 120, endFreq: 40, type: 'sawtooth', duration: 0.8, gain: 0.4 });
      this._playNoise({ filterType: 'lowpass', filterFreq: 300, duration: 0.5, gain: 0.3, delay: 0.1 });
    } else {
      this._playTone({ freq: 400, endFreq: 100, type: 'sine', duration: 0.3, gain: 0.2 });
    }
  }

  playEnemySlowed() {
    this._playTone({ freq: 300, endFreq: 200, type: 'sine', duration: 0.2, gain: 0.1 });
  }

  playCritHit() {
    this._playTone({ freq: 1200, type: 'sine', duration: 0.06, gain: 0.35 });
  }

  // ─── Wave Events ─────────────────────────────────────────────────────────

  playWaveStart(isBossWave = false) {
    if (isBossWave) {
      // Ominous tritone
      this._playTone({ freq: 80,  type: 'sawtooth', duration: 1.2, gain: 0.3 });
      this._playTone({ freq: 113, type: 'sawtooth', duration: 1.2, gain: 0.25, delay: 0.05 });
    } else {
      this._playArpeggio([261.6, 329.6, 392.0, 523.3], 'sine', 0.15, 0.3);
    }
  }

  playWaveCleared() {
    this._playArpeggio([261.6, 329.6, 392.0, 523.3, 659.3], 'sine', 0.16, 0.3);
  }

  // ─── Base / Game State ────────────────────────────────────────────────────

  playBaseDamaged() {
    this._playNoise({ filterType: 'highpass', filterFreq: 200, duration: 0.5, gain: 0.4 });
    this._playTone({ freq: 100, type: 'sine', duration: 0.4, gain: 0.35, delay: 0.05 });
  }

  playGameOver() {
    const freqs = [523, 440, 392, 330, 262];
    freqs.forEach((freq, i) => {
      this._playTone({ freq, type: 'sine', duration: 0.3, gain: 0.3, delay: i * 0.28 });
    });
  }

  playLowEnergy() {
    const now = Date.now();
    if (now - this._lastLowEnergy < 2000) return; // throttle: max 1 per 2s
    this._lastLowEnergy = now;
    this._playTone({ freq: 220, type: 'sine', duration: 0.3, gain: 0.2 });
  }

  // ─── Controls ─────────────────────────────────────────────────────────────

  setVolume(level) {
    this.volume = Math.max(0, Math.min(1, level));
    if (this.masterGain) this.masterGain.gain.value = this.volume;
    if (this.bgmAudio) this.bgmAudio.volume = this.volume * 0.4;
  }

  setEnabled(bool) {
    this.enabled = bool;
    if (this.masterGain) {
      this.masterGain.gain.value = bool ? this.volume : 0;
    }
    if (this.bgmAudio) {
      if (bool) {
        this.bgmAudio.volume = this.volume * 0.4;
        this.bgmAudio.play().catch(() => {});
      } else {
        this.bgmAudio.pause();
      }
    }
  }

  startBGM() {
    if (!this._initialized) return;

    if (!this.bgmAudio) {
      this.bgmAudio = new Audio('https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=8-bit-arcade-138828.mp3');
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = this.volume * 0.4;
    }

    if (this.enabled) {
      this.bgmAudio.play().catch(e => console.warn('BGM play failed:', e));
    }
  }

  stopBGM() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
    }
  }
}

export default new SoundManager(); // singleton
