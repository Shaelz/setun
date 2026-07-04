# Roadmap

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
parts of the earlier completion claim are reopened:

1. **Comprehension:** carry feedback is accurate but too terse to teach the
   normalization process by itself.
2. **Mobile:** horizontal scrolling preserves control size but hides most of a
   six-trit register, weakening positional comparison and carry visibility.

## Next milestone: comprehension pass

### Outcome

A user can load or construct a simple example, perform an operation, and follow
the result from input trits through normalization without leaving the console.

### 1. Show working for one operation

Use the existing normalization trace rather than introducing a second arithmetic
engine. Start with addition or increment and expose:

- The raw per-position digit sum
- Where normalization is required
- The carry or borrow transferred to the next power
- The final normalized register
- A short plain-language explanation alongside the instrument notation

The first canonical example should be small and memorable, such as
`1 + 1 = +- (2 decimal)`.

**Acceptance criteria**

- The explanation is mathematically accurate for carries and borrows.
- The static explanation contains all information conveyed by animation.
- A user can replay or step through it without changing the arithmetic result.
- The default console remains compact; explanation is available on demand.

### 2. Reopen mobile register design

The goal is to keep the full register mentally legible while retaining tappable
controls. Explore the smallest viable options before changing the trit control:

- A compact mobile-only trit control that keeps all six positions visible
- Two clearly connected groups of three trits
- Scroll snapping with edge fades, position context, and an explicit scroll cue

**Acceptance criteria**

- At 375 px and 430 px, users can discover and reach all six trits.
- The interface communicates that each register contains six positions.
- Power labels remain associated with the correct trits.
- Comparing A, B, and result does not require guesswork about hidden positions.
- Touch targets remain at least 44 px unless an equally accessible interaction
  replaces the current three-button control.
- Carry feedback remains understandable when affected trits cross a viewport or
  group boundary.

### 3. Add one guided experiment

Provide a restrained entry point that demonstrates a property balanced ternary
handles unusually well. Prefer one strong sequence over a library of tutorials.

Initial candidate:

1. Load `ONE` into A.
2. Select `INC`.
3. Observe `1 + 1` normalize to `+-`.
4. Copy the result to A and increment again.
5. Explain the carry in powers of three.

This must feel like operating the instrument, not entering a classroom wizard.

### 4. Protect the interaction contract

Add a small browser smoke suite covering only high-value behavior:

- Keyboard-changing a trit
- Switching between binary and unary modes
- Overflow disabling `RESULT -> A`
- Copying a valid result into A
- Reaching all six trits at a narrow viewport

Do not pursue exhaustive UI coverage or screenshot-test every visual detail.

### 5. Resolve the public playground route

`/playground/trit-control` is currently prerendered into the production build even
though it began as an isolated development surface. Make one explicit decision:

- Keep it as an intentional public component exhibit, give it appropriate page
  context, and link to it deliberately; or
- Exclude or remove it from the production build while preserving any useful
  local component-development workflow.

**Acceptance criteria**

- The route is no longer public by accident.
- README.md describes the chosen behavior rather than an unresolved ambiguity.
- Production-build verification confirms whether the route is included or absent.
- The decision does not introduce a component-workbench framework solely to
  preserve one playground page.

## Candidate follow-up work

These items may follow the comprehension pass if they reinforce the product
hypothesis:

- A right-shift and truncation demonstration showing round-to-nearest behavior
- Comparison operations as an explanation of balanced ordering
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

- One representative carry or borrow can be followed step by step.
- The explanation works with and without motion.
- The six-trit register is discoverable and understandable at narrow widths.
- The core keyboard, overflow, chaining, and mobile-reachability flows have
  automated smoke coverage.
- README.md, ROADMAP.md, and AESTHETIC.md describe the behavior that actually ships.

Passing tests and fitting inside a viewport are necessary evidence, but they are
not sufficient proof that the product teaches what it claims to teach.
