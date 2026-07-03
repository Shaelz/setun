import { describe, expect, it } from 'vitest';
import { balancedTernaryToDecimal } from './balancedTernary';
import { PRESETS, presetRegister, randomTritRegister } from './presets';

const WIDTH = 6;

describe('presetRegister', () => {
	it.each([
		['ZERO', 0],
		['ONE', 1],
		['NEGATIVE_ONE', -1],
		['EIGHT', 8],
		['NEGATIVE_SIX', -6],
		['MAX', 364],
		['MIN', -364]
	] as const)('loads %s as %i', (id, expected) => {
		const register = presetRegister(id, WIDTH);
		expect(register).toHaveLength(WIDTH);
		expect(balancedTernaryToDecimal(register)).toBe(expected);
	});

	it('defines each documented preset once', () => {
		expect(PRESETS.map(({ id }) => id)).toEqual([
			'ZERO',
			'ONE',
			'NEGATIVE_ONE',
			'EIGHT',
			'NEGATIVE_SIX',
			'MAX',
			'MIN',
			'RANDOM'
		]);
	});
});

describe('randomTritRegister', () => {
	it('samples every trit independently from the three valid states', () => {
		const samples = [0, 0.34, 0.99];
		let index = 0;
		const register = randomTritRegister(6, () => samples[index++ % samples.length]);

		expect(register).toEqual([-1, 0, 1, -1, 0, 1]);
	});
});
