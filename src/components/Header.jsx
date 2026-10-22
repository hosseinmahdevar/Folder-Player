/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FolderPlay Top Bar Header
 * Follows the 3-Zone Contract with telemetry and theme switching
 */
import {
  FolderLock,
  Moon,
  Car,
  Smartphone,
  Monitor,
  Code2
} from "lucide-react";
const Header = ({
  currentView,
  onSelectView,
  currentTheme,
  onSelectTheme,
  deviceMode,
  onToggleDeviceMode,
  sleepRemainingSec,
  sleepActive,
  rnnoiseActive
}) => {
  const formatSleep = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };
  return <header className="sticky top-0 z-50 flex items-center justify-between gap-8 px-5 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-lowest)]/95 backdrop-blur-md shadow-lg">
      {
    /* Zone 1: Brand Wordmark (Single text element with clean status badge) */
  }
      <div className="flex items-center gap-3 shrink-0">
        <button
    onClick={() => onSelectView("now-playing")}
    className="flex items-center gap-2.5 text-left group transition-transform active:scale-95"
  >
          <div className="w-8 h-8 rounded-lg bg-[var(--primary-container)]/15 border border-[var(--primary-container)]/30 flex items-center justify-center text-[var(--primary-container)]">
            <FolderLock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold text-[var(--primary)] tracking-tight">
                FolderPlay
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--bg-surface-high)] text-[var(--primary-container)] border border-[var(--border-subtle)]">
                DSP+
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] tracking-tight">
              Offline Zero-Cloud Audio Engine
            </p>
          </div>
        </button>
      </div>

      {
    /* Zone 2: Navigation Links (Single line, 1-2 words, clean hover states) */
  }
      <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium text-[var(--text-muted)] overflow-x-auto py-1">
        <button
    onClick={() => onSelectView("now-playing")}
    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${currentView === "now-playing" ? "bg-[var(--bg-surface-high)] text-[var(--primary-container)] shadow-sm" : "hover:text-[var(--text-high)] hover:bg-[var(--bg-surface-low)]"}`}
  >
          Now Playing
        </button>

        <button
    onClick={() => onSelectView("library")}
    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${currentView === "library" ? "bg-[var(--bg-surface-high)] text-[var(--primary-container)] shadow-sm" : "hover:text-[var(--text-high)] hover:bg-[var(--bg-surface-low)]"}`}
  >
          Library & Storage
        </button>

        <button
    onClick={() => onSelectView("dsp-studio")}
    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${currentView === "dsp-studio" ? "bg-[var(--bg-surface-high)] text-[var(--primary-container)] shadow-sm" : "hover:text-[var(--text-high)] hover:bg-[var(--bg-surface-low)]"}`}
  >
          Sound Shaping
        </button>

        <button
    onClick={() => onSelectView("characters-bookmarks")}
    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${currentView === "characters-bookmarks" ? "bg-[var(--bg-surface-high)] text-[var(--primary-container)] shadow-sm" : "hover:text-[var(--text-high)] hover:bg-[var(--bg-surface-low)]"}`}
  >
          Characters & Notes
        </button>

        <button
    onClick={() => onSelectView("sleep-timer")}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${currentView === "sleep-timer" ? "bg-[var(--bg-surface-high)] text-[var(--primary-container)] shadow-sm" : "hover:text-[var(--text-high)] hover:bg-[var(--bg-surface-low)]"}`}
  >
          <Moon className="w-3.5 h-3.5" />
          <span>Bedside Sleep</span>
          {sleepActive && <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-[var(--secondary)]/20 text-[var(--secondary)] font-bold">
              {formatSleep(sleepRemainingSec)}
            </span>}
        </button>

        <button
    onClick={() => onSelectView("sidecar-inspector")}
    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${currentView === "sidecar-inspector" ? "bg-[var(--bg-surface-high)] text-[var(--primary-container)] shadow-sm" : "hover:text-[var(--text-high)] hover:bg-[var(--bg-surface-low)]"}`}
  >
          Sidecar .SABP
        </button>

        <button
    onClick={() => onSelectView("flutter-hub")}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${currentView === "flutter-hub" ? "bg-[var(--bg-surface-high)] text-[var(--primary-container)] shadow-sm" : "hover:text-[var(--text-high)] hover:bg-[var(--bg-surface-low)]"}`}
  >
          <Code2 className="w-3.5 h-3.5 text-[var(--secondary)]" />
          <span>Flutter (Android & Desktop)</span>
        </button>
      </nav>

      {
    /* Zone 3: Hardware Indicators & Quick Actions */
  }
      <div className="flex items-center gap-3 shrink-0">
        {
    /* RNN Engine indicator */
  }
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--bg-surface-low)] border border-[var(--border-subtle)]">
          <span className={`w-1.5 h-1.5 rounded-full ${rnnoiseActive ? "bg-[var(--secondary)] animate-pulse" : "bg-[var(--text-muted)]"}`} />
          <span className="font-mono text-[10px] uppercase font-bold text-[var(--text-muted)]">
            {rnnoiseActive ? "RNN Active" : "RNN Off"}
          </span>
        </div>

        {
    /* Car Mode quick button */
  }
        <button
    onClick={() => onSelectView(currentView === "car-mode" ? "now-playing" : "car-mode")}
    className={`p-1.5 rounded-lg border transition-colors ${currentView === "car-mode" ? "bg-[var(--primary-container)] text-[var(--bg-base)] border-[var(--primary-container)]" : "bg-[var(--bg-surface-low)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-high)]"}`}
    title="Android Auto / Car Mode"
  >
          <Car className="w-4 h-4" />
        </button>

        {
    /* Device Mode Toggle (Desktop vs Mobile Frame) */
  }
        <button
    onClick={onToggleDeviceMode}
    className="p-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-low)] text-[var(--text-muted)] hover:text-[var(--text-high)] transition-colors"
    title={`Switch to ${deviceMode === "desktop" ? "Mobile Phone Preview" : "Desktop Studio"}`}
  >
          {deviceMode === "desktop" ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
        </button>

        {
    /* Theme Selector */
  }
        <div className="relative">
          <select
    value={currentTheme}
    onChange={(e) => onSelectTheme(e.target.value)}
    className="text-xs bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] text-[var(--text-high)] rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--primary-container)] cursor-pointer"
  >
            <option value="nocturne">OLED Nocturne</option>
            <option value="leatherbound">Leatherbound</option>
            <option value="nordic">Nordic Slate</option>
            <option value="solar">Solar High-Contrast</option>
          </select>
        </div>
      </div>
    </header>;
};
export {
  Header
};
