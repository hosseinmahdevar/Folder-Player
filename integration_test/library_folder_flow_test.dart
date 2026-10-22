import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:folderplay/main.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('E2E: Open Manual Folder Dialog and Submit Custom Path', (tester) async {
    await setupFolderPlay();
    await tester.pumpWidget(const FolderPlayApp());
    await tester.pumpAndSettle();

    // 1. Tap manual path button in AppBar
    final manualPathBtn = find.byKey(const Key('btn_action_manual_path'));
    expect(manualPathBtn, findsOneWidget);
    await tester.tap(manualPathBtn);
    await tester.pumpAndSettle();

    // 2. Verify dialog input and confirm button exist
    final inputField = find.byKey(const Key('input_manual_path'));
    final confirmBtn = find.byKey(const Key('btn_confirm_add_folder'));
    expect(inputField, findsOneWidget);
    expect(confirmBtn, findsOneWidget);

    // 3. Enter a custom audiobook directory path
    await tester.enterText(inputField, '/home/test/Audiobooks/Sanderson');
    await tester.pumpAndSettle();

    // 4. Tap Confirm
    await tester.tap(confirmBtn);
    await tester.pumpAndSettle();
  });
}
