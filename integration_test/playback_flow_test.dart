import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:folderplay/main.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('E2E: Launch App, Verify Shell, and Toggle Playback', (tester) async {
    await setupFolderPlay();
    await tester.pumpWidget(const FolderPlayApp());
    await tester.pumpAndSettle();

    // Verify main app bar exists
    expect(find.byKey(const Key('btn_action_dsp')), findsOneWidget);
    expect(find.byKey(const Key('btn_action_theme')), findsOneWidget);

    // Verify Play/Pause button
    final playBtn = find.byKey(const Key('btn_play_pause'));
    expect(playBtn, findsOneWidget);

    // Tap Play button
    await tester.tap(playBtn);
    await tester.pumpAndSettle();
  });
}
