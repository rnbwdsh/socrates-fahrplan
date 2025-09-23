import type { AuthRecord } from 'pocketbase';
import { get } from 'svelte/store';

import { pb } from './pocketbase';
import type { RoomResponse, TagResponse, TalkResponse, UsersResponse } from './pocketbase-types.js';
import { favoriteTalks, user } from './stores';

function getExpandedArray<T>(expand: unknown, key: string): T[] {
	if (!expand || typeof expand !== 'object') return [];
	const value = (expand as Record<string, unknown>)[key];
	if (Array.isArray(value)) return value as T[];
	if (value) return [value as T];
	return [];
}

export function getExpandedRoom(talk: TalkResponse): RoomResponse | null {
	if (!talk.expand || typeof talk.expand !== 'object') return null;
	return ((talk.expand as Record<string, unknown>).room as RoomResponse) || null;
}

export function getExpandedSpeakers(talk: TalkResponse): UsersResponse[] {
	return getExpandedArray<UsersResponse>(talk.expand, 'speaker');
}

export function getExpandedTags(talk: TalkResponse): TagResponse[] {
	return getExpandedArray<TagResponse>(talk.expand, 'tags');
}

export function formatTime(dateString: string): string {
	return new Date(dateString).toLocaleTimeString('en-US', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	});
}

export function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString('en-US', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
	});
}

export function formatFullDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
}

export function getEndTime(startTime: string, duration: number): string {
	return new Date(new Date(startTime).getTime() + duration * 60000).toISOString();
}

export function getUserDisplayName(user: UsersResponse): string {
	return user.name || user.username || user.email;
}

export function toggleFavoriteInArray(favorites: string[], talkId: string): string[] {
	return favorites.includes(talkId)
		? favorites.filter((id) => id !== talkId)
		: [...favorites, talkId];
}

export function canEditTalk(talk: TalkResponse | null, user: AuthRecord | null): boolean {
	if (!user || !talk) return false;
	return (talk.speaker || []).includes(user.id) || (talk.speaker || []).length === 0;
}

export async function toggleFavorite(talkId: string) {
	const currentUser = get(user);

	if (currentUser) {
		try {
			const userData = await pb.collection('users').getOne(currentUser.id);
			await pb.collection('users').update(currentUser.id, {
				talksToVisit: (userData.talksToVisit || []).includes(talkId)
					? (userData.talksToVisit || []).filter((id) => id !== talkId)
					: [...(userData.talksToVisit || []), talkId],
			});
		} catch (e) {
			alert(`Failed to update favorites: ${e}`);
		}
	} else {
		favoriteTalks.update((current) =>
			current.includes(talkId) ? current.filter((id) => id !== talkId) : [...current, talkId],
		);
	}
}
