<script lang="ts">
	import { page } from '$app/stores';

	import { pb } from '$lib/pocketbase';
	import { user } from '$lib/stores';
	import { getUserDisplayName } from '$lib/utils';

	let error = $state('Loading...');
	let profileUser = $state(null);
	let talksToVisit = $state([]);
	let speakerTalks = $state([]);

	$effect(() => {
		const userId = $page.params.id;
		if (!userId) {
			error = 'No user ID provided';
			return;
		}

		async function loadUser() {
			try {
				profileUser = await pb.collection('users').getOne(userId);

				const promises = [];

				if (profileUser?.talksToVisit?.length > 0) {
					promises.push(
						pb.collection('talk').getList(1, 50, {
							filter: profileUser.talksToVisit.map((id) => `id = "${id}"`).join(' || '),
							expand: 'room,speaker,tags',
							sort: 'start',
						}),
					);
				} else {
					promises.push(Promise.resolve({ items: [] }));
				}

				promises.push(
					pb.collection('talk').getList(1, 50, {
						filter: `speaker ~ "${userId}"`,
						expand: 'room,speaker,tags',
						sort: 'start',
					}),
				);

				const [talksResponse, speakerResponse] = await Promise.all(promises);
				talksToVisit = talksResponse.items;
				speakerTalks = speakerResponse.items;

				error = '';
			} catch (e) {
				error = `Failed to load user: ${e}`;
			}
		}

		loadUser();
	});
</script>

<svelte:head>
	{#if profileUser}
		<title
			>{profileUser.name || profileUser.username || profileUser.email} - Socrates Fahrplan</title
		>
		<meta
			name="description"
			content={profileUser.bio || `Profile of ${profileUser.name || profileUser.username}`}
		/>
	{/if}
</svelte:head>

<div class="max-w-4xl mx-auto p-6">
	{#if error}
		<div class="text-red-600 dark:text-red-400 text-center py-8">{error}</div>
		<div class="text-center">
			<a
				href="/"
				class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
				>← Back to schedule</a
			>
		</div>
	{:else if profileUser}
		<div class="mb-6">
			<a
				href="/"
				class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
			>
				← Back to schedule
			</a>
		</div>

		<div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
			<div class="flex items-start space-x-6 mb-8">
				{#if profileUser.avatar}
					<img
						src={pb.files.getURL(profileUser, profileUser.avatar, { thumb: '150x150' })}
						alt={profileUser.name || profileUser.username}
						class="w-24 h-24 rounded-full object-cover"
					/>
				{:else}
					<div class="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
						<span class="text-gray-600 text-3xl">👤</span>
					</div>
				{/if}

				<div class="flex-1">
					<h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
						{getUserDisplayName(profileUser)}
					</h1>

					{#if profileUser.emailVisibility && profileUser.email}
						<p class="text-gray-600 dark:text-gray-300 mb-2">📧 {profileUser.email}</p>
					{/if}

					{#if profileUser.website}
						<p class="mb-2">
							<a
								href={profileUser.website}
								target="_blank"
								rel="noopener noreferrer"
								class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center space-x-1"
							>
								<span>🌐</span>
								<span>{profileUser.website}</span>
							</a>
						</p>
					{/if}

					{#if profileUser.bio}
						<div class="text-gray-700 dark:text-gray-300 mt-4 whitespace-pre-wrap">
							{profileUser.bio}
						</div>
					{/if}

					{#if $user?.id === profileUser.id}
						<div class="mt-4">
							<a
								href="/user/edit"
								class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
							>
								✏️ Edit Profile
							</a>
						</div>
					{/if}
				</div>
			</div>

			{#if speakerTalks.length > 0}
				<div class="mb-8">
					<h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Speaking at</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						{#each speakerTalks as talk (talk.id)}
							<div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-l-4 border-green-500">
								<h3 class="font-bold text-lg mb-2">
									<a
										href="/talk/{talk.id}"
										class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
									>
										{talk.name}
									</a>
								</h3>
								{#if talk.description}
									<p class="text-gray-700 dark:text-gray-300 text-sm mb-3">
										{talk.description}
									</p>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if talksToVisit.length > 0}
				<div class="mb-8">
					<h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
						Planning to attend
					</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						{#each talksToVisit as talk (talk.id)}
							<div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-l-4 border-blue-500">
								<h3 class="font-bold text-lg mb-2">
									<a
										href="/talk/{talk.id}"
										class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
									>
										{talk.name}
									</a>
								</h3>
								{#if talk.description}
									<p class="text-gray-700 dark:text-gray-300 text-sm mb-3">
										{talk.description}
									</p>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if speakerTalks.length === 0 && talksToVisit.length === 0}
				<div class="text-center py-12 text-gray-500 dark:text-gray-400">
					<p class="text-lg mb-2">No talks found for this user.</p>
					<p class="text-sm">
						{#if $user?.id === profileUser?.id}
							Start by <a
								href="/"
								class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
								>browsing the schedule</a
							> and adding talks to your favorites!
						{:else}
							This user hasn't added any talks to their schedule yet.
						{/if}
					</p>
				</div>
			{/if}
		</div>
	{/if}
</div>
