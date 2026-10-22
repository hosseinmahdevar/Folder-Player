/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FolderPlay Bedtime Sleep Timer with Touchless Shake-to-Reset
 * Reconstructed from Stitch audio_sleep_timer design and PRD requirements
 */
import { useState } from "react";
import { audioEngine } from "../services/audioEngine";
import {
  Moon,
  Sparkles,
  Plus,
  X,
  ShieldCheck,
  Smartphone
} from "lucide-react";
const AudioSleepTimerModal = ({
  sleepState,
  onClose,
  onStateUpdate
}) => {
  const [sensitivity, setSensitivity] = useState(sleepState.shakeSensitivity);
  const [shakeMessage, setShakeMessage] = useState(null);
  const presets = [
    { label: "5m", sec: 300 },
    { label: "10m", sec: 600 },
    { label: "15m", sec: 900 },
    { label: "30m", sec: 1800 },
    { label: "45m", sec: 2700 },
    { label: "60m", sec: 3600 },
    { label: "End of Chapter", sec: 1440 },
    { label: "End of File", sec: 3940 }
  ];
  const handleStartPreset = (sec) => {
    audioEngine.startSleepTimer(sec);
    onStateUpdate({
      ...sleepState,
      active: true,
      targetDurationSec: sec,
      remainingSec: sec
    });
  };
  const handleAddFiveMinutes = () => {
    audioEngine.addSleepExtension(300);
  };
  const handleCancelTimer = () => {
    audioEngine.stopSleepTimer();
    onStateUpdate({
      ...sleepState,
      active: false,
      remainingSec: 0
    });
  };
  const handleSimulateShake = () => {
    const success = audioEngine.triggerShakeReset();
    if (success) {
      setShakeMessage("Bedside Shake Detected! Restored to 30:00 with gentle chime.");
      setTimeout(() => setShakeMessage(null), 3e3);
    } else {
      setShakeMessage("Timer not active or shake-to-reset disabled.");
      setTimeout(() => setShakeMessage(null), 2e3);
    }
  };
  const formatCountdown = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = sleepState.targetDurationSec > 0 ? Math.max(0, sleepState.remainingSec / sleepState.targetDurationSec) : 0;
  const strokeDashoffset = circumference * (1 - progressRatio);
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-2xl flex flex-col gap-6 hardware-plate-raised max-h-[90vh] overflow-y-auto">
        {
    /* Modal Top Bar */
  }
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary-container)]/15 border border-[var(--primary-container)]/30 flex items-center justify-center text-[var(--primary-container)]">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[var(--primary)]">
                Bedtime Sleep Management
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Gentle Audio Fadeout & Touchless Accelerometer Reset
              </p>
            </div>
          </div>
          <button
    onClick={onClose}
    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-high)] hover:bg-[var(--bg-surface)] transition-colors"
  >
            <X className="w-5 h-5" />
          </button>
        </div>

        {
    /* Shake feedback alert banner */
  }
        {shakeMessage && <div className="p-3 rounded-lg bg-[var(--secondary)]/15 border border-[var(--secondary)] text-[var(--secondary)] text-xs font-medium flex items-center gap-2 animate-bounce">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{shakeMessage}</span>
          </div>}

        {
    /* Circular Dial Mechanical Display */
  }
        <div className="flex flex-col items-center justify-center py-2 relative">
          <div className="relative w-52 h-52 flex items-center justify-center">
            {
    /* SVG Radial Track */
  }
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
    className="text-[var(--bg-surface-high)]"
    cx="50"
    cy="50"
    fill="transparent"
    r={radius}
    stroke="currentColor"
    strokeWidth="5"
  />
              <circle
    className="text-[var(--primary-container)] transition-all duration-700"
    cx="50"
    cy="50"
    fill="transparent"
    r={radius}
    stroke="currentColor"
    strokeWidth="5"
    strokeDasharray={circumference}
    strokeDashoffset={strokeDashoffset}
    strokeLinecap="round"
  />
            </svg>

            {
    /* Mechanical Core Hub */
  }
            <div className="absolute inset-4 rounded-full bg-[var(--bg-surface-lowest)] border border-[var(--border-subtle)] flex flex-col items-center justify-center shadow-inner text-center p-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-bold">
                Time Remaining
              </span>
              <span className="font-mono text-4xl font-bold text-[var(--primary)] tracking-tight my-0.5">
                {sleepState.active ? formatCountdown(sleepState.remainingSec) : "--:--"}
              </span>
              <div className="flex items-center gap-1.5 mt-1 text-[var(--secondary)]">
                <span className={`w-1.5 h-1.5 rounded-full ${sleepState.fadeoutActive ? "bg-amber-400 animate-ping" : "bg-[var(--secondary)]"}`} />
                <span className="text-[10px] font-mono tracking-wide font-bold">
                  {sleepState.fadeoutActive ? "FADEOUT ACTIVE" : sleepState.active ? "SESSION ENGAGED" : "DISENGAGED"}
                </span>
              </div>
            </div>
          </div>

          {
    /* Micro-Actions */
  }
          <div className="flex items-center gap-3 mt-4">
            <button
    onClick={handleAddFiveMinutes}
    className="hardware-plate flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-high)] hover:text-[var(--primary-container)] tactile-btn"
  >
              <Plus className="w-3.5 h-3.5" />
              <span>+5m Extension</span>
            </button>
            <button
    onClick={handleCancelTimer}
    className="hardware-plate flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-muted)] hover:text-red-400 tactile-btn"
  >
              <X className="w-3.5 h-3.5" />
              <span>Cancel Timer</span>
            </button>
          </div>
        </div>

        {
    /* Preset Chips */
  }
        <div className="flex flex-col gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-bold">
            Session Duration Presets
          </span>
          <div className="grid grid-cols-4 gap-2">
            {presets.map((p) => {
    const isSelected = sleepState.active && sleepState.targetDurationSec === p.sec;
    return <button
      key={p.label}
      onClick={() => handleStartPreset(p.sec)}
      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors border ${isSelected ? "bg-[var(--primary-container)] text-[var(--bg-base)] border-[var(--primary-container)] shadow-md" : "bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-high)] hover:bg-[var(--bg-surface-high)]"}`}
    >
                  {p.label}
                </button>;
  })}
          </div>
        </div>

        {
    /* Touchless Shake-to-Reset Hardware Sub-Panel */
  }
        <div className="bg-[var(--bg-surface-lowest)] border border-[var(--border-subtle)] rounded-xl p-4 flex flex-col gap-3 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface-high)] flex items-center justify-center text-[var(--primary-container)]">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[var(--primary)] block">
                  Touchless Shake-to-Reset
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Reset countdown with gentle bedside motion (no screen touch required)
                </span>
              </div>
            </div>

            {
    /* Test motion button */
  }
            <button
    onClick={handleSimulateShake}
    className="hardware-plate px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--primary-container)] hover:bg-[var(--primary-container)] hover:text-[var(--bg-base)] transition-colors shrink-0"
    title="Test the accelerometer shake gesture directly"
  >
              Simulate Shake
            </button>
          </div>

          {
    /* Shake Sensitivity Slider */
  }
          <div className="flex flex-col gap-1.5 pt-2 border-t border-[var(--border-subtle)]">
            <div className="flex justify-between text-xs font-mono text-[var(--text-muted)]">
              <span>Sensor Sensitivity (Threshold):</span>
              <span className="text-[var(--primary-container)] font-bold">
                Level {sensitivity} ({sensitivity <= 3 ? "Ultra-Sensitive" : sensitivity <= 6 ? "Balanced" : "Firm Shake"})
              </span>
            </div>
            <input
    type="range"
    min="1"
    max="18"
    step="1"
    value={sensitivity}
    onChange={(e) => {
      const val = Number(e.target.value);
      setSensitivity(val);
      sleepState.shakeSensitivity = val;
    }}
    className="w-full accent-[var(--primary-container)] cursor-pointer"
  />
          </div>

          <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--secondary)] shrink-0" />
            <span>
              Listens via device accelerometer vector differential |A<sub>t</sub> - A<sub>t-1</sub>|.
              Suppressed during active UI typing to avoid false triggers.
            </span>
          </div>
        </div>

        {
    /* Done / Close Button */
  }
        <button
    onClick={onClose}
    className="w-full py-2.5 rounded-xl bg-[var(--primary-container)] text-[var(--bg-base)] font-bold text-sm shadow-lg hover:brightness-105 active:scale-98 transition-all"
  >
          Confirm & Return to Listening
        </button>
      </div>
    </div>;
};
export {
  AudioSleepTimerModal
};
