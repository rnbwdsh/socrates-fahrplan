#!/usr/bin/env node
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function testOverlaps() {
	try {
		// Login as admin
		await pb.admins.authWithPassword('admin@admin.at', 'adminadmin');
		console.log('Logged in as admin');

		// First, list all talks to see what we have
		const allTalks = await pb.collection('talk').getFullList();
		console.log(
			'All talks:',
			allTalks.map((t) => ({ name: t.name, start: t.start, duration: t.durationMinutes })),
		);

		// Find the "BaaS'ed" talk
		const baasTalk = allTalks.find((talk) => talk.name.includes('BaaS'));
		if (!baasTalk) {
			console.error('BaaS talk not found!');
			return;
		}

		console.log('Found BaaS talk:', {
			name: baasTalk.name,
			start: baasTalk.start,
			duration: baasTalk.durationMinutes,
			room: baasTalk.room,
		});

		// BaaS talk: Friday, 16:00-17:00 in room 15-05
		const roomId = baasTalk.room;

		const testCases = [
			{
				name: 'Test 1: Starts during (16:30-17:30)',
				talk: {
					name: 'Overlap Test 1',
					start: '2025-09-26 16:30:00.000Z',
					durationMinutes: 60,
					room: roomId,
					language: 'english',
				},
			},
			{
				name: 'Test 2: Ends during (15:30-16:30)',
				talk: {
					name: 'Overlap Test 2',
					start: '2025-09-26 15:30:00.000Z',
					durationMinutes: 60,
					room: roomId,
					language: 'english',
				},
			},
			{
				name: 'Test 3: Encompasses (15:30-17:30)',
				talk: {
					name: 'Overlap Test 3',
					start: '2025-09-26 15:30:00.000Z',
					durationMinutes: 120,
					room: roomId,
					language: 'english',
				},
			},
			{
				name: 'Test 4: Contained within (16:15-16:45)',
				talk: {
					name: 'Overlap Test 4',
					start: '2025-09-26 16:15:00.000Z',
					durationMinutes: 30,
					room: roomId,
					language: 'english',
				},
			},
		];

		for (const testCase of testCases) {
			console.log(`\n${testCase.name}`);
			try {
				const result = await pb.collection('talk').create(testCase.talk);
				console.log('❌ ERROR: Talk was created when it should have been blocked!', result.id);
				// Clean up if accidentally created
				await pb.collection('talk').delete(result.id);
			} catch (error) {
				console.log('✅ SUCCESS: Overlap correctly detected');
				console.log('Error message:', error.message);
			}
		}

		console.log('\n=== Testing successful talk (no overlap) ===');
		try {
			const validTalk = {
				name: 'Valid Talk - No Overlap',
				start: '2025-09-26 18:00:00.000Z', // 18:00-19:00, after BaaS talk
				durationMinutes: 60,
				room: roomId,
				language: 'english',
			};

			const result = await pb.collection('talk').create(validTalk);
			console.log('✅ SUCCESS: Valid talk created successfully', result.id);

			// Clean up
			await pb.collection('talk').delete(result.id);
			console.log('Cleaned up test talk');
		} catch (error) {
			console.log('❌ ERROR: Valid talk was rejected!', error.message);
		}
	} catch (error) {
		console.error('Error in test:', error);
		if (error.response) {
			console.error('Response data:', error.response);
		}
	}
}

// Run the tests
testOverlaps();
