/// FolderPlay Domain: Natural Alphanumeric Comparator
/// Realizes FR-14 (Natural Alphanumeric Sorting, e.g. 'File 2.mp3' before 'File 10.mp3')

class NaturalSortComparator {
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
