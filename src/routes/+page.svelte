<script lang="ts">
	import { onDestroy } from 'svelte';
	import InfoPanel from '$lib/components/InfoPanel.svelte';
	import LogicReadout from '$lib/components/LogicReadout.svelte';
	import PresetBank from '$lib/components/PresetBank.svelte';
	import ShowWorking from '$lib/components/ShowWorking.svelte';
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
		subtractBalancedTernary,
		type RegisterResult,
		type NormalizationTrace,
		type Trit,
		type TritRegister as TritRegisterValue
	} from '$lib/ternary/balancedTernary';
	import type { PresetId } from '$lib/ternary/presets';
	import { ternaryAnd, ternaryNot, ternaryOr } from '$lib/ternary/ternaryLogic';

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

	let isUnary = $derived(UNARY_MODES.has(mode));
	let isLogic = $derived(LOGIC_MODES.has(mode));
	let logicMode = $derived<LogicMode | null>(isLogic ? (mode as LogicMode) : null);

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
			default: {
				const exhaustive: never = mode;
				throw new Error(`Unhandled mode: ${exhaustive}`);
			}
		}
	});

	let decimalA = $derived(balancedTernaryToDecimal(a));
	let decimalB = $derived(balancedTernaryToDecimal(b));
	let decimalResult = $derived(result.overflow ? null : balancedTernaryToDecimal(result.trits));

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
			startTrace(result);
		});
	}

	function copyResultToA() {
		if (result.overflow) return;
		a = [...result.trits];
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
	<title>TRIT//-0+</title>
	<meta name="description" content="Balanced ternary register console" />
</svelte:head>

<main>
	<div class="panel">
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

		<ShowWorking {mode} trace={result.trace} overflow={result.overflow} />

		<div class="readout label">
			<span class="readout-label">DECIMAL</span>
			<span class="values"
				>A: {decimalA}&nbsp;&nbsp;&nbsp;B: {decimalB}&nbsp;&nbsp;&nbsp;RESULT: {result.overflow
					? 'OVERFLOW'
					: decimalResult}</span
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
			<a class="exhibit-link" href="/playground/trit-control">COMPONENT EXHIBIT: TRIT CONTROL →</a>
		</footer>
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
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
		width: min(100%, 66rem);
		padding: 1.5rem 1.75rem;
		/* Light falling on the physical casing, not a viewport-relative
		   overlay: a soft highlight above center fading to a darker edge,
		   vignetted to the panel's own bounds. */
		background-color: var(--panel-1);
		background-image:
			radial-gradient(ellipse 130% 110% at 50% 45%, rgba(255, 255, 255, 0.13), transparent 78%),
			radial-gradient(ellipse at center, transparent 35%, rgba(0, 0, 0, 0.4) 100%);
		border: 1px solid var(--line);
		border-top-color: var(--edge);
		border-radius: 2px;
		margin-block: 0;
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

	.copy-button {
		appearance: none;
		align-self: flex-start;
		margin-left: 6.5rem;
		border: 1px solid var(--line);
		background: var(--panel-2);
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
			border-color 160ms var(--ease-settle);
	}

	.copy-button:hover:not(:disabled) {
		border-color: var(--edge);
	}

	.copy-button:focus-visible {
		outline: 1px solid var(--focus);
		outline-offset: 2px;
	}

	.copy-button:disabled {
		opacity: 0.35;
		cursor: default;
	}

	.readout,
	.status {
		font-family: var(--font-data);
		font-size: 0.85rem;
		letter-spacing: 0.06em;
		color: var(--text);
		display: flex;
		gap: 0.75rem;
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
		justify-content: flex-end;
		padding-top: 0.5rem;
		border-top: 1px solid var(--line);
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
		.copy-button {
			transition: none;
		}
	}
</style>
