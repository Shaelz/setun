<script lang="ts">
	import type { Mode } from './OperationSelector.svelte';
	import type { Trit, TritRegister } from '$lib/ternary/balancedTernary';

	interface Props {
		a: TritRegister;
		b: TritRegister;
		result: TritRegister;
		mode: Extract<Mode, 'TERNARY_AND' | 'TERNARY_OR' | 'TERNARY_NOT'>;
	}

	let { a, b, result, mode }: Props = $props();

	const SYMBOL: Record<Trit, string> = { [-1]: '−', 0: '0', 1: '+' };
	const SUPERSCRIPT = ['⁰', '¹', '²', '³', '⁴', '⁵'];
	let unary = $derived(mode === 'TERNARY_NOT');
	let operation = $derived(
		mode === 'TERNARY_AND' ? 'AND · MIN(A,B)' : mode === 'TERNARY_OR' ? 'OR · MAX(A,B)' : 'NOT · −A'
	);
</script>

<section class="logic-readout" aria-labelledby="logic-heading">
	<div class="logic-heading">
		<span id="logic-heading">ORDERED TERNARY LOGIC</span>
		<span class="ordering">− &lt; 0 &lt; +</span>
		<span class="operation">{operation}</span>
	</div>
	<div class="logic-scroll">
		<div class="logic-grid" class:unary>
			<span class="corner-label">TRIT</span>
			{#each a as _, index (index)}
				<span class="power">3{SUPERSCRIPT[a.length - 1 - index]}</span>
			{/each}

			<span class="row-label">A</span>
			{#each a as trit, index (`a-${index}`)}
				<span class="trit trit-{trit}">{SYMBOL[trit]}</span>
			{/each}

			{#if !unary}
				<span class="row-label">B</span>
				{#each b as trit, index (`b-${index}`)}
					<span class="trit trit-{trit}">{SYMBOL[trit]}</span>
				{/each}
			{/if}

			<span class="row-label output-label">OUT</span>
			{#each result as trit, index (`result-${index}`)}
				<span class="trit output trit-{trit}">{SYMBOL[trit]}</span>
			{/each}
		</div>
	</div>
</section>

<style>
	.logic-readout {
		margin-left: 6.5rem;
		border: 1px solid var(--line);
		border-radius: 2px;
		background: var(--panel-2);
		box-shadow: var(--shadow-recessed);
		min-width: 0;
	}

	.logic-heading {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		flex-wrap: wrap;
		padding: 0.45rem 0.65rem;
		border-bottom: 1px solid var(--line);
		font-family: var(--font-label);
		font-size: 0.72rem;
		letter-spacing: 0.1em;
		color: var(--label);
	}

	.ordering {
		color: var(--text);
		font-family: var(--font-data);
		letter-spacing: 0.04em;
	}

	.operation {
		margin-left: auto;
		color: var(--text);
	}

	.logic-scroll {
		overflow-x: auto;
		overflow-y: hidden;
	}

	.logic-grid {
		display: grid;
		grid-template-columns: 3rem repeat(6, minmax(2.4rem, 1fr));
		min-width: 21rem;
		padding: 0.35rem 0.45rem 0.45rem;
	}

	.logic-grid > span {
		display: grid;
		place-items: center;
		min-height: 1.65rem;
		border-right: 1px solid color-mix(in srgb, var(--line) 72%, transparent);
	}

	.logic-grid > span:nth-child(7n) {
		border-right: 0;
	}

	.corner-label,
	.row-label,
	.power {
		font-family: var(--font-label);
		font-size: 0.66rem;
		letter-spacing: 0.08em;
		color: var(--label);
	}

	.logic-grid > span.row-label,
	.logic-grid > span.corner-label {
		justify-items: start;
		padding-left: 0.2rem;
	}

	.power {
		border-bottom: 1px solid var(--line);
	}

	.corner-label {
		border-bottom: 1px solid var(--line);
	}

	.trit {
		font-family: var(--font-data);
		font-size: 0.85rem;
		font-weight: 600;
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

	.output,
	.output-label {
		border-top: 1px solid var(--line);
	}

	.output {
		background: color-mix(in srgb, currentColor 7%, transparent);
		text-shadow: 0 0 5px color-mix(in srgb, currentColor 25%, transparent);
	}

	@media (max-width: 42rem) {
		.logic-readout {
			margin-left: 0;
		}

		.operation {
			width: 100%;
			margin-left: 0;
		}
	}
</style>
