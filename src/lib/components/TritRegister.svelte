<script lang="ts">
	import TritControl from './TritControl.svelte';
	import type { TritRegister as TritRegisterValue } from '$lib/ternary/balancedTernary';

	const SUPERSCRIPT: Record<number, string> = {
		0: '⁰',
		1: '¹',
		2: '²',
		3: '³',
		4: '⁴',
		5: '⁵'
	};

	interface Props {
		/** Bindable so the console can do `bind:value={a}`; pass a plain value
		 * (no `bind:`) for a read-only/derived register like the result. */
		value: TritRegisterValue;
		/** Screen-reader and engraved-heading label, e.g. "Input A". */
		label: string;
		readonly?: boolean;
		disabled?: boolean;
		emphasized?: boolean;
		/** Visually de-emphasized when this register isn't used by the
		 * current mode (e.g. Input B during a unary operation). */
		muted?: boolean;
		/** Brightens the label — this register is the current LOAD destination. */
		targeted?: boolean;
		traceChangedIndices?: number[];
		activeTraceIndex?: number | null;
		onchange?: (index: number) => void;
	}

	let {
		value = $bindable([]),
		label,
		readonly = false,
		disabled = false,
		emphasized = false,
		muted = false,
		targeted = false,
		traceChangedIndices = [],
		activeTraceIndex = null,
		onchange
	}: Props = $props();

	const width = value.length;
</script>

<div class="register" class:muted>
	<span class="label" class:targeted>{label}</span>
	<div class="row">
		{#each value as _, i (i)}
			<TritControl
				value={value[i]}
				label={`${label}${muted ? ', unused in current mode' : ''}, trit ${i + 1} of ${width}`}
				positionLabel={`3${SUPERSCRIPT[width - 1 - i] ?? ''}`}
				{readonly}
				{disabled}
				{emphasized}
				traceChanged={traceChangedIndices.includes(i)}
				traceActive={activeTraceIndex === i}
				onchange={(next) => {
					value[i] = next;
					onchange?.(i);
				}}
			/>
		{/each}
	</div>
</div>

<style>
	.register {
		display: flex;
		align-items: center;
		gap: 1rem;
		min-width: 0;
		transition: opacity 200ms var(--ease-settle);
	}

	.register.muted {
		opacity: 0.45;
	}

	.label {
		flex: 0 0 auto;
		width: 5.5rem;
		align-self: flex-start;
		padding-top: calc(2px + (44px - 1em) / 2);
		font-family: var(--font-label);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-size: 0.8rem;
		color: var(--label);
		transition: color 160ms var(--ease-settle);
	}

	.label.targeted {
		color: var(--text);
	}

	.row {
		display: flex;
		flex: 1 1 auto;
		gap: 0.5rem;
		min-width: 0;
		overflow-x: auto;
		overflow-y: hidden;
		/* Focus brackets extend 4px beyond each control. Keep that clearance
		   inside the scrollport so overflow-y does not clip their top edge. */
		padding: 4px 4px 6px;
	}

	/* Each trit control is a full three-way switch (~136px), not a single
	   44px button — at 375-430px widths, even with the label column removed,
	   at most two fit per row. A 2-column grid keeps all six positions
	   visible with no horizontal scroll, rather than fitting three across by
	   shrinking below the 44px touch-target floor. */
	@media (max-width: 42rem) {
		.register {
			flex-direction: column;
			align-items: stretch;
			gap: 0.5rem;
		}

		.label {
			width: auto;
			padding-top: 0;
		}

		.row {
			display: grid;
			grid-template-columns: repeat(2, max-content);
			justify-content: center;
			gap: 0.6rem 0.75rem;
			overflow: visible;
			padding: 2px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.register,
		.label {
			transition: none;
		}
	}
</style>
