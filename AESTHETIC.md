# Aesthetic

The visual spec for `TRIT//-0+`. The README's [Visual language](README.md#visual-language) section states the intent; this document makes the concrete decisions so the UI exploration track has something to iterate against rather than re-deciding values live. It is meant to be updated when the trit-control iteration loop overturns a decision — spec, not scripture.

## The brief

> A precision desk instrument from an alternate 1960s–1980s where ternary computing won.

Not a restored museum piece from our timeline — a product of a different one, beautifully made and never actually manufactured. Historically grounded enough to be believable, strange enough that you immediately understand you're looking at a computer from a different technological lineage. Stripped of propaganda, grime, and cosplay.

When a decision is ambiguous, ask: *would this appear on a piece of laboratory equipment from that timeline?* Panel rules, engraved labels, indicator lamps, calibration marks: yes. Gradients, glassmorphism, bouncy animation, marketing prose: no.

Two failure modes bracket this direction, and both are fatal:

- **Cosplay** — fake scratches, rust, VHS distortion, faux-Cyrillic type, scanline shaders. The instrument is pristine and confident, not a prop.
- **The generic dark dev-tool** — flat near-black panel, one mono font, no texture, no depth. Tasteful and forgettable; every terminal app already lives there. Over-restraint is its own genericness. The atmosphere (grain, recession, engraving, lamp glow) is not decoration on the design — it *is* the design.

## Roads not taken

Kept as named branches in case the main direction stalls, explicitly not where we start:

| Direction | What it becomes | Risk |
| --------- | --------------- | ---- |
| Bauhaus / Braun industrial | Clean, timeless consumer-electronics ternary instrument | Too sterile, drifts Apple-like |
| Near-future research lab | White/graphite hardware UI, high-end scientific tool | Drifts into generic SaaS dashboard |
| Alien archaeological terminal | Strange symbols, unfamiliar geometry, speculative fiction | Makes the arithmetic harder to read |

## Theme

Dark panel only for v1. An instrument has one faceplate; a light mode is a different instrument. Deliberate scope decision, not an oversight.

## Color

The panel ramp leans **grey-green** — the enamel of period lab equipment — rather than dead neutral. It registers subliminally as "from somewhere else" without being nameable.

```css
:root {
  /* Surfaces — grey-green enamel ramp */
  --panel-0: #121412;  /* page background */
  --panel-1: #1a1d1a;  /* raised module face (registers, mode block) */
  --panel-2: #0c0e0c;  /* inset wells: trit tracks, display windows */
  --line:    #2b2f2a;  /* hairline borders and panel rules */
  --edge:    rgba(255, 255, 255, 0.06);  /* 1px machined-edge catch on raised surfaces */

  /* Text */
  --label:   #8f9188;  /* engraved section labels: INPUT A, MODE, STATUS, … */
  --text:    #d9d7cb;  /* readouts and values — warm ivory, not pure white */

  /* Trit states — the only saturated colors in the app */
  --trit-neg:  #f2a73b;  /* − : warm amber */
  --trit-zero: #9aa0a6;  /* 0 : calm neutral grey */
  --trit-pos:  #3fc6d8;  /* + : phosphor cyan */

  /* Status */
  --overflow: #e0483e;  /* OVERFLOW lamp only — used nowhere else */
  --focus:    #e9e7df;  /* keyboard focus marks */
}
```

Rules:

- **Amber and cyan must read as equally "on."** They are tuned to similar perceived luminance; if either is adjusted, re-tune the other. `−` is a direction, not a warning; `+` is a direction, not a success badge. The accessibility promise in the README depends on this.
- **Zero is calm, not dead.** A lit `0` position uses `--trit-zero` at full opacity — a lamp glowing quietly, not a disabled control. Zero is a real stable value; the system is centered on equilibrium, and the palette has to say so.
- **Red means overflow and nothing else.** One indicator lamp. If red appears anywhere else, the instrument's only alarm is diluted.
- **No green.** A green status lamp would compete with cyan and smuggle back the binary red/green good–bad axis this project exists to escape. Status text lives in the neutral ramp.
- **Saturated color is trit state.** Chrome, borders, labels, and layout stay in the enamel ramp.

