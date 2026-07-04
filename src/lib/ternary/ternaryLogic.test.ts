import { describe, expect, it } from 'vitest';
import {
	compareBalancedTernary,
	ternaryAnd,
	ternaryNot,
	ternaryOr
} from './ternaryLogic';
import { decimalToBalancedTernary, type TritRegister } from './balancedTernary';

const plusZeroMinus: TritRegister = [1, 0, -1]; // + 0 −
const minusZeroPlus: TritRegister = [-1, 0, 1]; // − 0 +

const WIDTH = 6;
function reg(value: number): TritRegister {
	return decimalToBalancedTernary(value, WIDTH).trits;
}

describe('ordered ternary logic (− < 0 < +)', () => {
	it('AND takes the minimum of each trit', () => {
		expect(ternaryAnd(plusZeroMinus, minusZeroPlus)).toEqual([-1, 0, -1]);
	});

	it('OR takes the maximum of each trit', () => {
		expect(ternaryOr(plusZeroMinus, minusZeroPlus)).toEqual([1, 0, 1]);
	});

	it('NOT negates every trit', () => {
		expect(ternaryNot(plusZeroMinus)).toEqual([-1, 0, 1]);
		expect(ternaryNot([0, 0, 0])).toEqual([0, 0, 0]);
	});
});

describe('compareBalancedTernary', () => {
	it('resolves at the most significant differing trit', () => {
		const result = compareBalancedTernary(reg(8), reg(-6));
		expect(result.outcome).toBe(1);
		expect(result.resolvingIndex).toBe(3);
	});

	it('reports equal registers with no resolving index', () => {
		expect(compareBalancedTernary(reg(8), reg(8))).toEqual({ outcome: 0, resolvingIndex: null });
	});

	it('orders negative values correctly with no sign special-casing', () => {
		expect(compareBalancedTernary(reg(-1), reg(-2)).outcome).toBe(1);
		expect(compareBalancedTernary(reg(-2), reg(-1)).outcome).toBe(-1);
	});

	it('orders a negative value below a positive one', () => {
		expect(compareBalancedTernary(reg(-1), reg(1)).outcome).toBe(-1);
	});
});
