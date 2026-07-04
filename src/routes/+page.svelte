<script lang="ts">
	import { onDestroy } from 'svelte';
	import InfoPanel from '$lib/components/InfoPanel.svelte';
	import LogicReadout from '$lib/components/LogicReadout.svelte';
	import PresetBank from '$lib/components/PresetBank.svelte';
	import ShowWorking from '$lib/components/ShowWorking.svelte';
	import TritControl from '$lib/components/TritControl.svelte';
	import TritRegister from '$lib/components/TritRegister.svelte';
	import OperationSelector, {
		LOGIC_MODES,
		UNARY_MODES,
		type Mode
	} from '$lib/components/OperationSelector.svelte';
	import {
		addBalancedTernary,
		balancedTernaryToDecimal,
		decrementBalancedTernary,
		incrementBalancedTernary,
		multiplyBalancedTernary,
		negateBalancedTernary,
		shiftRightBalancedTernary,
		subtractBalancedTernary,
		type RegisterResult,
		type NormalizationTrace,
		type Trit,
		type TritRegister as TritRegisterValue
	} from '$lib/ternary/balancedTernary';
	import { presetRegister, type PresetId } from '$lib/ternary/presets';
	import { compareBalancedTernary, ternaryAnd, ternaryNot, ternaryOr } from '$lib/ternary/ternaryLogic';
	import { SITE_NAME, SITE_URL } from '$lib/site';

	const PAGE_TITLE = `${SITE_NAME} — Balanced Ternary Register Console`;
	const PAGE_DESCRIPTION =
		'A tactile six-trit balanced-ternary calculator and logic console. Treats −, 0, and + as native digits — no sign bit, no two’s complement. Oh. Binary is not inevitable.';
	const OG_IMAGE_URL = `${SITE_URL}/og-image.png`;

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: SITE_NAME,
		alternateName: 'setun',
		description: PAGE_DESCRIPTION,
		url: SITE_URL,
		applicationCategory: 'EducationalApplication',
		operatingSystem: 'Any (runs in a web browser)',
		browserRequirements: 'Requires JavaScript',
		isAccessibleForFree: true,
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
	};

	const WIDTH = 6;
	type LogicMode = Extract<Mode, 'TERNARY_AND' | 'TERNARY_OR' | 'TERNARY_NOT'>;

	function zeros(): Trit[] {
		return new Array(WIDTH).fill(0);
	}

	let a = $state<Trit[]>(zeros());
	let b = $state<Trit[]>(zeros());
	let mode = $state<Mode>('ADD');
	let visibleTrace = $state<NormalizationTrace>({
		changedIndices: [],
		carrySteps: [],
		overflowIndex: null,
		steps: []
	});
	let activeTraceIndex = $state<number | null>(null);
	let statusText = $state('NORMALIZED · NO OVERFLOW');
	let traceTimer: ReturnType<typeof setTimeout> | undefined;
	let showWorkingOpen = $state(false);

	let isUnary = $derived(UNARY_MODES.has(mode));
	let isLogic = $derived(LOGIC_MODES.has(mode));
	let logicMode = $derived<LogicMode | null>(isLogic ? (mode as LogicMode) : null);
	let isCompare = $derived(mode === 'COMPARE');

	// Computed unconditionally (both are cheap, pure reads of a/b) so the
	// result switch below, the ShowWorking narration props, and the status
	// text all read the same value instead of recomputing it three times.
	let shiftResult = $derived(shiftRightBalancedTernary(a));
	let compareResult = $derived(compareBalancedTernary(a, b));

	let result = $derived.by<RegisterResult>(() => {
		switch (mode) {
			case 'ADD':
				return addBalancedTernary(a, b);
			case 'SUBTRACT':
				return subtractBalancedTernary(a, b);
			case 'MULTIPLY':
				return multiplyBalancedTernary(a, b);
			case 'NEGATE':
				return {
					trits: negateBalancedTernary(a),
					overflow: false,
					trace: { changedIndices: [], carrySteps: [], overflowIndex: null, steps: [] }
				};
			case 'INCREMENT':
				return incrementBalancedTernary(a);
			case 'DECREMENT':
				return decrementBalancedTernary(a);
			case 'SHIFT_RIGHT':
				return {
					trits: shiftResult.trits,
					overflow: false,
					trace: { changedIndices: [], carrySteps: [], overflowIndex: null, steps: [] }
				};
			case 'TERNARY_AND':
				return {
					trits: ternaryAnd(a, b),
					overflow: false,
					trace: { changedIndices: [], carrySteps: [], overflowIndex: null, steps: [] }
				};
			case 'TERNARY_OR':
				return {
					trits: ternaryOr(a, b),
					overflow: false,
					trace: { changedIndices: [], carrySteps: [], overflowIndex: null, steps: [] }
				};
			case 'TERNARY_NOT':
				return {
					trits: ternaryNot(a),
					overflow: false,
					trace: { changedIndices: [], carrySteps: [], overflowIndex: null, steps: [] }
				};
			case 'COMPARE':
				// Not a real six-trit register — the console shows a single
				// outcome trit for this mode instead (see the template below).
				// Padded to width so decimal/copy plumbing keeps its shape.
				return {
					trits: [0, 0, 0, 0, 0, compareResult.outcome],
					overflow: false,
					trace: { changedIndices: [], carrySteps: [], overflowIndex: null, steps: [] }
				};
			default: {
				const exhaustive: never = mode;
				throw new Error(`Unhandled mode: ${exhaustive}`);
			}
		}
	});

	let decimalA = $derived(balancedTernaryToDecimal(a));
	let decimalB = $derived(balancedTernaryToDecimal(b));
	let decimalResult = $derived(result.overflow ? null : balancedTernaryToDecimal(result.trits));

	// Extra narration data for ShowWorking's SHR/CMP branches — neither goes
	// through normalizeTrits, so there's no carry trace to describe them with.
	let shiftInfo = $derived({
		droppedTrit: shiftResult.droppedTrit,
		before: decimalA,
		after: shiftResult.roundedDecimal,
		floored: shiftResult.flooredDecimal
	});
	let compareInfo = $derived({
		resolvingPower:
			compareResult.resolvingIndex === null ? null : WIDTH - 1 - compareResult.resolvingIndex,
		digitA: compareResult.resolvingIndex === null ? (0 as Trit) : a[compareResult.resolvingIndex],
		digitB: compareResult.resolvingIndex === null ? (0 as Trit) : b[compareResult.resolvingIndex],
		outcome: compareResult.outcome
	});

	const SUPERSCRIPT = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶'];

	function powerLabel(power: number): string {
		return `3${SUPERSCRIPT[power] ?? `^${power}`}`;
	}

	function stepStatus(trace: NormalizationTrace, index: number): string {
		const step = trace.carrySteps.find(
			(candidate) => candidate.fromIndex === index || candidate.toIndex === index
		);
		if (!step) return `${trace.changedIndices.length} TRITS NORMALIZED`;
		const kind = step.amount < 0 ? 'BORROW' : 'CARRY';
		return `${kind} ${powerLabel(step.fromPower)} → ${powerLabel(step.toPower)}`;
	}

	function finalStatus(computation: RegisterResult): string {
		if (computation.overflow) {
			return `OVERFLOW AT ${powerLabel(computation.trace.overflowIndex ?? WIDTH)}`;
		}
		const steps = computation.trace.carrySteps;
		const isChain = steps.every(
			(step, index) =>
				index === 0 ||
				(step.fromPower === steps[index - 1].toPower && step.amount * steps[0].amount > 0)
		);
		if (steps.length > 0 && isChain) {
			const kind = steps[0].amount < 0 ? 'BORROW' : 'CARRY';
			return `${kind} ${[steps[0].fromPower, ...steps.map((step) => step.toPower)]
				.map(powerLabel)
				.join(' → ')}`;
		}
		if (computation.trace.changedIndices.length > 0) {
			return `${computation.trace.changedIndices.length} TRITS NORMALIZED`;
		}
		return 'NORMALIZED · NO OVERFLOW';
	}

	function startTrace(computation: RegisterResult) {
		if (traceTimer) clearTimeout(traceTimer);
		visibleTrace = computation.trace;
		activeTraceIndex = null;
		const sequence = computation.trace.changedIndices;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || sequence.length === 0) {
			statusText = finalStatus(computation);
			return;
		}

		let position = 0;
		const advance = () => {
			if (position >= sequence.length) {
				activeTraceIndex = null;
				statusText = finalStatus(computation);
				return;
			}
			activeTraceIndex = sequence[position];
			statusText = stepStatus(computation.trace, sequence[position]);
			position += 1;
			traceTimer = setTimeout(advance, 60);
		};
		advance();
	}

	function traceAfterUpdate() {
		queueMicrotask(() => {
			if (isLogic) {
				if (traceTimer) clearTimeout(traceTimer);
				visibleTrace = { changedIndices: [], carrySteps: [], overflowIndex: null, steps: [] };
				activeTraceIndex = null;
				statusText =
					mode === 'TERNARY_AND'
						? 'ORDERED AND · MIN(A,B)'
						: mode === 'TERNARY_OR'
							? 'ORDERED OR · MAX(A,B)'
							: 'ORDERED NOT · −A';
				return;
			}
			if (mode === 'SHIFT_RIGHT') {
				if (traceTimer) clearTimeout(traceTimer);
				visibleTrace = { changedIndices: [], carrySteps: [], overflowIndex: null, steps: [] };
				activeTraceIndex = null;
				statusText = 'SHR · ROUND(A ÷ 3)';
				return;
			}
			if (isCompare) {
				if (traceTimer) clearTimeout(traceTimer);
				visibleTrace = { changedIndices: [], carrySteps: [], overflowIndex: null, steps: [] };
				activeTraceIndex = null;
				statusText =
					compareResult.outcome === 0
						? 'CMP · A EQUALS B'
						: compareResult.outcome > 0
							? 'CMP · A GREATER THAN B'
							: 'CMP · A LESS THAN B';
				return;
			}
			startTrace(result);
		});
	}

	function copyResultToA() {
		if (result.overflow || isCompare) return;
		a = [...result.trits];
		traceAfterUpdate();
	}

	// The one guided experiment (ROADMAP.md): sets up `1 + 1` and opens the
	// explanation, then hands back to the ordinary controls — RESULT -> A and
	// INC already do the rest, so there's nothing further to script.
	function runGuidedExperiment() {
		a = presetRegister('ONE', WIDTH);
		mode = 'INCREMENT';
		showWorkingOpen = true;
		traceAfterUpdate();
	}

	function loadPreset(target: 'A' | 'B', value: TritRegisterValue, preset: PresetId) {
		if (target === 'A') {
			a = [...value];
			traceAfterUpdate();
			return;
		}

		b = [...value];
		if (isUnary) {
			statusText = result.overflow
				? finalStatus(result)
				: `B LOAD · ${preset.replaceAll('_', ' ')} · MODE IGNORES B`;
			return;
		}
		traceAfterUpdate();
	}

	onDestroy(() => {
		if (traceTimer) clearTimeout(traceTimer);
	});
