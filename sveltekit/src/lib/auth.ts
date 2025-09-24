import { applyAction } from '$app/forms';
import { invalidateAll } from '$app/navigation';
import { type SubmitFunction } from '@sveltejs/kit';
import { ClientResponseError } from 'pocketbase';
import { get } from 'svelte/store';

import { pb } from '$lib/pocketbase';
import { favoriteTalks, user } from '$lib/stores';

export const LoginAction: SubmitFunction = async ({ formData, cancel }) => {
	cancel();
	try {
		// Get localStorage favorites before login
		const localFavorites = get(favoriteTalks);

		await pb
			.collection('users')
			.authWithPassword(formData.get('email') as string, formData.get('password') as string);

		// Update user store for reactivity
		user.set(pb.authStore.record);

		// Sync localStorage favorites to the user account if any exist
		if (localFavorites.length > 0) {
			const userData = await pb.collection('users').getOne(pb.authStore.record.id);
			const existingFavorites = userData.talksToVisit || [];
			const mergedFavorites = [...new Set([...existingFavorites, ...localFavorites])];

			await pb.collection('users').update(pb.authStore.record.id, {
				talksToVisit: mergedFavorites,
			});
			// Update auth store record to reflect the change
			pb.authStore.record.talksToVisit = mergedFavorites;
			// Clear localStorage since we've synced to account
			favoriteTalks.set([]);
		}

		await applyAction({
			type: 'redirect',
			status: 303,
			location: (formData.get('next') as string) || '/',
		});
	} catch (e) {
		console.log(e);
		if (e instanceof ClientResponseError) {
			await applyAction({ type: 'failure', status: 400, data: { response: e.response } });
		} else {
			throw e;
		}
	}
};

export const Logout = async () => {
	pb.authStore.clear();
	// Update user store for reactivity
	user.set(null);
	// Clear any remaining localStorage favorites when logging out
	favoriteTalks.set([]);
	await invalidateAll();
};

export const RegisterAction: SubmitFunction = async ({ formData, cancel }) => {
	cancel();
	try {
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		// Get localStorage favorites before registration
		const localFavorites = get(favoriteTalks);

		await pb.collection('users').create({
			email,
			password,
			passwordConfirm: formData.get('passwordConfirm') as string,
			secret: formData.get('secret') as string,
		});
		await pb.collection('users').authWithPassword(email, password);

		// Update user store for reactivity
		user.set(pb.authStore.record);

		// Sync localStorage favorites to the new user account
		if (localFavorites.length > 0) {
			await pb.collection('users').update(pb.authStore.record.id, {
				talksToVisit: localFavorites,
			});
			// Update auth store record to reflect the change
			pb.authStore.record.talksToVisit = localFavorites;
			// Clear localStorage since we've synced to account
			favoriteTalks.set([]);
		}

		await applyAction({
			type: 'redirect',
			status: 303,
			location: (formData.get('next') as string) || '/',
		});
	} catch (e) {
		console.log(e);
		if (e instanceof ClientResponseError) {
			await applyAction({ type: 'failure', status: 400, data: { response: e.response } });
		} else {
			throw e;
		}
	}
};
