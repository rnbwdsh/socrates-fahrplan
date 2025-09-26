<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import { pb } from '$lib/pocketbase';
	import type {
		RoomResponse,
		TagResponse,
		TalkResponse,
		UsersResponse,
	} from '$lib/pocketbase-types';

	const talkId = $derived($page.params.id);

	let name = $state('');
	let description = $state('');
	let start = $state('');
	let durationMinutes = $state(60);
	let roomId = $state('');
	let selectedSpeakers = $state<string[]>([]);
	let selectedTags = $state<string[]>([]);
	let language = $state<'english' | 'german'>('english');
	let error = $state('Loading...');

	let rooms = $state<RoomResponse[]>([]);
	let tags = $state<TagResponse[]>([]);
	let users = $state<UsersResponse[]>([]);
	let talk = $state<TalkResponse | null>(null);

	const loadData = async () => {
		try {
			const [talkResponse, roomsResponse, tagsResponse, usersResponse] = await Promise.all([
				pb.collection('talk').getOne(talkId, { expand: 'room,speaker,tags' }),
				pb.collection('room').getList(1, 500),
				pb.collection('tag').getList(1, 500),
				pb.collection('users').getList(1, 500),
			]);

			talk = talkResponse;
			rooms = roomsResponse.items;
			tags = tagsResponse.items;
			users = usersResponse.items;

			// Populate form with existing data
			name = talk.name;
			description = talk.description || '';
			start = new Date(talk.start).toISOString().slice(0, 16); // Format for datetime-local
			durationMinutes = talk.durationMinutes;
			roomId = talk.room;
			selectedSpeakers = talk.speaker || [];
			selectedTags = talk.tags || [];
			language = talk.language || 'english';

			error = '';
		} catch (e) {
			error = `Failed to load data: ${e}`;
		}
	};

	const handleSubmit = async () => {
		if (!name || !start || !roomId) {
			error = 'Name, start time, and room are required';
			return;
		}

		try {
			const talkData = {
				name,
				description,
				start: new Date(start).toISOString(),
				durationMinutes,
				room: roomId,
				speaker: selectedSpeakers.length > 0 ? selectedSpeakers : undefined,
				tags: selectedTags.length > 0 ? selectedTags : undefined,
				language,
			};

			await pb.collection('talk').update(talkId, talkData);
			goto(`/talk/${talkId}`);
		} catch (e) {
			error = `Failed to update talk: ${e}`;
		}
	};

	const handleDelete = async () => {
		if (!confirm('Are you sure you want to delete this talk?')) return;

		try {
			await pb.collection('talk').delete(talkId);
			goto('/');
		} catch (e) {
			error = `Failed to delete talk: ${e}`;
		}
	};

	const toggleSpeaker = (speakerId: string) => {
		if (selectedSpeakers.includes(speakerId)) {
			selectedSpeakers = selectedSpeakers.filter((id) => id !== speakerId);
		} else {
			selectedSpeakers = [...selectedSpeakers, speakerId];
		}
	};

	const toggleTag = (tagId: string) => {
		if (selectedTags.includes(tagId)) {
			selectedTags = selectedTags.filter((id) => id !== tagId);
		} else {
			selectedTags = [...selectedTags, tagId];
		}
	};

	// Load data on mount
	loadData();
</script>

<div class="max-w-2xl mx-auto p-4">
	<h1 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Edit Talk</h1>

	{#if error}
		<div class="text-red-600 dark:text-red-400 mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
			{error}
		</div>
	{:else}
		<form
			class="space-y-6"
			onsubmit={(e) => {
				e.preventDefault();
				handleSubmit();
			}}
		>
			<div>
				<label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Talk Name *
				</label>
				<input
					id="name"
					type="text"
					required
					bind:value={name}
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
					placeholder="Enter talk name"
				/>
			</div>

			<div>
				<label
					for="description"
					class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
				>
					Description
				</label>
				<textarea
					id="description"
					rows={4}
					bind:value={description}
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
					placeholder="Enter talk description"
				></textarea>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label
						for="start"
						class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
					>
						Start Time *
					</label>
					<input
						id="start"
						type="datetime-local"
						required
						bind:value={start}
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
					/>
				</div>

				<div>
					<label
						for="duration"
						class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
					>
						Duration (minutes)
					</label>
					<input
						id="duration"
						type="number"
						min="15"
						step="15"
						bind:value={durationMinutes}
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
					/>
				</div>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label for="room" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Room *
					</label>
					<select
						id="room"
						required
						bind:value={roomId}
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
					>
						<option value="">Select a room</option>
						{#each rooms as room (room.id)}
							<option value={room.id}>{room.name}</option>
						{/each}
					</select>
				</div>

				<div>
					<label
						for="language"
						class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
					>
						Language
					</label>
					<select
						id="language"
						bind:value={language}
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
					>
						<option value="english">English</option>
						<option value="german">German</option>
					</select>
				</div>
			</div>

			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Speakers (optional)
				</label>
				<div
					class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-3 bg-white dark:bg-gray-800"
				>
					{#each users as user (user.id)}
						<label
							class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded"
						>
							<input
								type="checkbox"
								checked={selectedSpeakers.includes(user.id)}
								onchange={() => toggleSpeaker(user.id)}
								class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
							/>
							<span class="text-sm text-gray-900 dark:text-white">{user.name || user.email}</span>
						</label>
					{/each}
				</div>
			</div>

			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Tags (optional)
				</label>
				<div class="flex flex-wrap gap-2">
					{#each tags as tag (tag.id)}
						<button
							type="button"
							onclick={() => toggleTag(tag.id)}
							class="px-3 py-1 rounded-full text-sm border transition-colors {selectedTags.includes(
								tag.id,
							)
								? 'bg-blue-600 text-white border-blue-600'
								: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}"
						>
							{tag.name}
						</button>
					{/each}
				</div>
			</div>

			<div class="flex space-x-4">
				<button
					type="submit"
					class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
				>
					Update Talk
				</button>
				<button
					type="button"
					onclick={handleDelete}
					class="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
				>
					Delete
				</button>
				<a
					href="/talk/{talkId}"
					class="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium text-center"
				>
					Cancel
				</a>
			</div>
		</form>
	{/if}
</div>
