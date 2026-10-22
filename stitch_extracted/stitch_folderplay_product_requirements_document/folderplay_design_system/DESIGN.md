---
name: FolderPlay Design System
colors:
  surface: '#0e141c'
  surface-dim: '#0e141c'
  surface-bright: '#343a42'
  surface-container-lowest: '#090f16'
  surface-container-low: '#161c24'
  surface-container: '#1a2028'
  surface-container-high: '#242a33'
  surface-container-highest: '#2f353e'
  on-surface: '#dde3ee'
  on-surface-variant: '#d0c6ae'
  inverse-surface: '#dde3ee'
  inverse-on-surface: '#2b3139'
  outline: '#99907b'
  outline-variant: '#4d4635'
  surface-tint: '#eac33e'
  primary: '#fff2d6'
  on-primary: '#3c2f00'
  primary-container: '#fcd34d'
  on-primary-container: '#715b00'
  inverse-primary: '#735c00'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#dff7ff'
  on-tertiary: '#003640'
  tertiary-container: '#7fe5ff'
  on-tertiary-container: '#006678'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe086'
  primary-fixed-dim: '#eac33e'
  on-primary-fixed: '#231b00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#acedff'
  tertiary-fixed-dim: '#4cd7f6'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#0e141c'
  on-background: '#dde3ee'
  surface-variant: '#2f353e'
typography:
  headline-xl:
    fontFamily: Literata
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Literata
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Literata
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 36px
  headline-lg-mobile:
    fontFamily: Literata
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 30px
  headline-md:
    fontFamily: Literata
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Manrope
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Manrope
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Manrope
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Manrope
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.06em
  timecode-display:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
  space-2xl: 3.5rem
---

## Brand & Style

The design system crafts an austere, distraction-free sanctuary for dedicated listeners. It merges the tactile dignity of fine bookbinding with the mechanical certainty of vintage high-fidelity audio equipment. Built for nocturnal, bedside, and automotive contexts, it eliminates luminous glare while maximizing spatial legibility. 

The aesthetic is anchored in chiseled audio hardware and warm parchment illumination:
- **Atmosphere:** Deep OLED night backgrounds reduce retinal fatigue and battery drain during extended multi-hour listening sessions.
- **Accents:** Candlelight amber and aged-parchment gold tones establish focal anchors without disrupting dark adaptation.
- **Hardware Tactility:** Physical instrument cues—beveled jog dials, recessed scrub tracks, crisp status LEDs, and brushed matte faceplates—provide instant situational awareness.
- **Tone:** Methodical, timeless, distraction-free, and authoritative.

## Colors

The palette enforces strict nocturnal hierarchy, separating structural chassis surfaces from luminous interactive states.

### Palette Architecture
- **Primary (`#FCD34D` Amber Gold):** Reserved for core transport activations, playback progress bars, primary scrub heads, and highlighted active chapters. Radiates warmth without blinding.
- **Secondary (`#10B981` Studio Emerald):** Dedicated to active signal indicators, sleep timer countdown pulses, and valid audio sync states.
- **Tertiary (`#06B6D4` Calibration Cyan):** Applied to equalizer metrics, speed multipliers (e.g., 1.25x), and character cast tags.
- **Neutral Core (`#121820` Console Iron):** Structural base. Extended with deep OLED black (`#070A0E`) for the canvas foundation and brushed carbon (`#1A222D`) for card surfaces and tactile plate insets.

### Semantic & State Values
- **Canvas Base:** `#070A0E` (OLED True Dark)
- **Chassis Raised:** `#121820`
- **Surface Highlight / Plate:** `#1A222D`
- **Border Subtle:** `#283342`
- **Text High-Contrast:** `#F3F4F6` (Parchment White)
- **Text Muted:** `#8F9CAE` (Machined Nickel)
- **Alert / Overdrive:** `#EF4444` (Warning Red)

## Typography

Typography bridges editorial literature with high-precision instrumentation:
- **Titles & Book Metadata (`Literata`):** Warm, bookish, and scholarly serif styling evokes traditional physical volumes and library bindings.
- **Controls, Timers, & Telemetry (`Manrope`):** Balanced, modern geometric-humanist grotesque ensuring uncompromised glanceability in nightstands or car mounts.
- **Timecode & Scrubber Readouts:** Rendered with tabular numbers (`tnum`) in `Manrope` to eliminate jitter during active playback scrub.

## Layout & Spacing

