import type { AuthRecord } from 'pocketbase';
import { persisted } from 'svelte-persisted-store';
import { writable } from 'svelte/store';

import type { TalkResponse } from './pocketbase-types.js';

// User store for authentication
export const user = writable<AuthRecord | null>(null);

// Persisted store for favorite talks (used when not logged in)
export const favoriteTalks = persisted<string[]>('favorite-talks', []);

// Store for all talks
export const talks = writable<TalkResponse[]>([]);

// Store for selected day
export const selectedDay = writable<string>('');

// Store for available days (derived from talks)
export const availableDays = writable<string[]>([]);
