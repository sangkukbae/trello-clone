import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { Checklist as ChecklistType, Label } from '@/lib/types';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function slugfy(str: string) {
	return str.toLowerCase().replace(/\s/g, '-');
}

export function convertObjectToString(obj: Record<string, string>) {
	return Object.keys(obj)
		.map(key => `${key}=${obj[key]}`)
		.join('&');
}

export function convertStringToObject(str: string) {
	return str.split('&').reduce((acc, curr) => {
		const [key, value] = curr.split('=');
		acc[key] = value;
		return acc;
	}, {} as Record<string, string>);
}

export function isChecklist(data: any): data is ChecklistType[] {
	return (
		data &&
		Array.isArray(data) &&
		data.every(
			(item: any) =>
				item &&
				typeof item.title === 'string' &&
				typeof item.isEditing === 'boolean' &&
				Array.isArray(item.items) &&
				item.items.every(
					(item: any) =>
						item &&
						typeof item.task === 'string' &&
						typeof item.checked === 'boolean'
				)
		)
	);
}

export function isLabel(value: unknown): value is Label[] {
	const arr = value as Label[];
	return (
		Array.isArray(arr) &&
		arr.every(
			item =>
				typeof item.title === 'string' &&
				typeof item.color === 'string' &&
				typeof item.checked === 'boolean'
		)
	);
}
