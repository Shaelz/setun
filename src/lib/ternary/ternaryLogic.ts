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
