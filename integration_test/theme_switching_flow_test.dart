import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:folderplay/main.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('E2E: Switch App Theme to Leatherbound & Nordic Slate', (tester) async {
    await setupFolderPlay();
    await tester.pumpWidget(const FolderPlayApp());
    await tester.pumpAndSettle();

    // 1. Open Theme Picker Dialog
    final themeActionBtn = find.byKey(const Key('btn_action_theme'));
    expect(themeActionBtn, findsOneWidget);
    await tester.tap(themeActionBtn);
    await tester.pumpAndSettle();

    // 2. Select Leatherbound theme
    final leatherboundOption = find.byKey(const Key('theme_option_leatherbound'));
    expect(leatherboundOption, findsOneWidget);
    await tester.tap(leatherboundOption);
    await tester.pumpAndSettle();

    // 3. Open Theme Picker again and switch to Nordic
    await tester.tap(themeActionBtn);
    await tester.pumpAndSettle();

    final nordicOption = find.byKey(const Key('theme_option_nordic'));
    expect(nordicOption, findsOneWidget);
    await tester.tap(nordicOption);
    await tester.pumpAndSettle();
  });
}
