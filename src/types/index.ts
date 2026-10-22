/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FolderPlay Core Domain Types & Data Models
 * Reconstructed from Smart AudioBook Player v11.9.0 & Architecture Spine
 */

export type BookState = 'Started' | 'New' | 'Finished';

export interface Chapter {
  id: string;
  title: string;
  startMs: number;
  endMs: number;
  pov?: string;
}

export interface AudioFile {
  fileName: string;
  displayName: string;
  durationMs: number;
  bitrate: string;
  sampleRate: string;
  fileSizeMb: number;
  chapters: Chapter[];
}

export interface Bookmark {
  id: string;
  bookId: string;
  title: string;
  description: string;
  fileName: string;
  filePositionMs: number;
  globalPositionMs: number;
  createdAtEpochMs: number;
  colorTag?: string;
}

export interface Character {
  id: string;
  bookId: string;
  name: string;
  role: string;
  description: string;
  allegiance?: string;
  firstMentionChapter?: string;
  colorAccent?: string;
}

export interface SubtitleCue {
  startMs: number;
  endMs: number;
  text: string;
  speaker?: string;
}

export interface SidecarData {
  positionDat: string;
  bookmarksXml: string;
  charactersXml: string;
  infoTxt: string;
  srtSubtitles: SubtitleCue[];
}

export interface Book {
  id: string;
  title: string;
  author: string;
  narrator: string;
  series?: string;
  seriesNumber?: string;
  folderPath: string;
  coverColor: string;
  coverGlyph: string;
  coverImage?: string;
  state: BookState;
  queueIndex?: number;
  files: AudioFile[];
  currentFileIndex: number;
  currentPositionMs: number;
  playbackSpeed: number; // 0.5 to 3.0
  volumeBoostDb: number; // 0 to 20 dB
  pitchShift: number; // -12 to +12 semitones
  rnnoiseEnabled: boolean;
  skipSilence: boolean;
  monoDownmix: boolean;
  balance: number; // -1.0 to 1.0
  eqLevels: [number, number, number, number, number]; // 60Hz, 230Hz, 910Hz, 3.6kHz, 14kHz
  lastPlayedEpochMs: number;
  totalDurationMs: number;
  playedDurationMs?: number;
  sidecars: SidecarData;
}

export interface SleepTimerState {
  active: boolean;
  targetDurationSec: number;
  remainingSec: number;
  fadeoutActive: boolean;
  shakeToResetEnabled: boolean;
  shakeSensitivity: number; // 1, 3, 6, 12, 18
  scheduledBedtimeActive: boolean;
  androidAutoInhibit: boolean;
}

export interface AutoRewindState {
  armed: boolean;
  calculatedOffsetSec: number;
  pausedDurationSec: number;
  lastPauseEpochMs: number;
}

export interface DspSettings {
  speed: number;
  pitch: number;
  volumeBoostDb: number;
  rnnoise: boolean;
  mono: boolean;
  balance: number;
  eq: [number, number, number, number, number];
  skipSilence: boolean;
}

export type ThemeMode = 'nocturne' | 'leatherbound' | 'nordic' | 'solar';

export type ViewMode = 
  | 'now-playing'
  | 'library'
  | 'dsp-studio'
  | 'characters-bookmarks'
  | 'sleep-timer'
  | 'car-mode'
  | 'transcoder'
  | 'sidecar-inspector';
