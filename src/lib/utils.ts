import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function seededRandom(seed: string) {
	let hash = 0;
	for (let i = 0; i < seed.length; i++) {
		const char = seed.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32-bit integer
	}
	const x = Math.sin(hash) * 10000;
	return x - Math.floor(x);
}

export function generateGradientColors(seed: string): [string, string, number] {
	const randomColor = (salt: string) => {
		const r = Math.floor(seededRandom(`${seed + salt}r`) * 256);
		const g = Math.floor(seededRandom(`${seed + salt}g`) * 256);
		const b = Math.floor(seededRandom(`${seed + salt}b`) * 256);
		return `rgb(${r}, ${g}, ${b})`;
	};
	const angle = Math.floor(seededRandom(`${seed}angle`) * 360);
	return [randomColor("color1"), randomColor("color2"), angle];
}

export const getContrastColor = (bgColor: string): string => {
	const rgb = bgColor.match(/\d+/g)?.map(Number) || [0, 0, 0];
	const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
	return luminance > 0.5 ? "black" : "white";
};

export const getRandomItem = <T,>(items: T[], seed: string): T => {
	const index = Math.floor(seededRandom(seed) * items.length);
	return items[index];
};
