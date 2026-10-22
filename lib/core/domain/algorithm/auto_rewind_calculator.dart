/// FolderPlay Domain: Algorithms
/// Realizes FR-6 (Proportional Auto-Rewind) and FR-14 (Natural Alphanumeric Sorting)

class AutoRewindCalculator {
  /// Calculates rewind offset in seconds based on pause duration in seconds
  static int calculateOffsetSeconds(int pausedSeconds) {
    if (pausedSeconds < 3) {
      return 0;
    }
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
}

