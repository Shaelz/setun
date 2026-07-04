# setun

**TRIT//-0+** is a tactile six-trit balanced-ternary calculator and logic console.
It treats `-`, `0`, and `+` as native digits rather than adding ternary conversion
to a conventional calculator.

The project is named after [Setun](https://en.wikipedia.org/wiki/Setun), the Soviet
balanced-ternary computer built in 1958. `TRIT//-0+` is the in-app wordmark;
`setun` is the repository.

The current release is a functional v1: the arithmetic, logic, overflow handling,
keyboard interaction, and core instrument interface are implemented. The next
product work is not about adding more calculator buttons. It is about making the
existing operations easier to understand, especially carries and normalization,
and making the full six-trit register easier to read on mobile.

## Why balanced ternary?

Balanced ternary uses three digits:

```text
- = -1
 0 =  0
 + = +1
```

Each position is a power of three. For example:

```text
+ 0 -
= (+1 x 3^2) + (0 x 3^1) + (-1 x 3^0)
= 8
```

```text
- + 0
= (-1 x 3^2) + (+1 x 3^1) + (0 x 3^0)
= -6
```

Negative numbers need no separate sign bit. Negation is simply flipping every
`+` to `-` and every `-` to `+`. A six-trit register represents values from
**-364 to +364**.

Setun is meant to make those properties tangible. The design goal is that a user
leaves thinking: **"Oh. Binary is not inevitable."**

## What is implemented

- Two editable six-trit input registers and one computed result register
- Addition, subtraction, multiplication, negation, increment, and decrement
- Explicit overflow rather than silent wrapping
- Ordered ternary AND, OR, and NOT using `- < 0 < +`
- `RESULT -> A` chaining for accumulator-style experiments
- Carry and borrow trace metadata with brief visual and textual feedback
- Presets for zero, one, negative one, eight, negative six, limits, and random trits
- A compact balanced-ternary reference panel
- Keyboard-accessible trit controls and operation selectors
- Reduced-motion equivalents for carry feedback
- Automated tests for arithmetic, normalization, overflow, logic, and presets
- A linked component exhibit at `/playground/trit-control`, showing the trit
  control in isolation from the full console

## Using the console

Each trit is a direct three-position control:

```text
[ - | 0 | + ]
```

The most significant trit is on the left. The small labels beneath the controls
show the corresponding powers of three, from `3^5` through `3^0`.

### Keyboard controls

- `Tab` and `Shift+Tab` move between trit controls.
- Left Arrow moves the focused trit toward `-`.
- Right Arrow moves the focused trit toward `+`.
- `-`, `0`, and `+` set the focused trit directly.
- `=` also sets the focused trit to `+`.
- Arrow keys move through operation and preset-target radio groups.
- `Home` and `End` select the first or last radio-group option.

### Arithmetic

| Mode | Operation |
| --- | --- |
| ADD | `A + B` |
| SUB | `A - B` |
| MUL | `A x B` |
| NEG | `-A` |
| INC | `A + 1` |
| DEC | `A - 1` |

Unary operations mute Input B because it is not used. Results outside the
six-trit range display an explicit overflow state and cannot be copied back to A.

### Ordered ternary logic

The implemented logic system orders the trit values as `- < 0 < +`:

```text
AND = min(A, B)
OR  = max(A, B)
NOT = -A
```

These operations run independently at every trit position. This is one useful
ternary logic system, not the only possible one.

## Current limitations

- Carry feedback identifies affected powers and trits, but it does not yet show
  enough intermediate working to teach normalization to a first-time user.
- On narrow screens, registers scroll horizontally to preserve 44 px touch
  targets. This keeps the controls usable but makes the six-position register
  harder to understand as a whole. Mobile completion is therefore reopened.
- Keyboard, reduced-motion, and responsive behavior have been checked manually;
  the automated suite currently covers the domain logic rather than browser flows.

See [ROADMAP.md](ROADMAP.md) for the comprehension-first next milestone and
[AESTHETIC.md](AESTHETIC.md) for the visual direction and implementation-status
ledger.

## Run locally

Requirements: a current Node.js release and npm.

```sh
npm install
npm run dev
```

Useful verification commands:

```sh
npm test
npm run check
npm run build
```

The app is a prerendered SvelteKit site deployed with the Vercel adapter. It has
no backend, accounts, persistence, analytics, or network-dependent arithmetic.

## Code map

```text
src/
  lib/
    ternary/       balanced-ternary arithmetic, logic, presets, and tests
    components/    trit controls, registers, selectors, readouts, and reference UI
  routes/
    +page.svelte   the calculator and logic console
    playground/    linked trit-control component exhibit
```

Core values use these domain types:

```ts
type Trit = -1 | 0 | 1;
type TritRegister = Trit[];
```

Arithmetic functions are pure. Operations that can exceed the register width
return the result trits, an overflow flag, and normalization trace data. The UI
uses that trace for carry and borrow feedback.

## Product boundaries

Setun is currently a focused interactive instrument, not a simulated computer.
The active product direction does not include accounts, saved projects,
multiplayer, a programming language, a generalized ALU, memory cells, or hardware
integration.

Those ideas may be interesting experiments, but they must not make the current
web application more abstract or harder to maintain before they have a concrete
user purpose.
