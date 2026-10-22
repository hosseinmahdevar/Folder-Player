/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FolderPlay Now Playing Studio Workstation
 * Reconstructed from Stitch desktop_now_playing_studio and now_playing designs
 */
import { useEffect, useRef, useState } from "react";
import { audioEngine } from "../services/audioEngine";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  FastForward,
  Volume2,
  Sliders,
  Bookmark,
  Users,
  Moon,
  Activity,
  CheckCircle2,
  Radio,
  X
} from "lucide-react";
const NowPlayingStudio = ({
  book,
  isPlaying,
  currentPositionMs,
  autoRewindState,
  sleepTimerState,
  onTogglePlayPause,
  onSeek,
  onJump,
  onDismissAutoRewind,
  onSelectView,
  onAddBookmark,
  onOpenSleepTimer
}) => {
  const currentFile = book.files[book.currentFileIndex] || book.files[0];
  const activeChapter = currentFile.chapters.find(
    (ch) => currentPositionMs >= ch.startMs && currentPositionMs <= ch.endMs
  ) || currentFile.chapters[0];
  const canvasRef = useRef(null);
  const [activeSubtitle, setActiveSubtitle] = useState("");
  const [activeSpeaker, setActiveSpeaker] = useState("");
  useEffect(() => {
    const cue = book.sidecars.srtSubtitles.find(
      (s) => currentPositionMs >= s.startMs && currentPositionMs <= s.endMs
    );
    if (cue) {
      setActiveSubtitle(cue.text);
      setActiveSpeaker(cue.speaker || "Narrator");
    } else {
      setActiveSubtitle("");
      setActiveSpeaker("");
    }
  }, [currentPositionMs, book]);
  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const render = () => {
      const data = audioEngine.getVisualizerData();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = 3;
      const gap = 2;
      const numBars = Math.floor(canvas.width / (barWidth + gap));
      const step = Math.floor(data.length / numBars) || 1;
      for (let i = 0; i < numBars; i++) {
        const val = isPlaying ? data[i * step] || 10 : 4;
        const barHeight = Math.max(3, val / 255 * canvas.height * 0.9);
        const x = i * (barWidth + gap);
        const y = canvas.height - barHeight;
        ctx.fillStyle = isPlaying ? i % 2 === 0 ? "var(--primary-container)" : "var(--secondary)" : "var(--border-subtle)";
        ctx.fillRect(x, y, barWidth, barHeight);
      }
      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);
  const formatTime = (ms) => {
    const totalSec = Math.floor(ms / 1e3);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor(totalSec % 3600 / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  const fileProgressPercent = Math.min(100, Math.max(0, currentPositionMs / currentFile.durationMs * 100));
  const remainingFileMs = Math.max(0, currentFile.durationMs - currentPositionMs);
  return <div className="w-full flex flex-col gap-5 max-w-7xl mx-auto">
      {
    /* 1. Context & Resumption HUD Banner */
  }
      <section className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 shadow-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--bg-surface-high)] text-[var(--primary-container)] shrink-0 border border-[var(--border-subtle)]">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)] font-bold">
                Active Audio Stream
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--secondary)]" />
              <span className="text-[10px] font-mono text-[var(--secondary)] font-bold">
                L/R PHASE OK
              </span>
            </div>
            <p className="text-xs font-mono text-[var(--primary)] truncate">
              {currentFile.fileName} <span className="text-[var(--text-muted)] font-normal">· {currentFile.bitrate} · {currentFile.sampleRate} · 24-bit Stereo</span>
            </p>
          </div>
        </div>

        {
    /* Auto-Rewind Catch-up Badge */
  }
        {autoRewindState.armed && autoRewindState.calculatedOffsetSec > 0 && <div className="flex items-center gap-2 bg-[var(--bg-surface-high)] border border-[var(--primary-container)]/30 px-3 py-1.5 rounded-lg shrink-0 shadow-inner">
            <div className="w-2 h-2 rounded-full bg-[var(--primary-container)] animate-ping" />
            <RotateCcw className="w-3.5 h-3.5 text-[var(--primary-container)]" />
            <div className="flex items-baseline gap-1.5 text-xs">
              <span className="font-bold text-[var(--primary-container)] uppercase tracking-wide">
                -{autoRewindState.calculatedOffsetSec}s Catch-Up Armed
              </span>
              <span className="text-[11px] text-[var(--text-muted)] font-mono hidden sm:inline">
                (Paused {Math.round((Date.now() - autoRewindState.lastPauseEpochMs) / 6e4)}m ago · Resumes aligned)
              </span>
            </div>
            <button
    onClick={onDismissAutoRewind}
    className="text-[var(--text-muted)] hover:text-[var(--primary)] ml-1 transition-colors p-0.5"
    title="Dismiss auto-rewind"
  >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>}
      </section>

      {
    /* 2. Two-Column Workstation Layout */
  }
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
        {
    /* LEFT COLUMN: Deck 01 - Book Tome Cover & Metadata Plate (5 cols) */
  }
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="relative bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-xl flex flex-col gap-4 overflow-hidden hardware-plate">
            <div className="flex gap-4">
              {
    /* Leatherbound Book Cover Art Plate */
  }
              <div
    className="relative w-36 sm:w-44 h-52 sm:h-60 shrink-0 rounded-lg overflow-hidden shadow-2xl flex flex-col justify-between p-3 border border-[var(--border-subtle)] select-none"
    style={{ backgroundColor: book.coverColor }}
  >
                {
    /* Gold foil embossed glyph and ornament */
  }
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-amber-200/80 font-bold border border-amber-300/30 px-1 rounded">
                    SABP
                  </span>
                  <span className="text-xl">{book.coverGlyph}</span>
                </div>

                <div className="my-auto text-center px-1">
                  <p className="font-serif text-sm sm:text-base font-bold text-amber-100 tracking-tight leading-snug drop-shadow-md line-clamp-3">
                    {book.title}
                  </p>
                  <p className="text-[11px] font-sans text-amber-200/70 mt-1 font-medium">
                    {book.author}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-amber-300/90 pt-2 border-t border-amber-400/20">
                  <span className="bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
                    FILE {book.currentFileIndex + 1}/{book.files.length}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--secondary)]" />
                </div>
              </div>

              {
    /* Master Tome Meta Information */
  }
              <div className="flex flex-col justify-between py-1 min-w-0">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--primary-container)]">
                    {book.series} · {book.seriesNumber}
                  </span>
                  <h1 className="font-serif text-xl sm:text-2xl font-bold text-[var(--primary)] tracking-tight leading-tight line-clamp-2">
                    {book.title}
                  </h1>
                  <p className="text-sm text-[var(--text-muted)] font-medium">
                    {book.author}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-[var(--text-muted)] text-xs">
                    <span className="text-[var(--tertiary)] font-bold">Narrators:</span>
                    <span className="truncate">{book.narrator}</span>
                  </div>
                </div>

                {
    /* Chapter Sequence Card */
  }
                <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-2.5 rounded-lg flex flex-col gap-0.5 mt-3">
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono">
                    <span className="uppercase">Sequence Marker</span>
                    <span className="text-[var(--primary-container)]">{activeChapter?.id.toUpperCase()}</span>
                  </div>
                  <p className="font-serif text-sm font-semibold text-[var(--primary)] truncate">
                    {activeChapter?.title || "Continuous Narration"}
                  </p>
                  {activeChapter?.pov && <span className="text-[10px] font-mono text-[var(--text-muted)]">
                      POV: {activeChapter.pov}
                    </span>}
                </div>
              </div>
            </div>

            {
    /* Dynamic Synchronized Excerpt (.srt/.vtt reader) */
  }
            <div className="bg-[var(--bg-surface-lowest)] border border-[var(--border-subtle)] rounded-lg p-3.5 flex flex-col gap-2 relative shadow-inner">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--secondary)] animate-pulse" />
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)] font-bold">
                    Synchronized Subtitles ({activeSpeaker})
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[var(--primary-container)]">
                  {formatTime(currentPositionMs)}
                </span>
              </div>

              <div className="min-h-[4rem] flex items-center justify-center text-center p-2 rounded bg-[var(--bg-surface)]/60 border border-[var(--border-subtle)]">
                {activeSubtitle ? <p className="text-sm font-serif italic text-[var(--primary)] leading-relaxed">
                    {activeSubtitle}
                  </p> : <p className="text-xs text-[var(--text-muted)] italic">
                    Listening to uninterrupted narration...
                  </p>}
              </div>
            </div>

            {
    /* Live Audio Spectrum Bar Visualizer */
  }
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-[var(--primary-container)]" />
                  <span>DSP SPECTRUM (FFT 256)</span>
                </span>
                <span className="text-[var(--secondary)] font-bold">
                  {isPlaying ? "ENGINE STREAMING" : "STANDBY"}
                </span>
              </div>
              <div className="h-10 w-full bg-[var(--bg-surface-lowest)] rounded-md overflow-hidden border border-[var(--border-subtle)] p-1">
                <canvas ref={canvasRef} width={380} height={36} className="w-full h-full block" />
              </div>
            </div>
          </div>
        </div>

        {
    /* RIGHT COLUMN: Deck 02 - Master Scrubbers & Tactile Transport Panel (7 cols) */
  }
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-xl flex flex-col gap-6 hardware-plate-raised">
            {
    /* Header Telemetry Row */
  }
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--primary-container)]" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--primary-container)]">
                  Master Transport Deck
                </span>
              </div>

              {
    /* Sleep timer status badge */
  }
              <button
    onClick={onOpenSleepTimer}
    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--bg-surface-high)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] hover:text-[var(--text-high)] transition-colors"
  >
                <Moon className="w-3.5 h-3.5 text-[var(--secondary)]" />
                <span>Sleep:</span>
                <span className="font-mono font-bold text-[var(--primary)]">
                  {sleepTimerState.active ? `${Math.floor(sleepTimerState.remainingSec / 60)}m` : "Off"}
                </span>
              </button>
            </div>

            {
    /* Timecode Big Display */
  }
            <div className="flex flex-col items-center justify-center gap-1 py-1">
              <span className="font-mono text-4xl sm:text-5xl font-bold tracking-tight text-[var(--primary)] tabular-nums drop-shadow-sm">
                {formatTime(currentPositionMs)}
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                File Duration: {formatTime(currentFile.durationMs)} · Remaining: -{formatTime(remainingFileMs)}
              </span>
            </div>

            {
    /* Primary Track Scrubber */
  }
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-mono text-[var(--text-muted)]">
                <span>{formatTime(currentPositionMs)}</span>
                <span className="text-[var(--primary-container)] font-semibold">
                  {Math.round(fileProgressPercent)}%
                </span>
                <span>-{formatTime(remainingFileMs)}</span>
              </div>

              {
    /* Progress Channel Bar */
  }
              <div
    className="relative w-full h-3 bg-[var(--bg-surface-lowest)] rounded-full overflow-hidden border border-[var(--border-subtle)] cursor-pointer group shadow-inner"
    onClick={(e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      onSeek(ratio * currentFile.durationMs);
    }}
  >
                <div
    className="h-full bg-[var(--primary-container)] transition-all duration-75 relative"
    style={{ width: `${fileProgressPercent}%` }}
  >
                  <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/60 rounded-full shadow-md" />
                </div>
              </div>

              {
    /* Chapter ticks & POV preview */
  }
              <div className="flex justify-between items-center text-[11px] text-[var(--text-muted)] pt-0.5">
                <span className="truncate max-w-[65%] font-serif">
                  {activeChapter?.title}
                </span>
                <span className="font-mono text-[10px] text-[var(--text-muted)]">
                  Track {book.currentFileIndex + 1} of {book.files.length}
                </span>
              </div>
            </div>

            {
    /* Global Book Progress Strip */
  }
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-3 rounded-lg flex flex-col gap-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[var(--text-muted)]">Overall Book Progress:</span>
                <span className="text-[var(--primary-container)] font-bold">
                  {formatTime(book.playedDurationMs || currentPositionMs)} / {formatTime(book.totalDurationMs)} (31%)
                </span>
              </div>
              <div className="w-full h-1.5 bg-[var(--bg-surface-lowest)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--secondary)] w-[31%]" />
              </div>
            </div>

            {
    /* Tactile Transport Controls & Jump Buttons */
  }
            <div className="flex flex-col gap-4 items-center justify-center pt-2">
              {
    /* Primary Transport Row */
  }
              <div className="flex items-center justify-center gap-3 sm:gap-5 w-full">
                {
    /* -60s Big Jump */
  }
                <button
    onClick={() => onJump(-60)}
    className="hardware-plate flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl text-[var(--text-high)] hover:text-[var(--primary-container)] tactile-btn"
    title="Rewind 60 seconds"
  >
                  <RotateCcw className="w-5 h-5 mb-0.5" />
                  <span className="text-[11px] font-mono font-bold">-60s</span>
                </button>

                {
    /* -10s Small Jump */
  }
                <button
    onClick={() => onJump(-10)}
    className="hardware-plate flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl text-[var(--text-high)] hover:text-[var(--primary-container)] tactile-btn"
    title="Rewind 10 seconds"
  >
                  <RotateCcw className="w-5 h-5 mb-0.5" />
                  <span className="text-[11px] font-mono font-bold">-10s</span>
                </button>

                {
    /* Heavy 80x80mm Play/Pause Disc */
  }
                <button
    onClick={onTogglePlayPause}
    className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full flex items-center justify-center transition-all tactile-btn border-2 ${isPlaying ? "bg-[var(--primary-container)] text-[var(--bg-base)] border-amber-300 shadow-[0_0_24px_var(--primary-glow)]" : "bg-[var(--bg-surface-high)] text-[var(--primary-container)] border-[var(--border-subtle)] shadow-xl"}`}
    title={isPlaying ? "Pause" : "Play"}
  >
                  {isPlaying ? <Pause className="w-9 h-9 fill-current" /> : <Play className="w-9 h-9 fill-current ml-1" />}
                </button>

                {
    /* +30s Small Jump */
  }
                <button
    onClick={() => onJump(30)}
    className="hardware-plate flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl text-[var(--text-high)] hover:text-[var(--primary-container)] tactile-btn"
    title="Fast Forward 30 seconds"
  >
                  <RotateCw className="w-5 h-5 mb-0.5" />
                  <span className="text-[11px] font-mono font-bold">+30s</span>
                </button>

                {
    /* +5m Big Jump */
  }
                <button
    onClick={() => onJump(300)}
    className="hardware-plate flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl text-[var(--text-high)] hover:text-[var(--primary-container)] tactile-btn"
    title="Fast Forward 5 minutes"
  >
                  <FastForward className="w-5 h-5 mb-0.5" />
                  <span className="text-[11px] font-mono font-bold">+5m</span>
                </button>
              </div>

              {
    /* Fast Action Access Strip */
  }
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full pt-2">
                {
    /* Speed Multiplier Button */
  }
                <button
    onClick={() => onSelectView("dsp-studio")}
    className="hardware-plate p-2.5 rounded-lg flex items-center justify-between text-xs hover:border-[var(--primary-container)]/50 transition-colors"
  >
                  <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                    <Sliders className="w-3.5 h-3.5 text-[var(--tertiary)]" />
                    <span>Speed</span>
                  </div>
                  <span className="font-mono font-bold text-[var(--primary-container)]">
                    {book.playbackSpeed.toFixed(2)}x
                  </span>
                </button>

                {
    /* Loudness Boost Button */
  }
                <button
    onClick={() => onSelectView("dsp-studio")}
    className="hardware-plate p-2.5 rounded-lg flex items-center justify-between text-xs hover:border-[var(--primary-container)]/50 transition-colors"
  >
                  <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                    <Volume2 className="w-3.5 h-3.5 text-[var(--secondary)]" />
                    <span>Boost</span>
                  </div>
                  <span className="font-mono font-bold text-[var(--secondary)]">
                    +{book.volumeBoostDb} dB
                  </span>
                </button>

                {
    /* Add Bookmark Button */
  }
                <button
    onClick={onAddBookmark}
    className="hardware-plate p-2.5 rounded-lg flex items-center justify-between text-xs hover:border-[var(--primary-container)]/50 transition-colors"
  >
                  <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                    <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                    <span>Bookmark</span>
                  </div>
                  <span className="font-mono text-[10px] text-[var(--text-muted)]">
                    Quick Add
                  </span>
                </button>

                {
    /* Characters Directory Button */
  }
                <button
    onClick={() => onSelectView("characters-bookmarks")}
    className="hardware-plate p-2.5 rounded-lg flex items-center justify-between text-xs hover:border-[var(--primary-container)]/50 transition-colors"
  >
                  <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                    <Users className="w-3.5 h-3.5 text-[var(--tertiary)]" />
                    <span>Cast</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-[var(--text-high)]">
                    5 Active
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export {
  NowPlayingStudio
};
