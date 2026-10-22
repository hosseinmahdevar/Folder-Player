/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FolderPlay Opus Batch Transcoder (FR-21 & UJ-4)
 * Background voice-optimized MP3 to Opus conversion with battery protection
 */
import { useState } from "react";
import {
  Battery,
  CheckCircle2,
  X,
  HardDrive,
  Zap,
  Play,
  Pause
} from "lucide-react";
const OpusTranscoderModal = ({
  book,
  onClose
}) => {
  const [isTranscoding, setIsTranscoding] = useState(false);
  const [batteryThreshold, setBatteryThreshold] = useState(80);
  const [embedCover, setEmbedCover] = useState(true);
  const [savedSpaceGb, setSavedSpaceGb] = useState(18.4);
  const [progressPercent, setProgressPercent] = useState(42);
  const [activeFile, setActiveFile] = useState("018_The_Way_of_Kings_Ch24.mp3");
  const handleToggleTranscode = () => {
    setIsTranscoding(!isTranscoding);
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-2xl flex flex-col gap-5 hardware-plate-raised">
        {
    /* Header */
  }
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--primary-container)]/15 border border-[var(--primary-container)]/30 flex items-center justify-center text-[var(--primary-container)]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[var(--primary)]">
                Opus Speech Transcoder (libbassenc_opus)
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Converts space-consuming MP3s into 32 kbps voice-optimized Opus containers
              </p>
            </div>
          </div>
          <button
    onClick={onClose}
    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-white transition-colors"
  >
            <X className="w-5 h-5" />
          </button>
        </div>

        {
    /* Space Saved Counter Hero Badge */
  }
        <div className="bg-[var(--bg-surface-lowest)] border border-[var(--border-subtle)] rounded-xl p-4 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--secondary)]/15 flex items-center justify-center text-[var(--secondary)]">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono text-[var(--text-muted)] uppercase font-bold block">
                Cumulative Device Space Reclaimed
              </span>
              <span className="font-mono text-2xl font-bold text-[var(--secondary)]">
                +{savedSpaceGb.toFixed(1)} GB Saved
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[var(--secondary)]/20 text-[var(--secondary)]">
            ~65% REDUCTION
          </span>
        </div>

        {
    /* Progress & Current Conversion Status */
  }
        <div className="flex flex-col gap-2 bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-subtle)]">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-[var(--text-muted)]">Active Task:</span>
            <span className="text-[var(--primary-container)] font-bold">{activeFile}</span>
          </div>

          <div className="w-full h-2.5 bg-[var(--bg-surface-lowest)] rounded-full overflow-hidden border border-[var(--border-subtle)] my-1">
            <div
    className="h-full bg-[var(--primary-container)] transition-all duration-300"
    style={{ width: `${progressPercent}%` }}
  />
          </div>

          <div className="flex justify-between text-[11px] font-mono text-[var(--text-muted)]">
            <span>Progress: {progressPercent}% (18 of 45 files)</span>
            <span>Est. Remaining: 8m 42s</span>
          </div>
        </div>

        {
    /* Safeguard Settings */
  }
        <div className="flex flex-col gap-3">
          {
    /* Battery Protection Threshold */
  }
          <div className="flex items-center justify-between text-xs p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <Battery className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-bold text-[var(--primary)] block">Battery Thermal Safeguard</span>
                <span className="text-[10px] text-[var(--text-muted)]">Pauses encoding when battery level drops below threshold</span>
              </div>
            </div>
            <span className="font-mono font-bold text-[var(--primary-container)]">{batteryThreshold}%</span>
          </div>

          {
    /* Embed Cover Art */
  }
          <div className="flex items-center justify-between text-xs p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[var(--secondary)]" />
              <div>
                <span className="font-bold text-[var(--primary)] block">Preserve ID3 Tags & Cover Art</span>
                <span className="text-[10px] text-[var(--text-muted)]">Transfers embedded artwork into new Opus metadata packet</span>
              </div>
            </div>
            <button
    onClick={() => setEmbedCover(!embedCover)}
    className={`w-10 h-5 rounded-full p-0.5 transition-colors ${embedCover ? "bg-[var(--secondary)]" : "bg-gray-700"}`}
  >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${embedCover ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>
        </div>

        {
    /* Actions */
  }
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--border-subtle)]">
          <button
    onClick={onClose}
    className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--bg-surface)]"
  >
            Close
          </button>
          <button
    onClick={handleToggleTranscode}
    className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold shadow-lg transition-transform active:scale-95 ${isTranscoding ? "bg-amber-500 text-black" : "bg-[var(--primary-container)] text-[var(--bg-base)]"}`}
  >
            {isTranscoding ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isTranscoding ? "Pause Background Service" : "Start Background Conversion"}</span>
          </button>
        </div>
      </div>
    </div>;
};
export {
  OpusTranscoderModal
};
