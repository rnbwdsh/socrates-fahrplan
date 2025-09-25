import type { AuthRecord } from 'pocketbase';
import { persisted } from 'svelte-persisted-store';
import { writable, derived, get } from 'svelte/store';

import type { TalkResponse } from './pocketbase-types.js';
import { pb } from './pocketbase.js';

export const user = writable<AuthRecord | null>(null);
export const favoriteTalks = persisted<string[]>('favorite-talks', []);
export const talks = writable<TalkResponse[]>([]);
export const selectedDay = writable<string>('');
export const availableDays = writable<string[]>([]);
export const theme = persisted<'system' | 'light' | 'dark'>('theme', 'system');

// Create a reactive derived store for current user's favorites
export const currentUserFavorites = derived([user], () => {
	if (pb.authStore.isValid && pb.authStore.record) {
		return pb.authStore.record.talksToVisit || [];
	}
	return [];
});

// Create a function that returns a derived store for checking if a specific talk is favorited
export const createTalkFavoriteStore = (talkId: string) => {
	return derived([currentUserFavorites, favoriteTalks], ([userFavorites, localFavorites]) => {
		if (pb.authStore.isValid && pb.authStore.record) {
			return userFavorites.includes(talkId);
		}
		return localFavorites.includes(talkId);
	});
};

// Utility function for one-time checks (non-reactive)
export const isTalkFavorited = (talkId: string): boolean => {
	if (pb.authStore.isValid && pb.authStore.record) {
		return (pb.authStore.record.talksToVisit || []).includes(talkId);
	}
	return get(favoriteTalks).includes(talkId);
};

export const toggleFavorite = async (talkId: string): Promise<void> => {
	if (pb.authStore.isValid && pb.authStore.record) {
		// For logged in users - update server
		const userData = await pb.collection('users').getOne(pb.authStore.record.id);
		const newTalksToVisit = (userData.talksToVisit || []).includes(talkId)
			? (userData.talksToVisit || []).filter((id: string) => id !== talkId)
			: [...(userData.talksToVisit || []), talkId];

		await pb.collection('users').update(pb.authStore.record.id, {
			talksToVisit: newTalksToVisit,
		});

		// Update the local authStore record to trigger reactivity
		pb.authStore.record.talksToVisit = newTalksToVisit;
		
		// Trigger a user store update to notify components
		user.set({ ...pb.authStore.record });
	} else {
		// For non-logged in users - update local storage
		favoriteTalks.update((current) =>
			current.includes(talkId) 
				? current.filter((id) => id !== talkId) 
				: [...current, talkId]
		);
	}
};