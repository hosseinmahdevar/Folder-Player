/// FolderPlay Infrastructure: JustAudioSink Adapter
/// Cross-platform implementation of AudioSinkPort for Android & Desktop (Linux, Windows, macOS)

import 'dart:async';
import 'package:just_audio/just_audio.dart';
import '../../core/domain/model/book.dart';
import '../../core/domain/port/audio_sink_port.dart';

class JustAudioSink implements AudioSinkPort {
  final AudioPlayer _player = AudioPlayer();
  final _positionController = StreamController<int>.broadcast();
  final _isPlayingController = StreamController<bool>.broadcast();
  final _volumeController = StreamController<double>.broadcast();

  StreamSubscription? _posSub;
  StreamSubscription? _stateSub;
  StreamSubscription? _volSub;

  @override
  Stream<int> get positionStreamMs => _positionController.stream;

  @override
  Stream<bool> get isPlayingStream => _isPlayingController.stream;

  @override
  Stream<double> get volumeStream => _volumeController.stream;

  @override
  Future<void> initialize() async {
    _posSub = _player.positionStream.listen((duration) {
      _positionController.add(duration.inMilliseconds);
    });

    _stateSub = _player.playingStream.listen((playing) {
      _isPlayingController.add(playing);
    });

    _volSub = _player.volumeStream.listen((vol) {
      _volumeController.add(vol);
    });
  }

  @override
  Future<void> loadFile(String filePath, {int initialPositionMs = 0}) async {
    await _player.setFilePath(
      filePath,
      initialPosition: Duration(milliseconds: initialPositionMs),
    );
  }

  @override
  Future<void> play() async {
    await _player.play();
  }

  @override
  Future<void> pause() async {
    await _player.pause();
  }

  @override
  Future<void> seek(int positionMs) async {
    await _player.seek(Duration(milliseconds: positionMs));
  }

  @override
  Future<void> setSpeed(double speed) async {
    await _player.setSpeed(speed.clamp(0.5, 3.0));
  }

  @override
  Future<void> setPitch(int semitones) async {
    await _player.setPitch(1.0 + (semitones / 12.0));
  }

  @override
  Future<void> setVolumeBoost(int boostDb) async {
    // Volume scale: 1.0 + boost ratio
    final multiplier = 1.0 + (boostDb / 10.0);
    await _player.setVolume(multiplier.clamp(0.0, 3.0));
  }

  @override
  Future<void> setEqualizer(EqualizerConfig config) async {
    // Platform channel or audio filter pipeline
  }

  @override
  Future<void> setVolume(double volume) async {
    await _player.setVolume(volume.clamp(0.0, 1.0));
  }

  @override
  Future<void> dispose() async {
    await _posSub?.cancel();
    await _stateSub?.cancel();
    await _volSub?.cancel();
    await _player.dispose();
    await _positionController.close();
    await _isPlayingController.close();
    await _volumeController.close();
  }
}
