/// FolderPlay Domain: AudioSinkPort Interface
/// Invariant AD-3: Hardware abstraction decoupled from platform & UI

import '../model/book.dart';

abstract class AudioSinkPort {
  Stream<int> get positionStreamMs;
  Stream<bool> get isPlayingStream;
  Stream<double> get volumeStream;

  Future<void> initialize();
  Future<void> loadFile(String filePath, {int initialPositionMs = 0});
  Future<void> play();
  Future<void> pause();
  Future<void> seek(int positionMs);
  Future<void> setSpeed(double speed);
  Future<void> setPitch(int semitones);
  Future<void> setVolumeBoost(int boostDb);
  Future<void> setEqualizer(EqualizerConfig config);
  Future<void> setVolume(double volume);
  Future<void> dispose();
}
