<script lang="ts">
	import type { NormalizationTrace, PositionStep, Trit } from '$lib/ternary/balancedTernary';
	import { MODES, type Mode } from './OperationSelector.svelte';

	interface Props {
		mode: Mode;
		trace: NormalizationTrace;
		overflow: boolean;
	}

	let { mode, trace, overflow }: Props = $props();

	/** These four reduce to the same per-position "trit + trit (+ carry-in)"
	 * quantity before normalization runs — SUB negates B first, DEC subtracts
	 * the unit register — so one explanation template covers all of them. */
	const STEPPED_MODES: ReadonlySet<Mode> = new Set([
		'ADD',
		'SUBTRACT',
		'INCREMENT',
		'DECREMENT'
	]);

	let narration = $derived<'stepped' | 'multiply' | 'none'>(
		STEPPED_MODES.has(mode) ? 'stepped' : mode === 'MULTIPLY' ? 'multiply' : 'none'
	);
	let modeLabel = $derived(MODES.find((m) => m.id === mode)?.label ?? mode);

	const SUPERSCRIPT: Record<number, string> = {
		0: '⁰',
		1: '¹',
		2: '²',
		3: '³',
		4: '⁴',
		5: '⁵',
		6: '⁶'
	};
	const SYMBOL: Record<Trit, string> = { [-1]: '−', 0: '0', 1: '+' };

	function powerLabel(power: number): string {
		return `3${SUPERSCRIPT[power] ?? `^${power}`}`;
	}

	function signed(n: number): string {
		return n > 0 ? `+${n}` : `${n}`;
	}

	let rows = $derived(
		[...trace.steps]
			.filter((step): step is PositionStep & { index: number } => step.index !== null)
			.sort((a, b) => a.index - b.index)
	);

	function describeStep(step: PositionStep): string | null {
		const { carryIn, carryOut, rawSum, power, digit } = step;
		if (carryIn === 0 && carryOut === 0) return null;
		const symbol = SYMBOL[digit];
		const kindOf = (amount: number) => (amount < 0 ? 'borrows' : 'carries');
		if (carryIn === 0) {
			return (
				`${powerLabel(power)} sums to ${signed(rawSum)}, which needs normalization: ` +
				`becomes ${symbol} here and ${kindOf(carryOut)} ${Math.abs(carryOut)} into ${powerLabel(power + 1)}.`
			);
		}
		const source = `${carryIn < 0 ? 'borrow' : 'carry'} of ${Math.abs(carryIn)} from ${powerLabel(power - 1)}`;
		if (carryOut === 0) {
			return `${powerLabel(power)} receives a ${source}, bringing its sum to ${signed(rawSum)}: becomes ${symbol} here.`;
		}
		return (
			`${powerLabel(power)} receives a ${source} and, with a sum of ${signed(rawSum)}, still needs normalization: ` +
			`becomes ${symbol} here and ${kindOf(carryOut)} ${Math.abs(carryOut)} on to ${powerLabel(power + 1)}.`
		);
	}

	// Narrated in the same right-to-left, cause-before-effect order the carry
	// pulse animates (trace.changedIndices), not the table's left-to-right
	// display order — otherwise a carry's destination reads before its source.
	let sentences = $derived.by(() => {
		const byIndex = new Map(rows.map((step) => [step.index, step]));
		return trace.changedIndices
			.map((index) => byIndex.get(index))
			.filter((step): step is PositionStep & { index: number } => step !== undefined)
			.map(describeStep)
			.filter((line): line is string => line !== null);
	});
	let hasNormalization = $derived(trace.changedIndices.length > 0);

	// Replay walks the same changedIndices sequence, at the same ~60ms-per-trit
	// pace, as the live carry pulse on the result register — it only moves a
	// local highlight, it never re-runs the operation or touches A/B/result.
	let activeIndex = $state<number | null>(null);
	let replayTimer: ReturnType<typeof setTimeout> | undefined;

	function replay() {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		if (replayTimer) clearTimeout(replayTimer);
		const sequence = trace.changedIndices;
		let position = 0;
		const advance = () => {
			if (position >= sequence.length) {
				activeIndex = null;
				return;
			}
			activeIndex = sequence[position];
			position += 1;
			replayTimer = setTimeout(advance, 60);
		};
		advance();
	}
</script>