## Typography

Two families, as on real instrument faceplates — a condensed technical sans for the panel, a monospace for the machine:

- **Panel labels and headings**: a DIN-flavored condensed sans. First choice **Barlow Condensed**; alternates Archivo Narrow, Saira Condensed. Small (11–13px), uppercase, letter-spaced (+0.08 to +0.12em), `--label`. This is the "engraved" text: `INPUT A`, `MODE`, `STATUS`, `SIGNED RANGE −364 … +364`.
- **Data**: a monospace with more character than the dev-tool defaults. First choice **Martian Mono**; alternate IBM Plex Mono. Used for trit symbols, decimal values, powers of three, and diagnostic text.
- **Trit symbols** are the load-bearing glyphs: large, weight 500–600, true typographic characters — `−` (U+2212), not hyphen — so `−` and `+` match in width and weight.
- **Decimal readout**: large, `--text`, tabular figures. No seven-segment font — that's calculator cosplay, and this instrument is not a calculator.
- **Wordmark**: the condensed sans at heavy weight, plain and confident. **No faux-Cyrillic display type** — that's the propaganda cosplay we stripped out.

```
TRIT//-0+                              REGISTER CONSOLE 01
BALANCED TERNARY REGISTER CONSOLE
```

No "welcome," no marketing prose, no hero section. The machine is the homepage.

## Layout: the console

A wide instrument panel, not a card-based web app:

```text
┌──────────────────────────────────────────────────────────────────┐
│ TRIT//-0+                                  REGISTER CONSOLE 01   │
│                                                                  │
│ INPUT A     [ − | 0 | + ] [ − | 0 | + ] [ − | 0 | + ] …          │
│                3⁵            3⁴            3³                    │
│                                                                  │
│ INPUT B     [ − | 0 | + ] [ − | 0 | + ] [ − | 0 | + ] …          │
│                                                                  │
│ MODE        [ ADD ] [ SUB ] [ MUL ] [ NEG ] [ INC ] [ DEC ] [ LOGIC ] │
│                                                                  │
│ RESULT      [ + | − | 0 | + | 0 | − ]        [ RESULT → A ]      │
│                                                                  │
│ DECIMAL     A: +8     B: −6     RESULT: +2                       │
│ STATUS      NORMALIZED · NO OVERFLOW · CARRY TRACE AVAILABLE     │
└──────────────────────────────────────────────────────────────────┘
```

- **Designed wide, desktop-first**; on mobile the console stacks into vertical register modules. Stacking is a commitment, not an afterthought — the README makes mobile comfort a hard requirement. It never becomes rounded cards.
- **Every trit position carries its power-of-three label** (`3⁵` … `3⁰`), tiny, in the condensed sans, `--label`. Panel engraving and passive education in one element.
- **Precision markings** where they earn their place: ruler ticks along register tracks, `SIGNED RANGE −364 … +364` near the registers, the console number top-right. Sparse — calibration marks, not wallpaper.
- **The STATUS line is the instrument's voice**: terse, uppercase, neutral ramp. `NORMALIZED · NO OVERFLOW · CARRY TRACE AVAILABLE`, or `OVERFLOW` with the red lamp lit. No sentences, no exclamation marks.

## Materials and depth

A physical instrument's most basic visual fact: things are recessed *into* the panel or raised *out of* it.

- **Raised surfaces** (`--panel-1` modules): 1px `--line` border plus a 1px `--edge` catch on the top edge — a machined highlight, not a drop shadow.
- **Inset wells** (`--panel-2`): trit tracks and display windows sit visibly *in* the panel — subtle inner shadow at the top, slightly darker fill. The decimal readout is a recessed display window, darker than the panel around it, its digits faintly luminous.
- **Texture budget — spent once**: one extremely subtle grain layer over the panel (felt, never noticed; imperceptible at a glance), optionally a faint vignette. That is the whole budget. **No** directional brushed-metal highlights, no scanlines, no scratches, no rust.
- **Corner radius 2px maximum.** Machined edges, not rounded candy.
- **Glow reads as lamp, not neon**: at most a soft halo of the trit's own color at low alpha (~25%, blur ≤ 6px) on an *active* lamp. Never on layout, never stacked.
- **The result register is more luminous than the inputs** — brighter symbols, slightly stronger halo — as if actively computed rather than dialed in.

