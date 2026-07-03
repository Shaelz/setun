import { decimalToBalancedTernary, type Trit, type TritRegister } from './balancedTernary';

export type PresetId =
	| 'ZERO'
	| 'ONE'
	| 'NEGATIVE_ONE'
	| 'EIGHT'
	| 'NEGATIVE_SIX'
	| 'MAX'
	| 'MIN'
	| 'RANDOM';

export interface PresetDefinition {
	id: PresetId;
	label: string;
}

export const PRESETS: readonly PresetDefinition[] = [
	{ id: 'ZERO', label: 'ZERO' },
	{ id: 'ONE', label: 'ONE' },
	{ id: 'NEGATIVE_ONE', label: 'NEG ONE' },
	{ id: 'EIGHT', label: 'EIGHT' },
	{ id: 'NEGATIVE_SIX', label: 'NEG SIX' },
	{ id: 'MAX', label: 'MAX' },
	{ id: 'MIN', label: 'MIN' },
	{ id: 'RANDOM', label: 'RANDOM' }
];

const DECIMAL_PRESETS: Partial<Record<PresetId, number>> = {
	ZERO: 0,
	ONE: 1,
	NEGATIVE_ONE: -1,
	EIGHT: 8,
	NEGATIVE_SIX: -6
};

export function randomTritRegister(width: number, random: () => number = Math.random): TritRegister {
	return Array.from({ length: width }, () => (Math.floor(random() * 3) - 1) as Trit);
}

export function presetRegister(
	id: PresetId,
	width: number,
	random: () => number = Math.random
): TritRegister {
	if (id === 'RANDOM') return randomTritRegister(width, random);
	if (id === 'MAX') return new Array<Trit>(width).fill(1);
	if (id === 'MIN') return new Array<Trit>(width).fill(-1);
	return decimalToBalancedTernary(DECIMAL_PRESETS[id] ?? 0, width).trits;
}
