<script lang="ts">
	import { goto } from '$app/navigation';

	import { pb } from '$lib/pocketbase';
	import { user } from '$lib/stores';

	let email = $state('');
	let password = $state('');
	let passwordConfirm = $state('');
	let secret = $state('');
	let name = $state('');
	let error = $state('');

	const handleRegister = async () => {
		error = '';

		if (secret !== 'socrates2025') {
			error = 'Invalid secret code';
			return;
		}

		if (password !== passwordConfirm) {
			error = 'Passwords do not match';
			return;
		}

		try {
			const userData = {
				email,
				password,
				passwordConfirm,
				name: name || email.split('@')[0],
				verified: true,
			};

			await pb.collection('users').create(userData);

			const authData = await pb.collection('users').authWithPassword(email, password);
			user.set(authData.record);
			goto('/');
		} catch (e) {
			error = `Registration failed: ${e}`;
		}
	};
</script>

<div
	class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8"
>
	<div class="max-w-md w-full space-y-8">
		<div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
				Create your account
			</h2>
		</div>
		<form
			class="mt-8 space-y-6"
			onsubmit={(e) => {
				e.preventDefault();
				handleRegister();
			}}
		>
			{#if error}
				<div class="text-red-600 dark:text-red-400 text-center">{error}</div>
			{/if}

			<div class="space-y-4">
				<div>
					<label for="secret" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Secret Code (required)
					</label>
					<input
						id="secret"
						name="secret"
						type="text"
						required
						bind:value={secret}
						class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-800"
						placeholder="Enter the conference secret code"
					/>
				</div>

				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Email address
					</label>
					<input
						id="email"
						name="email"
						type="email"
						autocomplete="email"
						required
						bind:value={email}
						class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-800"
						placeholder="Email address"
					/>
				</div>

				<div>
					<label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Name (optional)
					</label>
					<input
						id="name"
						name="name"
						type="text"
						bind:value={name}
						class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-800"
						placeholder="Your name"
					/>
				</div>

				<div>
					<label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Password
					</label>
					<input
						id="password"
						name="password"
						type="password"
						autocomplete="new-password"
						required
						bind:value={password}
						class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-800"
						placeholder="Password"
					/>
				</div>

				<div>
					<label
						for="passwordConfirm"
						class="block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Confirm Password
					</label>
					<input
						id="passwordConfirm"
						name="passwordConfirm"
						type="password"
						autocomplete="new-password"
						required
						bind:value={passwordConfirm}
						class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-800"
						placeholder="Confirm password"
					/>
				</div>
			</div>

			<div>
				<button
					type="submit"
					class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
				>
					Register
				</button>
			</div>

			<div class="text-center">
				<a
					href="/login"
					class="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
				>
					Already have an account? Sign in here
				</a>
			</div>
		</form>
	</div>
</div>
