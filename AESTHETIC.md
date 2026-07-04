# Aesthetic

The visual direction and decision record for `TRIT//-0+`. It describes the
instrument Setun is trying to become, but it is not evidence that every idea has
shipped. Product behavior and observed usability take precedence when this
document disagrees with the implementation.

## Decision status

The labels used in this document are:

- **Implemented** — present in the current console and intended to remain.
- **Partial** — present in a narrower or less successful form than described.
- **Candidate** — a direction worth testing, not approved implementation work.
- **Deferred** — intentionally outside the active comprehension milestone.
- **Rejected** — a named direction the product should not drift toward.

Current ledger:

| Area | Status | Current reality |
| --- | --- | --- |
| Alternate laboratory-instrument brief | Implemented | Guides the shipped console |
| Dark panel, color system, and typography | Implemented | Tokens and local fonts are in use |
| Three-position trit control | Implemented | Direct input, keyboard support, and state lamps ship |
| Desktop console layout | Implemented | Wide instrument panel is the strongest layout |
| Mobile console layout | Implemented | Registers wrap into a fully visible 2-column grid rather than scrolling |
| Recessed wells, machined edges, and lamp glow | Implemented | Used throughout the console |
| Fixed top-light material model | Implemented | Raised edges catch light above; recessed and pressed surfaces darken inward |
| Precision markings | Partial | Power labels and console ID ship; ruler ticks and signed-range engraving do not |
| Grain or vignette | Implemented | Room grain and vignette cross both environmental and panel surfaces while content remains on a clean upper layer |
| Carry pulse and static reduced-motion trace | Implemented | Uses domain normalization metadata |
| Power-on sequence | Candidate | Not implemented and not required for the next milestone |
| Phosphor-decay readout | Candidate | Not implemented and lower priority than comprehension |
| Sound | Deferred | No active software or hardware commitment |
| Alternate visual roads and anti-goals | Rejected | Retained as drift protection |

