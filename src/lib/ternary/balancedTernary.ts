export type Trit = -1 | 0 | 1;

/** Most significant trit first, matching the on-screen register order. */
export type TritRegister = Trit[];

export interface CarryStep {
	fromPower: number;
	toPower: number;
	fromIndex: number | null;
	toIndex: number | null;
	amount: number;
}

export interface NormalizationTrace {
	/** In-register indices touched by normalization, ordered right to left. */
	changedIndices: number[];
	/** Carry/borrow events in the exact order normalization produced them. */
	carrySteps: CarryStep[];
	/** First nonzero power discarded above the register, when overflowing. */
	overflowIndex: number | null;
}

export interface RegisterResult {
	trits: TritRegister;
	overflow: boolean;
	trace: NormalizationTrace;
}

function mod3(n: number): number {
	return ((n % 3) + 3) % 3;
}

/**
 * Normalizes raw (possibly out-of-range) digit sums into a balanced-ternary
 * register of the given width, propagating carries left. `rawDigits` is
 * least-significant-digit first — the natural order for carry propagation.
 * Digits beyond `width` that carry out are lost and reported as overflow.
 */
export function normalizeTrits(rawDigits: number[], width: number): RegisterResult {
	const digits: Trit[] = [];
	const changedIndices = new Set<number>();
	const carrySteps: CarryStep[] = [];
	let carry = 0;
	let i = 0;
	while (i < rawDigits.length || carry !== 0) {
		const sum = (rawDigits[i] ?? 0) + carry;
		const digit = (mod3(sum + 1) - 1) as Trit;
		const nextCarry = (sum - digit) / 3;
		if (nextCarry !== 0) {
			const fromIndex = i < width ? width - 1 - i : null;
			const toIndex = i + 1 < width ? width - 2 - i : null;
			if (fromIndex !== null) changedIndices.add(fromIndex);
			if (toIndex !== null) changedIndices.add(toIndex);
			carrySteps.push({
				fromPower: i,
				toPower: i + 1,
				fromIndex,
				toIndex,
				amount: nextCarry
			});
		}
		carry = nextCarry;
		digits.push(digit);
		i++;
	}

	const overflow = digits.slice(width).some((d) => d !== 0);
	const overflowOffset = digits.slice(width).findIndex((digit) => digit !== 0);
	const overflowIndex = overflowOffset === -1 ? null : width + overflowOffset;
	const truncated: Trit[] = [];
	for (let j = 0; j < width; j++) truncated.push(digits[j] ?? 0);

	return {
		trits: truncated.reverse(),
		overflow,
		trace: { changedIndices: [...changedIndices], carrySteps, overflowIndex }
	};
}

export function decimalToBalancedTernary(value: number, width: number): RegisterResult {
	return normalizeTrits([value], width);
}

export function balancedTernaryToDecimal(trits: TritRegister): number {
	return trits.reduce<number>((value, trit) => value * 3 + trit, 0);
}

function toLeastSignificantFirst(trits: TritRegister): Trit[] {
	return [...trits].reverse();
}

export function addBalancedTernary(a: TritRegister, b: TritRegister): RegisterResult {
	const width = a.length;
	const aLsf = toLeastSignificantFirst(a);
	const bLsf = toLeastSignificantFirst(b);
	const rawDigits: number[] = [];
	for (let i = 0; i < Math.max(aLsf.length, bLsf.length); i++) {
		rawDigits.push((aLsf[i] ?? 0) + (bLsf[i] ?? 0));
	}
	return normalizeTrits(rawDigits, width);
}

export function negateBalancedTernary(a: TritRegister): TritRegister {
	// The six-trit range is symmetric (−364 to +364), so flipping every
	// trit can never overflow — this is the one operation that doesn't
	// need to go through normalizeTrits. `-0 as Trit` would otherwise
	// slip in for zero trits, so it's special-cased out.
	return a.map((trit) => (trit === 0 ? 0 : (-trit as Trit)));
}

export function subtractBalancedTernary(a: TritRegister, b: TritRegister): RegisterResult {
	return addBalancedTernary(a, negateBalancedTernary(b));
}

export function multiplyBalancedTernary(a: TritRegister, b: TritRegister): RegisterResult {
	const width = a.length;
	const aLsf = toLeastSignificantFirst(a);
	const bLsf = toLeastSignificantFirst(b);
	const rawDigits: number[] = new Array(aLsf.length + bLsf.length - 1).fill(0);
	for (let i = 0; i < aLsf.length; i++) {
		for (let j = 0; j < bLsf.length; j++) {
			rawDigits[i + j] += aLsf[i] * bLsf[j];
		}
	}
	return normalizeTrits(rawDigits, width);
}

function unitRegister(width: number): TritRegister {
	return normalizeTrits([1], width).trits;
}

export function incrementBalancedTernary(a: TritRegister): RegisterResult {
	return addBalancedTernary(a, unitRegister(a.length));
}

export function decrementBalancedTernary(a: TritRegister): RegisterResult {
	return subtractBalancedTernary(a, unitRegister(a.length));
}
