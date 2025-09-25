import type { AuthRecord } from 'pocketbase';

import type { RoomResponse, TalkResponse, UsersResponse } from './pocketbase-types.js';

export const getExpandedArray = <T>(expand: unknown, key: string): T[] => {
	if (!expand || typeof expand !== 'object') {
		return [];
	}
    const value = (expand as Record<string, unknown>)[key];
	if (Array.isArray(value)) {
		return value as T[];
	} else if (value) {
		return [value as T];
	} else {
		return [];
	}
};

export const getExpandedRoom = (talk: TalkResponse): RoomResponse | null =>
	!talk.expand || typeof talk.expand !== 'object'
		? null
		: ((talk.expand as Record<string, unknown>).room as RoomResponse) || null;

export const formatTime = (dateString: string): string =>
	new Date(dateString).toLocaleTimeString('en-US', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	});

export const getUserDisplayName = (user: UsersResponse): string =>
	user.name || user.username || user.email;

export const canEditTalk = (talk: TalkResponse | null, user: AuthRecord | null): boolean =>
	!user || !talk
		? false
		: (talk.speaker || []).includes(user.id) || (talk.speaker || []).length === 0;