<script lang="ts">
	import { page } from '$app/stores';

	import { pb } from '$lib/pocketbase';
	import { canEditTalk, getUserDisplayName } from '$lib/utils';

	// Check if we're creating a new talk
	const isNewTalk = $page.params.id === undefined;

	let error = $state(isNewTalk ? '' : 'Loading...');
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

	// Date validation function
	const isValidTalkDate = (dateString) => {
		if (!dateString) return false;
		const date = new Date(dateString);
		const dateStr = date.toISOString().split('T')[0];
		return dateStr === '2025-09-26' || dateStr === '2025-09-27';
	};

	$effect(() => {
		async function loadData() {
			try {
				// Always load rooms, tags, and users
				const [roomsResponse, tagsResponse, usersResponse] = await Promise.all([
					pb.collection('room').getList(1, 100, { sort: 'name' }),
					pb.collection('tag').getList(1, 100, { sort: 'name' }),
					pb.collection('users').getList(1, 100, { sort: 'name' }),
				]);

				[rooms, tags, users] = [roomsResponse.items, tagsResponse.items, usersResponse.items];

				if (isNewTalk) {
					// Set default values for new talk
					formData.speaker = pb.authStore.isValid ? [pb.authStore.record.id] : [];
					error = '';
				} else {
					// Load existing talk data
					const talkId = $page.params.id;
					if (!talkId) {
						error = 'No talk ID provided';
						return;
					}

					const talkData = await pb.collection('talk').getOne(talkId, {
						expand: 'room,speaker,tags',
					});

					talk = talkData;

					formData.id = talkData.id;
					formData.name = talkData.name || '';
					formData.start = talkData.start
						? new Date(talkData.start).toISOString().slice(0, 16)
						: '';
					formData.durationMinutes = talkData.durationMinutes || 60;
					formData.description = talkData.description || '';
					formData.room = talkData.room || '';
					formData.speaker = talkData.speaker || [];
					formData.tags = talkData.tags || [];
					formData.language = talkData.language || 'english';
					error = '';
				}
			} catch (e) {
				error = `Failed to load data: ${e}`;
			}
		}

		loadData();
	});

	async function handleSubmit(event) {
		event.preventDefault();

		// Validate date
		if (!isValidTalkDate(formData.start)) {
			alert('Talk date must be September 26 or 27, 2025');
			return;
		}

		// Validate required fields
		if (!formData.name || !formData.start) {
			alert('Please fill in all required fields');
			return;
		}

		// Validate speaker selection for new talks
		if (isNewTalk && formData.speaker.length === 0) {
			alert('Please select at least one speaker for new talks');
			return;
		}

		const formDataObj = new FormData();
		Object.entries(formData).forEach(([key, value]) => {
			if (Array.isArray(value)) {
				value.forEach((item) => formDataObj.append(key, item));
			} else {
				formDataObj.append(key, value);
			}
		});

		// Add files if selected
		if (selectedFiles) {
			for (let i = 0; i < selectedFiles.length; i++) {
				formDataObj.append('files', selectedFiles[i]);
			}
		}

		if (isNewTalk) {
			await pb.collection('talk').create(formDataObj);
		} else {
			await pb.collection('talk').update(formData.id!, formDataObj);
		}

		window.location.href = '/';
	}

	const toggleSpeaker = (userId) =>
		(formData.speaker = formData.speaker.includes(userId)
			? formData.speaker.filter((id) => id !== userId)
			: [...formData.speaker, userId]);

	const toggleTag = (tagId) =>
		(formData.tags = formData.tags.includes(tagId)
			? formData.tags.filter((id) => id !== tagId)
			: [...formData.tags, tagId]);
</script>

<svelte:head>
	<title>{isNewTalk ? 'Create' : 'Edit'} Talk - Socrates Fahrplan</title>
</svelte:head>

<div class="max-w-4xl mx-auto p-6">
	{#if error}
		<div class="text-red-600 dark:text-red-400 text-center py-8">{error}</div>
	{:else if !isNewTalk && talk && !canEditTalk(talk, pb.authStore.record)}
		<div class="text-red-600 dark:text-red-400 text-center py-8">
			You do not have permission to edit this talk.
		</div>
	{:else if isNewTalk && !pb.authStore.isValid}
		<div class="text-red-600 dark:text-red-400 text-center py-8">
			You must be logged in to create a talk.
		</div>
	{:else if isNewTalk || talk}
		<div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
			<h1 class="text-xl font-bold text-gray-900 dark:text-white mb-6">
				{isNewTalk ? 'Create New Talk' : 'Edit Talk'}
			</h1>

			<form onsubmit={handleSubmit} class="space-y-6">
				<div>
					<label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Talk Name *
					</label>
					<input
						id="name"
						type="text"
						bind:value={formData.name}
						required
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>

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
						bind:value={formData.start}
						required
						min="2025-09-26T00:00"
						max="2025-09-27T23:59"
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
						Must be on September 26 or 27, 2025
					</p>
				</div>

				<div>
					<label
						for="duration"
						class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
					>
						Duration (minutes) *
					</label>
					<input
						id="duration"
						type="number"
						bind:value={formData.durationMinutes}
						min="1"
						required
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label for="room" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Room *
					</label>
					<select
						id="room"
						bind:value={formData.room}
						required
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
					<label
						for="description"
						class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
					>
						Description
					</label>
					<textarea
						id="description"
						bind:value={formData.description}
						rows="4"
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
					></textarea>
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
						bind:value={formData.language}
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="english">English</option>
						<option value="german">German</option>
					</select>
				</div>

				<fieldset>
					<legend class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
						>Speakers</legend
					>
					<div
						class="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 p-3"
					>
						{#each users as userItem (userItem.id)}
							<label class="flex items-center space-x-2 py-1">
								<input
									type="checkbox"
									checked={formData.speaker.includes(userItem.id)}
									onchange={() => toggleSpeaker(userItem.id)}
									class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
								<span class="text-sm text-gray-900 dark:text-gray-100"
									>{getUserDisplayName(userItem)}</span
								>
							</label>
						{/each}
					</div>
				</fieldset>

				<fieldset>
					<legend class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
						>Tags</legend
					>
					<div
						class="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 p-3"
					>
						{#each tags as tag (tag.id)}
							<label class="flex items-center space-x-2 py-1">
								<input
									type="checkbox"
									checked={formData.tags.includes(tag.id)}
									onchange={() => toggleTag(tag.id)}
									class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
								<span class="text-sm text-gray-900 dark:text-gray-100">{tag.name}</span>
							</label>
						{/each}
					</div>
				</fieldset>

				<div>
					<label
						for="files"
						class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
					>
						Files
					</label>
					<input
						id="files"
						type="file"
						multiple
						bind:files={selectedFiles}
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
				{#if !isNewTalk && talk?.files && talk.files.length > 0}
					<div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
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
						href={isNewTalk ? '/' : `/talk/${talk?.id || ''}`}
						class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
					>
						Cancel
					</a>
					<button
						type="submit"
						class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						{isNewTalk ? 'Create Talk' : 'Update Talk'}
					</button>
				</div>
			</form>
		</div>
	{/if}
</div>
