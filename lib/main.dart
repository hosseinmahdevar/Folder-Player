/// FolderPlay Main Entry Point (Android & Desktop)
/// Clean-Room Reconstruction of Smart AudioBook Player v11.9.0

import 'dart:io';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:audio_service/audio_service.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:window_manager/window_manager.dart';

import 'app/service/audio_book_audio_handler.dart';
import 'app/ui/common/theme.dart';
import 'core/domain/model/book.dart';
import 'core/domain/model/audio_file.dart';
import 'infra/audio/just_audio_sink.dart';
import 'infra/storage/saf_storage_adapter.dart';

late AudioBookAudioHandler _audioHandler;
final UniversalBookStorageAdapter _storageAdapter = UniversalBookStorageAdapter();

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Desktop specific initialization (Linux, Windows, macOS)
  if (Platform.isLinux || Platform.isWindows || Platform.isMacOS) {
    try {
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
    } catch (_) {}
  }

  // Initialize Audio Handler singleton
  try {
    final audioSink = JustAudioSink();
    await audioSink.initialize();

    _audioHandler = await AudioService.init(
      builder: () => AudioBookAudioHandler(
        audioSink: audioSink,
        storage: _storageAdapter,
      ),
      config: const AudioServiceConfig(
        androidNotificationChannelId: 'com.folderplay.audio',
        androidNotificationChannelName: 'FolderPlay Playback',
        androidNotificationOngoing: true,
        androidStopForegroundOnPause: true,
      ),
    );
  } catch (e) {
    debugPrint('AudioService init fallback: $e');
  }

  runApp(const FolderPlayApp());
}

class FolderPlayApp extends StatefulWidget {
  const FolderPlayApp({super.key});

  @override
  State<FolderPlayApp> createState() => _FolderPlayAppState();
}

class _FolderPlayAppState extends State<FolderPlayApp> {
  AppThemeMode _currentTheme = AppThemeMode.nocturne;

  @override
  void initState() {
    super.initState();
    _loadTheme();
  }

  Future<void> _loadTheme() async {
    final prefs = await SharedPreferences.getInstance();
    final idx = prefs.getInt('folderplay_theme_mode') ?? 0;
    if (idx >= 0 && idx < AppThemeMode.values.length) {
      setState(() => _currentTheme = AppThemeMode.values[idx]);
    }
  }

  Future<void> _changeTheme(AppThemeMode mode) async {
    setState(() => _currentTheme = mode);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('folderplay_theme_mode', mode.index);
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FolderPlay',
      debugShowCheckedModeBanner: false,
      theme: FolderPlayTheme.getTheme(_currentTheme),
      home: MainStudioShell(
        currentTheme: _currentTheme,
        onThemeChanged: _changeTheme,
      ),
    );
  }
}

class MainStudioShell extends StatefulWidget {
  final AppThemeMode currentTheme;
  final ValueChanged<AppThemeMode> onThemeChanged;

  const MainStudioShell({
    super.key,
    required this.currentTheme,
    required this.onThemeChanged,
  });

  @override
  State<MainStudioShell> createState() => _MainStudioShellState();
}

class _MainStudioShellState extends State<MainStudioShell> {
  int _selectedIndex = 0;

  // Mock initial book for immediate playability
  late Book _activeBook;
  final List<Book> _libraryBooks = [];
  final List<String> _customFolderPaths = [];
  bool _isScanning = false;

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

    _libraryBooks.add(_activeBook);

    _loadPersistedFolders();

