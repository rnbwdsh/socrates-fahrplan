<script lang="ts">
	import { SvelteDate, SvelteSet } from 'svelte/reactivity';

	import { pb } from '$lib/pocketbase';
	import { availableDays, selectedDay, talks } from '$lib/stores';
	import { formatTime, getExpandedRoom } from '$lib/utils';

	let error = $state('Loading...');

	const dayTalks = $derived(() => {
		if (!$selectedDay) return [];
		return $talks.filter(
			(talk) =>
				new SvelteDate(talk.start).toDateString() === new SvelteDate($selectedDay).toDateString(),
		);
	});

	const rooms = $derived(() => {
		const roomSet = new SvelteSet();
		dayTalks().forEach((talk) => {
			const room = getExpandedRoom(talk);
			if (room) {
				roomSet.add(JSON.stringify({ id: room.id, name: room.name }));
			}
		});
		return Array.from(roomSet).map((roomStr) => JSON.parse(roomStr));
	});

	const timeSlots = $derived(() => {
		if (dayTalks().length === 0) return [];

		const times = dayTalks().map((talk) => new SvelteDate(talk.start).getHours());
		const minHour = Math.min(...times);
		const maxHour = Math.max(
			...dayTalks().map((talk) => {
				const endTime = new SvelteDate(talk.start);
				endTime.setMinutes(endTime.getMinutes() + talk.durationMinutes);
				return endTime.getHours();
			}),
		);

		const slots = [];
		for (let hour = minHour; hour <= maxHour; hour++) {
			const date = new SvelteDate(dayTalks()[0].start);
			date.setHours(hour, 0, 0, 0);
			slots.push(date.toISOString());
		}
		return slots;
	});

	const getGridPosition = (talk) => {
		const room = getExpandedRoom(talk);
		if (!room) return null;

		const roomIndex = rooms().findIndex((r) => r.id === room.id);
		if (roomIndex === -1) return null;

		const talkStart = new SvelteDate(talk.start);
		const talkEnd = new SvelteDate(talk.start);
		talkEnd.setMinutes(talkEnd.getMinutes() + talk.durationMinutes);

		const firstSlot = new SvelteDate(timeSlots()[0]);
		return {
			roomIndex,
			startRow: Math.floor((talkStart.getTime() - firstSlot.getTime()) / (1000 * 60 * 60)) + 1,
			endRow: Math.ceil((talkEnd.getTime() - firstSlot.getTime()) / (1000 * 60 * 60)) + 1,
		};
	};

	const days = $derived(() =>
		[...new Set($talks.map((talk) => new Date(talk.start).toDateString()))].sort(
			(a, b) => new Date(a).getTime() - new Date(b).getTime(),
		),
	);

	$effect(() => {
		if (days().length > 0 && !$selectedDay) {
			const today = new Date().toDateString();
			selectedDay.set(days().includes(today) ? today : days()[0]);
		}
	});

	$effect(() => availableDays.set(days()));

	$effect(() => {
		async function loadTalks() {
			try {
				const response = await pb.collection('talk').getList(1, 500, {
					expand: 'room,speaker,tags',
					sort: 'start',
				});

				talks.set(response.items);

				pb.collection('talk').subscribe('*', function (e) {
					if (e.action === 'create') {
						talks.update((current) => [...current, e.record]);
					} else if (e.action === 'update') {
						talks.update((current) =>
							current.map((talk) => (talk.id === e.record.id ? e.record : talk)),
						);
					} else if (e.action === 'delete') {
						talks.update((current) => current.filter((talk) => talk.id !== e.record.id));
					}
				});

				error = '';
			} catch (e) {
				error = `Failed to load talks: ${e}`;
				alert(error);
			}
		}

		loadTalks();
	});
</script>

<div class="p-4">
	{#if error}
		<div class="text-red-600 dark:text-red-400 text-center py-8">{error}</div>
	{:else if dayTalks().length === 0}
		<div class="text-gray-600 dark:text-gray-400 text-center py-8">
			No talks scheduled for this day
		</div>
	{:else}
		<div class="overflow-x-auto">
			<div class="min-w-fit">
				<div
					class="grid gap-1 mb-2 sticky top-0 bg-white dark:bg-gray-900 z-10 border-b border-gray-200 dark:border-gray-700"
					style="grid-template-columns: 100px repeat({rooms().length}, 300px);"
				>
					<div class="font-bold text-sm text-gray-600 dark:text-gray-400 p-2">Time</div>
					{#each rooms() as room (room.id)}
						<div
							class="font-bold text-sm text-gray-800 dark:text-gray-200 p-2 text-center border-b-2 border-gray-300 dark:border-gray-600"
						>
							{room.name}
						</div>
					{/each}
				</div>

				<div
					class="grid gap-1"
					style="grid-template-columns: 100px repeat({rooms()
						.length}, 300px); grid-template-rows: repeat({timeSlots().length}, 80px);"
				>
					{#each timeSlots() as timeSlot, index (timeSlot)}
						<div
							class="text-sm font-medium text-gray-600 dark:text-gray-400 p-2 border-r border-gray-200 dark:border-gray-700 flex items-center"
							style="grid-column: 1; grid-row: {index + 1};"
						>
							{formatTime(timeSlot)}
						</div>
					{/each}

					{#each timeSlots() as timeSlot, timeIndex (timeSlot)}
						{#each rooms() as room, roomIndex (room.id)}
							<div
								class="border border-gray-200 dark:border-gray-700"
								style="grid-column: {roomIndex + 2}; grid-row: {timeIndex + 1};"
							></div>
						{/each}
					{/each}

					{#each dayTalks() as talk (talk.id)}
						{@const position = getGridPosition(talk)}
						{#if position}
							<div
								class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 border-l-4 border-blue-500 hover:shadow-lg transition-shadow overflow-hidden m-1"
								style="grid-column: {position.roomIndex +
									2}; grid-row: {position.startRow} / {position.endRow};"
							>
								<div class="flex justify-between items-start mb-2">
									<div class="flex-1">
										<h3
											class="font-bold text-sm text-gray-900 dark:text-gray-100 mb-1 leading-tight"
										>
											<a
												href="/talk/{talk.id}"
												class="hover:text-blue-600 dark:hover:text-blue-400"
											>
												{talk.name}
											</a>
										</h3>
									</div>
								</div>
								{#if talk.description}
									<p class="text-gray-700 dark:text-gray-300 text-xs leading-tight">
										{talk.description.length > 100
											? talk.description.slice(0, 100) + '...'
											: talk.description}
									</p>
								{/if}
							</div>
						{/if}
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>