An unimplemented candidate must not be added merely to make this document true.

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
  --reflection: rgba(255, 255, 255, 0.025);  /* lower rim inside a top-lit recess */

  /* One fixed top-light model */
  --shadow-raised: inset 0 1px 0 var(--edge);
  --shadow-recessed: inset 0 2px 4px rgba(0, 0, 0, 0.5),
                     inset 0 -1px var(--reflection);
  --shadow-pressed: inset 0 3px 5px rgba(0, 0, 0, 0.65),
                    inset 0 -1px var(--reflection);

  /* Text */
  --label:   #8f9188;  /* engraved section labels: INPUT A, MODE, STATUS, … */
  --text:    #d9d7cb;  /* readouts and values — warm ivory, not pure white */

  /* Trit states — the only saturated colors in the app */
  --trit-neg:  #f2a73b;  /* − : warm amber */
  --trit-zero: #9aa0a6;  /* 0 : calm neutral grey */
  --trit-pos:  #3fc6d8;  /* + : phosphor cyan */

  /* Status */
  --overflow: #e75a50;  /* OVERFLOW lamp only — AA text contrast on panel-1 */
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
- **Data**: a monospace with more character than the dev-tool defaults. First choice **Martian Mono**; alternate IBM Plex Mono. Used for trit symbols, powers of three, and diagnostic text.
- **Trit symbols** are the load-bearing glyphs: large, weight 500–600, true typographic characters — `−` (U+2212), not hyphen — so `−` and `+` match in width and weight.
- **Decimal readout**: Barlow Condensed at weight 600, `--text`, with tabular figures. It reads like a purpose-built instrument inscription rather than terminal output. No seven-segment font — that's calculator cosplay, and this instrument is not a calculator.
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
│ LOAD        [ A ] [ B ]  ZERO ONE NEG ONE EIGHT … RANDOM         │
│                                                                  │
│ MODE        [ ADD ][ SUB ][ MUL ][ NEG ][ INC ][ DEC ][ SHR ][ AND ][ OR ][ NOT ][ CMP ] │
│                                                                  │
│ RESULT      [ + | − | 0 | + | 0 | − ]        [ RESULT → A ]      │
│                                                                  │
│ DECIMAL     A: +8     B: −6     RESULT: +2                       │
│ STATUS      NORMALIZED · NO OVERFLOW · CARRY TRACE AVAILABLE     │
└──────────────────────────────────────────────────────────────────┘
```

- **Implemented on desktop:** a wide instrument panel rather than a card-based web app.
- **Implemented on mobile:** the page stacks its major sections, and each six-trit register wraps into a 2-column, 3-row grid rather than scrolling — each trit control is a full three-position switch (~136px), so at 375–430px only two fit per row regardless of label reservation; three-per-row would require shrinking below the 44px touch-target floor. All six positions stay visible at once. It must not become a pile of generic rounded cards.
- **Every trit position carries its power-of-three label** (`3⁵` … `3⁰`), tiny, in the condensed sans, `--label`. Panel engraving and passive education in one element.
- **Partial — precision markings:** power labels and the console number ship. Ruler ticks and `SIGNED RANGE −364 … +364` engraving remain candidates and should appear only where they improve orientation. Sparse — calibration marks, not wallpaper.
- **The STATUS line is the instrument's voice**: terse, uppercase, neutral ramp. `NORMALIZED · NO OVERFLOW · CARRY TRACE AVAILABLE`, or `OVERFLOW` with the red lamp lit. No sentences, no exclamation marks.

## Materials and depth

A physical instrument's most basic visual fact: things are recessed *into* the panel or raised *out of* it.

- **Raised enamel** (`--panel-1`, `--shadow-raised`): the casing and unselected physical buttons use a 1px `--line` border with a top `--edge` catch. No drop shadow, bottom highlight, or floating elevation.
- **Recessed well** (`--panel-2`, `--shadow-recessed`): trit tracks, selected/latching keys, disclosure panels, and logic tables use a dark top inner shadow with a faint lower reflection.
- **Illuminated aperture** (`--panel-2`, `--shadow-recessed`, restrained glow): decimal and computed readouts use the same recess geometry, adding light only to the information being emitted.
- **Implemented -- pressure response:** pointer presses on any physical button and keyboard presses on trit controls temporarily use `--shadow-pressed`; editable trits preserve their state-color glow above that pressure shadow. Press feedback never moves the control or its surrounding layout.
- **Modular key rhythm:** operation and A/B target keys share one fixed width and gap; preset keys use one wider fixed module so short and long labels remain orderly without becoming cramped.
- **Implemented — texture budget:** a fixed SVG grain and room vignette crosses both the environmental background and the panel enamel, while a raised `panel-inner` layer keeps it below labels, controls, and readouts. The panel also has its own scoped light vignette — a soft highlight above center fading to a darker edge at the panel's bounds. That is the whole budget: **no** directional brushed-metal highlights, scanlines, scratches, or rust.
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
- Each trit exposes an ARIA slider with position in `aria-label` (e.g. `Input A, trit 4 of 6`) and state in `aria-valuetext` (e.g. `positive one`), so a screen reader announces both together.
- All state changes have a motion-free equivalent (see below).

## Motion

Motion is sparse and subordinate to comprehension:

1. **Candidate — power-on.** A single page-load sequence in which lamps settle to zero and the status line reports `NORMALIZED`. If tested, total duration must stay at or below 900ms, never block interaction, and disappear entirely under reduced motion. This is not implemented and is not active roadmap work.
2. **Implemented — carry pulse.** A brief right-to-left trace through trits touched by normalization, approximately 60ms per trit, followed by factual status text. The static underline markers preserve the information under reduced motion.
3. **Candidate — phosphor decay.** Old decimal digits ghost out over approximately 150ms. This is not implemented and should be tested only if it improves the readout's material character without reducing clarity.

Rules:

- Durations 120–240ms for everything else; easing `cubic-bezier(0.2, 0, 0, 1)` — sharp mechanical settle, no bounce, no spring.
- **`prefers-reduced-motion`**: no power-on, pulse, or decay. Trits changed by normalization get a static highlight (an underline tick in the trit's color) plus textual carry information. Information-equivalent, motion-free behavior is an implemented requirement even when the surrounding motion is only a candidate.
- Nothing loops, nothing idles, nothing breathes. An instrument at rest is still.

## Sound

**Deferred.** The software instrument is silent. Sound and physical hardware are
experiments rather than active roadmap phases.

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
