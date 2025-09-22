<script lang="ts">
	import { Logout } from '$lib/auth';
	import { pb } from '$lib/pocketbase';
	import { availableDays, selectedDay, user } from '$lib/stores';

	import '../app.css';

	const { children } = $props();

	$effect(() => {
		if (pb.authStore.isValid) {
			user.set(pb.authStore.record);
		}
	});

	const handleLogout = () => Logout();
</script>

<div class="min-h-screen bg-gray-50">
	<nav class="bg-white shadow-sm border-b">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between h-16">
				<div class="flex items-center space-x-6">
					<a href="/" class="text-xl font-bold text-gray-900"> Socrates Fahrplan </a>

					{#if $availableDays.length > 0}
						<div class="flex space-x-2">
							{#each $availableDays as day}
								<button
									class="px-3 py-1 rounded-md text-sm whitespace-nowrap {$selectedDay === day
										? 'bg-blue-600 text-white'
										: 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
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
					{#if $user}
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
							class="bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2 rounded-md text-sm font-medium border border-gray-300"
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

	<main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
		{@render children()}
	</main>
</div>
