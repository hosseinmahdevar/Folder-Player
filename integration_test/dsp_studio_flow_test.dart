import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:folderplay/main.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('E2E: Open Sound Shaping DSP and Adjust Speed and Boost', (tester) async {
    await setupFolderPlay();
    await tester.pumpWidget(const FolderPlayApp());
    await tester.pumpAndSettle();

    // 1. Open DSP Studio Bottom Sheet
    final dspActionBtn = find.byKey(const Key('btn_action_dsp'));
    expect(dspActionBtn, findsOneWidget);
    await tester.tap(dspActionBtn);
    await tester.pumpAndSettle();

    // 2. Verify Speed & Volume Boost Sliders exist
    final speedSlider = find.byKey(const Key('slider_playback_speed'));
    final boostSlider = find.byKey(const Key('slider_volume_boost'));
    expect(speedSlider, findsOneWidget);
    expect(boostSlider, findsOneWidget);

    // 3. Apply DSP Settings
    final applyBtn = find.byKey(const Key('btn_apply_dsp'));
    expect(applyBtn, findsOneWidget);
    await tester.tap(applyBtn);
    await tester.pumpAndSettle();
  });
}
