/// FolderPlay Domain: Book Aggregate Root
/// Zero external UI dependencies (Pure Dart - Invariant AD-1)

import 'audio_file.dart';
import 'bookmark.dart';
import 'character.dart';

enum BookLifecycleState {
  isNew,
  started,
  finished,
}

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

  EqualizerConfig copyWith({
    List<double>? bandGainsDb,
    double? balance,
    bool? isMono,
    bool? rnnoiseEnabled,
  }) {
    return EqualizerConfig(
      bandGainsDb: bandGainsDb ?? this.bandGainsDb,
      balance: balance ?? this.balance,
      isMono: isMono ?? this.isMono,
      rnnoiseEnabled: rnnoiseEnabled ?? this.rnnoiseEnabled,
    );
  }
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

  PlaybackPosition copyWith({
    String? fileName,
    int? positionMs,
    double? playbackSpeed,
    int? boostVolumeDb,
    int? pitchShiftSemitones,
    EqualizerConfig? eqConfig,
    int? lastPlaybackEpochMs,
  }) {
    return PlaybackPosition(
      fileName: fileName ?? this.fileName,
      positionMs: positionMs ?? this.positionMs,
      playbackSpeed: playbackSpeed ?? this.playbackSpeed,
      boostVolumeDb: boostVolumeDb ?? this.boostVolumeDb,
      pitchShiftSemitones: pitchShiftSemitones ?? this.pitchShiftSemitones,
      eqConfig: eqConfig ?? this.eqConfig,
      lastPlaybackEpochMs: lastPlaybackEpochMs ?? this.lastPlaybackEpochMs,
    );
  }
}

class Book {
  final String id;
  final String title;
  final String author;
  final String narrator;
  final String? series;
  final String? seriesNumber;
  final String folderPath;
  final String coverColorHex;
  final String coverGlyph;
  final BookLifecycleState state;
  final int? queuePosition;
  final List<AudioFile> files;
  final int totalDurationMs;
  final PlaybackPosition lastPosition;
  final List<Bookmark> bookmarks;
  final List<Character> characters;
  final String? synopsis;

  const Book({
    required this.id,
    required this.title,
    required this.author,
    required this.narrator,
    this.series,
    this.seriesNumber,
    required this.folderPath,
    this.coverColorHex = '#1e293b',
    this.coverGlyph = '📖',
    required this.state,
    this.queuePosition,
    required this.files,
    required this.totalDurationMs,
    required this.lastPosition,
    this.bookmarks = const [],
    this.characters = const [],
    this.synopsis,
  });

  int get currentFileIndex {
    final idx = files.indexWhere((f) => f.fileName == lastPosition.fileName);
    return idx >= 0 ? idx : 0;
  }

  AudioFile get currentFile {
    if (files.isEmpty) {
      throw StateError('Book contains no audio files');
    }
    return files[currentFileIndex];
  }

  double get progressPercentage {
    if (totalDurationMs == 0) return 0.0;
    int played = 0;
    for (int i = 0; i < currentFileIndex; i++) {
      played += files[i].durationMs;
    }
    played += lastPosition.positionMs;
    return (played / totalDurationMs).clamp(0.0, 1.0);
  }

  Book copyWith({
    String? title,
    String? author,
    String? narrator,
    String? series,
    String? seriesNumber,
    BookLifecycleState? state,
    int? queuePosition,
    List<AudioFile>? files,
    int? totalDurationMs,
    PlaybackPosition? lastPosition,
    List<Bookmark>? bookmarks,
    List<Character>? characters,
    String? synopsis,
  }) {
    return Book(
      id: id,
      title: title ?? this.title,
      author: author ?? this.author,
      narrator: narrator ?? this.narrator,
      series: series ?? this.series,
      seriesNumber: seriesNumber ?? this.seriesNumber,
      folderPath: folderPath,
      coverColorHex: coverColorHex,
      coverGlyph: coverGlyph,
      state: state ?? this.state,
      queuePosition: queuePosition ?? this.queuePosition,
      files: files ?? this.files,
      totalDurationMs: totalDurationMs ?? this.totalDurationMs,
      lastPosition: lastPosition ?? this.lastPosition,
      bookmarks: bookmarks ?? this.bookmarks,
      characters: characters ?? this.characters,
      synopsis: synopsis ?? this.synopsis,
    );
  }
}
