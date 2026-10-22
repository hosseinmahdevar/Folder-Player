/// FolderPlay Infrastructure: Atomic Sidecar Serializers
/// Implements Invariant AD-4: Atomic Two-Phase Sidecar Commit (.tmp -> rename)

import 'dart:io';
import 'package:xml/xml.dart';
import '../../core/domain/model/book.dart';
import '../../core/domain/model/bookmark.dart';
import '../../core/domain/model/character.dart';

class SidecarSerializer {
  /// Atomic file write: writes to .tmp first, flushes, then renames
  static Future<void> writeAtomic(File destinationFile, String content) async {
    final tempFile = File('${destinationFile.path}.tmp');
    await tempFile.writeAsString(content, flush: true);
    await tempFile.rename(destinationFile.path);
  }

  /// Serializes BookDataBackup for position.sabp.dat
  static String serializePositionDat(PlaybackPosition position, BookLifecycleState state) {
    final buffer = StringBuffer();
    buffer.writeln('AK_SABP_SERIALIZED_OBJ_V11.9');
    buffer.writeln('mFileName=${position.fileName}');
    buffer.writeln('mFilePosition=${position.positionMs}');
    buffer.writeln('mPlaybackSpeed=${position.playbackSpeed.toStringAsFixed(2)}');
    buffer.writeln('mBoostVolume=${position.boostVolumeDb}');
    buffer.writeln('mPitchShift=${position.pitchShiftSemitones}');
    buffer.writeln('mEqualizerLevels=[${position.eqConfig.bandGainsDb.join(',')}]');
    buffer.writeln('mRNNoiseActive=${position.eqConfig.rnnoiseEnabled}');
    buffer.writeln('mBookState=${state.name}');
    buffer.writeln('mLastPlaybackTime=${position.lastPlaybackEpochMs}');
    return buffer.toString();
  }

  /// Parses position.sabp.dat
  static PlaybackPosition? parsePositionDat(String content) {
    try {
      final lines = content.split('\n');
      String fileName = '';
      int positionMs = 0;
      double speed = 1.0;
      int boost = 0;
      int pitch = 0;
      List<double> eq = [0.0, 0.0, 0.0, 0.0, 0.0];
      bool rnnoise = true;
      int lastPlayback = DateTime.now().millisecondsSinceEpoch;

      for (final line in lines) {
        final parts = line.split('=');
        if (parts.length != 2) continue;
        final key = parts[0].trim();
        final val = parts[1].trim();

        if (key == 'mFileName') fileName = val;
        if (key == 'mFilePosition') positionMs = int.tryParse(val) ?? 0;
        if (key == 'mPlaybackSpeed') speed = double.tryParse(val) ?? 1.0;
        if (key == 'mBoostVolume') boost = int.tryParse(val) ?? 0;
        if (key == 'mPitchShift') pitch = int.tryParse(val) ?? 0;
        if (key == 'mRNNoiseActive') rnnoise = val.toLowerCase() == 'true';
        if (key == 'mLastPlaybackTime') lastPlayback = int.tryParse(val) ?? lastPlayback;
      }

      if (fileName.isEmpty) return null;

      return PlaybackPosition(
        fileName: fileName,
        positionMs: positionMs,
        playbackSpeed: speed,
        boostVolumeDb: boost,
        pitchShiftSemitones: pitch,
        eqConfig: EqualizerConfig(bandGainsDb: eq, rnnoiseEnabled: rnnoise),
        lastPlaybackEpochMs: lastPlayback,
      );
    } catch (_) {
      return null;
    }
  }

  /// Serializes bookmarks.sabp.xml
  static String serializeBookmarksXml(List<Bookmark> bookmarks) {
    final builder = XmlBuilder();
    builder.processing('xml', 'version="1.0" encoding="utf-8"');
    builder.element('root', nest: () {
      for (final bm in bookmarks) {
        builder.element('bookmark', nest: () {
          builder.element('title', nest: bm.title);
          builder.element('description', nest: bm.description);
          builder.element('fileName', nest: bm.fileName);
          builder.element('filePosition', nest: bm.filePositionMs.toString());
        });
      }
    });
    return builder.buildDocument().toXmlString(pretty: true);
  }

  /// Parses bookmarks.sabp.xml
  static List<Bookmark> parseBookmarksXml(String xmlString, String bookId) {
    try {
      final doc = XmlDocument.parse(xmlString);
      final list = <Bookmark>[];
      final elements = doc.findAllElements('bookmark');

      for (final el in elements) {
        final title = el.findElements('title').firstOrNull?.innerText ?? 'Bookmark';
        final desc = el.findElements('description').firstOrNull?.innerText ?? '';
        final file = el.findElements('fileName').firstOrNull?.innerText ?? '';
        final pos = int.tryParse(el.findElements('filePosition').firstOrNull?.innerText ?? '0') ?? 0;

        list.add(Bookmark(
          id: '${bookId}_${file}_$pos',
          bookId: bookId,
          title: title,
          description: desc,
          fileName: file,
          filePositionMs: pos,
          createdAtEpochMs: DateTime.now().millisecondsSinceEpoch,
        ));
      }
      return list;
    } catch (_) {
      return [];
    }
  }

  /// Serializes characters.sabp.xml
  static String serializeCharactersXml(List<Character> characters) {
    final builder = XmlBuilder();
    builder.processing('xml', 'version="1.0" encoding="utf-8"');
    builder.element('root', nest: () {
      for (final ch in characters) {
        builder.element('character', nest: () {
          builder.element('name', nest: ch.name);
          builder.element('role', nest: ch.role);
          builder.element('description', nest: ch.description);
          if (ch.allegiance != null) {
            builder.element('allegiance', nest: ch.allegiance!);
          }
        });
      }
    });
    return builder.buildDocument().toXmlString(pretty: true);
  }

  /// Parses characters.sabp.xml
  static List<Character> parseCharactersXml(String xmlString, String bookId) {
    try {
      final doc = XmlDocument.parse(xmlString);
      final list = <Character>[];
      final elements = doc.findAllElements('character');

      for (final el in elements) {
        final name = el.findElements('name').firstOrNull?.innerText ?? '';
        final role = el.findElements('role').firstOrNull?.innerText ?? '';
        final desc = el.findElements('description').firstOrNull?.innerText ?? '';
        final allegiance = el.findElements('allegiance').firstOrNull?.innerText;

        if (name.isNotEmpty) {
          list.add(Character(
            id: '${bookId}_$name',
            bookId: bookId,
            name: name,
            role: role,
            description: desc,
            allegiance: allegiance,
          ));
        }
      }
      return list;
    } catch (_) {
      return [];
    }
  }
}
