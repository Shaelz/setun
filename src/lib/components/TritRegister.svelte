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
		emphasized?: boolean;
		/** Visually de-emphasized when this register isn't used by the
		 * current mode (e.g. Input B during a unary operation). */
		muted?: boolean;
	}

	let {
		value = $bindable([]),
		label,
		readonly = false,
		emphasized = false,
		muted = false
	}: Props = $props();

	const width = value.length;
</script>

<div class="register" class:muted>
	<span class="label">{label}</span>
	<div class="row">
		{#each value as _, i (i)}
			<TritControl
				bind:value={value[i]}
				label={`${label}, trit ${i + 1} of ${width}`}
				positionLabel={`3${SUPERSCRIPT[width - 1 - i] ?? ''}`}
				{readonly}
				{emphasized}
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
		font-family: var(--font-label);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-size: 0.8rem;
		color: var(--label);
	}

	.row {
		display: flex;
		flex: 1 1 auto;
		gap: 0.5rem;
		min-width: 0;
		overflow-x: auto;
		overflow-y: hidden;
		padding: 2px 2px 6px;
	}

	@media (prefers-reduced-motion: reduce) {
		.register {
			transition: none;
		}
	}
</style>
