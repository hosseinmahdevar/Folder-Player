/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FolderPlay Library & Storage Manager
 * Reconstructed from Stitch desktop_library_storage_manager and library designs
 */
import { useState } from "react";
import { ROOT_STORAGE_FOLDERS } from "../data/mockBooks";
import {
  Library,
  Folder,
  Search,
  Play,
  Clock,
  HardDrive,
  ListOrdered,
  RefreshCw,
  Sparkles,
  Upload
} from "lucide-react";
const LibraryStorageManager = ({
  books,
  activeBookId,
  onSelectBook,
  onSelectView,
  onUpdateBookState,
  onAddToQueue,
  onImportAudioFiles
}) => {
  const [activeTab, setActiveTab] = useState("Started");
  const [searchQuery, setSearchQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState(null);
  const filteredBooks = books.filter((b) => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.author.toLowerCase().includes(searchQuery.toLowerCase()) || b.series && b.series.toLowerCase().includes(searchQuery.toLowerCase()) || b.narrator.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === "Queue") {
      return b.queueIndex !== void 0 && b.queueIndex > 0;
    }
    return b.state === activeTab;
  });
  const handleScanFolders = () => {
    setIsScanning(true);
    setScanMessage("Scanning root storage trees via SAF...");
    setTimeout(() => {
      setIsScanning(false);
      setScanMessage("Scan complete: 4 books, 84 files, 158.6 hrs indexed in 180ms. All sidecars validated.");
      setTimeout(() => setScanMessage(null), 4e3);
    }, 1e3);
  };
  const formatHours = (ms) => {
    const hrs = (ms / 36e5).toFixed(1);
    return `${hrs} hrs`;
  };
  return <div className="w-full flex flex-col gap-6 max-w-7xl mx-auto">
      {
    /* Top Banner: Storage Health & Root Management */
  }
      <div className="bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hardware-plate">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary-container)]/15 border border-[var(--primary-container)]/30 flex items-center justify-center text-[var(--primary-container)]">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl font-bold text-[var(--primary)]">
                Library & Storage Manager
              </h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--secondary)]/20 text-[var(--secondary)]">
                OFFLINE SAF ACTIVE
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Zero cloud lock-in. Books are discovered as atomic directories with local sidecars.
            </p>
          </div>
        </div>

        {
    /* Scan & Import Actions */
  }
        <div className="flex items-center gap-3">
          <label className="hardware-plate flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--primary-container)] hover:bg-[var(--bg-surface-high)] cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Import Local Files</span>
            <input
    type="file"
    multiple
    accept="audio/*,.mp3,.m4b,.opus,.ogg,.flac"
    className="hidden"
    onChange={(e) => {
      if (e.target.files && e.target.files.length > 0) {
        onImportAudioFiles(e.target.files);
      }
    }}
  />
          </label>

          <button
    onClick={handleScanFolders}
    disabled={isScanning}
    className="hardware-plate flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-high)] hover:text-[var(--primary-container)] transition-colors disabled:opacity-50"
  >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin text-[var(--primary-container)]" : ""}`} />
            <span>{isScanning ? "Scanning..." : "Re-scan Roots"}</span>
          </button>
        </div>
      </div>

      {
    /* Storage feedback alert */
  }
      {scanMessage && <div className="p-3 rounded-lg bg-[var(--secondary)]/15 border border-[var(--secondary)] text-[var(--secondary)] text-xs font-medium flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{scanMessage}</span>
        </div>}

      {
    /* Root Storage Tree Summary Bar */
  }
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {ROOT_STORAGE_FOLDERS.map((rf) => <div
    key={rf.path}
    className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-3 flex flex-col gap-1 shadow-sm"
  >
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[var(--primary-container)] font-bold flex items-center gap-1">
                <Folder className="w-3.5 h-3.5" />
                {rf.isInternal ? "Internal Storage" : "Removable SD"}
              </span>
              <span className="text-[var(--text-muted)]">{rf.freeSpaceGb} GB Free</span>
            </div>
            <p className="text-xs text-[var(--text-high)] font-mono truncate" title={rf.path}>
              {rf.path}
            </p>
            <span className="text-[10px] text-[var(--text-muted)]">
              {rf.bookCount} Recognized Tome Folders
            </span>
          </div>)}
      </div>

      {
    /* Search & Tabs Toolbar */
  }
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] rounded-xl p-3 shadow-md">
        {
    /* State Tabs */
  }
        <div className="flex items-center gap-1 bg-[var(--bg-surface-lowest)] p-1 rounded-lg border border-[var(--border-subtle)] overflow-x-auto">
          {["Started", "New", "Finished", "Queue"].map((tab) => {
    const count = books.filter((b) => tab === "Queue" ? b.queueIndex && b.queueIndex > 0 : b.state === tab).length;
    const isActive = activeTab === tab;
    return <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${isActive ? "bg-[var(--bg-surface-high)] text-[var(--primary-container)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-high)]"}`}
    >
                {tab} ({count})
              </button>;
  })}
        </div>

        {
    /* Search Input */
  }
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-2.5" />
          <input
    type="text"
    placeholder="Search books, authors, series..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-high)] rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--primary-container)] placeholder:text-[var(--text-muted)]"
  />
        </div>
      </div>

      {
    /* Book Grid */
  }
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBooks.map((b) => {
    const isCurrentlyPlaying = b.id === activeBookId;
    const currentFile = b.files[b.currentFileIndex] || b.files[0];
    const progressPercent = Math.round((b.playedDurationMs || b.currentPositionMs) / b.totalDurationMs * 100) || 0;
    return <div
      key={b.id}
      className={`hardware-plate-raised rounded-xl p-4 flex flex-col justify-between gap-4 transition-all hover:border-[var(--primary-container)]/50 ${isCurrentlyPlaying ? "ring-1 ring-[var(--primary-container)]" : ""}`}
    >
              {
      /* Card Header & Tome Artwork */
    }
              <div className="flex gap-3.5">
                {
      /* Book Mini Cover */
    }
                <div
      className="w-20 h-28 rounded-lg shrink-0 flex flex-col justify-between p-2 shadow-lg border border-[var(--border-subtle)]"
      style={{ backgroundColor: b.coverColor }}
    >
                  <span className="text-base">{b.coverGlyph}</span>
                  <p className="font-serif text-[10px] font-bold text-amber-100 line-clamp-2 leading-tight">
                    {b.title}
                  </p>
                  <span className="text-[8px] font-mono text-amber-200/80">
                    {b.files.length} PARTS
                  </span>
                </div>

                {
      /* Metadata */
    }
                <div className="flex flex-col justify-between min-w-0">
                  <div>
                    {b.series && <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary-container)] block truncate">
                        {b.series} · {b.seriesNumber}
                      </span>}
                    <h3 className="font-serif text-base font-bold text-[var(--primary)] leading-snug line-clamp-2">
                      {b.title}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
                      {b.author}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--text-muted)]">
                    <Clock className="w-3 h-3 text-[var(--tertiary)]" />
                    <span>{formatHours(b.totalDurationMs)}</span>
                    <span>·</span>
                    <span>{b.files.length} files</span>
                  </div>
                </div>
              </div>

              {
      /* Progress Track */
    }
              <div className="flex flex-col gap-1.5 bg-[var(--bg-surface)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
                <div className="flex justify-between items-center text-[10px] font-mono text-[var(--text-muted)]">
                  <span className="truncate max-w-[70%]">Current: {currentFile.displayName}</span>
                  <span className="text-[var(--primary-container)] font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-[var(--bg-surface-lowest)] rounded-full overflow-hidden">
                  <div
      className="h-full bg-[var(--primary-container)]"
      style={{ width: `${progressPercent}%` }}
    />
                </div>
              </div>

              {
      /* Action Buttons */
    }
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-[var(--border-subtle)]">
                <div className="flex items-center gap-1.5">
                  <button
      onClick={() => {
        onSelectBook(b);
        onSelectView("now-playing");
      }}
      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--primary-container)] text-[var(--bg-base)] shadow-sm hover:brightness-105 active:scale-95 transition-all"
    >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{isCurrentlyPlaying ? "Continue" : "Play"}</span>
                  </button>

                  <button
      onClick={() => onAddToQueue(b.id)}
      className="hardware-plate p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary-container)] transition-colors"
      title="Add to Playback Queue"
    >
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>
                </div>

                {
      /* State selector dropdown */
    }
                <select
      value={b.state}
      onChange={(e) => onUpdateBookState(b.id, e.target.value)}
      className="text-[11px] font-mono bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-high)] rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
    >
                  <option value="Started">Started</option>
                  <option value="New">New</option>
                  <option value="Finished">Finished</option>
                </select>
              </div>
            </div>;
  })}
      </div>

      {filteredBooks.length === 0 && <div className="p-12 text-center rounded-xl bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] flex flex-col items-center gap-3">
          <Library className="w-8 h-8 text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-muted)] font-medium">
            No audiobooks found in the {activeTab} tab matching "{searchQuery}".
          </p>
        </div>}
    </div>;
};
export {
  LibraryStorageManager
};
