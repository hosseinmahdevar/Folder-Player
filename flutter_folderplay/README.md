# FolderPlay — Cross-Platform Flutter Application (Android & Desktop)

*Clean-Room Reconstruction of Smart AudioBook Player v11.9.0*
*Architecture: Ports and Adapters (Hexagonal)*

## Supported Platforms
- **Android**: Full support for Android 8.0 - 15 (API 26-35), Android Auto (`MediaBrowserService`), Storage Access Framework (SAF), and Background Audio Notification (`audio_service`).
- **Desktop (Linux, Windows, macOS)**: Native window management (`window_manager`), local filesystem scanning with Natural Alphanumeric Sorting, and high-performance audio playback (`just_audio`).

---

## Directory Architecture

```
lib/
├── core/
│   ├── domain/               # Pure Dart domain layer (Zero UI dependencies - Invariant AD-1)
│   │   ├── model/            # book.dart, audio_file.dart, bookmark.dart, character.dart, sleep_timer.dart
│   │   ├── port/             # audio_sink_port.dart, book_storage_port.dart, motion_sensor_port.dart
│   │   └── algorithm/        # auto_rewind_calculator.dart, natural_sort_comparator.dart
│   └── application/
│       └── usecase/          # play_book_use_case.dart, sleep_timer_use_case.dart
├── infra/
│   ├── audio/                # AudioSinkPort adapters (just_audio_sink.dart, bass_ffi_audio_sink.dart)
│   ├── storage/              # saf_storage_adapter.dart, sidecar_serializer.dart (Atomic commit - Invariant AD-4)
│   └── sensors/              # motion_sensor_adapter.dart (sensors_plus accelerometer)
└── app/
    ├── service/              # audio_book_audio_handler.dart (Invariant AD-5: Single source of playback truth)
    └── ui/
        └── common/           # theme.dart (OLED Nocturne & Material 3 Dark theme)
```

---

## How to Build & Run

### Prerequisites
- Flutter SDK 3.22.0 or higher
- Dart SDK 3.4.0 or higher

### Android:
```bash
flutter pub get
flutter run -d android
# Or release build:
flutter build apk --release
```

### Desktop:
```bash
# Linux
flutter run -d linux

# Windows
flutter run -d windows

# macOS
flutter run -d macos
```
