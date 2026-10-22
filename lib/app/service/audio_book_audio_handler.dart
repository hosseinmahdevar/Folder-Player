/// FolderPlay Primary Adapter: AudioBookAudioHandler
/// Invariant AD-5: Single Source of Playback Truth in AudioHandler
/// Integrates with audio_service, lock screen, Android Auto, and background notifications

import 'dart:async';
import 'package:audio_service/audio_service.dart';
import '../../core/domain/algorithm/auto_rewind_calculator.dart';
import '../../core/domain/model/book.dart';
import '../../core/domain/model/sleep_timer.dart';
import '../../core/domain/port/audio_sink_port.dart';
import '../../core/domain/port/book_storage_port.dart';

class AudioBookAudioHandler extends BaseAudioHandler with SeekHandler {
  final AudioSinkPort _audioSink;
  final BookStoragePort _storage;

  Book? _currentBook;
  int _lastPauseEpochMs = 0;
  AutoRewindOffset? _autoRewind;
  SleepTimerConfig _sleepConfig = const SleepTimerConfig();
  Timer? _sleepCountdownTimer;

  AudioBookAudioHandler({
    required AudioSinkPort audioSink,
    required BookStoragePort storage,
  })  : _audioSink = audioSink,
        _storage = storage {
    _initStreams();
  }

  void _initStreams() {
    _audioSink.positionStreamMs.listen((positionMs) {
      playbackState.add(playbackState.value.copyWith(
        updatePosition: Duration(milliseconds: positionMs),
      ));
    });

    _audioSink.isPlayingStream.listen((playing) {
      playbackState.add(playbackState.value.copyWith(
        playing: playing,
      ));
    });
  }

  Book? get currentBook => _currentBook;
  SleepTimerConfig get sleepConfig => _sleepConfig;
  AutoRewindOffset? get autoRewind => _autoRewind;

  Future<void> loadBook(Book book) async {
    _currentBook = book;
    final file = book.currentFile;

    mediaItem.add(MediaItem(
      id: book.id,
      album: book.series ?? book.title,
      title: book.title,
      artist: book.author,
      genre: 'Audiobook',
      duration: Duration(milliseconds: file.durationMs),
      artUri: Uri.parse('file://${book.folderPath}/cover.jpg'),
    ));

    await _audioSink.loadFile(file.path, initialPositionMs: book.lastPosition.positionMs);
    await _audioSink.setSpeed(book.lastPosition.playbackSpeed);
    await _audioSink.setVolumeBoost(book.lastPosition.boostVolumeDb);
  }

  @override
  Future<void> play() async {
    if (_currentBook == null) return;

    // Apply auto-rewind if paused for longer than 3 seconds
    if (_lastPauseEpochMs > 0) {
      final pausedSeconds = ((DateTime.now().millisecondsSinceEpoch - _lastPauseEpochMs) / 1000).round();
      final offsetSec = AutoRewindCalculator.calculateOffsetSeconds(pausedSeconds);
      if (offsetSec > 0) {
        final currentPos = playbackState.value.position.inMilliseconds;
        final targetPos = (currentPos - (offsetSec * 1000)).clamp(0, currentBook!.currentFile.durationMs);
        await _audioSink.seek(targetPos);
      }
    }

    await _audioSink.play();
    playbackState.add(playbackState.value.copyWith(
      controls: [
        MediaControl.rewind,
        MediaControl.pause,
        MediaControl.fastForward,
      ],
      systemActions: const {
        MediaAction.seek,
        MediaAction.seekForward,
        MediaAction.seekBackward,
      },
      androidCompactActionIndices: const [0, 1, 2],
      playing: true,
    ));
  }

  @override
  Future<void> pause() async {
    _lastPauseEpochMs = DateTime.now().millisecondsSinceEpoch;
    await _audioSink.pause();

    // Persist position to sidecar immediately on pause (Invariant AD-2, AD-4)
    if (_currentBook != null) {
      final posMs = playbackState.value.position.inMilliseconds;
      final updatedPos = _currentBook!.lastPosition.copyWith(
        positionMs: posMs,
        lastPlaybackEpochMs: _lastPauseEpochMs,
      );
      await _storage.writePositionSidecar(_currentBook!.folderPath, updatedPos);
    }

    playbackState.add(playbackState.value.copyWith(
      playing: false,
    ));
  }

  @override
  Future<void> seek(Duration position) async {
    await _audioSink.seek(position.inMilliseconds);
  }

  @override
  Future<void> fastForward() async {
    // Standard +30s jump (FR-7)
    final newPos = playbackState.value.position + const Duration(seconds: 30);
    await seek(newPos);
  }

  @override
  Future<void> rewind() async {
    // Standard -10s rewind (FR-7)
    final newPos = playbackState.value.position - const Duration(seconds: 10);
    await seek(newPos < Duration.zero ? Duration.zero : newPos);
  }

  // --- Sleep Timer Management (FR-8, FR-9, FR-10) ---

  void startSleepTimer(int durationSeconds) {
    _sleepConfig = _sleepConfig.copyWith(
      isActive: true,
      targetDurationSeconds: durationSeconds,
      remainingSeconds: durationSeconds,
      isFadeoutActive: false,
    );
    _sleepCountdownTimer?.cancel();

    _sleepCountdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!_sleepConfig.isActive) {
        timer.cancel();
        return;
      }

      if (_sleepConfig.remainingSeconds > 0) {
        final remaining = _sleepConfig.remainingSeconds - 1;
        final isFadeout = remaining <= 60;

        _sleepConfig = _sleepConfig.copyWith(
          remainingSeconds: remaining,
          isFadeoutActive: isFadeout,
        );

        if (isFadeout) {
          // Linear volume fadeout over 60s
          final fadeVol = (remaining / 60.0).clamp(0.0, 1.0);
          _audioSink.setVolume(fadeVol);
        }
      } else {
        // Timer expired
        cancelSleepTimer();
        pause();
      }
    });
  }

  void cancelSleepTimer() {
    _sleepCountdownTimer?.cancel();
    _sleepCountdownTimer = null;
    _sleepConfig = _sleepConfig.copyWith(
      isActive: false,
      isFadeoutActive: false,
    );
    _audioSink.setVolume(1.0);
  }

  bool handleShakeReset() {
    if (!_sleepConfig.isActive || !_sleepConfig.isShakeToResetEnabled) {
      return false;
    }
    // Reset timer to original duration and restore full volume
    startSleepTimer(_sleepConfig.targetDurationSeconds);
    _audioSink.setVolume(1.0);
    return true;
  }
}
