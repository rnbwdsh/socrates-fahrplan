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
	let passwordConfirm = '';
	let secret = '';
	let isSubmitting = false;
	let errorMessage = '';

	// Inline register action - converted to arrow function
	const handleRegister = async () => {
		if (isSubmitting) return;

		isSubmitting = true;
		errorMessage = '';

		try {
			// Get localStorage favorites before registration
			const localFavorites = get(favoriteTalks);

			await pb.collection('users').create({
				email,
				password,
				passwordConfirm,
				secret,
			});
			await pb.collection('users').authWithPassword(email, password);

			// Update user store for reactivity
			user.set(pb.authStore.record);

			// Sync localStorage favorites to the new user account
			if (localFavorites.length > 0) {
				await pb.collection('users').update(pb.authStore.record!.id, {
					talksToVisit: localFavorites,
				});
				// Update auth store record to reflect the change
				pb.authStore.record!.talksToVisit = localFavorites;
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
				errorMessage = e.response.message || 'Registration failed';
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

<form on:submit|preventDefault={handleRegister} class="space-y-6">
	<div>
		<label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
			Email
		</label>
		<input
			bind:value={email}
			type="email"
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
	<div>
		<label for="passwordConfirm" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
			Confirm password
		</label>
		<input
			bind:value={passwordConfirm}
			type="password"
			required
			disabled={isSubmitting}
			class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
		/>
	</div>
	<div>
		<label for="secret" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
			Secret Code
		</label>
		<input
			bind:value={secret}
			type="text"
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
		{isSubmitting ? 'Registering...' : 'Register'}
	</button>

	<a
		href="/login"
		class="block text-sm text-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
	>
		Already have an account
	</a>
</form>