</script>

<svelte:head>
	<title>{PAGE_TITLE}</title>
	<meta name="description" content={PAGE_DESCRIPTION} />
	<link rel="canonical" href={SITE_URL} />
	<meta name="theme-color" content="#121412" />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:title" content={PAGE_TITLE} />
	<meta property="og:description" content={PAGE_DESCRIPTION} />
	<meta property="og:url" content={SITE_URL} />
	<meta property="og:image" content={OG_IMAGE_URL} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta
		property="og:image:alt"
		content="The TRIT//-0+ console showing 1 + 1 normalizing to +− in balanced ternary."
	/>
	<meta property="og:locale" content="en_US" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={PAGE_TITLE} />
	<meta name="twitter:description" content={PAGE_DESCRIPTION} />
	<meta name="twitter:image" content={OG_IMAGE_URL} />

	{@html `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`}
</svelte:head>

<main>
	<div class="panel">
		<div class="panel-inner">
		<header>
			<h1>TRIT//-0+</h1>
			<span class="console-id label">REGISTER CONSOLE 01</span>
		</header>

		<TritRegister bind:value={a} label="Input A" onchange={traceAfterUpdate} />
		<TritRegister
			bind:value={b}
			label="Input B"
			muted={isUnary}
			disabled={isUnary}
			onchange={() => {
				if (!isUnary) traceAfterUpdate();
			}}
		/>
		<PresetBank width={WIDTH} onload={loadPreset} />

		<div class="mode-row">
			<span class="label">MODE</span>
			<OperationSelector bind:value={mode} onchange={traceAfterUpdate} />
		</div>

		{#if logicMode}
			<LogicReadout {a} {b} result={result.trits} mode={logicMode} />
		{/if}

		{#if isCompare}
			<div class="compare-row">
				<span class="label">ORDER</span>
				<TritControl
					value={compareResult.outcome}
					label={`Comparison result, ${
						compareResult.outcome === 0
							? 'A equals B'
							: compareResult.outcome > 0
								? 'A greater than B'
								: 'A less than B'
					}`}
					readonly
					emphasized
				/>
				<span class="compare-text"
					>{compareResult.outcome === 0 ? 'A = B' : compareResult.outcome > 0 ? 'A > B' : 'A < B'}</span
				>
			</div>
		{:else}
			<div class="result-row">
				<TritRegister
					value={result.trits}
					label="Result"
					readonly
					emphasized
					traceChangedIndices={visibleTrace.changedIndices}
					{activeTraceIndex}
				/>
				<button type="button" class="copy-button" disabled={result.overflow} onclick={copyResultToA}>
					RESULT → A
				</button>
			</div>
		{/if}

		<ShowWorking
			{mode}
			trace={result.trace}
			overflow={result.overflow}
			shift={shiftInfo}
			compare={compareInfo}
			bind:open={showWorkingOpen}
		/>

		<div class="readout">
			<span class="readout-label">DECIMAL</span>
			<output class="values readout-window"
				>A: {decimalA}&nbsp;&nbsp;&nbsp;B: {decimalB}&nbsp;&nbsp;&nbsp;RESULT: {result.overflow
					? 'OVERFLOW'
					: decimalResult}</output
			>
		</div>

		<div
			class="status"
			class:overflow={result.overflow}
			role="status"
			aria-live={activeTraceIndex === null ? 'polite' : 'off'}
			aria-atomic="true"
		>
			<span class="readout-label">STATUS</span>
			{statusText}
		</div>

		<InfoPanel />

		<footer>
			<button type="button" class="guided-button" onclick={runGuidedExperiment}>
				GUIDED: 1 + 1 CARRY
			</button>
			<a class="exhibit-link" href="/playground/trit-control">COMPONENT EXHIBIT: TRIT CONTROL →</a>
		</footer>
		</div>
	</div>
</main>

<style>
	main {
		min-height: 100vh;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding: 2rem 1rem;
	}

	.panel {
		width: min(100%, 66rem);
		/* Light falling on the physical casing, not a viewport-relative
		   overlay: a soft highlight above center fading to a darker edge,
		   vignetted to the panel's own bounds. */
		background-color: var(--panel-1);
		background-image:
			radial-gradient(ellipse 130% 110% at 50% 45%, rgba(255, 255, 255, 0.13), transparent 78%),
			radial-gradient(ellipse at center, transparent 35%, rgba(0, 0, 0, 0.4) 100%);
		border: 1px solid var(--line);
		box-shadow: var(--shadow-raised);
		border-radius: 2px;
		margin-block: 0;
	}

	.panel-inner {
		position: relative;
		z-index: 3;
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
		padding: 1.5rem 1.75rem;
	}

	header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 0.25rem;
	}

	h1 {
		margin: 0;
		font-family: var(--font-label);
		font-weight: 600;
		font-size: 1.3rem;
		letter-spacing: 0.06em;
	}

	.label {
		font-family: var(--font-label);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-size: 0.75rem;
		color: var(--label);
	}

	.mode-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.mode-row .label {
		flex: 0 0 auto;
		width: 5.5rem;
	}

	.result-row {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.compare-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.compare-row .label {
		flex: 0 0 auto;
		width: 5.5rem;
	}

	.compare-text {
		font-family: var(--font-data);
		font-size: 0.85rem;
		letter-spacing: 0.06em;
		color: var(--text);
	}

	.copy-button {
		appearance: none;
		align-self: flex-start;
		margin-left: 6.5rem;
		border: 1px solid var(--line);
		background: var(--panel-1);
		box-shadow: var(--shadow-raised);
		color: var(--text);
		font-family: var(--font-label);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-size: 0.75rem;
		min-height: 44px;
		padding: 0.5rem 0.75rem;
		border-radius: 2px;
		cursor: pointer;
		transition:
			opacity 160ms var(--ease-settle),
			border-color 160ms var(--ease-settle),
			box-shadow 160ms var(--ease-settle);
	}

	.copy-button:hover:not(:disabled) {
		border-color: var(--line);
	}

	.copy-button:active:not(:disabled) {
		background: var(--panel-2);
		box-shadow: var(--shadow-pressed);
	}

	.copy-button:focus-visible {
		outline: 1px solid var(--focus);
		outline-offset: 2px;
	}

	.copy-button:disabled {
		opacity: 0.35;
		cursor: default;
	}

	@media (max-width: 42rem) {
		.copy-button {
			align-self: center;
			margin-left: 0;
		}

		.mode-row {
			flex-direction: column;
			align-items: stretch;
			gap: 0.5rem;
		}

		.mode-row .label {
			width: auto;
		}

		/* Two full-size trit controls (~136px each) need real headroom at
		   375-430px; the desktop padding leaves only a few px to spare. */
		.panel-inner {
			padding-inline: 1rem;
		}
	}

	.readout,
	.status {
		font-family: var(--font-data);
		font-size: 0.85rem;
		letter-spacing: 0.06em;
		color: var(--text);
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.readout-label {
		font-family: var(--font-label);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-size: 0.75rem;
		color: var(--label);
		flex: 0 0 auto;
		width: 5.5rem;
	}

	.readout-window {
		padding: 0.55rem 0.7rem;
		background: var(--panel-2);
		border: 1px solid var(--line);
		border-bottom-color: var(--edge);
		border-radius: 2px;
		color: var(--text);
		font-family: var(--font-label);
		font-size: 1rem;
		font-weight: 600;
		line-height: 1;
		letter-spacing: 0.08em;
		font-variant-numeric: tabular-nums;
		box-shadow: var(--shadow-recessed);
		text-shadow: var(--glow-readout);
	}

	.status {
		font-family: var(--font-label);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-size: 0.75rem;
		color: var(--label);
	}

	.status.overflow {
		color: var(--overflow);
	}

	footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5rem 1rem;
		padding-top: 0.5rem;
		border-top: 1px solid var(--line);
	}

	.guided-button {
		appearance: none;
		border: 1px solid var(--line);
		background: var(--panel-1);
		box-shadow: var(--shadow-raised);
		color: var(--label);
		font-family: var(--font-label);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-size: 0.7rem;
		min-height: 44px;
		padding: 0.4rem 0.75rem;
		border-radius: 2px;
		cursor: pointer;
		transition:
			color 160ms var(--ease-settle),
			border-color 160ms var(--ease-settle),
			box-shadow 160ms var(--ease-settle);
	}

	.guided-button:hover {
		color: var(--text);
		border-color: var(--line);
	}

	.guided-button:active {
		background: var(--panel-2);
		box-shadow: var(--shadow-pressed);
	}

	.guided-button:focus-visible {
		outline: 1px solid var(--focus);
		outline-offset: 2px;
	}

	.exhibit-link {
		font-family: var(--font-label);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-size: 0.7rem;
		color: var(--label);
		text-decoration: none;
	}

	.exhibit-link:hover {
		color: var(--text);
	}

	.exhibit-link:focus-visible {
		outline: 1px solid var(--focus);
		outline-offset: 2px;
	}

	@media (min-height: 50rem) {
		.panel:not(:has(:global(.info-panel[open]))) {
			margin-block: auto;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.copy-button,
		.guided-button {
			transition: none;
		}
	}
</style>
