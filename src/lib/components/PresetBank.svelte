<script lang="ts">
	import { PRESETS, presetRegister, type PresetId } from '$lib/ternary/presets';
	import type { TritRegister } from '$lib/ternary/balancedTernary';

	type Target = 'A' | 'B';

	interface Props {
		width: number;
		onload: (target: Target, value: TritRegister, preset: PresetId) => void;
	}

	let { width, onload }: Props = $props();
	let target = $state<Target>('A');
	let targetElement: HTMLDivElement;

	function load(id: PresetId) {
		onload(target, presetRegister(id, width), id);
	}

	function selectTarget(next: Target) {
		target = next;
	}

	function moveTarget(event: KeyboardEvent, index: number) {
		if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
			return;
		}
		event.preventDefault();
		const nextIndex =
			event.key === 'Home'
				? 0
				: event.key === 'End'
					? 1
					: ['ArrowLeft', 'ArrowUp'].includes(event.key)
						? (index - 1 + 2) % 2
						: (index + 1) % 2;
		selectTarget((['A', 'B'] as const)[nextIndex]);
		queueMicrotask(() =>
			targetElement.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus()
		);
	}
</script>

<section class="preset-bank" aria-labelledby="preset-heading">
	<span id="preset-heading" class="label">LOAD</span>
	<div
		bind:this={targetElement}
		class="targets"
		role="radiogroup"
		aria-label="Preset destination register"
	>
		{#each ['A', 'B'] as option, index (option)}
			<button
				type="button"
				class:active={target === option}
				role="radio"
				aria-checked={target === option}
				tabindex={target === option ? 0 : -1}
				onclick={() => selectTarget(option as Target)}
				onkeydown={(event) => moveTarget(event, index)}
			>
				{option}
			</button>
		{/each}
	</div>
	<div class="preset-buttons">
		{#each PRESETS as preset (preset.id)}
			<button
				type="button"
				aria-label={`Load ${preset.label} into Input ${target}`}
				onclick={() => load(preset.id)}>{preset.label}</button
			>
		{/each}
	</div>
</section>

<style>
	.preset-bank {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		min-width: 0;
	}

	.label {
		flex: 0 0 auto;
		width: 5.5rem;
		font-family: var(--font-label);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-size: 0.75rem;
		color: var(--label);
	}

	.targets,
	.preset-buttons {
		display: flex;
		gap: 0.3rem;
	}

	.preset-buttons {
		min-width: 0;
		overflow-x: auto;
		padding: 2px 2px 4px;
	}

	button {
		appearance: none;
		flex: 0 0 auto;
		min-height: 44px;
		border: 1px solid var(--line);
		border-radius: 2px;
		background: var(--panel-1);
		color: var(--label);
		font-family: var(--font-label);
		font-size: 0.7rem;
		letter-spacing: 0.07em;
		padding: 0.35rem 0.6rem;
		cursor: pointer;
		transition:
			color 120ms var(--ease-settle),
			border-color 120ms var(--ease-settle),
			background-color 120ms var(--ease-settle);
	}

	button:hover,
	button:focus-visible,
	button.active {
		color: var(--text);
		border-color: var(--text);
	}

	button:focus-visible {
		outline: 1px solid var(--focus);
		outline-offset: 2px;
	}

	button.active {
		background: var(--panel-2);
	}

	.targets button {
		min-width: 44px;
		padding-inline: 0.4rem;
	}

	@media (max-width: 42rem) {
		.preset-bank {
			align-items: flex-start;
			flex-wrap: wrap;
		}

		.preset-buttons {
			flex-basis: 100%;
			margin-left: 6.15rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		button {
			transition: none;
		}
	}
</style>
