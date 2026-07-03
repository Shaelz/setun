<details class="info-panel">
	<summary>
		<span>REFERENCE</span>
		<span class="summary-title">WHY BALANCED TERNARY?</span>
		<span class="indicator" aria-hidden="true">+</span>
	</summary>
	<div class="facts">
		<div><span class="key">SIGN</span><span>NEGATIVE VALUES NEED NO SIGN BIT</span></div>
		<div><span class="key">NEGATE</span><span>FLIP EVERY TRIT</span></div>
		<div><span class="key">PRODUCT</span><span>SIGNS HANDLE THEMSELVES</span></div>
		<div><span class="key">ROUNDING</span><span>TRUNCATION ROUNDS TO NEAREST</span></div>
		<div><span class="key">DENSITY</span><span>ONE TRIT ≈ 1.585 BITS</span></div>
		<div><span class="key">HISTORY</span><span>SETUN · 1958</span></div>
	</div>
</details>

<style>
	.info-panel {
		margin-left: 6.5rem;
		border: 1px solid var(--line);
		border-radius: 2px;
		background: var(--panel-2);
		color: var(--label);
	}

	summary {
		display: grid;
		grid-template-columns: 5.5rem 1fr auto;
		align-items: center;
		min-height: 44px;
		padding: 0.35rem 0.65rem;
		font-family: var(--font-label);
		font-size: 0.72rem;
		letter-spacing: 0.1em;
		cursor: pointer;
		list-style: none;
	}

	summary::-webkit-details-marker {
		display: none;
	}

	summary:focus-visible {
		outline: 1px solid var(--focus);
		outline-offset: 2px;
	}

	.summary-title {
		color: var(--text);
	}

	.indicator {
		color: var(--trit-pos);
		font-family: var(--font-data);
		font-size: 0.9rem;
		transition: transform 120ms var(--ease-settle);
	}

	details[open] .indicator {
		transform: rotate(45deg);
	}

	.facts {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		border-top: 1px solid var(--line);
	}

	.facts > div {
		display: grid;
		grid-template-columns: 5.5rem 1fr;
		gap: 0.5rem;
		padding: 0.55rem 0.65rem;
		border-bottom: 1px solid color-mix(in srgb, var(--line) 72%, transparent);
		font-family: var(--font-label);
		font-size: 0.7rem;
		letter-spacing: 0.06em;
	}

	.facts > div:nth-last-child(-n + 2) {
		border-bottom: 0;
	}

	.key {
		color: var(--text);
	}

	@media (max-width: 42rem) {
		.info-panel {
			margin-left: 0;
		}

		.facts {
			grid-template-columns: 1fr;
		}

		.facts > div:nth-last-child(2) {
			border-bottom: 1px solid color-mix(in srgb, var(--line) 72%, transparent);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.indicator {
			transition: none;
		}
	}
</style>
