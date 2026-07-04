import type { Trit, TritRegister } from './balancedTernary';

/**
 * Ordered ternary logic (− < 0 < +). Not the only valid ternary logic
 * system — see the README's Ternary logic mode section.
 */

export function ternaryAnd(a: TritRegister, b: TritRegister): TritRegister {
	return a.map((trit, i) => Math.min(trit, b[i]) as Trit);
}

export function ternaryOr(a: TritRegister, b: TritRegister): TritRegister {
	return a.map((trit, i) => Math.max(trit, b[i]) as Trit);
}

export function ternaryNot(a: TritRegister): TritRegister {
	// Special-cased to avoid producing `-0` for zero trits.
	return a.map((trit) => (trit === 0 ? 0 : (-trit as Trit)));
}

export interface ComparisonResult {
	/** −1 if a < b, 0 if equal, +1 if a > b. */
	outcome: Trit;
	/** Index of the first (most significant) trit where a and b differ;
	 * null if every position matched. */
	resolvingIndex: number | null;
}

/**
 * Lexicographic, most-significant-trit-first comparison, using the same
 * − < 0 < + order as AND/OR/NOT. Negative and positive values need no
 * special-casing here — unlike raw two's-complement bit patterns, a trit's
 * position in − < 0 < + already encodes its sign correctly at every digit.
 */
export function compareBalancedTernary(a: TritRegister, b: TritRegister): ComparisonResult {
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) {
			return { outcome: (a[i] > b[i] ? 1 : -1) as Trit, resolvingIndex: i };
		}
	}
	return { outcome: 0, resolvingIndex: null };
}
