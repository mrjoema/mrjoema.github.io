// Shared chart roles (light mode only: the site has no dark theme).
// Stage hues were checked with the dataviz validator in the adjacency order they are drawn:
// decode | front end | encoder | prefill | answer decode, and front end | engine core.
export const STAGE = {
	decode: '#1baf7a', // aqua
	frontEnd: '#eb6834', // orange
	encoder: '#4a3aa7', // violet
	prefill: '#2a78d6', // blue
	answer: '#eda100', // yellow
};

// Emphasis form: the chosen / optimized value in the accent, context in grays.
export const ACCENT = '#008300';
export const CONTEXT = ['#a9a79f', '#c3c2b7', '#d9d8d1'];

const INK = '#0b0b0b';
const WHITE = '#ffffff';

function luminance(hex: string): number {
	const n = parseInt(hex.slice(1), 16);
	const channel = (c: number) => {
		const s = c / 255;
		return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

function contrast(a: string, b: string): number {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
}

/** Ink or white, whichever reads better on a filled mark. */
export function textOn(fill: string): string {
	return contrast(fill, INK) >= contrast(fill, WHITE) ? INK : WHITE;
}
