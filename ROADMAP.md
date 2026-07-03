# Roadmap

## UI exploration (alongside early v1)

The core logic and the design don't touch, so they can proceed in parallel — no formal sign-off gate needed for a solo project. One design task genuinely earns its own iteration loop:

1. **Build the trit control in isolation.** A scratch route or isolated component playground for just `[ − | 0 | + ]`, iterated until the three states read clearly at a glance without relying on color alone. This is the single most important visual element in the whole app — it *is* the project, visually. [AESTHETIC.md](AESTHETIC.md) holds the starting values (colors, typography, state table, motion); iterate against it and update it when a decision changes.
2. **Static layout mockup** (optional, cheap). Lay out INPUT A, INPUT B, MODE, RESULT, and DECIMAL as in the README's main interface sketch to confirm the reading order (most significant trit left, decimal readout always visible) before wiring.

## v1: the calculator and logic console

1. **Complete — core ternary logic and tests.** Conversion, normalization, all six arithmetic operations, and ordered ternary AND/OR/NOT are implemented and tested with explicit overflow.
2. **Complete — arithmetic console.** Input and result registers, arithmetic modes, decimal readout, keyboard controls, overflow display, and RESULT → A chaining are wired.
3. **Complete — Carry Trace v1.** The domain layer emits ordered normalization metadata; the result register shows a brief right-to-left signal, static reduced-motion markers, and factual STATUS text.
4. **Complete — ordered ternary logic UI.** AND/OR/NOT are wired into the console with explicit `− < 0 < +` ordering, unary NOT behavior, and a compact per-trit logic readout.
5. **Next — presets and compact educational layer.** Add the documented presets and the restrained "Why balanced ternary?" section.
6. **Finish — responsive/accessibility validation and definition-of-done review.** Validate narrow-screen sizing, keyboard and assistive behavior, reduced motion, and the full README definition of done before calling v1 shipped.

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
