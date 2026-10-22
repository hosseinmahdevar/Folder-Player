/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Web Audio Engine for FolderPlay
 * Clean-room reconstruction of BASS + DSP effects + Sleep Timer + Auto-Rewind
 */
class AudioEngine {
  ctx = null;
  isPlaying = false;
  currentTimeMs = 0;
  durationMs = 18e5;
  // 30 minutes default
  playbackRate = 1;
  pitchShift = 0;
  // semitones
  volumeBoostDb = 0;
  rnnoiseEnabled = true;
  balance = 0;
  isMono = false;
  eqGains = [0, 0, 0, 0, 0];
  // Audio Nodes
  masterGain = null;
  boostGain = null;
  compressor = null;
  eqFilters = [];
  rnnoiseHighpass = null;
  rnnoiseNotch = null;
  rnnoiseVocalBoost = null;
  panner = null;
  analyser = null;
  // Synthesized voice narration oscillators (harmonic speech emulation)
  vocalOsc1 = null;
  vocalOsc2 = null;
  vocalOsc3 = null;
  vocalGain = null;
  ambientNoiseSource = null;
  ambientNoiseGain = null;
  // Custom audio element when user loads a real file
  customAudio = null;
  customMediaSource = null;
  usingCustomAudio = false;
  // Position clock loop
  timerInterval = null;
  lastClockEpoch = 0;
  // Auto-Rewind Tracking
  lastPauseEpochMs = 0;
  autoRewindState = {
    armed: false,
    calculatedOffsetSec: 0,
    pausedDurationSec: 0,
    lastPauseEpochMs: 0
  };
  // Sleep Timer
  sleepTimerState = {
    active: false,
    targetDurationSec: 1800,
    remainingSec: 1800,
    fadeoutActive: false,
    shakeToResetEnabled: true,
    shakeSensitivity: 6,
    scheduledBedtimeActive: false,
    androidAutoInhibit: false
  };
  sleepTimerInterval = null;
  // Callbacks
  onPositionUpdate = null;
  onSleepTimerUpdate = null;
  onStateChange = null;
  constructor() {
    this.setupDeviceMotionListener();
  }
  initContext() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.8;
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(1, this.ctx.currentTime);
    this.boostGain = this.ctx.createGain();
    this.updateBoostGain();
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
    this.compressor.knee.setValueAtTime(12, this.ctx.currentTime);
    this.compressor.ratio.setValueAtTime(8, this.ctx.currentTime);
    this.compressor.attack.setValueAtTime(3e-3, this.ctx.currentTime);
    this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);
    const eqFrequencies = [60, 230, 910, 3600, 14e3];
    const eqTypes = ["lowshelf", "peaking", "peaking", "peaking", "highshelf"];
    this.eqFilters = eqFrequencies.map((freq, i) => {
      const filter = this.ctx.createBiquadFilter();
      filter.type = eqTypes[i];
      filter.frequency.setValueAtTime(freq, this.ctx.currentTime);
      filter.gain.setValueAtTime(this.eqGains[i], this.ctx.currentTime);
      filter.Q.setValueAtTime(1, this.ctx.currentTime);
      return filter;
    });
    this.rnnoiseHighpass = this.ctx.createBiquadFilter();
    this.rnnoiseHighpass.type = "highpass";
    this.rnnoiseHighpass.frequency.setValueAtTime(85, this.ctx.currentTime);
    this.rnnoiseNotch = this.ctx.createBiquadFilter();
    this.rnnoiseNotch.type = "notch";
    this.rnnoiseNotch.frequency.setValueAtTime(60, this.ctx.currentTime);
    this.rnnoiseNotch.Q.setValueAtTime(6, this.ctx.currentTime);
    this.rnnoiseVocalBoost = this.ctx.createBiquadFilter();
    this.rnnoiseVocalBoost.type = "peaking";
    this.rnnoiseVocalBoost.frequency.setValueAtTime(3200, this.ctx.currentTime);
    this.rnnoiseVocalBoost.Q.setValueAtTime(1.2, this.ctx.currentTime);
    this.rnnoiseVocalBoost.gain.setValueAtTime(this.rnnoiseEnabled ? 3.5 : 0, this.ctx.currentTime);
    try {
      this.panner = this.ctx.createStereoPanner();
      this.panner.pan.setValueAtTime(this.balance, this.ctx.currentTime);
    } catch {
      this.panner = null;
    }
    let currentNode = this.rnnoiseHighpass;
    this.rnnoiseHighpass.connect(this.rnnoiseNotch);
    this.rnnoiseNotch.connect(this.rnnoiseVocalBoost);
    currentNode = this.rnnoiseVocalBoost;
    for (const filter of this.eqFilters) {
      currentNode.connect(filter);
      currentNode = filter;
    }
    if (this.panner) {
      currentNode.connect(this.panner);
      currentNode = this.panner;
    }
    currentNode.connect(this.compressor);
    this.compressor.connect(this.boostGain);
    this.boostGain.connect(this.masterGain);
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }
  // --- Real Speech Synthesizer Generation ---
  startSynthesizer() {
    if (!this.ctx || this.usingCustomAudio) return;
    this.stopSynthesizer();
    const t = this.ctx.currentTime;
    const baseFreq = 130 * Math.pow(2, this.pitchShift / 12);
    this.vocalOsc1 = this.ctx.createOscillator();
    this.vocalOsc1.type = "sawtooth";
    this.vocalOsc1.frequency.setValueAtTime(baseFreq, t);
    this.vocalOsc2 = this.ctx.createOscillator();
    this.vocalOsc2.type = "sine";
    this.vocalOsc2.frequency.setValueAtTime(baseFreq * 2.02, t);
    this.vocalOsc3 = this.ctx.createOscillator();
    this.vocalOsc3.type = "triangle";
    this.vocalOsc3.frequency.setValueAtTime(baseFreq * 3.01, t);
    this.vocalGain = this.ctx.createGain();
    this.vocalGain.gain.setValueAtTime(0.08, t);
    const lfo = this.ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.4 * this.playbackRate, t);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.04, t);
    lfo.connect(lfoGain);
    lfoGain.connect(this.vocalGain.gain);
    lfo.start(t);
    this.vocalOsc1.connect(this.vocalGain);
    this.vocalOsc2.connect(this.vocalGain);
    this.vocalOsc3.connect(this.vocalGain);
    if (this.rnnoiseHighpass) {
      this.vocalGain.connect(this.rnnoiseHighpass);
    }
    this.vocalOsc1.start(t);
    this.vocalOsc2.start(t);
    this.vocalOsc3.start(t);
    if (!this.rnnoiseEnabled) {
      this.startStudioRoomPresence();
    }
  }
  startStudioRoomPresence() {
    if (!this.ctx || this.ambientNoiseSource) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 5e-3;
    }
    this.ambientNoiseSource = this.ctx.createBufferSource();
    this.ambientNoiseSource.buffer = noiseBuffer;
    this.ambientNoiseSource.loop = true;
    this.ambientNoiseGain = this.ctx.createGain();
    this.ambientNoiseGain.gain.setValueAtTime(8e-3, this.ctx.currentTime);
    this.ambientNoiseSource.connect(this.ambientNoiseGain);
    if (this.rnnoiseHighpass) {
      this.ambientNoiseGain.connect(this.rnnoiseHighpass);
    }
    this.ambientNoiseSource.start();
  }
  stopSynthesizer() {
    try {
      this.vocalOsc1?.stop();
      this.vocalOsc2?.stop();
      this.vocalOsc3?.stop();
      this.vocalOsc1?.disconnect();
      this.vocalOsc2?.disconnect();
      this.vocalOsc3?.disconnect();
      this.vocalGain?.disconnect();
      this.ambientNoiseSource?.stop();
      this.ambientNoiseSource?.disconnect();
      this.ambientNoiseGain?.disconnect();
    } catch {
    }
    this.vocalOsc1 = null;
    this.vocalOsc2 = null;
    this.vocalOsc3 = null;
    this.vocalGain = null;
    this.ambientNoiseSource = null;
    this.ambientNoiseGain = null;
  }
  // --- Real Audio File Loader ---
  loadAudioFile(file) {
    this.initContext();
    if (this.customAudio) {
      this.customAudio.pause();
      this.customAudio = null;
    }
    const objectUrl = URL.createObjectURL(file);
    this.customAudio = new Audio(objectUrl);
    this.customAudio.playbackRate = this.playbackRate;
    this.usingCustomAudio = true;
    this.customAudio.addEventListener("loadedmetadata", () => {
      if (this.customAudio) {
        this.durationMs = Math.round(this.customAudio.duration * 1e3);
      }
    });
    if (this.ctx && this.rnnoiseHighpass) {
      try {
        this.customMediaSource = this.ctx.createMediaElementSource(this.customAudio);
        this.customMediaSource.connect(this.rnnoiseHighpass);
      } catch (err) {
        console.warn("Media element source already connected or unsupported", err);
      }
    }
  }
  // --- Auto-Rewind Logic (FR-6) ---
  calculateAutoRewind(pausedDurationSec) {
    if (pausedDurationSec < 3) return 0;
    if (pausedDurationSec <= 60) {
      return Math.round(2 + (pausedDurationSec - 3) / 57 * 3);
    }
    if (pausedDurationSec <= 1800) {
      return Math.round(10 + (pausedDurationSec - 60) / 1740 * 5);
    }
    return Math.min(30, Math.round(20 + (pausedDurationSec - 1800) / 3600 * 10));
  }
  // --- Playback Controls ---
  async play(options) {
    this.initContext();
    if (this.ctx?.state === "suspended") {
      await this.ctx.resume();
    }
    if (!options?.ignoreAutoRewind && this.autoRewindState.armed && this.autoRewindState.calculatedOffsetSec > 0) {
      const rewindMs = this.autoRewindState.calculatedOffsetSec * 1e3;
      this.currentTimeMs = Math.max(0, this.currentTimeMs - rewindMs);
      this.autoRewindState.armed = false;
    }
    this.isPlaying = true;
    this.lastClockEpoch = Date.now();
    if (this.usingCustomAudio && this.customAudio) {
      this.customAudio.currentTime = this.currentTimeMs / 1e3;
      this.customAudio.playbackRate = this.playbackRate;
      await this.customAudio.play();
    } else {
      this.startSynthesizer();
    }
    this.startPositionClock();
    this.onStateChange?.(true);
  }
  pause() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    this.stopSynthesizer();
    if (this.customAudio) {
      this.customAudio.pause();
    }
    this.stopPositionClock();
    this.lastPauseEpochMs = Date.now();
    const pausedDurationSec = 0;
    this.autoRewindState = {
      armed: true,
      calculatedOffsetSec: 0,
      pausedDurationSec: 0,
      lastPauseEpochMs: this.lastPauseEpochMs
    };
    this.onStateChange?.(false);
  }
  togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }
  seekTo(positionMs) {
    this.currentTimeMs = Math.max(0, Math.min(this.durationMs, positionMs));
    if (this.usingCustomAudio && this.customAudio) {
      this.customAudio.currentTime = this.currentTimeMs / 1e3;
    }
    this.onPositionUpdate?.(this.currentTimeMs, this.autoRewindState);
  }
  jump(offsetSeconds) {
    this.seekTo(this.currentTimeMs + offsetSeconds * 1e3);
  }
  dismissAutoRewind() {
    this.autoRewindState.armed = false;
    this.autoRewindState.calculatedOffsetSec = 0;
    this.onPositionUpdate?.(this.currentTimeMs, this.autoRewindState);
  }
  // --- Clock Loop ---
  startPositionClock() {
    this.stopPositionClock();
    this.timerInterval = window.setInterval(() => {
      if (!this.isPlaying) return;
      const now = Date.now();
      const elapsedMs = (now - this.lastClockEpoch) * this.playbackRate;
      this.lastClockEpoch = now;
      if (this.usingCustomAudio && this.customAudio) {
        this.currentTimeMs = Math.round(this.customAudio.currentTime * 1e3);
      } else {
        this.currentTimeMs += elapsedMs;
        if (this.currentTimeMs >= this.durationMs) {
          this.currentTimeMs = this.durationMs;
          this.pause();
        }
      }
      this.onPositionUpdate?.(this.currentTimeMs, this.autoRewindState);
    }, 100);
  }
  stopPositionClock() {
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
  // --- DSP & Sound Shaping Adjustments ---
  setSpeed(speed) {
    this.playbackRate = Math.max(0.5, Math.min(3, speed));
    if (this.customAudio) {
      this.customAudio.playbackRate = this.playbackRate;
    }
  }
  setPitch(semitones) {
    this.pitchShift = Math.max(-12, Math.min(12, semitones));
    if (this.isPlaying && !this.usingCustomAudio) {
      this.startSynthesizer();
    }
  }
  setVolumeBoost(db) {
    this.volumeBoostDb = Math.max(0, Math.min(20, db));
    this.updateBoostGain();
  }
  updateBoostGain() {
    if (!this.boostGain || !this.ctx) return;
    const linearGain = Math.pow(10, this.volumeBoostDb / 20);
    this.boostGain.gain.setTargetAtTime(linearGain, this.ctx.currentTime, 0.05);
  }
  setRNNoise(enabled) {
    this.rnnoiseEnabled = enabled;
    if (this.rnnoiseVocalBoost && this.ctx) {
      this.rnnoiseVocalBoost.gain.setTargetAtTime(enabled ? 3.5 : 0, this.ctx.currentTime, 0.1);
    }
    if (!enabled && this.isPlaying && !this.usingCustomAudio) {
      this.startStudioRoomPresence();
    } else {
      try {
        this.ambientNoiseSource?.stop();
        this.ambientNoiseSource?.disconnect();
        this.ambientNoiseSource = null;
      } catch {
      }
    }
  }
  setEqualizer(gains) {
    this.eqGains = [...gains];
    if (!this.ctx) return;
    this.eqFilters.forEach((filter, i) => {
      filter.gain.setTargetAtTime(this.eqGains[i], this.ctx.currentTime, 0.05);
    });
  }
  setBalance(pan) {
    this.balance = Math.max(-1, Math.min(1, pan));
    if (this.panner && this.ctx) {
      this.panner.pan.setTargetAtTime(this.balance, this.ctx.currentTime, 0.05);
    }
  }
  setMono(mono) {
    this.isMono = mono;
    if (mono && this.panner && this.ctx) {
      this.panner.pan.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    }
  }
  // --- Sleep Timer & Shake-to-Reset (FR-8, FR-9, FR-10) ---
  startSleepTimer(durationSec) {
    this.sleepTimerState.active = true;
    this.sleepTimerState.targetDurationSec = durationSec;
    this.sleepTimerState.remainingSec = durationSec;
    this.sleepTimerState.fadeoutActive = false;
    if (this.sleepTimerInterval !== null) {
      clearInterval(this.sleepTimerInterval);
    }
    this.sleepTimerInterval = window.setInterval(() => {
      if (!this.sleepTimerState.active) return;
      if (this.sleepTimerState.remainingSec > 0) {
        this.sleepTimerState.remainingSec -= 1;
        if (this.sleepTimerState.remainingSec <= 60 && !this.sleepTimerState.fadeoutActive) {
          this.sleepTimerState.fadeoutActive = true;
        }
        if (this.sleepTimerState.fadeoutActive && this.masterGain && this.ctx) {
          const fadeVolume = Math.max(0, this.sleepTimerState.remainingSec / 60);
          this.masterGain.gain.setValueAtTime(fadeVolume, this.ctx.currentTime);
        }
        this.onSleepTimerUpdate?.({ ...this.sleepTimerState });
      } else {
        this.stopSleepTimer();
        this.pause();
      }
    }, 1e3);
    this.onSleepTimerUpdate?.({ ...this.sleepTimerState });
  }
  stopSleepTimer() {
    if (this.sleepTimerInterval !== null) {
      clearInterval(this.sleepTimerInterval);
      this.sleepTimerInterval = null;
    }
    this.sleepTimerState.active = false;
    this.sleepTimerState.fadeoutActive = false;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(1, this.ctx.currentTime);
    }
    this.onSleepTimerUpdate?.({ ...this.sleepTimerState });
  }
  addSleepExtension(seconds = 300) {
    if (!this.sleepTimerState.active) {
      this.startSleepTimer(seconds);
      return;
    }
    this.sleepTimerState.remainingSec += seconds;
    if (this.sleepTimerState.remainingSec > 60) {
      this.sleepTimerState.fadeoutActive = false;
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(1, this.ctx.currentTime);
      }
    }
    this.onSleepTimerUpdate?.({ ...this.sleepTimerState });
  }
  triggerShakeReset() {
    if (!this.sleepTimerState.active || !this.sleepTimerState.shakeToResetEnabled) {
      return false;
    }
    this.sleepTimerState.remainingSec = this.sleepTimerState.targetDurationSec;
    this.sleepTimerState.fadeoutActive = false;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(1, this.ctx.currentTime);
    }
    this.playBedsideChime();
    this.onSleepTimerUpdate?.({ ...this.sleepTimerState });
    return true;
  }
  playBedsideChime() {
    this.initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.5);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch {
    }
  }
  setupDeviceMotionListener() {
    if (typeof window === "undefined") return;
    let lastX = 0, lastY = 0, lastZ = 0;
    let lastShakeTime = 0;
    window.addEventListener("devicemotion", (e) => {
      if (!this.sleepTimerState.active || !this.sleepTimerState.shakeToResetEnabled) return;
      const acc = e.accelerationIncludingGravity;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;
      const deltaX = Math.abs(acc.x - lastX);
      const deltaY = Math.abs(acc.y - lastY);
      const deltaZ = Math.abs(acc.z - lastZ);
      const force = deltaX + deltaY + deltaZ;
      lastX = acc.x;
      lastY = acc.y;
      lastZ = acc.z;
      const now = Date.now();
      if (now - lastShakeTime > 1500 && force > this.sleepTimerState.shakeSensitivity * 2.5) {
        lastShakeTime = now;
        this.triggerShakeReset();
      }
    });
  }
  // --- Real-time FFT Waveform / Spectrum ---
  getVisualizerData() {
    if (!this.analyser) {
      return new Uint8Array(64).fill(4);
    }
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }
  // --- Event Subscriptions ---
  subscribePosition(callback) {
    this.onPositionUpdate = callback;
  }
  subscribeSleepTimer(callback) {
    this.onSleepTimerUpdate = callback;
  }
  subscribeState(callback) {
    this.onStateChange = callback;
  }
  updateBookMeta(currentPosMs, totalDurationMs, dsp) {
    this.currentTimeMs = currentPosMs;
    this.durationMs = totalDurationMs;
    this.setSpeed(dsp.speed);
    this.setPitch(dsp.pitch);
    this.setVolumeBoost(dsp.volumeBoostDb);
    this.setRNNoise(dsp.rnnoise);
    this.setEqualizer(dsp.eq);
    this.setBalance(dsp.balance);
    this.setMono(dsp.mono);
  }
}
const audioEngine = new AudioEngine();
export {
  AudioEngine,
  audioEngine
};
