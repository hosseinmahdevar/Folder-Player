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

class NaturalSortComparator {
  /// Natural alphanumeric comparator (e.g. 'File 2.mp3' before 'File 10.mp3')
  static int compare(String a, String b) {
    final regex = RegExp(r'(\d+)|(\D+)');
    final matchesA = regex.allMatches(a).toList();
    final matchesB = regex.allMatches(b).toList();

    final minLen = matchesA.length < matchesB.length ? matchesA.length : matchesB.length;

    for (int i = 0; i < minLen; i++) {
      final partA = matchesA[i].group(0)!;
      final partB = matchesB[i].group(0)!;

      final isNumA = int.tryParse(partA) != null;
      final isNumB = int.tryParse(partB) != null;

      if (isNumA && isNumB) {
        final numA = int.parse(partA);
        final numB = int.parse(partB);
        if (numA != numB) {
          return numA.compareTo(numB);
        }
      } else {
        final cmp = partA.toLowerCase().compareTo(partB.toLowerCase());
        if (cmp != 0) {
          return cmp;
        }
      }
    }

    return matchesA.length.compareTo(matchesB.length);
  }
}
