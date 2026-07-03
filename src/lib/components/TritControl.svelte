<script lang="ts">
	import type { Trit } from '$lib/ternary/balancedTernary';

	interface Props {
		/** The trit's current value. Bindable so a register can do `bind:value={trits[i]}`. */
		value: Trit;
		/** Screen-reader context, e.g. "Input A, trit 4 of 6". */
		label: string;
		/** Small engraved power-of-three label shown under the control, e.g. "3⁴". */
		positionLabel?: string;
		disabled?: boolean;
	}

	let { value = $bindable(0), label, positionLabel = '', disabled = false }: Props = $props();

	const POSITIONS: Trit[] = [-1, 0, 1];
	const SYMBOL: Record<Trit, string> = { [-1]: '−', 0: '0', 1: '+' };
	const WORD: Record<Trit, string> = { [-1]: 'negative one', 0: 'zero', 1: 'positive one' };

	let rootEl: HTMLDivElement;

	function set(next: Trit) {
		if (disabled) return;
		value = next;
	}

	function onkeydown(event: KeyboardEvent) {
		if (disabled) return;
		switch (event.key) {
			case 'ArrowLeft':
				set(Math.max(-1, value - 1) as Trit);
				break;
			case 'ArrowRight':
				set(Math.min(1, value + 1) as Trit);
				break;
			case '-':
				set(-1);
				break;
			case '0':
				set(0);
				break;
			case '+':
			case '=':
				set(1);
				break;
			default:
				return;
		}
		event.preventDefault();
	}

	// Cells are tabindex="-1" (the slider role is the single tab stop) but a
	// mouse click still shifts focus to them by default; preventDefault on
	// mousedown stops that so focus stays on the root control.
	function onCellMousedown(event: MouseEvent) {
		event.preventDefault();
	}

	function onCellClick(position: Trit) {
		set(position);
		rootEl.focus();
	}
</script>

<div class="wrap">
	<div
		bind:this={rootEl}
		class="control"
		class:disabled
		role="slider"
		aria-label={label}
		aria-orientation="horizontal"
		aria-valuemin={-1}
		aria-valuemax={1}
		aria-valuenow={value}
		aria-valuetext={WORD[value]}
		aria-disabled={disabled}
		tabindex={disabled ? -1 : 0}
		{onkeydown}
	>
		<span class="corner corner-tl" aria-hidden="true"></span>
		<span class="corner corner-tr" aria-hidden="true"></span>
		<span class="corner corner-bl" aria-hidden="true"></span>
		<span class="corner corner-br" aria-hidden="true"></span>
		<div class="track">
			{#each POSITIONS as position, i (position)}
				{#if i > 0}
					<div class="divider" aria-hidden="true"></div>
				{/if}
				<button
					type="button"
					class="cell trit-{position}"
					class:selected={value === position}
					tabindex="-1"
					aria-hidden="true"
					onmousedown={onCellMousedown}
					onclick={() => onCellClick(position)}
				>
					{SYMBOL[position]}
				</button>
			{/each}
		</div>
	</div>
	{#if positionLabel}
		<span class="position-label">{positionLabel}</span>
	{/if}
</div>

<style>
	.wrap {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
	}

	.control {
		position: relative;
		display: inline-block;
		border-radius: 2px;
		outline: none;
	}

	.control.disabled {
		opacity: 0.4;
	}

	.track {
		display: flex;
		background: var(--panel-2);
		border: 1px solid var(--line);
		border-radius: 2px;
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
		overflow: hidden;
	}

	.divider {
		width: 1px;
		background: linear-gradient(to bottom, var(--edge), var(--line) 50%, var(--line));
	}

	.cell {
		appearance: none;
		border: none;
		background: transparent;
		width: 44px;
		height: 44px;
		font-family: var(--font-data);
		font-size: 1.25rem;
		font-weight: 600;
		line-height: 1;
		/* Dim baseline is tinted per trit (not neutral --text) so each
		   position's identity reads even at rest; 0.65 keeps contrast
		   against --panel-2 above 3:1 for all three trit colors. */
		opacity: 0.65;
		cursor: pointer;
		transform: scale(1);
		transition:
			opacity 160ms var(--ease-settle),
			background-color 160ms var(--ease-settle),
			box-shadow 160ms var(--ease-settle),
			transform 80ms var(--ease-settle);
	}

	.control.disabled .cell {
		cursor: default;
	}

	.cell.trit--1 {
		color: var(--trit-neg);
	}

	.cell.trit-0 {
		color: var(--trit-zero);
	}

	.cell.trit-1 {
		color: var(--trit-pos);
	}

	.cell.selected {
		opacity: 1;
		background: color-mix(in srgb, currentColor 14%, transparent);
		box-shadow: inset 0 0 8px color-mix(in srgb, currentColor 35%, transparent);
	}

	.control:not(.disabled) .cell:hover:not(.selected) {
		opacity: 0.85;
		background: color-mix(in srgb, currentColor 10%, transparent);
	}

	.control:not(.disabled) .cell:active {
		transform: scale(0.94);
	}

	.corner {
		position: absolute;
		width: 8px;
		height: 8px;
		border-color: var(--focus);
		border-style: solid;
		border-width: 0;
		opacity: 0;
		transition: opacity 120ms var(--ease-settle);
		pointer-events: none;
	}

	.control:focus-visible .corner {
		opacity: 1;
	}

	.corner-tl {
		top: -4px;
		left: -4px;
		border-top-width: 2px;
		border-left-width: 2px;
	}

	.corner-tr {
		top: -4px;
		right: -4px;
		border-top-width: 2px;
		border-right-width: 2px;
	}

	.corner-bl {
		bottom: -4px;
		left: -4px;
		border-bottom-width: 2px;
		border-left-width: 2px;
	}

	.corner-br {
		bottom: -4px;
		right: -4px;
		border-bottom-width: 2px;
		border-right-width: 2px;
	}

	.position-label {
		font-family: var(--font-label);
		font-size: 0.7rem;
		letter-spacing: 0.08em;
		color: var(--label);
	}

	@media (prefers-reduced-motion: reduce) {
		.cell,
		.corner {
			transition: none;
		}
	}
</style>
