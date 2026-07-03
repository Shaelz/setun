<script module lang="ts">
	export type Mode =
		| 'ADD'
		| 'SUBTRACT'
		| 'MULTIPLY'
		| 'NEGATE'
		| 'INCREMENT'
		| 'DECREMENT'
		| 'TERNARY_AND'
		| 'TERNARY_OR'
		| 'TERNARY_NOT';

	export const MODES: { id: Mode; label: string }[] = [
		{ id: 'ADD', label: 'ADD' },
		{ id: 'SUBTRACT', label: 'SUB' },
		{ id: 'MULTIPLY', label: 'MUL' },
		{ id: 'NEGATE', label: 'NEG' },
		{ id: 'INCREMENT', label: 'INC' },
		{ id: 'DECREMENT', label: 'DEC' },
		{ id: 'TERNARY_AND', label: 'AND' },
		{ id: 'TERNARY_OR', label: 'OR' },
		{ id: 'TERNARY_NOT', label: 'NOT' }
	];

	/** Modes that read only Input A — Input B is unused and gets visually muted. */
	export const UNARY_MODES: ReadonlySet<Mode> = new Set([
		'NEGATE',
		'INCREMENT',
		'DECREMENT',
		'TERNARY_NOT'
	]);

	export const LOGIC_MODES: ReadonlySet<Mode> = new Set([
		'TERNARY_AND',
		'TERNARY_OR',
		'TERNARY_NOT'
	]);
</script>

<script lang="ts">
	interface Props {
		value: Mode;
		onchange?: (value: Mode) => void;
	}

	let { value = $bindable(), onchange }: Props = $props();

	function select(next: Mode) {
		if (next === value) return;
		value = next;
		onchange?.(next);
	}
</script>

<div class="selector" role="radiogroup" aria-label="Operation mode">
	{#each MODES as m (m.id)}
		<button
			type="button"
			role="radio"
			aria-checked={value === m.id}
			class="option"
			class:active={value === m.id}
			onclick={() => select(m.id)}
		>
			{m.label}
		</button>
	{/each}
</div>

<style>
	.selector {
		display: flex;
		gap: 0.4rem;
		flex-wrap: wrap;
	}

	.option {
		appearance: none;
		border: 1px solid var(--line);
		background: var(--panel-1);
		color: var(--label);
		font-family: var(--font-label);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-size: 0.75rem;
		min-width: 44px;
		min-height: 44px;
		padding: 0.4rem 0.75rem;
		border-radius: 2px;
		cursor: pointer;
		transition:
			background-color 160ms var(--ease-settle),
			color 160ms var(--ease-settle),
			border-color 160ms var(--ease-settle);
	}

	.option:hover {
		color: var(--text);
		border-color: var(--edge);
	}

	.option.active {
		background: var(--panel-2);
		color: var(--text);
		border-color: var(--text);
	}

	@media (prefers-reduced-motion: reduce) {
		.option {
			transition: none;
		}
	}
</style>
