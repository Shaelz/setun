<script lang="ts">
	import TritRegister from '$lib/components/TritRegister.svelte';
	import OperationSelector, {
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
		type Trit
	} from '$lib/ternary/balancedTernary';

	const WIDTH = 6;

	function zeros(): Trit[] {
		return new Array(WIDTH).fill(0);
	}

	let a = $state<Trit[]>(zeros());
	let b = $state<Trit[]>(zeros());
	let mode = $state<Mode>('ADD');

	let isUnary = $derived(UNARY_MODES.has(mode));

	let result = $derived.by<RegisterResult>(() => {
		switch (mode) {
			case 'ADD':
				return addBalancedTernary(a, b);
			case 'SUBTRACT':
				return subtractBalancedTernary(a, b);
			case 'MULTIPLY':
				return multiplyBalancedTernary(a, b);
			case 'NEGATE':
				return { trits: negateBalancedTernary(a), overflow: false };
			case 'INCREMENT':
				return incrementBalancedTernary(a);
			case 'DECREMENT':
				return decrementBalancedTernary(a);
			default: {
				const exhaustive: never = mode;
				throw new Error(`Unhandled mode: ${exhaustive}`);
			}
		}
	});

	let decimalA = $derived(balancedTernaryToDecimal(a));
	let decimalB = $derived(balancedTernaryToDecimal(b));
	let decimalResult = $derived(result.overflow ? null : balancedTernaryToDecimal(result.trits));

	function copyResultToA() {
		if (result.overflow) return;
		a = [...result.trits];
	}
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

		<TritRegister bind:value={a} label="Input A" />
		<TritRegister bind:value={b} label="Input B" muted={isUnary} />

		<div class="mode-row">
			<span class="label">MODE</span>
			<OperationSelector bind:value={mode} />
		</div>

		<div class="result-row">
			<TritRegister value={result.trits} label="Result" readonly emphasized />
			<button type="button" class="copy-button" disabled={result.overflow} onclick={copyResultToA}>
				RESULT → A
			</button>
		</div>

		<div class="readout label">
			<span class="readout-label">DECIMAL</span>
			<span class="values"
				>A: {decimalA}&nbsp;&nbsp;&nbsp;B: {decimalB}&nbsp;&nbsp;&nbsp;RESULT: {result.overflow
					? 'OVERFLOW'
					: decimalResult}</span
			>
		</div>

		<div class="status" class:overflow={result.overflow}>
			<span class="readout-label">STATUS</span>
			{result.overflow ? 'OVERFLOW' : 'NORMALIZED · NO OVERFLOW'}
		</div>
	</div>
</main>

<style>
	main {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem 1rem;
	}

	.panel {
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
		width: min(100%, 66rem);
		padding: 1.5rem 1.75rem;
		background: var(--panel-1);
		border: 1px solid var(--line);
		border-top-color: var(--edge);
		border-radius: 2px;
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

	@media (prefers-reduced-motion: reduce) {
		.copy-button {
			transition: none;
		}
	}
</style>
