<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import { pb } from '$lib/pocketbase';
	import { user } from '$lib/stores';
	import { canEditTalk, getUserDisplayName } from '$lib/utils';

	let error = $state('Loading...');
	let talk = $state(null);
	let rooms = $state([]);
	let tags = $state([]);
	let users = $state([]);

	let formData = $state({
		id: '',
		name: '',
		start: '',
		durationMinutes: 60,
		description: '',
		room: '',
		speaker: [],
		tags: [],
		language: 'english',
	});

	let selectedFiles = $state(null);

	$effect(() => {
		const talkId = $page.params.id;
		if (!talkId) {
			error = 'No talk ID provided';
			return;
		}

		async function loadData() {
			try {
				const talkData = await pb.collection('talk').getOne(talkId!, {
					expand: 'room,speaker,tags',
				});

				talk = talkData;

				formData.id = talkData.id;
				formData.name = talkData.name || '';
				formData.start = talkData.start ? new Date(talkData.start).toISOString().slice(0, 16) : '';
				formData.durationMinutes = talkData.durationMinutes || 60;
				formData.description = talkData.description || '';
				formData.room = talkData.room || '';
				formData.speaker = talkData.speaker || [];
				formData.tags = talkData.tags || [];
				formData.language = talkData.language || 'english';

				const [roomsResponse, tagsResponse, usersResponse] = await Promise.all([
					pb.collection('room').getList(1, 100, { sort: 'name' }),
					pb.collection('tag').getList(1, 100, { sort: 'name' }),
					pb.collection('users').getList(1, 100, { sort: 'name' }),
				]);

				[rooms, tags, users] = [roomsResponse.items, tagsResponse.items, usersResponse.items];
				error = '';
			} catch (e) {
				error = `Failed to load data: ${e}`;
			}
		}

		loadData();
	});

	async function handleSubmit(event) {
		event.preventDefault();

		if (!canEditTalk(talk, $user)) {
			alert('You do not have permission to edit this talk');
			return;
		}

		try {
			formData.start = new Date(formData.start).toISOString();

			const formDataObj = new FormData();
			Object.entries(formData).forEach(([key, value]) => {
				if (Array.isArray(value)) {
					value.forEach((item) => formDataObj.append(key, item));
				} else {
					formDataObj.append(key, String(value));
				}
			});

			if (selectedFiles) {
				for (let i = 0; i < selectedFiles.length; i++) {
					formDataObj.append('files', selectedFiles[i]);
				}
			}

			await pb.collection('talk').update(formData.id, formDataObj);
			goto(`/talk/${formData.id}`);
		} catch (e) {
			alert(`Failed to update talk: ${e}`);
		}
	}

	const toggleSpeaker = (userId) => {
		formData.speaker = formData.speaker.includes(userId)
			? formData.speaker.filter((id) => id !== userId)
			: [...formData.speaker, userId];
	};

	const toggleTag = (tagId) => {
		formData.tags = formData.tags.includes(tagId)
			? formData.tags.filter((id) => id !== tagId)
			: [...formData.tags, tagId];
	};
</script>

<svelte:head>
	<title>Edit Talk - Socrates Fahrplan</title>
</svelte:head>

<div class="max-w-4xl mx-auto p-6">
	{#if error}
		<div class="text-red-600 text-center py-8">{error}</div>
	{:else if talk && !canEditTalk(talk, $user)}
		<div class="text-red-600 text-center py-8">You do not have permission to edit this talk.</div>
	{:else if talk}
		<div class="bg-white rounded-lg shadow-lg p-8">
			<h1 class="text-xl font-bold text-gray-900 mb-6">Edit Talk</h1>

			<form onsubmit={handleSubmit} class="space-y-6">
				<div>
					<label for="name" class="block text-sm font-medium text-gray-700 mb-2">
						Talk Name *
					</label>
					<input
						id="name"
						type="text"
						bind:value={formData.name}
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label for="start" class="block text-sm font-medium text-gray-700 mb-2">
						Start Time *
					</label>
					<input
						id="start"
						type="datetime-local"
						bind:value={formData.start}
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label for="duration" class="block text-sm font-medium text-gray-700 mb-2">
						Duration (minutes) *
					</label>
					<input
						id="duration"
						type="number"
						bind:value={formData.durationMinutes}
						min="1"
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label for="room" class="block text-sm font-medium text-gray-700 mb-2"> Room * </label>
					<select
						id="room"
						bind:value={formData.room}
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="">Select a room...</option>
						{#each rooms as room (room.id)}
							<option value={room.id}>
								{room.name}{room.floor ? ` (Floor ${room.floor})` : ''}
							</option>
						{/each}
					</select>
				</div>

				<div>
					<label for="description" class="block text-sm font-medium text-gray-700 mb-2">
						Description
					</label>
					<textarea
						id="description"
						bind:value={formData.description}
						rows="4"
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					></textarea>
				</div>

				<div>
					<label for="language" class="block text-sm font-medium text-gray-700 mb-2">
						Language
					</label>
					<select
						id="language"
						bind:value={formData.language}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="english">English</option>
						<option value="german">German</option>
					</select>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Speakers</label>
					<div class="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
						{#each users as userItem (userItem.id)}
							<label class="flex items-center space-x-2 py-1">
								<input
									type="checkbox"
									checked={formData.speaker.includes(userItem.id)}
									onchange={() => toggleSpeaker(userItem.id)}
									class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
								<span class="text-sm">{getUserDisplayName(userItem)}</span>
							</label>
						{/each}
					</div>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Tags</label>
					<div class="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
						{#each tags as tag (tag.id)}
							<label class="flex items-center space-x-2 py-1">
								<input
									type="checkbox"
									checked={formData.tags.includes(tag.id)}
									onchange={() => toggleTag(tag.id)}
									class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
								<span class="text-sm">{tag.name}</span>
							</label>
						{/each}
					</div>
				</div>

				<div>
					<label for="files" class="block text-sm font-medium text-gray-700 mb-2"> Files </label>
					<input
						id="files"
						type="file"
						multiple
						bind:files={selectedFiles}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
				{#if talk?.files && talk.files.length > 0}
					<div class="mt-2 text-sm text-gray-600">
						<p>Current files:</p>
						<ul class="list-disc list-inside">
							{#each talk.files as file (file)}
								<li>{file}</li>
							{/each}
						</ul>
					</div>
				{/if}

				<div class="flex justify-end space-x-4">
					<a
						href="/talk/{talk?.id || ''}"
						class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
					>
						Cancel
					</a>
					<button
						type="submit"
						class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						Update Talk
					</button>
				</div>
			</form>
		</div>
	{/if}
</div>
