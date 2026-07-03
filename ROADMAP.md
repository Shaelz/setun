# Roadmap

## UI exploration (alongside early v1)

The core logic and the design don't touch, so they can proceed in parallel — no formal sign-off gate needed for a solo project. One design task genuinely earns its own iteration loop:

1. **Build the trit control in isolation.** A scratch route or isolated component playground for just `[ − | 0 | + ]`, iterated until the three states read clearly at a glance without relying on color alone. This is the single most important visual element in the whole app — it *is* the project, visually. [AESTHETIC.md](AESTHETIC.md) holds the starting values (colors, typography, state table, motion); iterate against it and update it when a decision changes.
2. **Static layout mockup** (optional, cheap). Lay out INPUT A, INPUT B, MODE, RESULT, and DECIMAL as in the README's main interface sketch to confirm the reading order (most significant trit left, decimal readout always visible) before wiring.

## v1: the calculator and logic console

1. **Core ternary logic, with tests, before any UI wiring.** `decimalToBalancedTernary`, `balancedTernaryToDecimal`, `normalizeTrits`, and the six arithmetic operations (including multiplication), plus the ordered-logic AND/OR/NOT. All range-limited operations return the `RegisterResult` type from the README so overflow is representable in the core API. Cover the required test values (`0, 1, -1, 2, -2, 3, -3, 8, -6, 364, -364`), the overflow boundaries (`364 + 1`, `-364 - 1`), and the multiplication cases (`2 × 3`, `8 × −6`, `−2 × −2`, `20 × 20` overflow) before touching a component. Arithmetic must be reliable before visual polish.
2. **Wire the designed UI to the core logic.** Trit registers for Input A, Input B, and Result, mode selector, decimal readout, and the RESULT → A chaining control, all using the trit control and visual language from the UI exploration track.
3. **Keyboard and accessibility.** Tab/Shift+Tab between trits, Left/Right/`0` to change a focused trit's value, screen-reader position labels, reduced-motion support. Do this before carry visualization, since carry animations need to respect reduced-motion from day one, not retrofitted.
4. **Carry visualization.** Pulse/highlight on normalization, optional "show working" toggle, textual carry explanation. The spec calls this an important feature, not a nice-to-have — don't let it slip to a stretch goal.
5. **Logic mode UI.** Operation selector, trit-by-trit AND/OR/NOT table, the "Ordered ternary logic" label so it's clear this isn't the only valid ternary logic system.
6. **Educational layer and presets.** The collapsible "Why balanced ternary?" section, and the `ZERO / ONE / NEGATIVE ONE / EIGHT / NEGATIVE SIX / MAX / MIN / RANDOM` preset buttons.
7. **Responsive pass and definition-of-done review.** Mobile trit sizing and scroll behavior, then walk the Definition of Done in the README top to bottom before calling v1 shipped.

## Phase 2

- Animated arithmetic walkthroughs
- Step-by-step carry mode
- More ternary logic systems
- Comparison operations
- Shift operations (and rounding-by-truncation demo — right-shift rounds to nearest, a balanced-ternary party trick)
- Configurable register width

> **Scope guardrail:** Phases 3–5 are a different project's worth of ambition. Keep them written down, but no v1 decision should be shaped by them — e.g. don't generalize register width or abstract the "ALU" before Phase 2 actually needs it.

## Phase 3

- Tiny ternary ALU visualization
- Multiple registers
- Memory cells
- Instruction sequencing
- Ternary assembly playground

## Phase 4

- Physical hardware version
- Six physical three-position switches
- LED trit display
- RP2040 or ESP32 controller
- OLED decimal output
- Sound feedback for trit state changes

## Phase 5

- Actual three-level electrical bus
- 0 V = −, midpoint voltage = 0, high voltage = +
- Comparator-based ternary gates
