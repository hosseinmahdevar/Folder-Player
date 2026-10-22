/// FolderPlay Main Entry Point (Android & Desktop)
/// Clean-Room Reconstruction of Smart AudioBook Player v11.9.0

import 'dart:io';
import 'package:flutter/material.dart';
import 'package:audio_service/audio_service.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:window_manager/window_manager.dart';

import 'app/service/audio_book_audio_handler.dart';
import 'app/ui/common/theme.dart';
import 'core/domain/model/book.dart';
import 'core/domain/model/audio_file.dart';
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

  // Initialize Audio Handler singleton
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
}

class FolderPlayApp extends StatelessWidget {
  const FolderPlayApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FolderPlay',
      debugShowCheckedModeBanner: false,
      theme: FolderPlayTheme.darkTheme,
      home: const MainStudioShell(),
    );
  }
}

class MainStudioShell extends StatefulWidget {
  const MainStudioShell({super.key});

  @override
  State<MainStudioShell> createState() => _MainStudioShellState();
}

class _MainStudioShellState extends State<MainStudioShell> {
  int _selectedIndex = 0;

  // Mock initial book for immediate playability
  late Book _activeBook;

  @override
  void initState() {
    super.initState();
    _activeBook = const Book(
      id: 'wok-01',
      title: 'The Way of Kings',
      author: 'Brandon Sanderson',
      narrator: 'Michael Kramer & Kate Reading',
      series: 'The Stormlight Archive',
      seriesNumber: 'Vol. I',
      folderPath: '/storage/emulated/0/Audiobooks/The_Way_of_Kings',
      state: BookLifecycleState.started,
      totalDurationMs: 163800000,
      files: [
        AudioFile(
          fileName: '018_The_Way_of_Kings_Ch24.mp3',
          path: '/storage/emulated/0/Audiobooks/The_Way_of_Kings/018_The_Way_of_Kings_Ch24.mp3',
          displayName: 'Chapter 24: The Bright Side',
          durationMs: 3940000,
          bitrate: 'CBR 256 kbps',
          sampleRate: '44.1 kHz',
          fileSizeMb: 74.2,
        ),
      ],
      lastPosition: PlaybackPosition(
        fileName: '018_The_Way_of_Kings_Ch24.mp3',
        positionMs: 1118200,
        playbackSpeed: 1.15,
        boostVolumeDb: 4,
        lastPlaybackEpochMs: 1729598400000,
      ),
    );

    _audioHandler.loadBook(_activeBook);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const Icon(Icons.folder_special, color: FolderPlayTheme.amberGold),
            const SizedBox(width: 8),
            Text(
              'FolderPlay',
              style: GoogleFonts.literata(fontWeight: FontWeight.bold, fontSize: 20),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: FolderPlayTheme.surfaceHigh,
                borderRadius: BorderRadius.circular(4),
                border: Border.all(color: FolderPlayTheme.borderSubtle),
              ),
              child: const Text('DSP+', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: FolderPlayTheme.amberGold)),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.bedtime, color: FolderPlayTheme.studioEmerald),
            tooltip: 'Sleep Timer',
            onPressed: () => _showSleepTimerDialog(context),
          ),
          IconButton(
            icon: const Icon(Icons.tune, color: FolderPlayTheme.calibrationCyan),
            tooltip: 'Sound Shaping DSP',
            onPressed: () => _showSoundShapingDialog(context),
          ),
        ],
      ),
      body: Row(
        children: [
          // Navigation rail for Desktop
          if (MediaQuery.of(context).size.width > 768)
            NavigationRail(
              selectedIndex: _selectedIndex,
              onDestinationSelected: (idx) => setState(() => _selectedIndex = idx),
              labelType: NavigationRailLabelType.all,
              backgroundColor: FolderPlayTheme.surfaceLowest,
              destinations: const [
                NavigationRailDestination(icon: Icon(Icons.play_circle_outline), selectedIcon: Icon(Icons.play_circle), label: Text('Now Playing')),
                NavigationRailDestination(icon: Icon(Icons.library_books_outlined), selectedIcon: Icon(Icons.library_books), label: Text('Library')),
                NavigationRailDestination(icon: Icon(Icons.people_outline), selectedIcon: Icon(Icons.people), label: Text('Characters')),
                NavigationRailDestination(icon: Icon(Icons.directions_car_outlined), selectedIcon: Icon(Icons.directions_car), label: Text('Car Mode')),
              ],
            ),

          Expanded(
            child: _buildBody(),
          ),
        ],
      ),
      bottomNavigationBar: MediaQuery.of(context).size.width <= 768
          ? NavigationBar(
              selectedIndex: _selectedIndex,
              onDestinationSelected: (idx) => setState(() => _selectedIndex = idx),
              backgroundColor: FolderPlayTheme.surfaceLowest,
              destinations: const [
                NavigationDestination(icon: Icon(Icons.play_circle_outline), selectedIcon: Icon(Icons.play_circle), label: 'Now Playing'),
                NavigationDestination(icon: Icon(Icons.library_books_outlined), selectedIcon: Icon(Icons.library_books), label: 'Library'),
                NavigationDestination(icon: Icon(Icons.people_outline), selectedIcon: Icon(Icons.people), label: 'Characters'),
                NavigationDestination(icon: Icon(Icons.directions_car_outlined), selectedIcon: Icon(Icons.directions_car), label: 'Car Mode'),
              ],
            )
          : null,
    );
  }

  Widget _buildBody() {
    switch (_selectedIndex) {
      case 0:
        return _buildNowPlayingView();
      case 1:
        return _buildLibraryView();
      case 2:
        return _buildCharactersView();
      case 3:
        return _buildCarModeView();
      default:
        return _buildNowPlayingView();
    }
  }

  Widget _buildNowPlayingView() {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 800),
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Tome Cover Card
              Container(
                width: 180,
                height: 240,
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.6), blurRadius: 20, offset: const Offset(0, 10)),
                  ],
                  border: Border.all(color: FolderPlayTheme.borderSubtle),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('⚡', style: TextStyle(fontSize: 48)),
                    const SizedBox(height: 12),
                    Text(
                      _activeBook.title,
                      textAlign: TextAlign.center,
                      style: GoogleFonts.literata(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.amber[100]),
                    ),
                    const SizedBox(height: 4),
                    Text(_activeBook.author, style: const TextStyle(fontSize: 12, color: Colors.white70)),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              Text(
                _activeBook.title,
                style: GoogleFonts.literata(fontSize: 24, fontWeight: FontWeight.bold, color: FolderPlayTheme.textParchment),
              ),
              Text(
                'Chapter 24: The Bright Side',
                style: GoogleFonts.manrope(fontSize: 14, color: FolderPlayTheme.textMuted),
              ),

              const SizedBox(height: 32),

              // Transport Controls
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  IconButton(
                    iconSize: 42,
                    icon: const Icon(Icons.replay_10, color: FolderPlayTheme.textParchment),
                    onPressed: () => _audioHandler.rewind(),
                  ),
                  const SizedBox(width: 24),
                  StreamBuilder<PlaybackState>(
                    stream: _audioHandler.playbackState,
                    builder: (context, snapshot) {
                      final isPlaying = snapshot.data?.playing ?? false;
                      return Container(
                        width: 76,
                        height: 76,
                        decoration: BoxDecoration(
                          color: FolderPlayTheme.amberGold,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(color: FolderPlayTheme.amberGold.withOpacity(0.3), blurRadius: 16),
                          ],
                        ),
                        child: IconButton(
                          iconSize: 40,
                          icon: Icon(isPlaying ? Icons.pause : Icons.play_arrow, color: Colors.black),
                          onPressed: () => isPlaying ? _audioHandler.pause() : _audioHandler.play(),
                        ),
                      );
                    },
                  ),
                  const SizedBox(width: 24),
                  IconButton(
                    iconSize: 42,
                    icon: const Icon(Icons.forward_30, color: FolderPlayTheme.textParchment),
                    onPressed: () => _audioHandler.fastForward(),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLibraryView() {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        Text('Library Folders (SAF & Local)', style: GoogleFonts.literata(fontSize: 22, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        Card(
          child: ListTile(
            leading: const Icon(Icons.folder, color: FolderPlayTheme.amberGold),
            title: Text(_activeBook.title),
            subtitle: Text('${_activeBook.author} · Started (31%)'),
            trailing: const Icon(Icons.play_arrow),
            onTap: () => setState(() => _selectedIndex = 0),
          ),
        ),
      ],
    );
  }

  Widget _buildCharactersView() {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        Text('Character Cast (characters.sabp.xml)', style: GoogleFonts.literata(fontSize: 22, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        const Card(
          child: ListTile(
            title: Text('Kaladin Stormblessed', style: TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text('Bridge Four Leader & Former Surgeon Apprentice'),
          ),
        ),
        const Card(
          child: ListTile(
            title: Text('Dalinar Kholin', style: TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text('Highprince of War / The Blackthorn'),
          ),
        ),
      ],
    );
  }

  Widget _buildCarModeView() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.directions_car, size: 64, color: FolderPlayTheme.amberGold),
          const SizedBox(height: 16),
          Text('Car Mode Active', style: GoogleFonts.manrope(fontSize: 28, fontWeight: FontWeight.bold)),
          const Text('Sleep timer auto-inhibited for safety', style: TextStyle(color: FolderPlayTheme.studioEmerald)),
          const SizedBox(height: 32),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: FolderPlayTheme.amberGold,
              foregroundColor: Colors.black,
              minimumSize: const Size(200, 60),
            ),
            onPressed: () => _audioHandler.play(),
            child: const Text('RESUME PLAYBACK', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _showSleepTimerDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: FolderPlayTheme.surfaceLow,
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Bedtime Sleep Timer', style: GoogleFonts.literata(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text('Fadeout in final 60s · Touchless Shake-to-Reset active'),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                ElevatedButton(onPressed: () => _audioHandler.startSleepTimer(900), child: const Text('15m')),
                ElevatedButton(onPressed: () => _audioHandler.startSleepTimer(1800), child: const Text('30m')),
                ElevatedButton(onPressed: () => _audioHandler.startSleepTimer(2700), child: const Text('45m')),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showSoundShapingDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: FolderPlayTheme.surfaceLow,
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Sound Shaping DSP', style: GoogleFonts.literata(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            const Text('Continuous Speed (0.5x–3.0x), RNNoise Speech Denoiser, +20dB Boost'),
            const SizedBox(height: 20),
            ElevatedButton(onPressed: () => Navigator.pop(ctx), child: const Text('Done')),
          ],
        ),
      ),
    );
  }
}
