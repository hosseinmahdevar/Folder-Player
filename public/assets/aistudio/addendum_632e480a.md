# FolderPlay: Technical Addendum & Reverse-Engineering Findings

*Companion Technical Reference for PRD: FolderPlay (Reconstructed from Smart AudioBook Player v11.9.0)*

## 1. Local Storage & Sidecar File Schemas

FolderPlay avoids centralized SQL databases for book state, opting instead for portable sidecar files stored directly in each book directory.

### 1.1 `position.sabp.dat` (Java Object Serialization)
State is saved via `ObjectOutputStream` when pausing or updating progress:
- Class: `ak.alizandro.smartaudiobookplayer.BookDataBackup`
- `mFileName`: (String) Relative path/name of the active file in multi-part books.
- `mFilePosition`: (int) Playback position in milliseconds within the active file.
- `mPlaybackSpeed`: (float) Playback speed multiplier (default 1.0f).
- `mBoostVolume`: (int) Gain offset in decibels.
- `mEqualizerLevels`: (EqualizerLevels) Equalizer bands, pitch, balance, and RNNoise toggle state.
- `mBookState`: (BookData.BookState) Enum: `New`, `Started`, `Finished`.
- `mBookCreationTime`: (Date) Timestamp when book was first scanned.
- `mLastPlaybackTime`: (long) Epoch milliseconds of last playback activity.
- `mBookQueuePosition`: (int) Index in the sequential playback queue.
- `mSkipSilence`: (int) Skip silence threshold mode.
- `mRepeatSettings`: (RepeatSettings) Loop/repeat segment constraints.
- `mSkipStartEndSettings`: (SkipStartEndSettings) Offsets to trim intros and outros per file.
- `mCoverName`: (String) Filename of selected cover art.

### 1.2 `bookmarks.sabp.xml`
Stored as structured UTF-8 XML:
```xml
<?xml version="1.0" encoding="utf-8"?>
<root>
    <bookmark>
        <title>Scene introduction</title>
        <description>Crucial clue revealed by protagonist</description>
        <fileName>Part03.mp3</fileName>
        <filePosition>145820</filePosition>
    </bookmark>
</root>
```

### 1.3 `characters.sabp.xml`
Stored as structured UTF-8 XML:
```xml
<?xml version="1.0" encoding="utf-8"?>
<root>
    <character>
        <name>Alyosha Karamazov</name>
        <description>Third son, novice monk at the local monastery</description>
    </character>
</root>
```

### 1.4 `info.txt`
Standard plaintext file in UTF-8 encoding placed at root of book folder containing book synopsis or notes. Also populated via Gemini AI generation or web scraping.

---

## 2. Audio Subsystem Architecture

### 2.1 Native Shared Libraries (`lib/`)
The player packages multiple native JNI libraries:
- `libbass.so`: Core Un4seen BASS audio engine.
- `libbass_fx.so`: Real-time DSP effects (tempo, pitch, equalizer).
- `librnnoise.so`: Recurrent Neural Network based real-time speech denoiser.
- `libbassopus.so`: Native Opus codec decoder.
- `libbassenc_opus.so`: Native Opus codec encoder (used for background MP3 conversion).
- `libbassflac.so`, `libbassalac.so`, `libbass_aac.so`, `libbasswebm.so`, `libbasswv.so`: Format plugins.
- `libtags.so`: Tag reading engine for extracting metadata, cover art, and chapters.

### 2.2 Dual-Engine Fallback Strategy
`b8.java` wraps the playback session:
1. Primary: `SmartMediaPlayer$PlaybackMode.Bass`. Direct low-level DSP pipeline supporting RNNoise and precise pitch shifting.
2. Secondary Fallback: `SmartMediaPlayer$PlaybackMode.Normal`. Native Android `android.media.MediaPlayer` coupled with `android.media.audiofx.Equalizer` and `android.media.audiofx.LoudnessEnhancer`.

---

## 3. Automation & Public Broadcast API (Tasker Integration)

The application registers public action filters on `PlayerService`:

| Action Constant | Intent Target | Effect |
| :--- | :--- | :--- |
| `ak.alizandro.smartaudiobookplayer.ActionPlayPause` | Service / Broadcast | Toggles playback state |
| `ak.alizandro.smartaudiobookplayer.ActionPlay` | Service / Broadcast | Resumes playback |
| `ak.alizandro.smartaudiobookplayer.ActionPause` | Service / Broadcast | Pauses playback |
| `ak.alizandro.smartaudiobookplayer.ActionRewindBig` | Service / Broadcast | Big rewind (default 1 min) |
| `ak.alizandro.smartaudiobookplayer.ActionRewindSmall` | Service / Broadcast | Small rewind (default 10s) |
| `ak.alizandro.smartaudiobookplayer.ActionFwdSmall` | Service / Broadcast | Small fast-forward (default 30s) |
| `ak.alizandro.smartaudiobookplayer.ActionFwdBig` | Service / Broadcast | Big fast-forward (default 5 min) |
| `ak.alizandro.smartaudiobookplayer.ActionPrevFile` | Service / Broadcast | Jumps to previous audio file |
| `ak.alizandro.smartaudiobookplayer.ActionNextFile` | Service / Broadcast | Jumps to next audio file |
| `ak.alizandro.smartaudiobookplayer.ActionAddBookmark` | Service / Broadcast | Adds bookmark at current pos |
| `ak.alizandro.smartaudiobookplayer.ActionEnableSleepTimer`| Service / Broadcast | Activates sleep timer |
| `ak.alizandro.smartaudiobookplayer.ActionDisableSleepTimer`| Service / Broadcast | Deactivates sleep timer |
| `ak.alizandro.smartaudiobookplayer.ActionExit` | Service / Broadcast | Stops service and unloads audio |

---

## 4. Accelerometer Motion & Sensor Algorithm

For touchless sleep timer extension:
- Listens on `Sensor.TYPE_ACCELEROMETER`.
- High-pass vector magnitude differential: $d = |A_t - A_{t-1}|$.
- Compared against calibrated threshold `shakeForce_v2` (preset values: 1, 3, 6, 12, 18).
- Suppressed during screen-on or active UI interactions to prevent spurious resets while typing.
