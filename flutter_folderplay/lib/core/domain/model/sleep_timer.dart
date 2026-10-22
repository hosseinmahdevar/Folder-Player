/// FolderPlay Domain: Sleep Timer Policy & Auto-Rewind Models

class SleepTimerConfig {
  final bool isActive;
  final int targetDurationSeconds;
  final int remainingSeconds;
  final bool isFadeoutActive;
  final bool isShakeToResetEnabled;
  final int shakeSensitivityForce; // 1 (ultra-sensitive) to 18 (firm shake)
  final bool autoInhibitInCarMode;

  const SleepTimerConfig({
    this.isActive = false,
    this.targetDurationSeconds = 1800,
    this.remainingSeconds = 1800,
    this.isFadeoutActive = false,
    this.isShakeToResetEnabled = true,
    this.shakeSensitivityForce = 6,
    this.autoInhibitInCarMode = true,
  });

  SleepTimerConfig copyWith({
    bool? isActive,
    int? targetDurationSeconds,
    int? remainingSeconds,
    bool? isFadeoutActive,
    bool? isShakeToResetEnabled,
    int? shakeSensitivityForce,
    bool? autoInhibitInCarMode,
  }) {
    return SleepTimerConfig(
      isActive: isActive ?? this.isActive,
      targetDurationSeconds: targetDurationSeconds ?? this.targetDurationSeconds,
      remainingSeconds: remainingSeconds ?? this.remainingSeconds,
      isFadeoutActive: isFadeoutActive ?? this.isFadeoutActive,
      isShakeToResetEnabled: isShakeToResetEnabled ?? this.isShakeToResetEnabled,
      shakeSensitivityForce: shakeSensitivityForce ?? this.shakeSensitivityForce,
      autoInhibitInCarMode: autoInhibitInCarMode ?? this.autoInhibitInCarMode,
    );
  }
}

class AutoRewindOffset {
  final bool isArmed;
  final int offsetSeconds;
  final int pausedDurationSeconds;
  final int pauseTimestampEpochMs;

  const AutoRewindOffset({
    required this.isArmed,
    required this.offsetSeconds,
    required this.pausedDurationSeconds,
    required this.pauseTimestampEpochMs,
  });
}
