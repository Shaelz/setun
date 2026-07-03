import { describe, expect, it } from 'vitest';
import {
	addBalancedTernary,
	balancedTernaryToDecimal,
	decimalToBalancedTernary,
	decrementBalancedTernary,
	incrementBalancedTernary,
	multiplyBalancedTernary,
	negateBalancedTernary,
	normalizeTrits,
	subtractBalancedTernary,
	type TritRegister
} from './balancedTernary';

const WIDTH = 6;

function reg(value: number): TritRegister {
	return decimalToBalancedTernary(value, WIDTH).trits;
}

// The values the README requires as a minimum test set.
const REQUIRED_VALUES = [0, 1, -1, 2, -2, 3, -3, 8, -6, 364, -364];

describe('decimalToBalancedTernary / balancedTernaryToDecimal round trip', () => {
	it.each(REQUIRED_VALUES)('round-trips %i without overflow', (value) => {
		const result = decimalToBalancedTernary(value, WIDTH);
		expect(result.overflow).toBe(false);
		expect(result.trits).toHaveLength(WIDTH);
		expect(balancedTernaryToDecimal(result.trits)).toBe(value);
	});

	it('matches the README reference table for 8 (+0−)', () => {
		expect(reg(8)).toEqual([0, 0, 0, 1, 0, -1]);
	});

	it('matches the README reference table for -6 (−+0)', () => {
		expect(reg(-6)).toEqual([0, 0, 0, -1, 1, 0]);
	});

	it('represents the max six-trit value as all +', () => {
		expect(reg(364)).toEqual([1, 1, 1, 1, 1, 1]);
	});

	it('represents the min six-trit value as all −', () => {
		expect(reg(-364)).toEqual([-1, -1, -1, -1, -1, -1]);
	});
});

describe('overflow boundaries', () => {
	it('flags 364 + 1 as overflow', () => {
		expect(decimalToBalancedTernary(365, WIDTH).overflow).toBe(true);
		expect(addBalancedTernary(reg(364), reg(1)).overflow).toBe(true);
	});

	it('flags -364 - 1 as overflow', () => {
		expect(decimalToBalancedTernary(-365, WIDTH).overflow).toBe(true);
		expect(subtractBalancedTernary(reg(-364), reg(1)).overflow).toBe(true);
	});

	it('does not overflow at the exact boundary', () => {
		expect(addBalancedTernary(reg(363), reg(1)).overflow).toBe(false);
		expect(subtractBalancedTernary(reg(-363), reg(1)).overflow).toBe(false);
	});
});

describe('addBalancedTernary / subtractBalancedTernary', () => {
	it('adds two positive numbers with carry', () => {
		const result = addBalancedTernary(reg(8), reg(-6));
		expect(result.overflow).toBe(false);
		expect(balancedTernaryToDecimal(result.trits)).toBe(2);
	});

	it('subtracts to a negative result', () => {
		const result = subtractBalancedTernary(reg(3), reg(8));
		expect(result.overflow).toBe(false);
		expect(balancedTernaryToDecimal(result.trits)).toBe(-5);
	});
});

describe('negateBalancedTernary', () => {
	it('flips every trit and never overflows', () => {
		expect(balancedTernaryToDecimal(negateBalancedTernary(reg(8)))).toBe(-8);
		expect(negateBalancedTernary(reg(364))).toEqual(reg(-364));
	});
});

describe('incrementBalancedTernary / decrementBalancedTernary', () => {
	it('increments across a carry boundary', () => {
		const result = incrementBalancedTernary(reg(1));
		expect(result.overflow).toBe(false);
		expect(balancedTernaryToDecimal(result.trits)).toBe(2);
		expect(result.trace.changedIndices).toEqual([5, 4]);
		expect(result.trace.carrySteps).toEqual([
			{ fromPower: 0, toPower: 1, fromIndex: 5, toIndex: 4, amount: 1 }
		]);
	});

	it('reports a multi-trit carry chain in animation order', () => {
		const result = incrementBalancedTernary(reg(4));

		expect(balancedTernaryToDecimal(result.trits)).toBe(5);
		expect(result.trace.changedIndices).toEqual([5, 4, 3]);
		expect(result.trace.carrySteps.map(({ fromPower, toPower }) => [fromPower, toPower])).toEqual([
			[0, 1],
			[1, 2]
		]);
	});

	it('decrements across a carry boundary', () => {
		const result = decrementBalancedTernary(reg(-1));
		expect(result.overflow).toBe(false);
		expect(balancedTernaryToDecimal(result.trits)).toBe(-2);
		expect(result.trace.carrySteps).toEqual([
			{ fromPower: 0, toPower: 1, fromIndex: 5, toIndex: 4, amount: -1 }
		]);
	});

	it('reports a carry exiting at 3^6 when the top boundary overflows', () => {
		const result = incrementBalancedTernary(reg(364));
		expect(result.overflow).toBe(true);
		expect(result.trace.overflowIndex).toBe(6);
		expect(result.trace.carrySteps.at(-1)).toEqual({
			fromPower: 5,
			toPower: 6,
			fromIndex: 0,
			toIndex: null,
			amount: 1
		});
		expect(decrementBalancedTernary(reg(-364)).overflow).toBe(true);
	});
});

describe('multiplyBalancedTernary', () => {
	it('multiplies 2 × 3', () => {
		const result = multiplyBalancedTernary(reg(2), reg(3));
		expect(result.overflow).toBe(false);
		expect(balancedTernaryToDecimal(result.trits)).toBe(6);
	});

	it('reports normalization carries in a product', () => {
		const result = multiplyBalancedTernary(reg(2), reg(2));

		expect(balancedTernaryToDecimal(result.trits)).toBe(4);
		expect(result.trace.carrySteps).toContainEqual({
			fromPower: 1,
			toPower: 2,
			fromIndex: 4,
			toIndex: 3,
			amount: -1
		});
	});

	it('multiplies 8 × −6 with no sign handling needed', () => {
		const result = multiplyBalancedTernary(reg(8), reg(-6));
		expect(result.overflow).toBe(false);
		expect(balancedTernaryToDecimal(result.trits)).toBe(-48);
	});

	it('multiplies −2 × −2 to a positive result', () => {
		const result = multiplyBalancedTernary(reg(-2), reg(-2));
		expect(result.overflow).toBe(false);
		expect(balancedTernaryToDecimal(result.trits)).toBe(4);
	});

	it('flags 20 × 20 as overflow', () => {
		expect(multiplyBalancedTernary(reg(20), reg(20)).overflow).toBe(true);
	});
});

describe('normalizeTrits', () => {
	it('propagates carries beyond the raw digit count', () => {
		// Every position pushed to +2 should ripple carries all the way up.
		const result = normalizeTrits([2, 2, 2], WIDTH);
		expect(result.overflow).toBe(false);
		expect(balancedTernaryToDecimal(result.trits)).toBe(2 + 2 * 3 + 2 * 9);
	});

	it('reports overflow only when a nonzero digit is truncated', () => {
		expect(normalizeTrits([0, 0, 0, 0, 0, 0, 1], WIDTH).overflow).toBe(true);
		expect(normalizeTrits([0, 0, 0, 0, 0, 1], WIDTH).overflow).toBe(false);
	});

	it('leaves the trace empty when no normalization is needed', () => {
		expect(normalizeTrits([1, 0, -1], WIDTH).trace).toEqual({
			changedIndices: [],
			carrySteps: [],
			overflowIndex: null
		});
	});
});
