/// FolderPlay Domain: Bookmark & Character Entities

class Bookmark {
  final String id;
  final String bookId;
  final String title;
  final String description;
  final String fileName;
  final int filePositionMs;
  final int createdAtEpochMs;
  final String colorTag;

  const Bookmark({
    required this.id,
    required this.bookId,
    required this.title,
    required this.description,
    required this.fileName,
    required this.filePositionMs,
    required this.createdAtEpochMs,
    this.colorTag = 'amber',
  });
}
