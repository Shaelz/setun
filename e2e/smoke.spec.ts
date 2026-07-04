import { expect, test } from '@playwright/test';

// ROADMAP.md "Protect the interaction contract": only the behavior that
// would silently break the instrument if it regressed. Not exhaustive UI
// coverage, not a screenshot test.

test('keyboard changes a trit', async ({ page }) => {
	await page.goto('/');
	await page.waitForLoadState('networkidle');
	const trit = page.getByRole('slider', { name: 'Input A, trit 6 of 6' });
	await trit.focus();
	await expect(trit).toHaveAttribute('aria-valuenow', '0');

	await trit.press('ArrowRight');
	await expect(trit).toHaveAttribute('aria-valuenow', '1');

	await trit.press('ArrowLeft');
	await trit.press('ArrowLeft');
	await expect(trit).toHaveAttribute('aria-valuenow', '-1');
});

test('switching between binary and unary modes mutes and restores Input B', async ({ page }) => {
	await page.goto('/');
	await page.waitForLoadState('networkidle');
	await expect(page.getByRole('slider', { name: 'Input B, trit 6 of 6' })).toHaveAttribute(
		'aria-disabled',
		'false'
	);

	await page.getByRole('radio', { name: 'NEG' }).click();
	await expect(
		page.getByRole('slider', { name: 'Input B, unused in current mode, trit 6 of 6' })
	).toHaveAttribute('aria-disabled', 'true');

	await page.getByRole('radio', { name: 'ADD' }).click();
	await expect(page.getByRole('slider', { name: 'Input B, trit 6 of 6' })).toHaveAttribute(
		'aria-disabled',
		'false'
	);
});

test('overflow disables RESULT -> A', async ({ page }) => {
	await page.goto('/');
	await page.waitForLoadState('networkidle');
	await page.getByRole('button', { name: 'Load MAX into Input A' }).click();
	await page.getByRole('radio', { name: 'INC' }).click();
	await expect(page.getByRole('button', { name: 'RESULT → A' })).toBeDisabled();
});

test('copies a valid result into A', async ({ page }) => {
	await page.goto('/');
	await page.waitForLoadState('networkidle');
	await page.getByRole('button', { name: 'Load ONE into Input A' }).click();
	await page.getByRole('radio', { name: 'INC' }).click();
	await page.getByRole('button', { name: 'RESULT → A' }).click();
	await expect(page.locator('.values')).toContainText('A: 2');
});

test('reaches all six trits at a narrow viewport', async ({ page }) => {
	await page.setViewportSize({ width: 375, height: 812 });
	await page.goto('/');
	await page.waitForLoadState('networkidle');

	for (let i = 1; i <= 6; i++) {
		await expect(page.getByRole('slider', { name: `Input A, trit ${i} of 6` })).toBeVisible();
	}

	const overflowing = await page
		.locator('.row')
		.first()
		.evaluate((el) => el.scrollWidth > el.clientWidth);
	expect(overflowing).toBe(false);
});
