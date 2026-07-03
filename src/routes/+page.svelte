<svelte:head>
	<title>TRIT//-0+</title>
	<meta name="description" content="Balanced ternary register console" />
</svelte:head>

<main>
	<h1>TRIT//-0+</h1>
	<p>BALANCED TERNARY REGISTER CONSOLE</p>
	<p class="status">STATUS&nbsp;&nbsp;NOT YET OPERATIONAL</p>
</main>

<style>
	:global(body) {
		margin: 0;
		background: #121412;
		color: #d9d7cb;
	}

	main {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-family: monospace;
		letter-spacing: 0.08em;
	}

	h1 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 600;
	}

	p {
		margin: 0;
		font-size: 0.8rem;
		color: #8f9188;
	}

	.status {
		margin-top: 1.5rem;
	}
</style>
