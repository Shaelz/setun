# Roadmap

## Now

Setun has completed its functional baseline and the mechanical comprehension
pass, including SHOW WORKING, the guided carry experiment, the mobile register
layout, and smoke coverage. The active question is now whether first-time users
actually understand balanced-ternary normalization from that experience.

## Next

No accepted items yet. The follow-up ideas below remain candidates only until
one is shown to strengthen the product hypothesis.

## Product direction

Setun should become a small interactive balanced-ternary explainer disguised as
an instrument. The next milestone is not defined by the number of operations or
the sophistication of the simulated machine. It is defined by whether the
existing console helps someone understand what balanced ternary is doing.

The active product hypothesis is:

> After performing a simple operation, a first-time user can explain how the
> balanced-ternary result was formed and why it differs from ordinary signed
> binary representation.

Until that hypothesis is supported, additional calculator modes and computer
simulation features are secondary.

## Current baseline: functional v1

The current console implements:

- Six-trit A, B, and result registers
- Tested arithmetic, ordered logic, normalization, and overflow handling
- Keyboard-accessible trit and radio-group controls
- Result chaining, presets, carry feedback, and a compact reference panel
- A responsive layout that preserves 44 px trit targets
- Reduced-motion feedback for normalization traces

This is a complete functional baseline, not the end of the product work. Two
parts of the earlier completion claim were reopened:

1. **Comprehension:** carry feedback was accurate but too terse to teach the
   normalization process by itself. The SHOW WORKING disclosure (below)
   addresses this for ADD, SUB, INC, and DEC; the guided experiment and smoke
   coverage items are still open.
2. **Mobile:** horizontal scrolling preserved control size but hid most of a
   six-trit register, weakening positional comparison and carry visibility.
   Resolved — registers now wrap into a fully visible 2-column grid at narrow
   widths instead of scrolling.

## Next milestone: comprehension pass

### Outcome

A user can load or construct a simple example, perform an operation, and follow
the result from input trits through normalization without leaving the console.

### 1. Show working for one operation — shipped

A "SHOW WORKING" disclosure under the result register uses the existing
normalization trace — no second arithmetic engine — to expose, for ADD, SUB,
INC, and DEC:

- The raw per-position digit sum
- Where normalization is required
- The carry or borrow transferred to the next power
- The final normalized register
- A plain-language sentence per changed position, in the same right-to-left,
  cause-before-effect order the carry pulse animates

MULTIPLY produces the same trace data but is not narrated: its per-position sum
is a convolution across several trit pairs, not a simple two-input add, so the
same sentence template would misdescribe the math. NEGATE and the ordered-logic
modes never produce a trace, and say so rather than showing an empty table.

**Acceptance criteria**

- The explanation is mathematically accurate for carries and borrows — the
  data comes directly from the tested `normalizeTrits`, nothing is recomputed.
- The static explanation contains all information conveyed by animation — the
  full per-position list and sentences render before any replay runs.
- A user can replay it without changing the arithmetic result — replay only
  moves a local highlight; it never re-invokes an operation or touches A, B,
  mode, or the live result.
- The default console remains compact; explanation is available on demand —
  the disclosure is closed by default, matching the existing reference panel.

### 2. Reopen mobile register design — shipped

Measurement first: each trit control is a full three-position switch (~136px
wide), not a single 44px button. At 375–430px, even with the label column
removed, at most two full controls fit per row — three-per-row is
geometrically impossible without shrinking below the 44px touch-target floor,
at either width. So instead of "two groups of three," registers wrap into a
2-column grid at ≤42rem viewports: three rows of two, MSD to LSD, top to
bottom, with no shrinking of the control and no horizontal scroll.

**Acceptance criteria**

- At 375 px and 430 px, users can discover and reach all six trits — confirmed
  by measuring `scrollWidth`/`clientWidth` on the register row at both widths:
  no overflow, nothing to scroll.
- The interface communicates that each register contains six positions — all
  six controls are visible at once, grouped as one register block.
- Power labels remain associated with the correct trits — unchanged, each
  control keeps its own `3ⁿ` label directly beneath it.
- Comparing A, B, and result does not require guesswork about hidden
  positions — nothing is hidden at these widths.
- Touch targets remain at least 44 px — unchanged; only the wrapping layout
  changed, not the control itself.
- Carry feedback remains understandable when affected trits cross a viewport
  or group boundary — verified with a full six-position overflow chain
  (`MAX + INC`): the highlight correctly traverses all three grid rows in
  carry order.

### 3. Add one guided experiment — shipped

A `GUIDED: 1 + 1 CARRY` control in the footer performs steps 1-3 and opens the
explanation; steps 4-5 are left to the existing controls rather than scripted,
because they already work:

1. Load `ONE` into A — automated.
2. Select `INC` — automated.
3. Observe `1 + 1` normalize to `+-` — automatic once mode is set; the SHOW
   WORKING panel opens at the same time so the explanation is immediate.
