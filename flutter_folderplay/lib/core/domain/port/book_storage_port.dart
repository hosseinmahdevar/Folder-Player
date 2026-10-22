/// FolderPlay Domain: Storage & Sensor Ports
/// Invariant AD-2: Zero centralized database; sidecars only

import '../model/book.dart';
import '../model/bookmark.dart';
import '../model/character.dart';

abstract class BookStoragePort {
  /// Scans configured root directories for audiobooks
  Future<List<Book>> scanRootFolders(List<String> rootFolderUris);

  /// Reads local sidecar files from a book directory
  Future<PlaybackPosition?> readPositionSidecar(String bookDirectoryUri);
  Future<List<Bookmark>> readBookmarksSidecar(String bookDirectoryUri, String bookId);
  Future<List<Character>> readCharactersSidecar(String bookDirectoryUri, String bookId);
  Future<String?> readSynopsisSidecar(String bookDirectoryUri);

  /// Invariant AD-4: Atomic writes to sidecar files
  Future<void> writePositionSidecar(String bookDirectoryUri, PlaybackPosition position);
  Future<void> writeBookmarksSidecar(String bookDirectoryUri, List<Bookmark> bookmarks);
  Future<void> writeCharactersSidecar(String bookDirectoryUri, List<Character> characters);
}

abstract class MotionSensorPort {
  Stream<double> get accelerationForceStream;
  Future<bool> isSupported();
  void startListening();
  void stopListening();
}
