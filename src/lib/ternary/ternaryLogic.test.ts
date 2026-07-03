import { describe, expect, it } from 'vitest';
import { ternaryAnd, ternaryNot, ternaryOr } from './ternaryLogic';
import type { TritRegister } from './balancedTernary';

const plusZeroMinus: TritRegister = [1, 0, -1]; // + 0 −
const minusZeroPlus: TritRegister = [-1, 0, 1]; // − 0 +

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