## The trit control

The single most important element (per the [roadmap](ROADMAP.md), it earns its own iteration loop). A chunky three-position control, recessed into the panel:

```
[ − | 0 | + ]
     3⁴
```

| State | Selected position | Unselected positions |
| ----- | ----------------- | -------------------- |
| `−` | Amber lamp, symbol at full intensity | Symbols at ~30% opacity, no fill |
| `0` | Quiet grey lamp — lit, calm, clearly *chosen* | 〃 |
| `+` | Cyan lamp, symbol at full intensity | 〃 |

Requirements:

- All three positions visible at all times — the control's shape alone says "this has three states." Never a cycling button whose next state is a mystery.
- State readable without color: position within the track + symbol carry the meaning; color reinforces it.
- Sits in an inset well (`--panel-2`) — the switch-like feel comes from recession and the state lamp, not from 3D-rendered skeuomorphism.
- Minimum touch target 44×44px per position on mobile.
- Position changes settle in ≤ 120ms; state is never ambiguous mid-transition.

## Focus and accessibility

- Keyboard focus is drawn as **corner brackets** (viewfinder-style ticks in `--focus`) around the focused control — the instrument's way of saying "this channel is selected." Never invisible, never `outline: none` without a replacement, never color-only.
- Screen-reader labels per the README: position and state (`Input A, trit 4 of 6, currently positive one.`).
- All state changes have a motion-free equivalent (see below).

## Motion

Three signature moments, and almost nothing else:

1. **Power-on** (page load, once). An instrument doesn't fade in — it powers on: lamps flicker to life staggered across the panel, registers settle to zero, the status line reports `NORMALIZED`. Total ≤ 900ms, never blocks interaction, skipped entirely under reduced motion (the console simply appears, on).
2. **Carry pulse** (the interaction signature). A narrow brightness pulse traveling right-to-left through the register track, like a signal passing through circuitry — ~60ms per trit, once. It shows causality — *this* carry produced *that* trit — then gets out of the way.
3. **Phosphor decay** (the readout material). When a decimal value changes, the old digits ghost out over ~150ms rather than swapping instantly.

Rules:

- Durations 120–240ms for everything else; easing `cubic-bezier(0.2, 0, 0, 1)` — sharp mechanical settle, no bounce, no spring.
- **`prefers-reduced-motion`**: no power-on, no pulse, no decay. Trits changed by normalization get a static highlight (an underline tick in the trit's color) plus the textual carry explanation. Information-equivalent, motion-free.
- Nothing loops, nothing idles, nothing breathes. An instrument at rest is still.

## Sound

None in v1. The roadmap reserves sound for the physical hardware phase; the software instrument is silent.

## Anti-goals

- No neon glow bloom, no gradient buttons, no glassmorphism.
- No matrix-rain, terminal-green hacker styling, or crypto-brand geometry.
- No conventional calculator layout or seven-segment cosplay.
- No fake wear: scratches, rust, VHS distortion, CRT scanline shaders.
- No faux-Cyrillic type, hammer-and-sickle iconography, or propaganda-poster styling — the timeline is alternate, not ideological.
- No playful/rounded educational styling — the education layer looks like documentation printed on the panel, not a classroom poster.
- No card-based web-app layout, hero sections, or marketing prose.

## Reference points

Tektronix and period oscilloscope faceplates, amber and cyan phosphor terminals, industrial control panels, Soviet-era lab instrument enamel, and the [Setun](https://en.wikipedia.org/wiki/Setun) machine itself. Borrow the discipline of those objects, not their wear and tear: the goal is a beautifully made instrument from a timeline that never happened, in mint condition because it was never used — because it was never built.
