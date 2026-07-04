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
- Presets for zero, one, negative one, eight, negative six, limits, and random
  trits, targeting either Input A or B; the target selector brightens that
  register's label, and the most recently loaded preset stays visibly marked
- A compact balanced-ternary reference panel
- Keyboard-accessible trit controls and operation selectors
- Reduced-motion equivalents for carry feedback
- Automated tests for arithmetic, normalization, overflow, logic, and presets
- A linked component exhibit at `/playground/trit-control`, showing the trit
  control in isolation from the full console
- A "SHOW WORKING" disclosure under the result register, walking ADD, SUB, INC,
  and DEC through per-position sums, carries, and borrows in plain language,
  with a replay of the same pace as the live carry pulse
- SHR (right shift), demonstrating that dropping the lowest trit rounds to the
  nearest integer rather than flooring, because trits are centered on zero
- CMP (comparison), reducing a whole-register comparison to a single `- 0 +`
  outcome trit, using the same `- < 0 < +` order as the logic modes
- Registers that stay fully visible at narrow widths: a 2-column grid of all
  six trits rather than a horizontally scrolling row
- A `GUIDED: 1 + 1 CARRY` control that loads the canonical example, selects
  INC, and opens SHOW WORKING in one step; `RESULT -> A` and INC already
  handle continuing the sequence
- A Playwright smoke suite covering keyboard input, mode switching, overflow,
  copying a result, and mobile reachability
- Open Graph, Twitter Card, and JSON-LD metadata, a custom OG image rendered
  from the console's own design tokens, and a minimal sitemap. The playground
  exhibit is `noindex` so it doesn't compete with the console in search.

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
| SHR | drop A's `3^0` trit, shift the rest toward `3^0` |

Unary operations mute Input B because it is not used. Results outside the
six-trit range display an explicit overflow state and cannot be copied back to A.

SHR never overflows (magnitude only shrinks), and it rounds to the nearest
integer rather than flooring: `8 -> 3`, not `2`, because the dropped trit is
already the exact rounding remainder when digits are centered on zero. A
binary right shift has no equivalent free lunch — it floors.

### Ordered ternary logic

The implemented logic system orders the trit values as `- < 0 < +`:

```text
AND = min(A, B)
OR  = max(A, B)
NOT = -A
```

These operations run independently at every trit position. This is one useful
ternary logic system, not the only possible one.

### Comparison

CMP compares Input A and Input B most-significant-trit first and stops at the
first position where they differ — the same `- < 0 < +` order the logic modes
use. The result is a single outcome trit, shown in place of the six-trit
result register: `-` means A is less than B, `0` means they're equal, `+`
means A is greater. Negative and positive values need no special-casing: a
trit's position in `- < 0 < +` already encodes its sign correctly at every
digit, unlike comparing raw two's-complement bit patterns.

## Current limitations

- The "SHOW WORKING" per-position table covers ADD, SUB, INC, and DEC; SHR and
  CMP get their own dedicated explanations instead, since neither produces a
  carry trace. MULTIPLY produces the same trace data as ADD/SUB/INC/DEC, but
  its per-position sum is a convolution, not a simple two-input add, so it is
  not narrated yet rather than narrated incorrectly. NEGATE and the
  ordered-logic modes never produce a trace or a dedicated explanation.
- Reduced-motion behavior has been checked manually. Keyboard interaction,
  mode switching, overflow, chaining, and mobile reachability now have
  automated browser coverage instead (`npm run test:e2e`).

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
npm run test:e2e
```

The app is a prerendered SvelteKit site deployed with the Vercel adapter. It has
no backend, accounts, persistence, analytics, or network-dependent arithmetic.

## Code map

```text
e2e/               Playwright smoke suite (npm run test:e2e)
static/            favicons, og-image.png, robots.txt, sitemap.xml
src/
  lib/
    site.ts        shared site URL/name for meta tags and the sitemap
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
