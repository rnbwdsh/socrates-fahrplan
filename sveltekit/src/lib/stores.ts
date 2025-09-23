import type { AuthRecord } from 'pocketbase';
import { persisted } from 'svelte-persisted-store';
import { writable } from 'svelte/store';

import type { TalkResponse } from './pocketbase-types.js';

export const user = writable<AuthRecord | null>(null);
export const favoriteTalks = persisted<string[]>('favorite-talks', []);
export const talks = writable<TalkResponse[]>([]);
export const selectedDay = writable<string>('');
export const availableDays = writable<string[]>([]);
export const theme = persisted<'system' | 'light' | 'dark'>('theme', 'system');
