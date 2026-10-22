/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FolderPlay Audio DSP & Sound Shaping Studio
 * Dual-Engine BASS/WebAudio: Speed, Pitch, RNNoise, Volume Boost, 5-Band EQ, Mono Downmix
 */
import { useState } from "react";
import { audioEngine } from "../services/audioEngine";
import {
  Sliders,
  Sparkles,
  Waves,
  RotateCcw,
  Headphones,
  ShieldAlert,
  ArrowRight
} from "lucide-react";
const AudioDspStudio = ({
  book,
  onUpdateBookDsp,
  onBackToPlayer
}) => {
  const [speed, setSpeed] = useState(book.playbackSpeed);
  const [pitch, setPitch] = useState(book.pitchShift);
  const [boostDb, setBoostDb] = useState(book.volumeBoostDb);
  const [rnnoise, setRnnoise] = useState(book.rnnoiseEnabled);
  const [eq, setEq] = useState(book.eqLevels);
  const [balance, setBalance] = useState(book.balance);
  const [mono, setMono] = useState(book.monoDownmix);
  const [skipSilence, setSkipSilence] = useState(book.skipSilence);
  const speedPresets = [0.75, 1, 1.15, 1.25, 1.5, 1.75, 2, 2.5];
  const applyChanges = (updates) => {
    const newSettings = {
      speed: updates.speed ?? speed,
      pitch: updates.pitch ?? pitch,
      volumeBoostDb: updates.volumeBoostDb ?? boostDb,
      rnnoise: updates.rnnoise ?? rnnoise,
      mono: updates.mono ?? mono,
      balance: updates.balance ?? balance,
      eq: updates.eq ?? eq,
      skipSilence: updates.skipSilence ?? skipSilence
    };
    if (updates.speed !== void 0) audioEngine.setSpeed(newSettings.speed);
    if (updates.pitch !== void 0) audioEngine.setPitch(newSettings.pitch);
    if (updates.volumeBoostDb !== void 0) audioEngine.setVolumeBoost(newSettings.volumeBoostDb);
    if (updates.rnnoise !== void 0) audioEngine.setRNNoise(newSettings.rnnoise);
    if (updates.eq !== void 0) audioEngine.setEqualizer(newSettings.eq);
    if (updates.balance !== void 0) audioEngine.setBalance(newSettings.balance);
    if (updates.mono !== void 0) audioEngine.setMono(newSettings.mono);
    onUpdateBookDsp(newSettings);
  };
  const resetToFlat = () => {
    const flatEq = [0, 0, 0, 0, 0];
    setSpeed(1);
    setPitch(0);
    setBoostDb(0);
    setRnnoise(true);
    setEq(flatEq);
    setBalance(0);
    setMono(false);
    setSkipSilence(false);
    applyChanges({
      speed: 1,
      pitch: 0,
      volumeBoostDb: 0,
      rnnoise: true,
      eq: flatEq,
      balance: 0,
      mono: false,
      skipSilence: false
    });
  };
  return <div className="w-full flex flex-col gap-6 max-w-5xl mx-auto">
      {
    /* Studio Header */
  }
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[var(--primary-container)]" />
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-[var(--primary)]">
              Sound Shaping Studio & DSP
            </h1>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Real-time vocal calibration, neural speech enhancement, and parametric frequency shaping.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
    onClick={resetToFlat}
    className="hardware-plate flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-high)] transition-colors"
  >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Flat</span>
          </button>
          <button
    onClick={onBackToPlayer}
    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-[var(--primary-container)] text-[var(--bg-base)] shadow-md hover:brightness-105 transition-all"
  >
            <span>Return to Player</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {
    /* PANEL 1: Speed & Pitch Controls */
  }
        <div className="bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-lg flex flex-col gap-5 hardware-plate">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--primary-container)]">
              Playback Speed & Tempo
            </span>
            <span className="font-mono text-base font-bold text-[var(--primary)]">
              {speed.toFixed(2)}x
            </span>
          </div>

          {
    /* Speed Slider */
  }
          <div className="flex flex-col gap-2">
            <input
    type="range"
    min="0.5"
    max="3.0"
    step="0.05"
    value={speed}
    onChange={(e) => {
      const val = Number(e.target.value);
      setSpeed(val);
      applyChanges({ speed: val });
    }}
    className="w-full accent-[var(--primary-container)] cursor-pointer"
  />
            <div className="flex justify-between text-[11px] font-mono text-[var(--text-muted)]">
              <span>0.50x (Slow)</span>
              <span>1.00x (Normal)</span>
              <span>2.00x</span>
              <span>3.00x (Hyper)</span>
            </div>
          </div>

          {
    /* Speed Preset Chips */
  }
          <div className="flex flex-wrap gap-2 pt-1">
            {speedPresets.map((sp) => <button
    key={sp}
    onClick={() => {
      setSpeed(sp);
      applyChanges({ speed: sp });
    }}
    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors border ${Math.abs(speed - sp) < 0.01 ? "bg-[var(--primary-container)] text-[var(--bg-base)] border-[var(--primary-container)] shadow-sm" : "bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-high)]"}`}
  >
                {sp.toFixed(2)}x
              </button>)}
          </div>

          {
    /* Independent Pitch Shift */
  }
          <div className="flex flex-col gap-2 pt-4 border-t border-[var(--border-subtle)]">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono uppercase font-bold text-[var(--text-muted)]">
                Independent Pitch Shift
              </span>
              <span className="font-mono text-xs font-bold text-[var(--tertiary)]">
                {pitch > 0 ? `+${pitch}` : pitch} Semitones
              </span>
            </div>
            <input
    type="range"
    min="-12"
    max="12"
    step="1"
    value={pitch}
    onChange={(e) => {
      const val = Number(e.target.value);
      setPitch(val);
      applyChanges({ pitch: val });
    }}
    className="w-full accent-[var(--tertiary)] cursor-pointer"
  />
            <p className="text-[11px] text-[var(--text-muted)]">
              Shifts voice fundamental formant pitch up or down without modifying playback duration or cadence.
            </p>
          </div>
        </div>

        {
    /* PANEL 2: Neural RNNoise & Loudness Booster */
  }
        <div className="bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-lg flex flex-col gap-5 hardware-plate">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--secondary)]">
              Speech Enhancement & Booster
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${rnnoise ? "bg-[var(--secondary)]/20 text-[var(--secondary)]" : "bg-gray-800 text-gray-400"}`}>
              {rnnoise ? "NEURAL FILTER ON" : "RAW AUDIO"}
            </span>
          </div>

          {
    /* RNNoise Toggle Card */
  }
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${rnnoise ? "bg-[var(--secondary)]/20 text-[var(--secondary)]" : "bg-gray-800 text-gray-500"}`}>
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[var(--primary)] block">
                  RNNoise Recurrent Speech Denoiser
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Suppresses tape hiss, microphone hum, and room acoustics in real time
                </span>
              </div>
            </div>
            <button
    onClick={() => {
      const n = !rnnoise;
      setRnnoise(n);
      applyChanges({ rnnoise: n });
    }}
    className={`w-12 h-6 rounded-full p-1 transition-colors relative ${rnnoise ? "bg-[var(--secondary)]" : "bg-[var(--border-subtle)]"}`}
  >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${rnnoise ? "translate-x-6" : "translate-x-0"}`} />
            </button>
          </div>

          {
    /* Loudness Booster (+0 to +20 dB) */
  }
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[var(--text-muted)] uppercase font-bold">
                Hardware Loudness Booster:
              </span>
              <span className={`font-bold ${boostDb > 12 ? "text-amber-400" : "text-[var(--secondary)]"}`}>
                +{boostDb} dB
              </span>
            </div>
            <input
    type="range"
    min="0"
    max="20"
    step="1"
    value={boostDb}
    onChange={(e) => {
      const val = Number(e.target.value);
      setBoostDb(val);
      applyChanges({ volumeBoostDb: val });
    }}
    className="w-full accent-[var(--secondary)] cursor-pointer"
  />
            <div className="flex justify-between text-[11px] font-mono text-[var(--text-muted)]">
              <span>0 dB (Unity)</span>
              <span>+6 dB</span>
              <span>+12 dB (Quiet Audio)</span>
              <span>+20 dB (Max)</span>
            </div>

            {boostDb > 12 && <div className="flex items-center gap-2 p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>Dynamics compressor engaged to prevent clipping distortion over +12dB.</span>
              </div>}
          </div>
        </div>

        {
    /* PANEL 3: 5-Band Parametric Equalizer */
  }
        <div className="lg:col-span-2 bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-lg flex flex-col gap-5 hardware-plate-raised">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
            <div className="flex items-center gap-2">
              <Waves className="w-4 h-4 text-[var(--primary-container)]" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--primary-container)]">
                5-Band Parametric Equalizer
              </span>
            </div>
            <span className="text-[11px] text-[var(--text-muted)] font-mono">
              BASS_FX 64-bit Floating Point Architecture
            </span>
          </div>

          {
    /* 5-Band Sliders Grid */
  }
          <div className="grid grid-cols-5 gap-3 pt-2">
            {[
    { label: "60 Hz", sub: "Low Thump", index: 0 },
    { label: "230 Hz", sub: "Vocal Warmth", index: 1 },
    { label: "910 Hz", sub: "Body & Nasal", index: 2 },
    { label: "3.6 kHz", sub: "Clarity / Presence", index: 3 },
    { label: "14 kHz", sub: "Air / Sibilance", index: 4 }
  ].map(({ label, sub, index }) => <div key={label} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                <span className="font-mono text-xs font-bold text-[var(--primary-container)]">
                  {eq[index] > 0 ? `+${eq[index]}` : eq[index]} dB
                </span>

                <div className="h-32 flex items-center justify-center my-1">
                  <input
    type="range"
    min="-12"
    max="12"
    step="1"
    value={eq[index]}
    onChange={(e) => {
      const newEq = [...eq];
      newEq[index] = Number(e.target.value);
      setEq(newEq);
      applyChanges({ eq: newEq });
    }}
    className="h-28 -rotate-90 accent-[var(--primary-container)] cursor-pointer"
  />
                </div>

                <span className="font-mono text-xs font-bold text-[var(--text-high)]">
                  {label}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] text-center leading-tight">
                  {sub}
                </span>
              </div>)}
          </div>

          {
    /* Balance & Mono Downmix Strip */
  }
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[var(--border-subtle)]">
            {
    /* Channel Balance Slider */
  }
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[var(--text-muted)]">Stereo Pan (L - R):</span>
                <span className="text-[var(--primary)] font-bold">
                  {balance === 0 ? "Center" : balance < 0 ? `L ${Math.round(Math.abs(balance) * 100)}%` : `R ${Math.round(balance * 100)}%`}
                </span>
              </div>
              <input
    type="range"
    min="-1"
    max="1"
    step="0.05"
    value={balance}
    onChange={(e) => {
      const val = Number(e.target.value);
      setBalance(val);
      applyChanges({ balance: val });
    }}
    className="w-full accent-[var(--primary-container)] cursor-pointer"
  />
            </div>

            {
    /* Mono Downmix Toggle */
  }
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-[var(--secondary)]" />
                <div>
                  <span className="text-xs font-bold text-[var(--primary)] block">
                    Mono Channel Downmix
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    Ideal for single earbud listening
                  </span>
                </div>
              </div>
              <button
    onClick={() => {
      const m = !mono;
      setMono(m);
      applyChanges({ mono: m });
    }}
    className={`w-11 h-6 rounded-full p-1 transition-colors relative ${mono ? "bg-[var(--secondary)]" : "bg-[var(--border-subtle)]"}`}
  >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${mono ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export {
  AudioDspStudio
};
