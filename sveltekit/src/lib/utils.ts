import type { AuthRecord } from 'pocketbase';

import { pb } from './pocketbase';
import type { RoomResponse, TagResponse, TalkResponse, UsersResponse } from './pocketbase-types.js';
import { favoriteTalks } from './stores';

export const getExpandedArray = <T>(expand: unknown, key: string): T[] => {
	if (!expand || typeof expand !== 'object') return [];
	const value = (expand as Record<string, unknown>)[key];
	return Array.isArray(value) ? (value as T[]) : value ? [value as T] : [];
};

export const getExpandedRoom = (talk: TalkResponse): RoomResponse | null =>
	!talk.expand || typeof talk.expand !== 'object'
		? null
		: ((talk.expand as Record<string, unknown>).room as RoomResponse) || null;

export const getExpandedSpeakers = (talk: TalkResponse): UsersResponse[] =>
	getExpandedArray<UsersResponse>(talk.expand, 'speaker');

export const getExpandedTags = (talk: TalkResponse): TagResponse[] =>
	getExpandedArray<TagResponse>(talk.expand, 'tags');

export const formatTime = (dateString: string): string =>
	new Date(dateString).toLocaleTimeString('en-US', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	});

export const formatDate = (dateString: string): string =>
	new Date(dateString).toLocaleDateString('en-US', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
	});

export const formatFullDate = (dateString: string): string =>
	new Date(dateString).toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});

export const getEndTime = (startTime: string, duration: number): string =>
	new Date(new Date(startTime).getTime() + duration * 60000).toISOString();

export const getUserDisplayName = (user: UsersResponse): string =>
	user.name || user.username || user.email;

export const toggleFavoriteInArray = (favorites: string[], talkId: string): string[] =>
	favorites.includes(talkId) ? favorites.filter((id) => id !== talkId) : [...favorites, talkId];

export const canEditTalk = (talk: TalkResponse | null, user: AuthRecord | null): boolean =>
	!user || !talk
		? false
		: (talk.speaker || []).includes(user.id) || (talk.speaker || []).length === 0;

export const toggleFavorite = async (talkId: string) => {
	if (pb.authStore.isValid) {
		const userData = await pb.collection('users').getOne(pb.authStore.record.id);
		const newTalksToVisit = (userData.talksToVisit || []).includes(talkId)
			? (userData.talksToVisit || []).filter((id) => id !== talkId)
			: [...(userData.talksToVisit || []), talkId];

		await pb.collection('users').update(pb.authStore.record.id, {
			talksToVisit: newTalksToVisit,
		});

		pb.authStore.record.talksToVisit = newTalksToVisit;
	} else {
		favoriteTalks.update((current) =>
			current.includes(talkId) ? current.filter((id) => id !== talkId) : [...current, talkId],
		);
	}
};

export const deleteTalk = async (talkId: string): Promise<void> => {
	await pb.collection('talk').delete(talkId);
};
