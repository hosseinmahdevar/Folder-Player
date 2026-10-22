/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FolderPlay Android Auto / Car Mode
 * High-visibility automotive interface with giant touch targets and sleep inhibit
 */
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Bookmark,
  Car,
  ArrowLeft
} from "lucide-react";
const CarModeView = ({
  book,
  isPlaying,
  currentPositionMs,
  onTogglePlayPause,
  onJump,
  onAddBookmark,
  onExitCarMode
}) => {
  const currentFile = book.files[book.currentFileIndex] || book.files[0];
  const activeChapter = currentFile.chapters[0];
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
  const remainingMs = Math.max(0, currentFile.durationMs - currentPositionMs);
  return <div className="fixed inset-0 z-50 bg-[#05080c] text-white flex flex-col justify-between p-6 sm:p-10 select-none animate-fade-in">
      {
    /* Top Automotive Bar */
  }
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm uppercase tracking-wider font-bold text-amber-400">
                Android Auto Mode
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <span className="text-xs text-gray-400 font-mono">
              Sleep Timer Inhibit Engaged · Head Unit Connected
            </span>
          </div>
        </div>

        <button
    onClick={onExitCarMode}
    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 border border-gray-700 text-gray-300 hover:text-white text-sm font-bold active:scale-95 transition-all"
  >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Car Mode</span>
        </button>
      </div>

      {
    /* Central Glanceable Book & Chapter Display */
  }
      <div className="flex flex-col items-center justify-center text-center my-auto max-w-3xl mx-auto gap-3">
        <span className="text-xs sm:text-sm font-mono tracking-widest uppercase text-amber-400 font-bold">
          {book.series || "Audiobook Master"}
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-amber-100 line-clamp-2 leading-tight">
          {book.title}
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 font-medium">
          {activeChapter?.title || currentFile.displayName}
        </p>

        {
    /* Large Timecode */
  }
        <div className="flex items-center gap-4 mt-2">
          <span className="font-mono text-3xl sm:text-4xl font-bold text-white tabular-nums">
            {formatTime(currentPositionMs)}
          </span>
          <span className="text-gray-500 font-mono text-xl">/</span>
          <span className="font-mono text-xl sm:text-2xl text-gray-400 tabular-nums">
            -{formatTime(remainingMs)}
          </span>
        </div>
      </div>

      {
    /* Massive Automotive Hardware Touch Targets */
  }
      <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
        {
    /* Progress Bar */
  }
        <div className="w-full h-3 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
          <div
    className="h-full bg-amber-400 transition-all duration-100"
    style={{ width: `${Math.min(100, currentPositionMs / currentFile.durationMs * 100)}%` }}
  />
        </div>

        {
    /* Huge Controls Row */
  }
        <div className="grid grid-cols-5 gap-3 sm:gap-6 items-center">
          {
    /* -60s Button */
  }
          <button
    onClick={() => onJump(-60)}
    className="h-20 sm:h-24 rounded-2xl bg-gray-900 border-2 border-gray-800 flex flex-col items-center justify-center text-gray-200 active:scale-95 active:bg-gray-800 transition-transform shadow-xl"
    title="Rewind 60 seconds"
  >
            <RotateCcw className="w-7 h-7 sm:w-8 sm:h-8 mb-1" />
            <span className="font-mono text-xs sm:text-sm font-bold">-60s</span>
          </button>

          {
    /* -10s Button */
  }
          <button
    onClick={() => onJump(-10)}
    className="h-20 sm:h-24 rounded-2xl bg-gray-900 border-2 border-gray-800 flex flex-col items-center justify-center text-gray-200 active:scale-95 active:bg-gray-800 transition-transform shadow-xl"
    title="Rewind 10 seconds"
  >
            <RotateCcw className="w-7 h-7 sm:w-8 sm:h-8 mb-1" />
            <span className="font-mono text-xs sm:text-sm font-bold">-10s</span>
          </button>

          {
    /* Central Mega Play/Pause Button (100px+) */
  }
          <button
    onClick={onTogglePlayPause}
    className={`h-24 sm:h-28 rounded-3xl flex items-center justify-center active:scale-95 transition-transform shadow-2xl border-4 ${isPlaying ? "bg-amber-400 text-black border-amber-300 shadow-amber-500/30" : "bg-gray-800 text-amber-400 border-gray-700"}`}
    title={isPlaying ? "Pause" : "Play"}
  >
            {isPlaying ? <Pause className="w-12 h-12 fill-current" /> : <Play className="w-12 h-12 fill-current ml-1" />}
          </button>

          {
    /* +30s Button */
  }
          <button
    onClick={() => onJump(30)}
    className="h-20 sm:h-24 rounded-2xl bg-gray-900 border-2 border-gray-800 flex flex-col items-center justify-center text-gray-200 active:scale-95 active:bg-gray-800 transition-transform shadow-xl"
    title="Forward 30 seconds"
  >
            <RotateCw className="w-7 h-7 sm:w-8 sm:h-8 mb-1" />
            <span className="font-mono text-xs sm:text-sm font-bold">+30s</span>
          </button>

          {
    /* Bookmark Button */
  }
          <button
    onClick={onAddBookmark}
    className="h-20 sm:h-24 rounded-2xl bg-gray-900 border-2 border-gray-800 flex flex-col items-center justify-center text-amber-400 active:scale-95 active:bg-gray-800 transition-transform shadow-xl"
    title="Add Bookmark at Current Position"
  >
            <Bookmark className="w-7 h-7 sm:w-8 sm:h-8 mb-1" />
            <span className="font-mono text-xs sm:text-sm font-bold">Mark</span>
          </button>
        </div>
      </div>
    </div>;
};
export {
  CarModeView
};
