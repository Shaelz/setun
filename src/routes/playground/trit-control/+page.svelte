<script lang="ts">
	import TritControl from '$lib/components/TritControl.svelte';
	import { balancedTernaryToDecimal, type Trit } from '$lib/ternary/balancedTernary';

	const SUPERSCRIPT: Record<number, string> = {
		0: '⁰',
		1: '¹',
		2: '²',
		3: '³',
		4: '⁴',
		5: '⁵'
	};

	let solo = $state<Trit>(0);

	let register = $state<Trit[]>([0, 0, 0, 0, 0, 0]);
	let decimal = $derived(balancedTernaryToDecimal(register as Trit[]));
</script>

<svelte:head>
	<title>Trit control — playground</title>
</svelte:head>

<main>
	<header>
		<h1>TRIT CONTROL</h1>
		<p class="label">ISOLATED COMPONENT PLAYGROUND — NOT THE FULL CONSOLE</p>
	</header>

	<section>
		<h2 class="label">Single control</h2>
		<p class="hint">Click a position, or focus and use ← → · − 0 + =</p>
		<TritControl bind:value={solo} label="Playground trit, currently {solo}" />
		<p class="readout">VALUE&nbsp;&nbsp;{solo}</p>
	</section>

	<section>
		<h2 class="label">Fixed states, side by side</h2>
		<p class="hint">Read clearly at a glance, without relying on color alone?</p>
		<div class="row">
			<TritControl value={-1} label="Fixed negative one" disabled />
			<TritControl value={0} label="Fixed zero" disabled />
			<TritControl value={1} label="Fixed positive one" disabled />
		</div>
	</section>

	<section>
		<h2 class="label">Disabled</h2>
		<div class="row">
			<TritControl value={1} label="Disabled example" disabled />
		</div>
	</section>

	<section>
		<h2 class="label">Six-trit register</h2>
		<div class="row register">
			{#each register as _, i (i)}
				<TritControl
					bind:value={register[i]}
					label={`Register trit ${i + 1} of 6, currently ${register[i]}`}
					positionLabel={`3${SUPERSCRIPT[5 - i]}`}
				/>
			{/each}
		</div>
		<p class="readout">DECIMAL&nbsp;&nbsp;{decimal}</p>
	</section>
</main>

<style>
	main {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2.5rem;
		padding: 3rem 1.5rem 5rem;
	}

	header {
		text-align: center;
	}

	h1 {
		margin: 0 0 0.4rem;
		font-family: var(--font-label);
		font-weight: 600;
		font-size: 1.6rem;
		letter-spacing: 0.06em;
	}

	.label {
		margin: 0;
		font-family: var(--font-label);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-size: 0.75rem;
		color: var(--label);
	}

	section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	h2.label {
		font-size: 0.8rem;
	}

	.hint {
		margin: 0;
		max-width: min(90vw, 32rem);
		text-align: center;
		font-size: 0.75rem;
		color: var(--label);
		font-family: var(--font-data);
	}

	.row {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
		flex-wrap: wrap;
		justify-content: center;
	}

	.register {
		gap: 0.5rem;
	}

	.readout {
		margin: 0;
		font-family: var(--font-data);
		font-size: 0.9rem;
		letter-spacing: 0.08em;
		color: var(--text);
	}
</style>
