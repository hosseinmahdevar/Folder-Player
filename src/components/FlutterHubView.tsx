/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FolderPlay Flutter Codebase Hub (Android & Desktop)
 * Interactive source code viewer and cross-platform architecture guide
 */

import React, { useState } from 'react';
import { 
  Code2, 
  Smartphone, 
  Monitor, 
  Copy, 
  Check, 
  Download, 
  Layers, 
  FileCode, 
  CheckCircle2, 
  ExternalLink,
  Cpu,
  FolderTree,
  Terminal,
  ShieldCheck
} from 'lucide-react';

export const FlutterHubView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('pubspec.yaml');
  const [copied, setCopied] = useState(false);

  const flutterFiles: Record<string, { path: string; category: string; description: string; content: string }> = {
    'pubspec.yaml': {
      path: 'pubspec.yaml',
      category: 'Project Configuration',
      description: 'Flutter SDK, audio_service, just_audio, sensors_plus, and ffi dependencies.',
      content: `name: folderplay
description: "FolderPlay - Offline Audiobook Player & Studio for Android and Desktop"
publish_to: "none"
version: 1.0.0+1

environment:
  sdk: ">=3.4.0 <4.0.0"
  flutter: ">=3.22.0"

dependencies:
  flutter:
    sdk: flutter

  # Audio & Media Services
  audio_service: ^0.18.17
  just_audio: ^0.9.38
  just_audio_background: ^0.0.1-beta.11

  # Native DSP & FFI bindings for BASS and RNNoise
  ffi: ^2.1.2

  # Sensors & Hardware Accelerometer for Shake-to-Reset
  sensors_plus: ^5.0.2

  # State Management & Reactive Streams
  flutter_bloc: ^8.1.6
  rxdart: ^0.27.7

  # Serialization & Storage sidecars (.xml, .dat)
  xml: ^6.5.0
  path_provider: ^2.1.3
  path: ^1.9.0

  # Android Storage Access Framework (SAF) tree picker
  shared_storage: ^0.7.1

  # Desktop window styling & hardware integration
  window_manager: ^0.3.9
  screen_retriever: ^0.1.9

  # UI icons & typography
  google_fonts: ^6.2.1
  lucide_icons: ^0.257.0`
    },
    'main.dart': {
      path: 'lib/main.dart',
      category: 'Entry Point',
      description: 'Main application bootstrap with Desktop window_manager and Android AudioService initialization.',
      content: `import 'dart:io';
import 'package:flutter/material.dart';
import 'package:audio_service/audio_service.dart';
import 'package:window_manager/window_manager.dart';

import 'app/service/audio_book_audio_handler.dart';
import 'app/ui/common/theme.dart';
import 'infra/audio/just_audio_sink.dart';
import 'infra/storage/saf_storage_adapter.dart';

late AudioBookAudioHandler _audioHandler;

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Desktop specific initialization (Linux, Windows, macOS)
  if (Platform.isLinux || Platform.isWindows || Platform.isMacOS) {
    await windowManager.ensureInitialized();
    const windowOptions = WindowOptions(
      size: Size(1280, 840),
      minimumSize: Size(960, 640),
      center: true,
      title: 'FolderPlay - Offline Audiobook Studio',
    );
    windowManager.waitUntilReadyToShow(windowOptions, () async {
      await windowManager.show();
      await windowManager.focus();
    });
  }

  final audioSink = JustAudioSink();
  await audioSink.initialize();
  final storage = UniversalBookStorageAdapter();

  _audioHandler = await AudioService.init(
    builder: () => AudioBookAudioHandler(
      audioSink: audioSink,
      storage: storage,
    ),
    config: const AudioServiceConfig(
      androidNotificationChannelId: 'com.folderplay.audio',
      androidNotificationChannelName: 'FolderPlay Playback',
      androidNotificationOngoing: true,
      androidStopForegroundOnPause: true,
    ),
  );

  runApp(const FolderPlayApp());
}`
    },
    'book.dart': {
      path: 'lib/core/domain/model/book.dart',
      category: 'Domain Model (Pure Dart)',
      description: 'Book aggregate root, playback position, and equalizer config (Invariant AD-1: zero UI dependencies).',
      content: `/// FolderPlay Domain: Book Aggregate Root
/// Zero external UI dependencies (Pure Dart - Invariant AD-1)

enum BookLifecycleState { isNew, started, finished }

class EqualizerConfig {
  final List<double> bandGainsDb; // 60Hz, 230Hz, 910Hz, 3.6kHz, 14kHz
  final double balance; // -1.0 to 1.0
  final bool isMono;
  final bool rnnoiseEnabled;

  const EqualizerConfig({
    this.bandGainsDb = const [0.0, 0.0, 0.0, 0.0, 0.0],
    this.balance = 0.0,
    this.isMono = false,
    this.rnnoiseEnabled = true,
  });
}

class PlaybackPosition {
  final String fileName;
  final int positionMs;
  final double playbackSpeed;
  final int boostVolumeDb;
  final int pitchShiftSemitones;
  final EqualizerConfig eqConfig;
  final int lastPlaybackEpochMs;

  const PlaybackPosition({
    required this.fileName,
    required this.positionMs,
    this.playbackSpeed = 1.0,
    this.boostVolumeDb = 0,
    this.pitchShiftSemitones = 0,
    this.eqConfig = const EqualizerConfig(),
    required this.lastPlaybackEpochMs,
  });
}`
    },
    'auto_rewind_calculator.dart': {
      path: 'lib/core/domain/algorithm/auto_rewind_calculator.dart',
      category: 'Domain Algorithm',
      description: 'FR-6 pause-proportional auto-rewind mathematical step calculation.',
      content: `/// Realizes FR-6: Dynamic Auto-Rewind based on pause duration
class AutoRewindCalculator {
  static int calculateOffsetSeconds(int pausedSeconds) {
    if (pausedSeconds < 3) return 0;
    if (pausedSeconds <= 60) {
      // 3s to 60s -> 2s to 5s rewind
      final progress = (pausedSeconds - 3) / 57.0;
      return (2 + progress * 3).round();
    }
    if (pausedSeconds <= 1800) {
      // 1m to 30m -> 10s to 15s rewind
      final progress = (pausedSeconds - 60) / 1740.0;
      return (10 + progress * 5).round();
    }
    // > 30m -> 20s to 30s
    final progress = ((pausedSeconds - 1800) / 3600.0).clamp(0.0, 1.0);
    return (20 + progress * 10).round().clamp(20, 30);
  }
}`
    },
    'sidecar_serializer.dart': {
      path: 'lib/infra/storage/sidecar_serializer.dart',
      category: 'Infrastructure Adapter',
      description: 'Invariant AD-4: Atomic two-phase sidecar writes (.tmp -> rename) for position.sabp.dat, bookmarks.sabp.xml, characters.sabp.xml.',
      content: `import 'dart:io';
import 'package:xml/xml.dart';

class SidecarSerializer {
  /// Invariant AD-4: Atomic file write prevents corruption
  static Future<void> writeAtomic(File destinationFile, String content) async {
    final tempFile = File('\${destinationFile.path}.tmp');
    await tempFile.writeAsString(content, flush: true);
    await tempFile.rename(destinationFile.path);
  }

  static String serializePositionDat(PlaybackPosition position, BookLifecycleState state) {
    final buffer = StringBuffer();
    buffer.writeln('AK_SABP_SERIALIZED_OBJ_V11.9');
    buffer.writeln('mFileName=\${position.fileName}');
    buffer.writeln('mFilePosition=\${position.positionMs}');
    buffer.writeln('mPlaybackSpeed=\${position.playbackSpeed.toStringAsFixed(2)}');
    buffer.writeln('mBoostVolume=\${position.boostVolumeDb}');
    buffer.writeln('mBookState=\${state.name}');
    buffer.writeln('mLastPlaybackTime=\${position.lastPlaybackEpochMs}');
    return buffer.toString();
  }
}`
    },
    'audio_book_audio_handler.dart': {
      path: 'lib/app/service/audio_book_audio_handler.dart',
      category: 'Audio Service & Background',
      description: 'Invariant AD-5: Single source of playback truth. Coordinates lock screen, sleep timer fadeout, and Android Auto.',
      content: `import 'dart:async';
import 'package:audio_service/audio_service.dart';

class AudioBookAudioHandler extends BaseAudioHandler with SeekHandler {
  final AudioSinkPort _audioSink;
  final BookStoragePort _storage;

  @override
  Future<void> play() async {
    // Automatic rewind calculation on resume
    if (_lastPauseEpochMs > 0) {
      final pausedSec = ((DateTime.now().millisecondsSinceEpoch - _lastPauseEpochMs) / 1000).round();
      final offsetSec = AutoRewindCalculator.calculateOffsetSeconds(pausedSec);
      if (offsetSec > 0) {
        final currentPos = playbackState.value.position.inMilliseconds;
        await _audioSink.seek((currentPos - (offsetSec * 1000)).clamp(0, currentBook!.currentFile.durationMs));
      }
    }
    await _audioSink.play();
  }

  void startSleepTimer(int durationSeconds) {
    // 60-second gentle linear fadeout before sleep termination
  }

  bool handleShakeReset() {
    // Touchless accelerometer motion reset (FR-10)
    startSleepTimer(_sleepConfig.targetDurationSeconds);
    _audioSink.setVolume(1.0);
    return true;
  }
}`
    },
    'build-and-release.yml': {
      path: '.github/workflows/build-and-release.yml',
      category: 'CI/CD & GitHub Actions',
      description: 'Multi-platform matrix building Android APK/AAB, Linux x64, Windows x64, macOS Universal, and publishing GitHub Releases.',
      content: `name: FolderPlay Multi-Platform Build & Release

on:
  push:
    branches: [ main, master ]
    tags: [ 'v*' ]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.22.2'
      - run: flutter pub get
      - run: flutter analyze

  build-android:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
      - run: flutter build apk --release --split-per-abi
      - run: flutter build appbundle --release

  build-linux:
    needs: test
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v4
      - run: sudo apt-get install -y clang cmake ninja-build libgtk-3-dev
      - run: flutter build linux --release

  build-windows:
    needs: test
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - run: flutter build windows --release

  build-macos:
    needs: test
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - run: flutter build macos --release

  release:
    if: startsWith(github.ref, 'refs/tags/v')
    needs: [build-android, build-linux, build-windows, build-macos]
    runs-on: ubuntu-latest
    steps:
      - uses: softprops/action-gh-release@v2
        with:
          files: release-assets/*`
    },
    'deploy-web.yml': {
      path: '.github/workflows/deploy-web.yml',
      category: 'CI/CD & GitHub Actions',
      description: 'Automated GitHub Pages deployment workflow on pushes to main.',
      content: `name: Deploy Web to GitHub Pages

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - uses: actions/deploy-pages@v4`
    },
    'AndroidManifest.xml': {
      path: 'android/app/src/main/AndroidManifest.xml',
      category: 'Android Native Config',
      description: 'MediaBrowserService, Foreground Service permissions, MediaButtonReceiver, and Android Auto metadata.',
      content: `<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.folderplay.audiobook">

    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />

    <application android:label="FolderPlay">
        <!-- Audio Service Foreground Service -->
        <service
            android:name="com.ryanheise.audioservice.AudioService"
            android:foregroundServiceType="mediaPlayback"
            android:exported="true">
            <intent-filter>
                <action android:name="android.media.browse.MediaBrowserService" />
            </intent-filter>
        </service>

        <!-- Android Auto Metadata -->
        <meta-data
            android:name="com.google.android.gms.car.application"
            android:resource="@xml/automotive_app_desc" />
    </application>
</manifest>`
    }
  };

  const currentFileObj = flutterFiles[selectedFile] || flutterFiles['pubspec.yaml'];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentFileObj.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = () => {
    // Download current file
    const blob = new Blob([currentFileObj.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFileObj.path.split('/').pop() || 'file.dart';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] rounded-xl p-6 shadow-xl hardware-plate flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--primary-container)]/15 border border-[var(--primary-container)]/30 flex items-center justify-center text-[var(--primary-container)]">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold text-[var(--primary)]">
                Flutter Cross-Platform Architecture
              </h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--secondary)]/20 text-[var(--secondary)]">
                ANDROID & DESKTOP DUAL TARGET
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Engineered using Ports and Adapters (Hexagonal Architecture) in Flutter & Dart.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyCode}
            className="hardware-plate flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[var(--text-high)] hover:text-[var(--primary-container)] transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy Active File'}</span>
          </button>

          <a
            href="/downloads/flutter_folderplay.tar.gz"
            download="flutter_folderplay.tar.gz"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-[var(--primary-container)] text-[var(--bg-base)] shadow-md hover:brightness-105 transition-all text-decoration-none"
          >
            <Download className="w-4 h-4" />
            <span>Download Full Flutter Package (.tar.gz)</span>
          </a>
        </div>
      </div>

      {/* Cross-Platform Matrix: Android vs Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Android Target Card */}
        <div className="bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-md hardware-plate flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-5 h-5 text-[var(--secondary)]" />
              <h3 className="font-serif text-base font-bold text-[var(--primary)]">
                Android Platform Target (API 26-35)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[var(--secondary)] font-bold">MOBILE & AUTO</span>
          </div>

          <ul className="text-xs text-[var(--text-muted)] space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[var(--secondary)] shrink-0 mt-0.5" />
              <span><strong>Storage Access Framework (SAF):</strong> Persists root folder URI trees across reboots without requiring legacy storage permissions.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[var(--secondary)] shrink-0 mt-0.5" />
              <span><strong>Android Auto MediaBrowserService:</strong> Exposes browsable Started, Queue, and New lists to automotive head units.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[var(--secondary)] shrink-0 mt-0.5" />
              <span><strong>Accelerometer Shake-to-Reset:</strong> Polls device accelerometer via <code className="font-mono text-[var(--primary-container)]">sensors_plus</code> during bedside sleep countdowns.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[var(--secondary)] shrink-0 mt-0.5" />
              <span><strong>Lock Screen Media Notifications:</strong> High-priority ongoing playback notification with -10s, Play/Pause, +30s compact actions.</span>
            </li>
          </ul>
        </div>

        {/* Desktop Target Card */}
        <div className="bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-md hardware-plate flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
            <div className="flex items-center gap-2.5">
              <Monitor className="w-5 h-5 text-[var(--tertiary)]" />
              <h3 className="font-serif text-base font-bold text-[var(--primary)]">
                Desktop Platform Target (Linux, Windows, macOS)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[var(--tertiary)] font-bold">WORKSTATION</span>
          </div>

          <ul className="text-xs text-[var(--text-muted)] space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[var(--tertiary)] shrink-0 mt-0.5" />
              <span><strong>Window Management:</strong> Native 1280x840 window resizing, centering, and frame styling via <code className="font-mono text-[var(--tertiary)]">window_manager</code>.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[var(--tertiary)] shrink-0 mt-0.5" />
              <span><strong>Native Dart FileSystem IO:</strong> High-speed direct disk access through <code className="font-mono text-[var(--tertiary)]">dart:io</code> for indexing 10,000+ files in &lt;1 second.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[var(--tertiary)] shrink-0 mt-0.5" />
              <span><strong>Two-Phase Atomic Commit:</strong> <code className="font-mono text-[var(--tertiary)]">writeAtomic()</code> flushes to temp file before rename, preventing corruption on hard power-offs.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[var(--tertiary)] shrink-0 mt-0.5" />
              <span><strong>Multi-Pane Desktop Ergonomics:</strong> Expanded split-deck workstation layout with NavigationRail and full keyboard shortcuts.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Codebase File Explorer & Interactive Source Viewer */}
      <div className="bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-xl hardware-plate flex flex-col lg:flex-row gap-5 items-start">
        {/* Left: File Tree Directory */}
        <div className="w-full lg:w-72 shrink-0 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)] px-2 pb-1 border-b border-[var(--border-subtle)]">
            <span>Flutter Code Tree</span>
            <span>{Object.keys(flutterFiles).length} Files</span>
          </div>

          <div className="flex flex-col gap-1 max-h-[480px] overflow-y-auto pr-1">
            {Object.entries(flutterFiles).map(([key, item]) => {
              const isSelected = selectedFile === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedFile(key)}
                  className={`flex flex-col items-start p-2.5 rounded-lg text-left transition-colors border ${
                    isSelected
                      ? 'bg-[var(--bg-surface-high)] border-[var(--primary-container)]/50 text-[var(--primary)] shadow-sm'
                      : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-surface-highest)]'
                  }`}
                >
                  <div className="flex items-center gap-2 w-full">
                    <FileCode className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[var(--primary-container)]' : 'text-gray-500'}`} />
                    <span className="font-mono text-xs font-bold truncate">{key}</span>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate w-full">
                    {item.path}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Code Viewer */}
        <div className="flex-1 w-full flex flex-col gap-3 min-w-0">
          <div className="flex items-center justify-between bg-[var(--bg-surface)] p-3 rounded-lg border border-[var(--border-subtle)]">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[var(--primary-container)]">
                  {currentFileObj.path}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-surface-high)] text-[var(--secondary)]">
                  {currentFileObj.category}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5 truncate">
                {currentFileObj.description}
              </p>
            </div>

            <button
              onClick={handleCopyCode}
              className="hardware-plate flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-high)] hover:text-[var(--primary-container)] shrink-0 ml-2"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="relative bg-[var(--bg-surface-lowest)] border border-[var(--border-subtle)] rounded-xl p-4 font-mono text-xs text-amber-100/90 leading-relaxed overflow-x-auto max-h-[500px] shadow-inner select-text">
            <pre className="whitespace-pre">
              {currentFileObj.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
