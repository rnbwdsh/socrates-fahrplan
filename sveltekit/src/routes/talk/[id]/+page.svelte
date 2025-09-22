<script lang="ts">
	import { page } from '$app/stores';

	import { pb } from '$lib/pocketbase';
    import { favoriteTalks, user } from '$lib/stores';
	import {
		canEditTalk,
		formatFullDate,
		formatTime,
		getEndTime,
		getExpandedRoom,
		getExpandedSpeakers,
		getExpandedTags,
		getUserDisplayName,
		toggleFavorite,
	} from '$lib/utils';

	let error = $state('Loading...');
	let talk = $state(null);

	$effect(() => {
		const talkId = $page.params.id;
		if (!talkId) {
			error = 'No talk ID provided';
			return;
		}

		async function loadTalk() {
			try {
				talk = await pb.collection('talk').getOne(talkId!, {
					expand: 'room,speaker,tags',
				});
				error = '';
			} catch (e) {
				error = `Failed to load talk: ${e}`;
			}
		}

		loadTalk();
	});

	const handleToggleFavorite = () => talk && toggleFavorite(talk.id);

	const isFavorited = $derived(() => {
		if (!talk) return false;
		return $user ? ($user.talksToVisit || []).includes(talk.id) : $favoriteTalks.includes(talk.id);
	});
</script>

<svelte:head>
	{#if talk}
		<title>{talk.name} - Socrates Fahrplan</title>
		<meta
			name="description"
			content={talk.description ||
				`Talk by ${getExpandedSpeakers(talk)
					.map((s) => getUserDisplayName(s))
					.join(', ')}`}
		/>
	{/if}
</svelte:head>

<div class="max-w-4xl mx-auto p-6">
	{#if error}
		<div class="text-red-600 text-center py-8">{error}</div>
	{:else if talk}
		{@const room = getExpandedRoom(talk)}
		{@const speakers = getExpandedSpeakers(talk)}
		{@const tags = getExpandedTags(talk)}

		<div class="bg-white rounded-lg shadow-lg p-8">
			<div class="flex justify-between items-start mb-6">
				<div class="flex-1">
					<h1 class="text-xl font-bold text-gray-900 mb-2">{talk.name}</h1>

					<div class="text-base text-gray-600 mb-2">
						📅 {formatFullDate(talk.start)}
					</div>
					<div class="text-base text-gray-600 mb-2">
						🕐 {formatTime(talk.start)} - {formatTime(getEndTime(talk.start, talk.durationMinutes))}
						<span class="text-sm text-gray-500">({talk.durationMinutes} minutes)</span>
					</div>

					{#if room}
						<div class="text-base text-gray-600 mb-1">
							📍 {room.name}{room.floor ? ` (Floor ${room.floor})` : ''}
						</div>
					{/if}

					{#if tags.length > 0}
						<div class="text-base text-gray-600 mb-1">
							🏷️ {tags.map((tag) => tag.name).join(', ')}
						</div>
					{/if}

					{#if talk.language}
						<div class="text-base text-gray-600 mb-4">
							🌐 {talk.language === 'english' ? 'English' : 'German'}
						</div>
					{/if}
				</div>

				<div class="flex space-x-3 ml-6">
					<button
						onclick={handleToggleFavorite}
						class="flex items-center space-x-2 px-4 py-2 rounded-md border {isFavorited()
							? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
							: 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}"
					>
						<span class="text-lg">{isFavorited() ? '❤️' : '🤍'}</span>
						<span>{isFavorited() ? 'Remove from favorites' : 'Add to favorites'}</span>
					</button>

					{#if canEditTalk(talk, $user)}
						<a
							href="/talk/{talk.id}/edit"
							class="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
						>
							<span>✏️</span>
							<span>Edit Talk</span>
						</a>
					{/if}
				</div>
			</div>

			{#if talk.description}
				<div class="mb-8">
					<div class="text-base text-gray-700 whitespace-pre-wrap">
						<b>Description:</b>
						{talk.description}
					</div>
				</div>
			{/if}

			{#if speakers.length > 0}
				<div class="mb-8">
					<h2 class="text-base font-semibold mb-4">
						Speaker{speakers.length > 1 ? 's' : ''}
					</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						{#each speakers as speaker (speaker.id)}
							<div class="bg-gray-50 rounded-lg p-4">
								<div class="flex items-start space-x-4">
									{#if speaker.avatar}
										<img
											src={pb.files.getURL(speaker, speaker.avatar, { thumb: '80x80' })}
											alt={speaker.name || speaker.username}
											class="w-16 h-16 rounded-full object-cover"
										/>
									{:else}
										<div
											class="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center"
										>
											<span class="text-gray-600 text-lg">👤</span>
										</div>
									{/if}

									<div class="flex-1">
										<h3 class="font-semibold text-lg">
											<a href="/user/{speaker.id}" class="text-blue-600 hover:text-blue-800">
												{getUserDisplayName(speaker)}
											</a>
										</h3>

										{#if speaker.bio}
											<p class="text-gray-600 text-sm mt-1 line-clamp-3">
												{speaker.bio}
											</p>
										{/if}

										{#if speaker.website}
											<a
												href={speaker.website}
												target="_blank"
												rel="noopener noreferrer"
												class="text-blue-500 hover:text-blue-700 text-sm mt-2 inline-block"
											>
												🌐 Website
											</a>
										{/if}

										{#if speaker.emailVisibility && speaker.email}
											<div class="text-gray-500 text-sm mt-1">
												📧 {speaker.email}
											</div>
										{/if}
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if talk.files && talk.files.length > 0}
				<div class="mb-8">
					<h2 class="text-base font-semibold mb-3">Files</h2>
					<div class="space-y-2">
						{#each talk.files as file (file)}
							<a
								href={pb.files.getURL(talk, file)}
								target="_blank"
								rel="noopener noreferrer"
								class="flex items-center space-x-2 text-blue-600 hover:text-blue-800 p-2 bg-gray-50 rounded-md"
							>
								<span>📎</span>
								<span>{file}</span>
								<span class="text-gray-500 text-sm ml-auto">Download</span>
							</a>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.line-clamp-3 {
		display: -webkit-box;
		line-clamp: 3;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
