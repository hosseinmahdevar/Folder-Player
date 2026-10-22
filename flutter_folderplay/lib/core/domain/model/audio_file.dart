/// FolderPlay Domain: AudioFile & Chapter Model

class Chapter {
  final String id;
  final String title;
  final int startMs;
  final int endMs;
  final String? pov;

  const Chapter({
    required this.id,
    required this.title,
    required this.startMs,
    required this.endMs,
    this.pov,
  });

  int get durationMs => endMs - startMs;
}

class AudioFile {
  final String fileName;
  final String path;
  final String displayName;
  final int durationMs;
  final String bitrate;
  final String sampleRate;
  final double fileSizeMb;
  final List<Chapter> chapters;

  const AudioFile({
    required this.fileName,
    required this.path,
    required this.displayName,
    required this.durationMs,
    required this.bitrate,
    required this.sampleRate,
    required this.fileSizeMb,
    this.chapters = const [],
  });
}
