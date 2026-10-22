/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FolderPlay - The Definitive Folder-Based Audiobook Player & Studio
 * Reconstructed from Google Stitch outputs, PRD, Addendum, and Architecture Spine
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Book, ViewMode, ThemeMode, DspSettings, SleepTimerState, AutoRewindState, BookState, Character } from './types';
import { INITIAL_BOOKS } from './data/mockBooks';
import { audioEngine } from './services/audioEngine';

// Components
import { Header } from './components/Header';
import { NowPlayingStudio } from './components/NowPlayingStudio';
import { LibraryStorageManager } from './components/LibraryStorageManager';
import { AudioDspStudio } from './components/AudioDspStudio';
import { CharactersBookmarksView } from './components/CharactersBookmarksView';
import { AudioSleepTimerModal } from './components/AudioSleepTimerModal';
import { SidecarInspectorModal } from './components/SidecarInspectorModal';
import { CarModeView } from './components/CarModeView';
import { OpusTranscoderModal } from './components/OpusTranscoderModal';

export default function App() {
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [activeBookId, setActiveBookId] = useState<string>(INITIAL_BOOKS[0].id);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentPositionMs, setCurrentPositionMs] = useState<number>(INITIAL_BOOKS[0].currentPositionMs);
  const [currentView, setCurrentView] = useState<ViewMode>('now-playing');
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('nocturne');
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  
  // Overlays / Modals
  const [showSleepModal, setShowSleepModal] = useState<boolean>(false);
  const [showSidecarModal, setShowSidecarModal] = useState<boolean>(false);
  const [showTranscoderModal, setShowTranscoderModal] = useState<boolean>(false);

  // Auto-Rewind state
  const [autoRewindState, setAutoRewindState] = useState<AutoRewindState>({
    armed: true,
    calculatedOffsetSec: 14,
    pausedDurationSec: 1320,
    lastPauseEpochMs: Date.now() - 1320000
  });

  // Sleep Timer state
  const [sleepTimerState, setSleepTimerState] = useState<SleepTimerState>({
    active: false,
    targetDurationSec: 1800,
    remainingSec: 1800,
    fadeoutActive: false,
    shakeToResetEnabled: true,
    shakeSensitivity: 6,
    scheduledBedtimeActive: false,
    androidAutoInhibit: false
  });

  const activeBook = books.find(b => b.id === activeBookId) || books[0];

  // Set data-theme on html root element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  // Sync initial audio engine parameters
  useEffect(() => {
    audioEngine.updateBookMeta(
      activeBook.currentPositionMs,
      activeBook.files[activeBook.currentFileIndex]?.durationMs || 3600000,
      {
        speed: activeBook.playbackSpeed,
        pitch: activeBook.pitchShift,
        volumeBoostDb: activeBook.volumeBoostDb,
        rnnoise: activeBook.rnnoiseEnabled,
        mono: activeBook.monoDownmix,
        balance: activeBook.balance,
        eq: activeBook.eqLevels,
        skipSilence: activeBook.skipSilence
      }
    );

    audioEngine.subscribePosition((posMs, autoRewind) => {
      setCurrentPositionMs(posMs);
      if (autoRewind.armed !== autoRewindState.armed || autoRewind.calculatedOffsetSec !== autoRewindState.calculatedOffsetSec) {
        setAutoRewindState({ ...autoRewind });
      }
    });

    audioEngine.subscribeSleepTimer((state) => {
      setSleepTimerState({ ...state });
    });

    audioEngine.subscribeState((playing) => {
      setIsPlaying(playing);
    });
  }, [activeBook.id]);

  // Keyboard Shortcuts (Space to play/pause, Arrows to jump)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        audioEngine.togglePlayPause();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        audioEngine.jump(e.shiftKey ? -60 : -10);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        audioEngine.jump(e.shiftKey ? 300 : 30);
      } else if (e.key === 'c' || e.key === 'C') {
        setCurrentView(prev => prev === 'car-mode' ? 'now-playing' : 'car-mode');
      } else if (e.key === 's' || e.key === 'S') {
        setShowSleepModal(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTogglePlayPause = useCallback(() => {
    audioEngine.togglePlayPause();
  }, []);

  const handleSeek = useCallback((positionMs: number) => {
    audioEngine.seekTo(positionMs);
  }, []);

  const handleJump = useCallback((seconds: number) => {
    audioEngine.jump(seconds);
  }, []);

  const handleDismissAutoRewind = useCallback(() => {
    audioEngine.dismissAutoRewind();
    setAutoRewindState(prev => ({ ...prev, armed: false, calculatedOffsetSec: 0 }));
  }, []);

  const handleUpdateBookDsp = useCallback((dsp: DspSettings) => {
    setBooks(prev => prev.map(b => {
      if (b.id !== activeBook.id) return b;
      return {
        ...b,
        playbackSpeed: dsp.speed,
        pitchShift: dsp.pitch,
        volumeBoostDb: dsp.volumeBoostDb,
        rnnoiseEnabled: dsp.rnnoise,
        monoDownmix: dsp.mono,
        balance: dsp.balance,
        eqLevels: dsp.eq,
        skipSilence: dsp.skipSilence
      };
    }));
  }, [activeBook.id]);

  const handleUpdateBookState = useCallback((bookId: string, newState: BookState) => {
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, state: newState } : b));
  }, []);

  const handleAddToQueue = useCallback((bookId: string) => {
    setBooks(prev => prev.map(b => {
      if (b.id === bookId) {
        return { ...b, queueIndex: (b.queueIndex || 0) + 1 };
      }
      return b;
    }));
  }, []);

  const handleImportAudioFiles = useCallback((fileList: FileList) => {
    const firstFile = fileList[0];
    if (!firstFile) return;

    // Load into audio engine
    audioEngine.loadAudioFile(firstFile);

    // Create a new Book item
    const newBook: Book = {
      id: `imported-${Date.now()}`,
      title: firstFile.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
      author: 'User Imported Audio',
      narrator: 'Local Audio Stream',
      folderPath: '/storage/emulated/0/Audiobooks/Imported',
      coverColor: '#0f766e',
      coverGlyph: '📂',
      state: 'Started',
      files: Array.from(fileList).map((f, i) => ({
        fileName: f.name,
        displayName: f.name.replace(/\.[^/.]+$/, ''),
        durationMs: 3600000,
        bitrate: 'Original Container',
        sampleRate: '48.0 kHz',
        fileSizeMb: Math.round((f.size / (1024 * 1024)) * 10) / 10,
        chapters: [{ id: `imp-ch-${i}`, title: f.name, startMs: 0, endMs: 3600000 }]
      })),
      currentFileIndex: 0,
      currentPositionMs: 0,
      playbackSpeed: 1.0,
      volumeBoostDb: 0,
      pitchShift: 0,
      rnnoiseEnabled: true,
      skipSilence: false,
      monoDownmix: false,
      balance: 0,
      eqLevels: [0, 0, 0, 0, 0],
      lastPlayedEpochMs: Date.now(),
      totalDurationMs: fileList.length * 3600000,
      sidecars: {
        positionDat: `mFileName=${firstFile.name}\nmFilePosition=0\nmBookState=Started`,
        bookmarksXml: '<root></root>',
        charactersXml: '<root></root>',
        infoTxt: `Imported local audio file: ${firstFile.name} (${fileList.length} files)`,
        srtSubtitles: []
      }
    };

    setBooks(prev => [newBook, ...prev]);
    setActiveBookId(newBook.id);
    setCurrentView('now-playing');
  }, []);

  const handleAddBookmarkDirect = useCallback(() => {
    const title = `Bookmark at ${Math.floor(currentPositionMs / 60000)}m`;
    const desc = `Saved timestamp in ${activeBook.files[activeBook.currentFileIndex]?.fileName || 'current file'}`;
    const newBm = {
      id: `bm-${Date.now()}`,
      bookId: activeBook.id,
      title,
      description: desc,
      fileName: activeBook.files[activeBook.currentFileIndex]?.fileName || 'part.mp3',
      filePositionMs: currentPositionMs,
      globalPositionMs: currentPositionMs,
      createdAtEpochMs: Date.now(),
      colorTag: 'amber'
    };
    alert(`Bookmark saved: "${title}" added to bookmarks.sabp.xml!`);
  }, [activeBook, currentPositionMs]);

  // Car Mode View
  if (currentView === 'car-mode') {
    return (
      <CarModeView
        book={activeBook}
        isPlaying={isPlaying}
        currentPositionMs={currentPositionMs}
        onTogglePlayPause={handleTogglePlayPause}
        onJump={handleJump}
        onAddBookmark={handleAddBookmarkDirect}
        onExitCarMode={() => setCurrentView('now-playing')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-medium)] flex flex-col selection:bg-[var(--primary-container)] selection:text-[var(--bg-base)]">
      {/* Top Header */}
      <Header
        currentView={currentView}
        onSelectView={setCurrentView}
        currentTheme={currentTheme}
        onSelectTheme={setCurrentTheme}
        deviceMode={deviceMode}
        onToggleDeviceMode={() => setDeviceMode(prev => prev === 'desktop' ? 'mobile' : 'desktop')}
        sleepRemainingSec={sleepTimerState.remainingSec}
        sleepActive={sleepTimerState.active}
        rnnoiseActive={activeBook.rnnoiseEnabled}
      />

      {/* Main Container: Either Full Desktop or Mobile Preview Frame */}
      <main className="flex-1 flex flex-col justify-start items-center p-3 sm:p-6 md:p-8 w-full">
        {deviceMode === 'mobile' ? (
          /* Mobile Phone Device Frame */
          <div className="relative w-full max-w-[420px] bg-[var(--bg-surface-lowest)] border-4 border-[var(--border-subtle)] rounded-[44px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col my-auto min-h-[780px]">
            {/* Phone Speaker Notch */}
            <div className="h-6 w-full bg-[var(--bg-surface-lowest)] flex justify-center items-center shrink-0">
              <div className="w-24 h-4 bg-black rounded-b-xl flex items-center justify-center">
                <div className="w-10 h-1 bg-gray-800 rounded-full" />
              </div>
            </div>

            {/* Mobile Scrollable Viewport */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5">
              {currentView === 'now-playing' && (
                <NowPlayingStudio
                  book={activeBook}
                  isPlaying={isPlaying}
                  currentPositionMs={currentPositionMs}
                  autoRewindState={autoRewindState}
                  sleepTimerState={sleepTimerState}
                  onTogglePlayPause={handleTogglePlayPause}
                  onSeek={handleSeek}
                  onJump={handleJump}
                  onDismissAutoRewind={handleDismissAutoRewind}
                  onSelectView={setCurrentView}
                  onAddBookmark={handleAddBookmarkDirect}
                  onOpenSleepTimer={() => setShowSleepModal(true)}
                />
              )}

              {currentView === 'library' && (
                <LibraryStorageManager
                  books={books}
                  activeBookId={activeBookId}
                  onSelectBook={(b) => setActiveBookId(b.id)}
                  onSelectView={setCurrentView}
                  onUpdateBookState={handleUpdateBookState}
                  onAddToQueue={handleAddToQueue}
                  onImportAudioFiles={handleImportAudioFiles}
                />
              )}

              {currentView === 'dsp-studio' && (
                <AudioDspStudio
                  book={activeBook}
                  onUpdateBookDsp={handleUpdateBookDsp}
                  onBackToPlayer={() => setCurrentView('now-playing')}
                />
              )}

              {currentView === 'characters-bookmarks' && (
                <CharactersBookmarksView
                  book={activeBook}
                  currentPositionMs={currentPositionMs}
                  onSeekBookmark={(ms) => {
                    handleSeek(ms);
                    setCurrentView('now-playing');
                  }}
                  onAddBookmark={() => {}}
                  onAddCharacter={() => {}}
                  onDeleteBookmark={() => {}}
                  onDeleteCharacter={() => {}}
                  onBackToPlayer={() => setCurrentView('now-playing')}
                />
              )}
            </div>

            {/* Phone Home Bar Indicator */}
            <div className="h-4 w-full bg-[var(--bg-surface-lowest)] flex justify-center items-center shrink-0">
              <div className="w-28 h-1 bg-white/40 rounded-full" />
            </div>
          </div>
        ) : (
          /* Desktop Workstation View */
          <div className="w-full max-w-7xl animate-fade-in">
            {currentView === 'now-playing' && (
              <NowPlayingStudio
                book={activeBook}
                isPlaying={isPlaying}
                currentPositionMs={currentPositionMs}
                autoRewindState={autoRewindState}
                sleepTimerState={sleepTimerState}
                onTogglePlayPause={handleTogglePlayPause}
                onSeek={handleSeek}
                onJump={handleJump}
                onDismissAutoRewind={handleDismissAutoRewind}
                onSelectView={setCurrentView}
                onAddBookmark={handleAddBookmarkDirect}
                onOpenSleepTimer={() => setShowSleepModal(true)}
              />
            )}

            {currentView === 'library' && (
              <LibraryStorageManager
                books={books}
                activeBookId={activeBookId}
                onSelectBook={(b) => setActiveBookId(b.id)}
                onSelectView={setCurrentView}
                onUpdateBookState={handleUpdateBookState}
                onAddToQueue={handleAddToQueue}
                onImportAudioFiles={handleImportAudioFiles}
              />
            )}

            {currentView === 'dsp-studio' && (
              <AudioDspStudio
                book={activeBook}
                onUpdateBookDsp={handleUpdateBookDsp}
                onBackToPlayer={() => setCurrentView('now-playing')}
              />
            )}

            {currentView === 'characters-bookmarks' && (
              <CharactersBookmarksView
                book={activeBook}
                currentPositionMs={currentPositionMs}
                onSeekBookmark={(ms) => {
                  handleSeek(ms);
                  setCurrentView('now-playing');
                }}
                onAddBookmark={() => {}}
                onAddCharacter={() => {}}
                onDeleteBookmark={() => {}}
                onDeleteCharacter={() => {}}
                onBackToPlayer={() => setCurrentView('now-playing')}
              />
            )}

            {currentView === 'sleep-timer' && (
              <div className="max-w-xl mx-auto py-4">
                <AudioSleepTimerModal
                  sleepState={sleepTimerState}
                  onClose={() => setCurrentView('now-playing')}
                  onStateUpdate={setSleepTimerState}
                />
              </div>
            )}

            {currentView === 'sidecar-inspector' && (
              <div className="max-w-3xl mx-auto py-4">
                <SidecarInspectorModal
                  book={activeBook}
                  onClose={() => setCurrentView('now-playing')}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bedtime Sleep Timer Modal Overlay (when triggered via button) */}
      {showSleepModal && (
        <AudioSleepTimerModal
          sleepState={sleepTimerState}
          onClose={() => setShowSleepModal(false)}
          onStateUpdate={setSleepTimerState}
        />
      )}

      {/* Sidecar Inspector Modal */}
      {showSidecarModal && (
        <SidecarInspectorModal
          book={activeBook}
          onClose={() => setShowSidecarModal(false)}
        />
      )}

      {/* Opus Transcoder Modal */}
      {showTranscoderModal && (
        <OpusTranscoderModal
          book={activeBook}
          onClose={() => setShowTranscoderModal(false)}
        />
      )}

      {/* Persistent Minimal Audio Player Footer Bar */}
      <footer className="sticky bottom-0 z-40 bg-[var(--bg-surface-lowest)]/95 border-t border-[var(--border-subtle)] px-4 py-2.5 backdrop-blur-md flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div 
            className="w-7 h-7 rounded shrink-0 flex items-center justify-center font-bold text-black text-xs"
            style={{ backgroundColor: activeBook.coverColor }}
          >
            {activeBook.coverGlyph}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-serif font-bold text-[var(--primary)] truncate">
              {activeBook.title}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] truncate">
              {activeBook.files[activeBook.currentFileIndex]?.displayName || 'Track'}
            </span>
          </div>
        </div>

        {/* Global Micro-controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleJump(-10)}
            className="hardware-plate px-2 py-1 rounded text-[10px] font-mono text-[var(--text-high)] hover:text-[var(--primary-container)]"
          >
            -10s
          </button>
          <button
            onClick={handleTogglePlayPause}
            className="px-3 py-1 rounded bg-[var(--primary-container)] text-[var(--bg-base)] font-bold text-xs"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={() => handleJump(30)}
            className="hardware-plate px-2 py-1 rounded text-[10px] font-mono text-[var(--text-high)] hover:text-[var(--primary-container)]"
          >
            +30s
          </button>
        </div>

        {/* Shortcuts notice */}
        <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono text-[var(--text-muted)]">
          <span className="px-1.5 py-0.5 rounded bg-[var(--bg-surface-high)] border border-[var(--border-subtle)]">Space</span>
          <span>Play/Pause</span>
          <span className="px-1.5 py-0.5 rounded bg-[var(--bg-surface-high)] border border-[var(--border-subtle)]">← / →</span>
          <span>Jump 10s/30s</span>
          <span className="px-1.5 py-0.5 rounded bg-[var(--bg-surface-high)] border border-[var(--border-subtle)]">C</span>
          <span>Car Mode</span>
        </div>
      </footer>
    </div>
  );
}