    // Safely load initial book metadata without blocking UI initialization
    try {
      _audioHandler.loadBook(_activeBook);
    } catch (_) {}
  }

  Future<void> _loadPersistedFolders() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedFolders = prefs.getStringList('folderplay_saved_folders') ?? [];
      if (savedFolders.isEmpty) return;

      setState(() => _isScanning = true);
      for (final folderPath in savedFolders) {
        if (!_customFolderPaths.contains(folderPath)) {
          _customFolderPaths.add(folderPath);
        }
        final single = await _storageAdapter.scanSingleBookDirectory(folderPath);
        if (single != null && single.files.isNotEmpty) {
          if (!_libraryBooks.any((b) => b.folderPath == single.folderPath)) {
            _libraryBooks.add(single);
          }
        } else {
          final subDirs = await _storageAdapter.scanRootFolders([folderPath]);
          for (final b in subDirs) {
            if (!_libraryBooks.any((existing) => existing.folderPath == b.folderPath)) {
              _libraryBooks.add(b);
            }
          }
        }
      }
      setState(() => _isScanning = false);
    } catch (_) {
      setState(() => _isScanning = false);
    }
  }

  Future<bool> _requestAndroidStoragePermissions() async {
    if (!Platform.isAndroid) return true;

    // 1. Audio permission for Android 13+ (API 33+)
    final audioStatus = await Permission.audio.request();
    if (audioStatus.isGranted) return true;

    // 2. Standard storage permission for Android 12 and below
    final storageStatus = await Permission.storage.request();
    if (storageStatus.isGranted) return true;

    // 3. All files access fallback for Android 11+ custom external folders
    if (await Permission.manageExternalStorage.isRestricted == false) {
      final manageStatus = await Permission.manageExternalStorage.request();
      if (manageStatus.isGranted) return true;
    }

    return false;
  }

  Future<String?> _showManualPathInputDialog(BuildContext context) async {
    final controller = TextEditingController();
    return showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Theme.of(context).cardTheme.color ?? FolderPlayTheme.surfaceLow,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            const Icon(Icons.folder_open, color: FolderPlayTheme.amberGold),
            const SizedBox(width: 8),
            Text(
              'Enter Folder Path',
              style: GoogleFonts.literata(fontSize: 18, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'System dialog tool (zenity/kdialog) was not found. Please enter or paste the full directory path to your audiobook(s):',
              style: TextStyle(fontSize: 13, color: Colors.grey),
            ),
            const SizedBox(height: 16),
            TextField(
              key: const Key('input_manual_path'),
              controller: controller,
              autofocus: true,
              decoration: InputDecoration(
                hintText: Platform.isWindows ? 'C:\\Audiobooks\\MyBook' : '/home/user/Audiobooks/MyBook',
                hintStyle: const TextStyle(color: Colors.grey, fontSize: 13),
                filled: true,
                fillColor: FolderPlayTheme.surfaceLowest,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(color: FolderPlayTheme.borderSubtle),
                ),
                prefixIcon: const Icon(Icons.folder, size: 20),
              ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              children: [
                ActionChip(
                  label: const Text('~/Audiobooks', style: TextStyle(fontSize: 11)),
                  onPressed: () {
                    final home = Platform.environment['HOME'] ?? Platform.environment['USERPROFILE'] ?? '';
                    controller.text = '$home${Platform.pathSeparator}Audiobooks';
                  },
                ),
                ActionChip(
                  label: const Text('~/Downloads', style: TextStyle(fontSize: 11)),
                  onPressed: () {
                    final home = Platform.environment['HOME'] ?? Platform.environment['USERPROFILE'] ?? '';
                    controller.text = '$home${Platform.pathSeparator}Downloads';
                  },
                ),
                ActionChip(
                  label: const Text('~/Music', style: TextStyle(fontSize: 11)),
                  onPressed: () {
                    final home = Platform.environment['HOME'] ?? Platform.environment['USERPROFILE'] ?? '';
                    controller.text = '$home${Platform.pathSeparator}Music';
                  },
                ),
              ],
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, null),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            key: const Key('btn_confirm_add_folder'),
            style: ElevatedButton.styleFrom(
              backgroundColor: FolderPlayTheme.amberGold,
              foregroundColor: Colors.black,
            ),
            onPressed: () {
              final text = controller.text.trim();
              if (text.isNotEmpty) {
                Navigator.pop(ctx, text);
              }
            },
            child: const Text('Add Folder', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Future<void> _pickAndAddCustomFolder() async {
    try {
      if (Platform.isAndroid) {
        final hasPermission = await _requestAndroidStoragePermissions();
        if (!hasPermission && mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Storage permission required to read audiobook folders.'),
              action: SnackBarAction(
                label: 'Settings',
                onPressed: () => openAppSettings(),
              ),
              backgroundColor: Colors.orange,
            ),
          );
        }
      }

      String? selectedDirectory;
      try {
        selectedDirectory = await FilePicker.platform.getDirectoryPath(
          dialogTitle: 'Select Audiobook Folder or Root Library',
        );
      } catch (pickerError) {
        debugPrint('Native file picker error (e.g. missing zenity/kdialog): $pickerError');
        // Fallback to manual folder path input dialog if native dialog executable is missing
        if (mounted && (Platform.isLinux || Platform.isWindows || Platform.isMacOS)) {
          selectedDirectory = await _showManualPathInputDialog(context);
        }
      }

      if (selectedDirectory == null || selectedDirectory.isEmpty) return;

      await _processAddedDirectory(selectedDirectory);
    } catch (e) {
      setState(() => _isScanning = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to add folder: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _processAddedDirectory(String selectedDirectory) async {
    try {
      setState(() => _isScanning = true);

      // 1. Try scanning as single book directory
      final singleBook = await _storageAdapter.scanSingleBookDirectory(selectedDirectory);
      final newBooks = <Book>[];

      if (singleBook != null && singleBook.files.isNotEmpty) {
        newBooks.add(singleBook);
      } else {
        // 2. Scan as root folder containing subdirectories of audiobooks
        final scannedSubDirs = await _storageAdapter.scanRootFolders([selectedDirectory]);
        newBooks.addAll(scannedSubDirs);
      }

      setState(() {
        if (!_customFolderPaths.contains(selectedDirectory)) {
          _customFolderPaths.add(selectedDirectory);
        }
        for (final b in newBooks) {
          if (!_libraryBooks.any((existing) => existing.folderPath == b.folderPath)) {
            _libraryBooks.add(b);
          }
        }
        _isScanning = false;
      });

      // Persist chosen folder paths
      final prefs = await SharedPreferences.getInstance();
      await prefs.setStringList('folderplay_saved_folders', _customFolderPaths);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              newBooks.isEmpty
                  ? 'No audio files found in selected folder.'
                  : 'Added ${newBooks.length} audiobook(s) to Library.',
            ),
            backgroundColor: newBooks.isEmpty ? Colors.orange : FolderPlayTheme.studioEmerald,
          ),
        );
      }
    } catch (e) {
      setState(() => _isScanning = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to scan folder: $e'), backgroundColor: Colors.red),
        );
      }
    }
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
            key: const Key('btn_action_manual_path'),
            icon: const Icon(Icons.folder_open, color: FolderPlayTheme.amberGold),
            tooltip: 'Enter Folder Path Manually',
            onPressed: () async {
              final path = await _showManualPathInputDialog(context);
              if (path != null && path.isNotEmpty) {
                _processAddedDirectory(path);
              }
            },
          ),
          IconButton(
            key: const Key('btn_action_theme'),
            icon: const Icon(Icons.palette_outlined, color: FolderPlayTheme.amberGold),
            tooltip: 'Switch Theme',
            onPressed: () => _showThemePickerDialog(context),
          ),
          IconButton(
            key: const Key('btn_action_sleep'),
            icon: const Icon(Icons.bedtime, color: FolderPlayTheme.studioEmerald),
            tooltip: 'Sleep Timer',
            onPressed: () => _showSleepTimerDialog(context),
          ),
          IconButton(
            key: const Key('btn_action_dsp'),
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
                NavigationRailDestination(
                  key: Key('rail_dest_now_playing'),
                  icon: Icon(Icons.play_circle_outline),
                  selectedIcon: Icon(Icons.play_circle),
                  label: Text('Now Playing'),
                ),
                NavigationRailDestination(
                  key: Key('rail_dest_library'),
                  icon: Icon(Icons.library_books_outlined),
                  selectedIcon: Icon(Icons.library_books),
                  label: Text('Library'),
                ),
                NavigationRailDestination(
                  key: Key('rail_dest_characters'),
                  icon: Icon(Icons.people_outline),
                  selectedIcon: Icon(Icons.people),
                  label: Text('Characters'),
                ),
                NavigationRailDestination(
                  key: Key('rail_dest_carmode'),
                  icon: Icon(Icons.directions_car_outlined),
                  selectedIcon: Icon(Icons.directions_car),
                  label: Text('Car Mode'),
                ),
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
                NavigationDestination(
                  key: Key('nav_dest_now_playing'),
                  icon: Icon(Icons.play_circle_outline),
                  selectedIcon: Icon(Icons.play_circle),
                  label: 'Now Playing',
                ),
                NavigationDestination(
                  key: Key('nav_dest_library'),
                  icon: Icon(Icons.library_books_outlined),
                  selectedIcon: Icon(Icons.library_books),
                  label: 'Library',
                ),
                NavigationDestination(
                  key: Key('nav_dest_characters'),
                  icon: Icon(Icons.people_outline),
                  selectedIcon: Icon(Icons.people),
                  label: 'Characters',
                ),
                NavigationDestination(
                  key: Key('nav_dest_carmode'),
                  icon: Icon(Icons.directions_car_outlined),
                  selectedIcon: Icon(Icons.directions_car),
                  label: 'Car Mode',
                ),
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
                          key: const Key('btn_play_pause'),
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
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Audiobook Library',
                    style: GoogleFonts.literata(fontSize: 22, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    '${_libraryBooks.length} book(s) available',
                    style: const TextStyle(color: Colors.grey, fontSize: 13),
                  ),
                ],
              ),
            ),
          Row(
            children: [
              OutlinedButton.icon(
                key: const Key('btn_library_path_input'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: FolderPlayTheme.amberGold,
                  side: const BorderSide(color: FolderPlayTheme.borderSubtle),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                ),
                onPressed: _isScanning
                    ? null
                    : () async {
                        final path = await _showManualPathInputDialog(context);
                        if (path != null && path.isNotEmpty) {
                          _processAddedDirectory(path);
                        }
                      },
                icon: const Icon(Icons.edit_note, size: 18),
                label: const Text('Path'),
              ),
              const SizedBox(width: 8),
              ElevatedButton.icon(
                key: const Key('btn_library_browse'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: FolderPlayTheme.amberGold,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                ),
                onPressed: _isScanning ? null : _pickAndAddCustomFolder,
                icon: _isScanning
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                      )
                    : const Icon(Icons.create_new_folder),
                label: Text(_isScanning ? 'Scanning...' : 'Browse'),
              ),
            ],
          ),
          ],
        ),
        const SizedBox(height: 20),
        if (_customFolderPaths.isNotEmpty) ...[
          Text(
            'Custom Configured Folders:',
            style: GoogleFonts.manrope(fontSize: 12, fontWeight: FontWeight.w600, color: FolderPlayTheme.calibrationCyan),
          ),
          const SizedBox(height: 6),
          ..._customFolderPaths.map(
            (p) => Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Text(
                '• $p',
                style: const TextStyle(fontSize: 11, color: Colors.grey, fontFamily: 'monospace'),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ),
          const SizedBox(height: 16),
        ],
        ..._libraryBooks.map(
          (book) => Card(
            margin: const EdgeInsets.only(bottom: 12),
            child: ListTile(
              leading: const Icon(Icons.folder, color: FolderPlayTheme.amberGold, size: 36),
              title: Text(
                book.title,
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              subtitle: Text(
                '${book.author} · ${book.files.length} track(s) · ${(book.totalDurationMs / (1000 * 60)).round()} min',
              ),
              trailing: IconButton(
                icon: const Icon(Icons.play_circle_fill, color: FolderPlayTheme.amberGold, size: 32),
                onPressed: () {
                  setState(() {
                    _activeBook = book;
                    _selectedIndex = 0;
                  });
                  _audioHandler.loadBook(book);
                  _audioHandler.play();
                },
              ),
              onTap: () {
                setState(() {
                  _activeBook = book;
                  _selectedIndex = 0;
                });
                _audioHandler.loadBook(book);
              },
            ),
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

  void _showThemePickerDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Theme.of(context).cardTheme.color ?? FolderPlayTheme.surfaceLow,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.palette, color: FolderPlayTheme.amberGold),
                const SizedBox(width: 8),
                Text(
                  'Select Theme Style',
                  style: GoogleFonts.literata(fontSize: 20, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _buildThemeOption(
              ctx,
              key: const Key('theme_option_nocturne'),
              title: 'OLED Nocturne',
              desc: 'Pure pitch black background with warm parchment typography',
              mode: AppThemeMode.nocturne,
              color: const Color(0xFF070A0E),
              accent: const Color(0xFFFCD34D),
            ),
            _buildThemeOption(
              ctx,
              key: const Key('theme_option_leatherbound'),
              title: 'Leatherbound',
              desc: 'Warm antique sepia tones, bookbinding heritage warmth',
              mode: AppThemeMode.leatherbound,
              color: const Color(0xFF140D0A),
              accent: const Color(0xFFE6B865),
            ),
            _buildThemeOption(
              ctx,
              key: const Key('theme_option_nordic'),
              title: 'Nordic Slate',
              desc: 'Cool oceanic blue-grey palette with icy cyan accents',
              mode: AppThemeMode.nordic,
              color: const Color(0xFF0B1118),
              accent: const Color(0xFF38BDF8),
            ),
            _buildThemeOption(
              ctx,
              key: const Key('theme_option_solar'),
              title: 'Solar High Contrast',
              desc: 'Maximum daylight contrast with golden amber glow',
              mode: AppThemeMode.solar,
              color: const Color(0xFF050505),
              accent: const Color(0xFFF59E0B),
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  Widget _buildThemeOption(
    BuildContext ctx, {
    Key? key,
    required String title,
    required String desc,
    required AppThemeMode mode,
    required Color color,
    required Color accent,
  }) {
    final isSelected = widget.currentTheme == mode;
    return Card(
      key: key,
      margin: const EdgeInsets.only(bottom: 8),
      color: isSelected ? accent.withValues(alpha: 0.15) : null,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
        side: BorderSide(
          color: isSelected ? accent : FolderPlayTheme.borderSubtle,
          width: isSelected ? 1.5 : 1.0,
        ),
      ),
      child: ListTile(
        leading: Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: accent, width: 2),
          ),
          child: isSelected ? Icon(Icons.check, size: 18, color: accent) : null,
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(desc, style: const TextStyle(fontSize: 12)),
        onTap: () {
          widget.onThemeChanged(mode);
          Navigator.pop(ctx);
        },
      ),
    );
  }

  void _showSoundShapingDialog(BuildContext context) {
    double currentSpeed = _activeBook.lastPosition.playbackSpeed;
    double currentBoost = _activeBook.lastPosition.boostVolumeDb.toDouble();
    int currentPitch = _activeBook.lastPosition.pitchShiftSemitones;
    bool monoDownmix = false;
    bool skipSilence = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).cardTheme.color ?? FolderPlayTheme.surfaceLow,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => Padding(
          padding: EdgeInsets.only(
            left: 24.0,
            right: 24.0,
            top: 24.0,
            bottom: MediaQuery.of(context).viewInsets.bottom + 24.0,
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.tune, color: FolderPlayTheme.calibrationCyan),
                        const SizedBox(width: 8),
                        Text(
                          'Sound Shaping & DSP',
                          style: GoogleFonts.literata(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    TextButton(
                      onPressed: () {
                        setModalState(() {
                          currentSpeed = 1.0;
                          currentBoost = 0.0;
                          currentPitch = 0;
                          monoDownmix = false;
                          skipSilence = false;
                        });
                        _audioHandler.setPlaybackSpeed(1.0);
                        _audioHandler.setVolumeBoost(0);
                        _audioHandler.setPitch(0);
                      },
                      child: const Text('Reset Flat'),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Speed Slider
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Playback Speed (0.5x – 3.0x)', style: TextStyle(fontWeight: FontWeight.w600)),
                    Text('${currentSpeed.toStringAsFixed(2)}x', style: const TextStyle(color: FolderPlayTheme.amberGold, fontWeight: FontWeight.bold)),
                  ],
                ),
                Slider(
                  key: const Key('slider_playback_speed'),
                  value: currentSpeed,
                  min: 0.5,
                  max: 3.0,
                  divisions: 50,
                  activeColor: FolderPlayTheme.amberGold,
                  onChanged: (val) {
                    setModalState(() => currentSpeed = val);
                    _audioHandler.setPlaybackSpeed(val);
                  },
                ),
                Wrap(
                  spacing: 8,
                  children: [0.8, 1.0, 1.15, 1.25, 1.5, 1.75, 2.0].map((preset) {
                    final isSel = (currentSpeed - preset).abs() < 0.02;
                    return ChoiceChip(
                      label: Text('${preset}x'),
                      selected: isSel,
                      onSelected: (_) {
                        setModalState(() => currentSpeed = preset);
                        _audioHandler.setPlaybackSpeed(preset);
                      },
                    );
                  }).toList(),
                ),
                const Divider(height: 32),

                // Volume Boost
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Preamp Volume Boost (+0dB to +20dB)', style: TextStyle(fontWeight: FontWeight.w600)),
                    Text('+${currentBoost.toInt()} dB', style: const TextStyle(color: FolderPlayTheme.studioEmerald, fontWeight: FontWeight.bold)),
                  ],
                ),
                Slider(
                  key: const Key('slider_volume_boost'),
                  value: currentBoost,
                  min: 0,
                  max: 20,
                  divisions: 20,
                  activeColor: FolderPlayTheme.studioEmerald,
                  onChanged: (val) {
                    setModalState(() => currentBoost = val);
                    _audioHandler.setVolumeBoost(val.toInt());
                  },
                ),
                const Divider(height: 32),

                // Pitch Shifting
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Voice Pitch Shift', style: TextStyle(fontWeight: FontWeight.w600)),
                    Text('${currentPitch > 0 ? '+' : ''}$currentPitch st', style: const TextStyle(color: FolderPlayTheme.calibrationCyan, fontWeight: FontWeight.bold)),
                  ],
                ),
                Slider(
                  value: currentPitch.toDouble(),
                  min: -6,
                  max: 6,
                  divisions: 12,
                  activeColor: FolderPlayTheme.calibrationCyan,
                  onChanged: (val) {
                    setModalState(() => currentPitch = val.toInt());
                    _audioHandler.setPitch(val.toInt());
                  },
                ),
                const Divider(height: 32),

                // Toggles
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Mono Downmix', style: TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: const Text('Merge stereo channels into single ear for one-earbud listening', style: TextStyle(fontSize: 12)),
                  value: monoDownmix,
                  activeColor: FolderPlayTheme.amberGold,
                  onChanged: (val) {
                    setModalState(() => monoDownmix = val);
                  },
                ),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Skip Speech Silence', style: TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: const Text('Truncate pauses between audiobook paragraphs and narration', style: TextStyle(fontSize: 12)),
                  value: skipSilence,
                  activeColor: FolderPlayTheme.studioEmerald,
                  onChanged: (val) {
                    setModalState(() => skipSilence = val);
                  },
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    key: const Key('btn_apply_dsp'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: FolderPlayTheme.amberGold,
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    onPressed: () => Navigator.pop(ctx),
                    child: const Text('APPLY DSP SETTINGS', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