The layout is built for high-stakes ergonomics: nighttime bedside operation with drowsy motor control, one-handed grip, and automotive dash docks.

### Spacing & Grid Discipline
- **Grid Architecture:** 4-column structure on mobile devices, expanding to 8 columns on foldables and tablets. 
- **Touch Target Enclosure:** All interactive controls maintain a mandatory minimum clearance target of 48×48px. Dedicated skip actions (`-60s`, `+30s`) and the central transport play/pause button occupy expanded zones of at least 64×64px to 80×80px.
- **Bottom-Weighted Gravity:** 75% of touch interactions are clustered in the lower 40% of the viewport to accommodate natural thumb reach. Book cover art, metadata, and equalizer telemetry remain pinned to the upper viewing plane.

## Elevation & Depth

Depth is modeled through machined physical tiers rather than diffused white light casts. Components mimic anodized aluminum and matte composite plates set into an equipment rack.

### Tonal Stratification
- **Level 0 (Chassis Bed):** `#070A0E` — The base canvas floor.
- **Level 1 (Surface Plates):** `#121820` — Main playback panel, folder lists, drawer backgrounds. Defined by a 1px top highlight border of `rgba(255, 255, 255, 0.07)` and an inset perimeter.
- **Level 2 (Mechanical Modules):** `#1A222D` — Floating audio scrubbing blocks, equalizer overlays, dialog sheets. Uses low-intensity, color-tinted ambient shadow: `0 12px 32px -4px rgba(0, 0, 0, 0.75)`.
- **Level 3 (Tactile Switches & Dials):** Raised controls feature an explicit dual-edge rim: an illuminated 1px top edge of `#283342` and a deep lower shelf shadow (`0 4px 6px -1px rgba(0, 0, 0, 0.6)`) to convey physical pressing stroke.
- **Active State / Illumination:** Engaged buttons shed inner ambient glows of `#FCD34D` at 12% opacity, simulating a warm internal bulb filament behind vintage studio dials.

## Shapes

The design system enforces a noticeably rounded, accessible form language (`roundedness: 2`):
- **Base Geometry:** Standard elements utilize `0.5rem` (8px) corner radii, offering a softer, welcoming touch target while retaining structural integrity.
- **Structural Panels & Sheets:** Cards, book cover placeholders, and bottom sheets scale to `rounded-lg` (`1rem` / 16px).
- **Control Hardware:** Scrub knobs, time jump toggles, and status LEDs use strict squircle-bounded mechanical geometry or precise circular indicators (`rounded-full`) exclusively where rotational metaphor demands.

## Components

### Transport & Jump Controls
- **Primary Play/Pause Button:** Heavy circular disc with an inset brushed border (`#283342`). In active playback, it emits an ambient `#FCD34D` under-glow. Sized at 80×80px for immediate tactile confidence.
- **Interval Jump Buttons (`-60s`, `-10s`, `+30s`):** Beveled hardware plates. The directional arrow is accompanied by prominent numeric labels in `Manrope` bold. Visual feedback upon touch is immediate via a recessed inset transform (`translate-y: 1px`) and border lightening.

### Audio Scrubber & Waveform Bar
- **Progress Track:** Recessed 6px channel in `#1A222D` with an etched inner border.
- **Played Duration:** Filled with glowing `#FCD34D`.
- **Scrubber Head (Playhead):** Machined vertical brass pill (`8px × 24px`) with knurled grip lines, giving substantial touch affordance without obscuring underlying audio chapter breakpoints.

### Bookmarks & Character Cast Drawer
- **Cast Cards:** Horizontal modular cards displaying character name in `Literata` and actor/role metadata in `Manrope`. Pinned accents in `#06B6D4` indicate recurring speaker status.
- **Bookmark Chips:** Compact physical tabs marked with exact timecode stamps, user audio notes, and color-coded mood tags.

### Sleep Timer & Hardware Toggles
- **Sleep Preset Chips:** Segmented pill array (`15m`, `30m`, `End of Chapter`, `Fade Out`). Active selection shifts background to `#121820` with an active `#10B981` status LED pin beside the label.
- **Volume & Boost Sliders:** Heavy linear tracks with decibel graduation markings along the rail.

### Folder / Chapter List Items
- **List Rows:** Structured table rows separated by hairline dividers (`rgba(255, 255, 255, 0.05)`). Each item features leading track numbers, a title in `Literata`, remaining duration, and an optional offline file verification icon.