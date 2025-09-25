<script lang="ts">
	import { applyAction } from '$app/forms';
	import { page } from '$app/state';
	import { ClientResponseError } from 'pocketbase';
	import type { AuthRecord } from 'pocketbase';
	import { persisted } from 'svelte-persisted-store';
	import { get } from 'svelte/store';
	import { writable } from 'svelte/store';

	import { pb } from '$lib/pocketbase';

	// Inline stores with proper typing
	const user = writable<AuthRecord | null>(null);
	const favoriteTalks = persisted<string[]>('favorite-talks', []);

	// Reactive form fields
	let email = '';
	let password = '';
	let isSubmitting = false;
	let errorMessage = '';

	// Inline login action - converted to arrow function
	const handleLogin = async () => {
		if (isSubmitting) return;

		isSubmitting = true;
		errorMessage = '';

		try {
			// Get localStorage favorites before login
			const localFavorites = get(favoriteTalks);

			await pb.collection('users').authWithPassword(email, password);

			// Update user store for reactivity
			user.set(pb.authStore.record);

			// Sync localStorage favorites to the user account if any exist
			if (localFavorites.length > 0) {
				const userData = await pb.collection('users').getOne(pb.authStore.record!.id);
				const existingFavorites = userData.talksToVisit || [];
				const mergedFavorites = [...new Set([...existingFavorites, ...localFavorites])];

				await pb.collection('users').update(pb.authStore.record!.id, {
					talksToVisit: mergedFavorites,
				});
				// Update auth store record to reflect the change
				pb.authStore.record!.talksToVisit = mergedFavorites;
				// Clear localStorage since we've synced to account
				favoriteTalks.set([]);
			}

			await applyAction({
				type: 'redirect',
				status: 303,
				location: page.url?.searchParams?.get('next') || '/',
			});
		} catch (e) {
			console.log(e);
			if (e instanceof ClientResponseError) {
				errorMessage = e.response.message || 'Login failed';
				await applyAction({ type: 'failure', status: 400, data: { response: e.response } });
			} else {
				errorMessage = 'An unexpected error occurred';
				throw e;
			}
		} finally {
			isSubmitting = false;
		}
	};
</script>

<form on:submit|preventDefault={handleLogin} class="space-y-6">
	<div>
		<label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
			Email or Username
		</label>
		<input
			bind:value={email}
			type="text"
			required
			disabled={isSubmitting}
			class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
		/>
	</div>
	<div>
		<label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
			Password
		</label>
		<input
			bind:value={password}
			type="password"
			required
			disabled={isSubmitting}
			class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
		/>
	</div>

	{#if errorMessage}
		<p class="text-red-500 dark:text-red-400">{errorMessage}</p>
	{/if}

	<button
		type="submit"
		disabled={isSubmitting}
		class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
	>
		{isSubmitting ? 'Logging in...' : 'Login'}
	</button>

	<a
		href="/register"
		class="block text-sm text-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
	>
		Create an account
	</a>
</form>
