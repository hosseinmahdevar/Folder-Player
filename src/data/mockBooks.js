/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FolderPlay Mock Audiobooks Data
 * Aligned with PRD, Addendum, and Google Stitch outputs
 */
const INITIAL_BOOKS = [
  {
    id: "wok-01",
    title: "The Way of Kings",
    author: "Brandon Sanderson",
    narrator: "Michael Kramer & Kate Reading",
    series: "The Stormlight Archive",
    seriesNumber: "Vol. I",
    folderPath: "/storage/emulated/0/Audiobooks/Sanderson/The_Way_of_Kings",
    coverColor: "#1e293b",
    coverGlyph: "\u26A1",
    state: "Started",
    queueIndex: 1,
    currentFileIndex: 17,
    // File 18 (0-indexed 17)
    currentPositionMs: 1118200,
    // 18m 38s
    playbackSpeed: 1.15,
    volumeBoostDb: 4,
    pitchShift: 0,
    rnnoiseEnabled: true,
    skipSilence: true,
    monoDownmix: false,
    balance: 0,
    eqLevels: [2, 1, 0, 3, 1],
    lastPlayedEpochMs: Date.now() - 132e4,
    // 22 minutes ago (triggers -14s auto-rewind!)
    totalDurationMs: 1638e5,
    // 45.5 hours
    files: [
      {
        fileName: "001_The_Way_of_Kings_Prelude.mp3",
        displayName: "Prelude to the Stormlight Archive",
        durationMs: 36e5,
        bitrate: "CBR 256 kbps",
        sampleRate: "44.1 kHz",
        fileSizeMb: 68.4,
        chapters: [
          { id: "ch-prelude", title: "Prelude: The Heraldic Oath", startMs: 0, endMs: 36e5, pov: "Kalak" }
        ]
      },
      {
        fileName: "018_The_Way_of_Kings_Ch24.mp3",
        displayName: "Part 2: The Illuminating Storms - Chapter 24",
        durationMs: 394e4,
        // ~1h 05m
        bitrate: "CBR 256 kbps",
        sampleRate: "44.1 kHz",
        fileSizeMb: 74.2,
        chapters: [
          { id: "ch-24", title: "Chapter 24: The Bright Side", startMs: 0, endMs: 198e4, pov: "Kaladin" },
          { id: "ch-25", title: "Chapter 25: The Wolf Approach", startMs: 198e4, endMs: 394e4, pov: "Dalinar" }
        ]
      },
      {
        fileName: "019_The_Way_of_Kings_Ch26.mp3",
        displayName: "Part 2: The Illuminating Storms - Chapter 26",
        durationMs: 372e4,
        bitrate: "CBR 256 kbps",
        sampleRate: "44.1 kHz",
        fileSizeMb: 71,
        chapters: [
          { id: "ch-26", title: "Chapter 26: Words of Radiance", startMs: 0, endMs: 372e4, pov: "Shallan" }
        ]
      }
    ],
    sidecars: {
      positionDat: `AK_SABP_SERIALIZED_OBJ_V11.9
mFileName=018_The_Way_of_Kings_Ch24.mp3
mFilePosition=1118200
mPlaybackSpeed=1.15
mBoostVolume=4
mEqualizerLevels=[2,1,0,3,1]
mRNNoiseActive=true
mBookState=Started
mLastPlaybackTime=1729598400000
mBookQueuePosition=1
mSkipSilence=1
mCoverName=cover.jpg`,
      bookmarksXml: `<?xml version="1.0" encoding="utf-8"?>
<root>
    <bookmark>
        <title>The Honor Chasm</title>
        <description>Kaladin stands over the edge of the chasm in the rain, contemplating ending it all before Syl brings the blackbane leaf.</description>
        <fileName>018_The_Way_of_Kings_Ch24.mp3</fileName>
        <filePosition>1118200</filePosition>
    </bookmark>
    <bookmark>
        <title>First Bridge Run</title>
        <description>Bridge Four carries the wooden span under Parshendi arrow fire; horrific losses reveal Sadeas' strategy.</description>
        <fileName>006_The_Way_of_Kings_Ch11.mp3</fileName>
        <filePosition>482100</filePosition>
    </bookmark>
    <bookmark>
        <title>Dalinar's Vision of the Knight Radiant</title>
        <description>The highstorm vision of Nohadon and the Way of Kings doctrine.</description>
        <fileName>012_The_Way_of_Kings_Ch15.mp3</fileName>
        <filePosition>1842000</filePosition>
    </bookmark>
</root>`,
      charactersXml: `<?xml version="1.0" encoding="utf-8"?>
<root>
    <character>
        <name>Kaladin Stormblessed</name>
        <role>Former Surgeon Apprentice / Bridge Four Leader</role>
        <description>Enslaved darkeyes soldier branded with the shash glyph. Possesses proto-Windrunner gravity and stormlight abilities.</description>
        <allegiance>Alethkar / Bridge Four</allegiance>
    </character>
    <character>
        <name>Dalinar Kholin</name>
        <role>Highprince of War / The Blackthorn</role>
        <description>Brother to late King Gavilar. Experiences tactical visions during highstorms and follows the Code of the ancient Radiants.</description>
        <allegiance>House Kholin</allegiance>
    </character>
    <character>
        <name>Shallan Davar</name>
        <role>Scholar Ward to Jasnah Kholin</role>
        <description>Veden noblewoman seeking to save her family from bankruptcy; secretly plots to steal a Soulcaster gemstone.</description>
        <allegiance>House Davar</allegiance>
    </character>
    <character>
        <name>Sylphrena (Syl)</name>
        <role>Honorspren</role>
        <description>Tiny floating windspren with female form, drawn to Kaladin's deep protective sense of honor and justice.</description>
        <allegiance>Spren of the Cognitive Realm</allegiance>
    </character>
    <character>
        <name>Szeth-son-son-Vallano</name>
        <role>The Assassin in White</role>
        <description>Truthless of Shinovar wielding an Honorblade. Forced to kill world leaders by anyone holding his Oathstone.</description>
        <allegiance>Shinovar / Oathstone Bearer</allegiance>
    </character>
</root>`,
      infoTxt: `Title: The Way of Kings (The Stormlight Archive, Book 1)
Author: Brandon Sanderson
Narrated by: Michael Kramer, Kate Reading
Publisher: Macmillan Audio
Length: 45 hrs and 37 mins

Roshar is a world of stone and storms. Uncanny tempests of incredible power sweep across the rocky terrain so frequently that they have shaped ecology and civilization alike. It has been centuries since the fall of the ten consecrated orders known as the Knights Radiant, but their Shardblades and Shardplate remain.

In the War of Reckoning on the Shattered Plains, Kaladin struggles as an enslaved bridgeman, Dalinar questions his sanity amidst visions of ancient radiants, and Shallan schemes to save her ruined house.`,
      srtSubtitles: [
        {
          startMs: 11e5,
          endMs: 1115e3,
          text: '"Somebody has to start, Kaladin. Somebody has to step forward and do what is right, because it is right."',
          speaker: "Sylphrena"
        },
        {
          startMs: 1118200,
          endMs: 1129050,
          text: '"The stormlight gathered within his lungs, cold and crystalline. He looked out over the drop into the abyss, and for the first time in ten months, he did not want to fall."',
          speaker: "Narrator (Michael Kramer)"
        },
        {
          startMs: 1129500,
          endMs: 1142e3,
          text: '"Kaladin turned his eyes toward the eastern horizon where the highstorm was gathering again, violet lightning tearing the sky."',
          speaker: "Narrator (Michael Kramer)"
        },
        {
          startMs: 1142500,
          endMs: 1158e3,
          text: '"Life before death. Strength before weakness. Journey before destination. The words resonated in his blood like war drums."',
          speaker: "Kaladin Stormblessed"
        }
      ]
    }
  },
  {
    id: "phm-02",
    title: "Project Hail Mary",
    author: "Andy Weir",
    narrator: "Ray Porter",
    series: "Standalone Sci-Fi",
    seriesNumber: "Novel",
    folderPath: "/storage/emulated/0/Audiobooks/Andy_Weir/Project_Hail_Mary",
    coverColor: "#0f172a",
    coverGlyph: "\u{1F680}",
    state: "Started",
    queueIndex: 2,
    currentFileIndex: 4,
    currentPositionMs: 54e4,
    // 9 minutes
    playbackSpeed: 1.25,
    volumeBoostDb: 2,
    pitchShift: 0,
    rnnoiseEnabled: true,
    skipSilence: true,
    monoDownmix: false,
    balance: 0,
    eqLevels: [0, 2, 1, 2, 0],
    lastPlayedEpochMs: Date.now() - 36e5,
    totalDurationMs: 582e5,
    // 16.1 hours
    files: [
      {
        fileName: "001_HailMary_Amnesia.opus",
        displayName: "Track 01 - The Slumber Wake",
        durationMs: 42e5,
        bitrate: "Opus 32 kbps",
        sampleRate: "48.0 kHz",
        fileSizeMb: 16.8,
        chapters: [{ id: "phm-1", title: "Chapter 1: The Computer Slumber", startMs: 0, endMs: 42e5 }]
      },
      {
        fileName: "005_HailMary_RockyContact.opus",
        displayName: "Track 05 - First Contact at Tau Ceti",
        durationMs: 48e5,
        bitrate: "Opus 32 kbps",
        sampleRate: "48.0 kHz",
        fileSizeMb: 19.2,
        chapters: [{ id: "phm-5", title: "Chapter 9: The Blip-A Approach", startMs: 0, endMs: 48e5 }]
      }
    ],
    sidecars: {
      positionDat: `AK_SABP_SERIALIZED_OBJ_V11.9
mFileName=005_HailMary_RockyContact.opus
mFilePosition=540000
mPlaybackSpeed=1.25
mBoostVolume=2
mEqualizerLevels=[0,2,1,2,0]
mRNNoiseActive=true
mBookState=Started
mBookQueuePosition=2`,
      bookmarksXml: `<?xml version="1.0" encoding="utf-8"?>
<root>
    <bookmark>
        <title>Amaze! Amaze! Amaze!</title>
        <description>Rocky communicates using tonal chords through the xenonite hull.</description>
        <fileName>005_HailMary_RockyContact.opus</fileName>
        <filePosition>540000</filePosition>
    </bookmark>
</root>`,
      charactersXml: `<?xml version="1.0" encoding="utf-8"?>
<root>
    <character>
        <name>Ryland Grace</name>
        <role>Sole Surviving Astronaut & Junior High Science Teacher</role>
        <description>Recruited by Stratt to solve the Astrophage crisis threatening Earth's sun.</description>
    </character>
    <character>
        <name>Rocky</name>
        <role>Eridian Starship Engineer</role>
        <description>Spider-like metallic alien whose crew also perished saving their home planet 40 Eridani.</description>
    </character>
</root>`,
      infoTxt: `Project Hail Mary by Andy Weir, narrated by Ray Porter.
A lone astronaut must save the earth from disaster in this incredible new adventure from the bestselling author of The Martian.`,
      srtSubtitles: [
        {
          startMs: 53e4,
          endMs: 545e3,
          text: '"Human question: Why are you leaky space-blob? Answer: Biology, Rocky. We are made of water."',
          speaker: "Ryland Grace"
        },
        {
          startMs: 545500,
          endMs: 558e3,
          text: '"*Tonal musical chirp* Amaze! Very leaky, very squishy. Good engineer, bad exterior!"',
          speaker: "Rocky"
        }
      ]
    }
  },
  {
    id: "cap-03",
    title: "Crime and Punishment",
    author: "Fyodor Dostoevsky",
    narrator: "Anthony Heald",
    series: "Russian Literature Classics",
    seriesNumber: "Single Volume",
    folderPath: "/storage/emulated/0/Audiobooks/Dostoevsky/Crime_and_Punishment",
    coverColor: "#3b1812",
    coverGlyph: "\u2696\uFE0F",
    state: "New",
    queueIndex: 3,
    currentFileIndex: 0,
    currentPositionMs: 0,
    playbackSpeed: 1,
    volumeBoostDb: 6,
    pitchShift: 0,
    rnnoiseEnabled: true,
    skipSilence: false,
    monoDownmix: true,
    balance: 0,
    eqLevels: [1, 2, 0, 1, 0],
    lastPlayedEpochMs: 0,
    totalDurationMs: 756e5,
    // 21 hours
    files: [
      {
        fileName: "Part_1_Chapter_01.mp3",
        displayName: "Part 1 - Chapter 1: The Yellow Room in St. Petersburg",
        durationMs: 36e5,
        bitrate: "VBR 192 kbps",
        sampleRate: "44.1 kHz",
        fileSizeMb: 52.4,
        chapters: [{ id: "cap-1", title: "Chapter 1: The Garret on S. Lane", startMs: 0, endMs: 36e5 }]
      }
    ],
    sidecars: {
      positionDat: `AK_SABP_SERIALIZED_OBJ_V11.9
mFileName=Part_1_Chapter_01.mp3
mFilePosition=0
mPlaybackSpeed=1.00
mBoostVolume=6
mBookState=New`,
      bookmarksXml: `<?xml version="1.0" encoding="utf-8"?>
<root></root>`,
      charactersXml: `<?xml version="1.0" encoding="utf-8"?>
<root>
    <character>
        <name>Rodion Romanovich Raskolnikov</name>
        <role>Former Law Student / Protagonist</role>
        <description>Living in abject poverty in a tiny garret; formulates a theory of extraordinary men exempt from moral laws.</description>
    </character>
    <character>
        <name>Sofya Semyonovna Marmeladova (Sonya)</name>
        <role>Daughter of Marmeladov</role>
        <description>Self-sacrificing devout young woman who supports her starving family.</description>
    </character>
    <character>
        <name>Dmitri Prokofyich Razumikhin</name>
        <role>Loyal Friend</role>
        <description>Hardworking former student whose optimism and generosity contrast with Raskolnikov's brooding isolation.</description>
    </character>
    <character>
        <name>Porfiry Petrovich</name>
        <role>Investigating Magistrate</role>
        <description>Astute investigator of the pawnbroker's murder, relies on psychological pressure rather than physical clues.</description>
    </character>
</root>`,
      infoTxt: `Crime and Punishment by Fyodor Dostoevsky.
Set in the sweltering summer streets of Saint Petersburg, the novel traces the psychological torment and moral dilemmas of Raskolnikov.`,
      srtSubtitles: [
        {
          startMs: 0,
          endMs: 12e3,
          text: '"On an exceptionally hot evening early in July a young man came out of the garret in which he lodged in S. Place and walked slowly, as though in hesitation, towards K. bridge."',
          speaker: "Anthony Heald"
        }
      ]
    }
  },
  {
    id: "dune-04",
    title: "Dune",
    author: "Frank Herbert",
    narrator: "Full Cast Production",
    series: "Dune Chronicles",
    seriesNumber: "Book 1",
    folderPath: "/storage/emulated/0/Audiobooks/Frank_Herbert/Dune",
    coverColor: "#78350f",
    coverGlyph: "\u{1FA90}",
    state: "Finished",
    currentFileIndex: 23,
    currentPositionMs: 36e5,
    playbackSpeed: 1.1,
    volumeBoostDb: 0,
    pitchShift: 0,
    rnnoiseEnabled: true,
    skipSilence: true,
    monoDownmix: false,
    balance: 0,
    eqLevels: [3, 1, 0, 2, 2],
    lastPlayedEpochMs: Date.now() - 864e5 * 3,
    totalDurationMs: 76e6,
    files: [
      {
        fileName: "Dune_Final_Battle.mp3",
        displayName: "Book 3: The Prophet - Finale",
        durationMs: 36e5,
        bitrate: "CBR 320 kbps",
        sampleRate: "48.0 kHz",
        fileSizeMb: 82.5,
        chapters: [{ id: "dune-fin", title: "Epilogue: Emperor of Arrakis", startMs: 0, endMs: 36e5 }]
      }
    ],
    sidecars: {
      positionDat: `AK_SABP_SERIALIZED_OBJ_V11.9
mFileName=Dune_Final_Battle.mp3
mFilePosition=3600000
mBookState=Finished`,
      bookmarksXml: `<?xml version="1.0" encoding="utf-8"?>
<root>
    <bookmark>
        <title>Litany Against Fear</title>
        <description>I must not fear. Fear is the mind-killer. Fear is the little-death that brings total obliteration.</description>
        <fileName>Dune_Part01.mp3</fileName>
        <filePosition>742000</filePosition>
    </bookmark>
</root>`,
      charactersXml: `<?xml version="1.0" encoding="utf-8"?>
<root>
    <character>
        <name>Paul Atreides (Muad'Dib)</name>
        <role>Heir to House Atreides / Kwisatz Haderach</role>
        <description>Trained in Bene Gesserit prana-bindu disciplines and Mentat computation.</description>
    </character>
    <character>
        <name>Lady Jessica</name>
        <role>Bene Gesserit / Mother of Paul</role>
        <description>Concubine of Duke Leto who defied the Sisterhood order to bear a daughter.</description>
    </character>
</root>`,
      infoTxt: `Dune by Frank Herbert, Full Cast Recording.
Winner of the Hugo and Nebula Awards, Dune is the definitive science fiction epic of politics, religion, and ecology on the desert planet Arrakis.`,
      srtSubtitles: []
    }
  }
];
const ROOT_STORAGE_FOLDERS = [
  { path: "/storage/emulated/0/Audiobooks", freeSpaceGb: 412, isInternal: true, bookCount: 3 },
  { path: "/storage/SD_CARD_128G/Audiobooks", freeSpaceGb: 88, isInternal: false, bookCount: 1 },
  { path: "/storage/USB_OTG_DRIVE/AudioLibrary", freeSpaceGb: 256, isInternal: false, bookCount: 0 }
];
export {
  INITIAL_BOOKS,
  ROOT_STORAGE_FOLDERS
};