<details class="show-working">
	<summary>
		<span>WORKING</span>
		<span class="summary-title">SHOW WORKING</span>
		<span class="indicator" aria-hidden="true">+</span>
	</summary>

	<div class="content">
		{#if narration === 'none'}
			<p class="note">
				{modeLabel} doesn't produce a normalization trace — there's nothing to walk through here.
			</p>
		{:else if narration === 'multiply'}
			<p class="note">
				Step detail isn't written for {modeLabel} yet. The result above is still correct.
			</p>
		{:else if !hasNormalization}
			<p class="note">No carry or borrow — every position matched a single trit exactly.</p>
		{:else}
			<div class="working-scroll">
				<div class="working-grid">
					<span class="corner-label">POWER</span>
					{#each rows as step (step.index)}
						<span class="power">{powerLabel(step.power)}</span>
					{/each}

					<span class="row-label">SUM</span>
					{#each rows as step (step.index)}
						<span class="value">{signed(step.rawSum)}</span>
					{/each}

					<span class="row-label">DIGIT</span>
					{#each rows as step (step.index)}
						<span class="trit trit-{step.digit}" class:active={activeIndex === step.index}
							>{SYMBOL[step.digit]}</span
						>
					{/each}

					<span class="row-label">CARRY</span>
					{#each rows as step (step.index)}
						<span class="value carry"
							>{step.carryOut === 0
								? '—'
								: `${step.carryOut < 0 ? 'BORROW' : 'CARRY'} → ${powerLabel(step.power + 1)}`}</span
						>
					{/each}
				</div>
			</div>

			<ul class="sentences">
				{#each sentences as sentence, index (index)}
					<li>{sentence}</li>
				{/each}
			</ul>

			{#if overflow}
				<p class="note">
					A further carry reaches {powerLabel(trace.overflowIndex ?? 0)} and is discarded — OVERFLOW.
				</p>
			{/if}

			{#if hasNormalization}
				<button type="button" class="replay-button" onclick={replay}>REPLAY</button>
			{/if}
		{/if}
	</div>
</details>

<style>
	.show-working {
		margin-left: 6.5rem;
		border: 1px solid var(--line);
		border-radius: 2px;
		background: var(--panel-2);
		color: var(--label);
	}

	summary {
		display: grid;
		grid-template-columns: 5.5rem 1fr auto;
		align-items: center;
		min-height: 44px;
		padding: 0.35rem 0.65rem;
		font-family: var(--font-label);
		font-size: 0.72rem;
		letter-spacing: 0.1em;
		cursor: pointer;
		list-style: none;
	}

	summary::-webkit-details-marker {
		display: none;
	}

	summary:focus-visible {
		outline: 1px solid var(--focus);
		outline-offset: 2px;
	}

	.summary-title {
		color: var(--text);
	}

	.indicator {
		color: var(--trit-pos);
		font-family: var(--font-data);
		font-size: 0.9rem;
		transition: transform 120ms var(--ease-settle);
	}

	details[open] .indicator {
		transform: rotate(45deg);
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding: 0.65rem;
		border-top: 1px solid var(--line);
	}

	.note {
		margin: 0;
		font-family: var(--font-data);
		font-size: 0.78rem;
		color: var(--text);
	}

	.working-scroll {
		overflow-x: auto;
		overflow-y: hidden;
	}

	.working-grid {
		display: grid;
		grid-template-columns: 3rem repeat(6, minmax(2.6rem, 1fr));
		min-width: 21rem;
	}

	.working-grid > span {
		display: grid;
		place-items: center;
		min-height: 1.65rem;
		border-right: 1px solid color-mix(in srgb, var(--line) 72%, transparent);
		border-bottom: 1px solid color-mix(in srgb, var(--line) 72%, transparent);
	}

	.working-grid > span:nth-child(7n) {
		border-right: 0;
	}

	.corner-label,
	.row-label,
	.power {
		font-family: var(--font-label);
		font-size: 0.66rem;
		letter-spacing: 0.08em;
	}

	.row-label,
	.corner-label {
		justify-items: start !important;
		padding-left: 0.2rem;
	}

	.power {
		border-bottom: 2px solid var(--line);
	}

	.value {
		font-family: var(--font-data);
		font-size: 0.78rem;
		color: var(--text);
	}

	.carry {
		font-size: 0.62rem;
		letter-spacing: 0.04em;
	}

	.trit {
		font-family: var(--font-data);
		font-size: 0.9rem;
		font-weight: 600;
		transition:
			text-shadow 160ms var(--ease-settle),
			opacity 160ms var(--ease-settle);
	}

	.trit--1 {
		color: var(--trit-neg);
	}

	.trit-0 {
		color: var(--trit-zero);
	}

	.trit-1 {
		color: var(--trit-pos);
	}

	.trit.active {
		text-shadow: 0 0 6px color-mix(in srgb, currentColor 60%, transparent);
	}

	.sentences {
		margin: 0;
		padding-left: 1.1rem;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		font-family: var(--font-data);
		font-size: 0.78rem;
		color: var(--text);
	}

	.replay-button {
		appearance: none;
		align-self: flex-start;
		border: 1px solid var(--line);
		background: var(--panel-1);
		color: var(--text);
		font-family: var(--font-label);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-size: 0.72rem;
		min-height: 44px;
		padding: 0.4rem 0.75rem;
		border-radius: 2px;
		cursor: pointer;
		transition:
			opacity 160ms var(--ease-settle),
			border-color 160ms var(--ease-settle);
	}

	.replay-button:hover {
		border-color: var(--edge);
	}

	.replay-button:focus-visible {
		outline: 1px solid var(--focus);
		outline-offset: 2px;
	}

	@media (max-width: 42rem) {
		.show-working {
			margin-left: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.indicator,
		.trit {
			transition: none;
		}

		.replay-button {
			display: none;
		}
	}
</style>
