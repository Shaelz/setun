<script lang="ts">
	import { PRESETS, presetRegister, type PresetId } from '$lib/ternary/presets';
	import type { TritRegister } from '$lib/ternary/balancedTernary';

	type Target = 'A' | 'B';

	interface Props {
		width: number;
		onload: (target: Target, value: TritRegister, preset: PresetId) => void;
		target?: Target;
	}

	let { width, onload, target = $bindable('A') }: Props = $props();
	let lastLoaded = $state<PresetId | null>(null);
	let targetElement: HTMLDivElement;

	function load(id: PresetId) {
		lastLoaded = id;
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
				class:active={lastLoaded === preset.id}
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
		gap: 1rem;
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
		gap: var(--key-gap);
	}

	.preset-buttons {
		min-width: 0;
		overflow-x: auto;
		overflow-y: hidden;
		padding: 4px;
	}

	button {
		appearance: none;
		flex: 0 0 auto;
		min-height: 44px;
		border: 1px solid var(--line);
		border-radius: 2px;
		background: var(--panel-1);
		box-shadow: var(--shadow-raised);
		color: var(--label);
		font-family: var(--font-label);
		font-size: 0.7rem;
		letter-spacing: 0.07em;
		width: var(--preset-key-width);
		padding: 0.35rem 0.25rem;
		cursor: pointer;
		transition:
			color 120ms var(--ease-settle),
			border-color 120ms var(--ease-settle),
			background-color 120ms var(--ease-settle),
			box-shadow 120ms var(--ease-settle);
	}

	button:hover {
		color: var(--text);
		border-color: var(--line);
	}

	button:focus-visible,
	button.active {
		color: var(--text);
	}

	button:focus-visible {
		outline: 1px solid var(--focus);
		outline-offset: 2px;
	}

	button.active {
		background: var(--panel-2);
		border-color: var(--text);
		box-shadow: var(--shadow-recessed);
	}

	button:active {
		background: var(--panel-2);
		box-shadow: var(--shadow-pressed);
	}

	.targets button {
		width: var(--key-width);
		padding-inline: 0;
	}

	@media (max-width: 42rem) {
		.preset-bank {
			flex-direction: column;
			align-items: stretch;
			gap: 0.5rem;
		}

		.targets,
		.preset-buttons {
			flex-wrap: wrap;
		}

		.preset-buttons {
			overflow: visible;
			padding-inline: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		button {
			transition: none;
		}
	}
</style>
