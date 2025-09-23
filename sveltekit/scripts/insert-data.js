#!/usr/bin/env node
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function insertData() {
	try {
		// Login as admin
		await pb.admins.authWithPassword('admin@admin.at', 'adminadmin');
		console.log('Logged in as admin');

		// Create rooms
		const rooms = [
			{ name: '15-04', floor: '15' },
			{ name: '15-05', floor: '15' },
			{ name: '15-06', floor: '15' },
			{ name: '08-03', floor: '8' },
			{ name: '08-05', floor: '8' },
			{ name: '08-07', floor: '8' },
			{ name: '08-08', floor: '8' },
			{ name: 'buffet', floor: '0' },
			{ name: 'other', floor: '0' },
		];

		console.log('Creating rooms...');
		const roomRecords = {};
		for (const room of rooms) {
			const record = await pb.collection('room').create(room);
			roomRecords[room.name] = record.id;
			console.log(`Created room: ${room.name}`);
		}

		// Create tags
		const tags = [
			'hardware',
			'coding',
			'testing',
			'security',
			'infrastructure',
			'entertainment',
			'meta',
			'community',
		];

		console.log('Creating tags...');
		const tagRecords = {};
		for (const tag of tags) {
			const record = await pb.collection('tag').create({ name: tag });
			tagRecords[tag] = record.id;
			console.log(`Created tag: ${tag}`);
		}

		// Create user markus (or find existing)
		console.log('Creating user markus...');
		let markusUser = await pb.collection('users').create({
			username: 'markus',
			email: 'markus@example.com',
			password: 'markus91',
			passwordConfirm: 'markus91',
			name: 'markus',
			secret: 'socrates2025',
		});
		console.log(`Created user: markus (ID: ${markusUser.id})`);

		const talks = [
			// Friday, 26. Sep 2025
			{
				name: 'Doors opening',
				description: 'Kuchen (Apfel-Vanille & Nuss-Weichsel) & Obst',
				start: '2025-09-26 13:00:00.000Z',
				durationMinutes: 60,
				room: roomRecords['15-04'],
				language: 'german',
			},
			{
				name: 'Marketplace',
				description: 'Kuchen (Apfel-Vanille & Nuss-Weichsel) & Obst',
				start: '2025-09-26 14:00:00.000Z',
				durationMinutes: 180,
				room: roomRecords['15-04'],
				language: 'german',
			},
			{
				name: 'Gemüse-Lasagne, Golden Curry',
				description: '',
				start: '2025-09-26 17:00:00.000Z',
				durationMinutes: 180,
				room: roomRecords['buffet'],
				language: 'german',
			},
			{
				name: 'Evening News',
				description: '',
				start: '2025-09-26 20:00:00.000Z',
				durationMinutes: 60,
				room: roomRecords['15-04'],
				language: 'german',
			},
			{
				name: "BaaS'ed: Low code backend design with pocketbase",
				description:
					"We'll design a small socrates fahrplan, inspired by fahrplan.events.ccc.de with pocketbase, sveltkit and claude 4",
				start: '2025-09-26 16:00:00.000Z',
				durationMinutes: 60,
				room: roomRecords['15-05'],
				speaker: [markusUser.id],
				tags: [tagRecords['coding']],
				language: 'english',
			},
			// Saturday, 27. Sep 2025
			{
				name: 'Doors Opening + Kuchen & Obst',
				description: '',
				start: '2025-09-27 09:00:00.000Z',
				durationMinutes: 120,
				room: roomRecords['15-04'],
				language: 'german',
			},
			{
				name: 'Kürbis-Kartoffel-Gulasch, Pasta mit Cashew-Carbonara & Tofu-Speck',
				description: '',
				start: '2025-09-27 11:00:00.000Z',
				durationMinutes: 240,
				room: roomRecords['buffet'],
				language: 'german',
			},
			{
				name: 'Kuchen (Schoko-Weichsel & Schoko-Orange) & Obst',
				description: '',
				start: '2025-09-27 15:00:00.000Z',
				durationMinutes: 60,
				room: roomRecords['buffet'],
				language: 'german',
			},
			{
				name: 'Closing the Space',
				description: '',
				start: '2025-09-27 17:00:00.000Z',
				durationMinutes: 60,
				room: roomRecords['other'],
				language: 'german',
			},
			{
				name: 'Chili sin Carne, Linsen-Tofu-Ragout mit Kartofferl',
				description: '',
				start: '2025-09-27 18:00:00.000Z',
				durationMinutes: 60,
				room: roomRecords['buffet'],
				language: 'german',
			},
		];

		console.log('Creating talks...');
		for (const talk of talks) {
			await pb.collection('talk').create(talk);
			console.log(`Created talk: ${talk.name}`);
		}

		console.log('All data inserted successfully!');
	} catch (error) {
		console.error('Error inserting data:', error);
		if (error.response) {
			console.error('Response data:', error.response);
		}
	}
}

// Run the script
insertData();
