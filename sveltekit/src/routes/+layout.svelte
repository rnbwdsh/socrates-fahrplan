<script lang="ts">
	import { onMount } from 'svelte';

	import { pb } from '$lib/pocketbase';
	import { availableDays, selectedDay, theme, user } from '$lib/stores';

	import '../app.css';

	const { children } = $props();

	// Use user store for proper reactivity
	const isAuthenticated = $derived($user !== null);

	const isDark = $derived(
		() =>
			$theme === 'dark' ||
			($theme === 'system' &&
				typeof window !== 'undefined' &&
				window.matchMedia('(prefers-color-scheme: dark)').matches),
	);

	$effect(() => {
		if (isDark()) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	});

	// Inline logout functionality
	const handleLogout = () => {
		pb.authStore.clear();
		user.set(null);
		window.location.href = '/';
	};

	onMount(() => {
		// Initialize user store with current auth state
		user.set(pb.authStore.record);
	});

	const themeEmojis = {
		system: '🌓',
		light: '☀️',
		dark: '🌙',
	} as const;

	const themes = Object.keys(themeEmojis) as (keyof typeof themeEmojis)[];
	const toggleTheme = () => {
		const currentIndex = themes.indexOf($theme);
		const nextIndex = (currentIndex + 1) % themes.length;
		theme.set(themes[nextIndex]);
	};
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<nav class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
		<div class="px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between h-16">
				<div class="flex items-center space-x-6">
					<a href="/" class="text-xl font-bold text-gray-900 dark:text-white">
						Socrates Fahrplan
					</a>

					{#if $availableDays.length > 0}
						<div class="flex space-x-2">
							{#each $availableDays as day (day)}
								<button
									class="px-3 py-1 rounded-md text-sm whitespace-nowrap {$selectedDay === day
										? 'bg-blue-600 text-white'
										: 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'}"
									onclick={() => selectedDay.set(day)}
								>
									{new Date(day).toLocaleDateString('en-US', {
										weekday: 'short',
										month: 'short',
										day: 'numeric',
									})}
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<div class="flex items-center space-x-4">
					<button
						onclick={toggleTheme}
						class="px-3 py-2 rounded-md text-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
						title="Toggle theme: {$theme}"
					>
						{themeEmojis[$theme]}
					</button>
					{#if isAuthenticated}
						<a
							href="/talk/new/edit"
							class="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
						>
							Add Talk
						</a>
						<a
							href="/user/edit"
							class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
						>
							Edit Profile
						</a>
						<button
							onclick={handleLogout}
							class="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
						>
							Logout
						</button>
					{:else}
						<a
							href="/login"
							class="bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2 rounded-md text-sm font-medium border border-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-500"
						>
							Login
						</a>
						<a
							href="/register"
							class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
						>
							Register
						</a>
					{/if}
				</div>
			</div>
		</div>
	</nav>

	<main class="py-6 text-gray-900 dark:text-gray-100">
		{@render children()}
	</main>
</div>
