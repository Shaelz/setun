# setun

**TRIT//-0+** — a tactile balanced-ternary calculator and logic playground built around three states:

```
−   0   +
```

Named after [Setun](https://en.wikipedia.org/wiki/Setun), the Soviet balanced-ternary computer built in 1958. `TRIT//-0+` is the in-app wordmark; `setun` is the repo.

The project should feel like a small alternate-computing instrument, not a normal calculator with a ternary conversion mode bolted on. Its core premise: numbers, arithmetic, logic, and interface all treat balanced ternary as the native system.

## Product goal

Build a polished interactive prototype for a six-trit balanced-ternary calculator. Users should be able to:

- Set trits physically or virtually as `−`, `0`, or `+`
- See the represented number in both balanced ternary and decimal
- Perform arithmetic operations
- Explore ternary logic operations
- Understand carries visually
- Get an intuitive feel for why balanced ternary is interesting

Educational without feeling like a school worksheet. Closer to a compact experimental instrument, an old scientific device, or a tiny alien computer.

## Core concept

Balanced ternary uses digits:

```
− = -1
0 =  0
+ = +1
```

Each position is a power of three. Example:

```
+ 0 −
= (+1 × 3²) + (0 × 3¹) + (−1 × 3⁰)
= 9 − 1
= 8
```

```
− + 0
= (−1 × 3²) + (+1 × 3¹) + (0 × 3⁰)
= −6
```

A six-trit signed balanced-ternary number has the range **−364 to +364**, because `(3⁶ − 1) / 2 = 364`.

There is no separate "minus sign" input or sign bit. Negative numbers are represented naturally through negative trits.

## Main interface

```
TRIT//-0+

INPUT A
[ − | 0 | + ] [ − | 0 | + ] [ − | 0 | + ] [ − | 0 | + ] [ − | 0 | + ] [ − | 0 | + ]

INPUT B
[ − | 0 | + ] [ − | 0 | + ] [ − | 0 | + ] [ − | 0 | + ] [ − | 0 | + ] [ − | 0 | + ]

MODE
ADD / SUBTRACT / MULTIPLY / NEGATE / INCREMENT / DECREMENT / LOGIC

RESULT
[ − | 0 | + ] [ − | 0 | + ] [ − | 0 | + ] [ − | 0 | + ] [ − | 0 | + ] [ − | 0 | + ]

DECIMAL
A: 8
B: -6
RESULT: 2
```

Most significant trit on the left. Each trit control must clearly communicate three stable states at a glance — avoid generic binary toggle switches.

## Visual language

Restrained, instrument-panel aesthetic. This section states the intent; [AESTHETIC.md](AESTHETIC.md) makes the concrete decisions (exact colors, typography, trit control states, motion rules).

```
− = warm amber / orange
0 = neutral white / grey
+ = cyan / blue
```

Zero should feel calm and inactive. Negative and positive should feel equally valid — do not visually frame `−` as an error or warning state.

References: vintage scientific instruments, oscilloscopes, CRT terminals, industrial control panels, early computing hardware, minimal cybernetic interfaces. Abstract "alien arithmetic," not neon hacker cliché.

Avoid: generic crypto branding, excessive glowing gradients, matrix-rain aesthetics, a normal calculator layout, overly playful children's educational styling.

Typography technical and readable. Monospace where it communicates machine-like structure.

## Interactions

### Trit controls

Prefer the direct three-position control (`[ − | 0 | + ]`) over a cycling click if it stays visually clean.

**Keyboard support:**

- Tab / Shift+Tab move focus between trits (register order, most significant first)
- Left arrow = move focused trit toward `−`
- Right arrow = move focused trit toward `+`
- `-` = set focused trit to `−`
- `0` = set focused trit to `0`
- `+` or `=` = set focused trit to `+`

The original spec covered changing a focused trit's value but not moving focus between trits — Tab/Shift+Tab closes that gap, since the accessibility section below promises full keyboard support and per-position screen-reader labels.

### Arithmetic modes

```
ADD         A + B
SUBTRACT    A − B
MULTIPLY    A × B
NEGATE      −A
INCREMENT   A + 1
DECREMENT   A − 1
```

Multiplication is in v1 deliberately: it is where balanced ternary shows off — no sign handling at all, the signs take care of themselves. Many six-trit products overflow; that is fine, because overflow is an explicit, visible state anyway.

Result displays both balanced ternary and decimal. Arithmetic wraps only if explicitly designed as a feature — default behavior shows an explicit overflow state if the answer exceeds six-trit range (e.g. `364 + 1` must overflow visibly, never silently return an incorrect result).

### Chained computation

A **RESULT → A** control copies the result register back into Input A. This turns the one-shot calculator into something with an accumulator feel — tap INCREMENT repeatedly and watch carries ripple, or build up a value across several operations. It is also what makes INCREMENT and DECREMENT worth having as modes. Disabled while the result is in an overflow state.

### Carry visualization

Important feature, not an afterthought. When arithmetic changes a trit due to carrying, animate or highlight the change. Possible behavior:

- Brief pulse traveling left across affected trits
- Highlight trits that changed during normalization
- Optional "show working" toggle
- Small textual explanation beneath the result, e.g. `Carry propagated from trit 4 to trit 5.`

Keep animations brief, never slow or obstructive.

### Ternary logic mode

Ordered ternary values: `− < 0 < +`.

```
TERNARY AND = min(A, B)
TERNARY OR  = max(A, B)
NOT         = −A
```

Operates trit-by-trit. Show a table or visual explanation of the currently selected operation. Label explicitly as **Ordered ternary logic (− < 0 < +)** — do not imply it's the only valid ternary logic system.

## Educational layer

A compact, collapsible **"Why balanced ternary?"** section:

- Negative numbers do not need a separate sign bit.
- Every integer can be represented naturally.
- Negation is just flipping every trit — no two's-complement dance.
- Multiplication needs no sign handling; the signs take care of themselves.
- Truncating trits rounds to the *nearest* value, not toward zero, because digits are centered around zero.
- A trit carries more information than a bit.
- Balanced ternary was explored in historical computing systems, including the Soviet Setun computer.

Concise and visual. The main screen should never become a tutorial page.

## Suggested stack

- **SvelteKit + TypeScript**, matching your other greenfield builds (ship-notes, stabilize-or-rebuild, handoff-log). Same toolchain across projects means less context-switching and faster iteration on a tinker project you want to actually finish.
- **Vitest** for the core ternary logic tests — arithmetic must be reliable before visual polish, per the design principle below.
- No backend needed for v1: pure client-side arithmetic and UI, prerenderable like the rest of your SvelteKit projects.

## Suggested app structure

```
src/
  lib/
    ternary/
      balancedTernary.ts
      balancedTernary.test.ts
      ternaryLogic.ts
    components/
      TritControl.svelte
      TritDisplay.svelte
      TritRegister.svelte
      OperationSelector.svelte
      CarryVisualizer.svelte
      LogicTable.svelte
      InfoPanel.svelte
  routes/
    +page.svelte
```

Domain language: `trit`, `balanced ternary`, `register`, `normalize`, `carry`, `overflow`. Avoid binary-assumption naming (`bit`, `signBit`, `positiveFlag`, `negativeFlag`) except when referring to underlying implementation details.

## Core logic requirements

```ts
type Trit = -1 | 0 | 1;
type TritRegister = Trit[];

interface CarryStep {
  fromPower: number;
  toPower: number;
  fromIndex: number | null;
  toIndex: number | null;
  amount: number;
}

interface RegisterResult {
  trits: TritRegister;
  overflow: boolean;
  trace: {
    changedIndices: number[];
    carrySteps: CarryStep[];
    overflowIndex: number | null;
  };
}

const eight: TritRegister = [1, 0, -1]; // + 0 −
```

Every operation that can exceed six-trit range returns a `RegisterResult`, so overflow is representable in the core API rather than bolted on in the UI. Negation is the exception: the balanced-ternary range is symmetric (−364 to +364), so `negate` can never overflow and returns a plain register.

Pure functions:

```ts
decimalToBalancedTernary(value: number, width: number): RegisterResult
balancedTernaryToDecimal(trits: TritRegister): number
normalizeTrits(trits: number[], width: number): RegisterResult
addBalancedTernary(a: TritRegister, b: TritRegister): RegisterResult
subtractBalancedTernary(a: TritRegister, b: TritRegister): RegisterResult
multiplyBalancedTernary(a: TritRegister, b: TritRegister): RegisterResult
negateBalancedTernary(a: TritRegister): TritRegister
incrementBalancedTernary(a: TritRegister): RegisterResult
decrementBalancedTernary(a: TritRegister): RegisterResult
```

Internals may compute at unbounded width and truncate to six trits as an explicit final step — that final step is also where the "show working" carry explanation comes from.

Test at minimum: `0, 1, -1, 2, -2, 3, -3, 8, -6, 364, -364`, plus boundary overflow: `364 + 1`, `-364 - 1`. For multiplication: `2 × 3`, `8 × −6`, `−2 × −2`, and an overflowing product such as `20 × 20`.

### Reference table

| Decimal | Balanced ternary |
| ------- | ----------------- |
| 0       | 0                  |
| 1       | +                  |
| -1      | −                  |
| 2       | +−                 |
| -2      | −+                 |
| 3       | +0                 |
| -3      | −0                 |
| 4       | ++                 |
| -4      | −−                 |
| 8       | +0−                |
| -6      | −+0                |

Use these as UI examples, presets, or tests.

## Presets

```
ZERO / ONE / NEGATIVE ONE / EIGHT / NEGATIVE SIX / MAX / MIN / RANDOM
```

`MAX = + + + + + +`, `MIN = − − − − − −`. `RANDOM` generates a random *valid six-trit register*, not a random decimal number.

## Responsive behavior

Works comfortably on desktop and mobile. On mobile: trit rows may scroll horizontally if required, trits must stay tappable (not tiny), result stays visible without excessive scrolling, decimal output is never hidden behind a menu, instrument-panel feel is preserved.

## Accessibility

Three states distinguishable without relying on color alone: symbols (`− 0 +`), clear labels, keyboard interaction, sufficient contrast, reduced-motion support for carry animations. Screen-reader labels describe both trit position and current state, e.g. `Input A, trit 4 of 6, currently positive one.`

## Non-goals for v1

A real ternary CPU, hardware microcontroller integration, analog three-voltage logic, user accounts, saving projects, multiplayer, complex programming language support, heavy gamification, a giant educational curriculum.

v1 is a beautifully executed ternary calculator and logic console. Nothing more.

See [ROADMAP.md](ROADMAP.md) for the build sequence and post-v1 phases.

## Definition of done for v1

- A user can set six trits for Input A and Input B.
- Every trit visibly supports `−`, `0`, and `+`.
- Decimal values update accurately.
- Addition, subtraction, multiplication, negation, increment, and decrement work.
- Overflow is handled explicitly.
- RESULT → A copies the result into Input A for chained computation.
- Ordered ternary AND, OR, and NOT work trit-by-trit.
- Result trits are easy to read.
- Carry behavior is visually communicated.
- Keyboard focus moves between trits and changes their value, matching the accessibility promises above.
- The design feels like a cohesive instrument, not a generic calculator.
- The core balanced-ternary logic has automated tests.

## Design principle

The user should leave with the feeling: **"Oh. Binary is not inevitable."**

## Status

The six-trit arithmetic console is implemented with tested balanced-ternary conversion,
normalization, arithmetic, explicit overflow, keyboard-accessible trit controls, chained
RESULT → A computation, and Carry Trace v1. Ordered ternary logic, presets, the compact
educational layer, and the final responsive/accessibility review remain v1 work.