4. Copy the result to A and increment again — the existing `RESULT -> A`
   button and the still-selected `INC` mode do this with no new code.
5. Explain the carry in powers of three — the SHOW WORKING panel already
   built for item 1.

One button, no wizard chrome, no separate tutorial state machine.

### 4. Protect the interaction contract — shipped

A Playwright smoke suite (`e2e/smoke.spec.ts`, `npm run test:e2e`) covers
exactly the five listed behaviors and nothing more:

- Keyboard-changing a trit
- Switching between binary and unary modes
- Overflow disabling `RESULT -> A`
- Copying a valid result into A
- Reaching all six trits at a narrow viewport

Building this caught a real bug: the 2-column mobile register grid (item 2)
had a ~6px horizontal overflow at 375px that manual preview-tool measurement
had missed. Fixed by tightening the grid's column gap and reducing the
panel's inline padding at narrow widths — verified with Playwright's exact
CSS-pixel measurements, not just visual inspection.

### 5. Public playground route — resolved

`/playground/trit-control` began as an isolated development surface but was
prerendered into the production build by accident. Decision: keep it, as an
intentional public component exhibit rather than remove it.

- The page now carries its own context (`COMPONENT EXHIBIT — THE CONTROL,
  ISOLATED FROM THE FULL CONSOLE`) instead of reading as a leftover.
- The main console links to it from a footer line, and the exhibit links back
  to the console, so the route is reached deliberately rather than by accident.
- No component-workbench framework was introduced; the page remains a single
  plain SvelteKit route.
- README.md describes this as shipped behavior rather than an open question.

## Candidate follow-up work

Two items from this list have shipped:

- **Right-shift and truncation demonstration — shipped.** SHR drops A's `3⁰`
  trit and shifts the rest toward `3⁰`. Because trits are centered on zero,
  the dropped trit is already the exact rounding remainder: `8 -> 3`, not the
  `2` a floor-based binary shift would give. Never overflows, since magnitude
  only shrinks. SHOW WORKING states both values and the floor contrast
  explicitly, only when they actually differ.
- **Comparison operations — shipped.** CMP compares A and B most-significant-
  trit first using the same `- < 0 < +` order as AND/OR/NOT, stopping at the
  first difference. The six-trit result register doesn't fit a three-outcome
  comparison honestly, so CMP shows a single outcome trit instead
  (`-`/`0`/`+` for less/equal/greater) — reusing `TritControl` directly rather
  than padding a six-trit register with meaningless zeros. `RESULT -> A` is
  hidden for this mode; copying a bare ordering trit into all of A isn't a
  meaningful chained action, unlike SHR (repeated SHR is a legitimate,
  demonstrative chain).

These items may still follow if they reinforce the product hypothesis:

- A second ternary logic system, presented explicitly as a comparison
- Configurable register width when a specific demonstration requires it

None is automatically approved merely because it appeared in an earlier roadmap.

## Experiments, not commitments

The following ideas belong to possible future projects or experiments. They are
not active roadmap phases and must not shape the current architecture:

- Multiple registers, memory cells, or instruction sequencing
- A ternary ALU or assembly playground
- Physical switches, LEDs, controllers, or sound feedback
- An actual three-level electrical bus and comparator-based gates

Before promoting one of these ideas, answer:

1. What user experience becomes possible that the current console cannot provide?
2. Why is that experience better than deepening the existing explanation?
3. What is the smallest disposable experiment that tests the idea?
4. What existing complexity can be avoided or removed if the experiment fails?

## Explicit non-goals

- Generalizing the domain layer for imagined hardware or CPU requirements
- Abstracting an ALU before multiple real operations need that abstraction
- Adding backend services, accounts, persistence, or collaboration
- Expanding the operation list without a comprehension use case
- Implementing decorative motion solely because it exists in the aesthetic spec
- Treating completed documentation as authority over observed product behavior

## Completion standard for the next milestone

The comprehension pass is complete when:

- One representative carry or borrow can be followed step by step. — Shipped
  (SHOW WORKING, item 1; the guided `1 + 1` experiment, item 3).
- The explanation works with and without motion. — Shipped (SHOW WORKING's
  replay is inert under `prefers-reduced-motion`; the static list carries the
  same information either way).
- The six-trit register is discoverable and understandable at narrow widths.
  — Shipped (item 2: 2-column grid, no horizontal scroll, verified at 375px
  and 430px).
- The core keyboard, overflow, chaining, and mobile-reachability flows have
  automated smoke coverage. — Shipped (item 4: `e2e/smoke.spec.ts`).
- README.md, ROADMAP.md, and AESTHETIC.md describe the behavior that actually
  ships. — This pass.

All five mechanical criteria above are met. That is not the same claim as "the
product teaches what it claims to teach" — this document has no way to
measure whether a first-time user actually walks away understanding
normalization, only whether the mechanism to show it exists, works, and is
tested. Whether the hypothesis itself holds is a question for real users, not
for this checklist.
