import { redirect } from '@sveltejs/kit';
import type { AuthRecord } from 'pocketbase';
import { get, writable } from 'svelte/store';

import type { LayoutLoad } from './$types';

// Inline user store
const user = writable<AuthRecord | null>(null);

export const load: LayoutLoad = async ({ url }) => {
	if (get(user) !== null) {
		throw redirect(302, url.searchParams.get('next') || '/');
	}
};
