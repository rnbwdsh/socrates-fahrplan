<script lang="ts">
	import { goto } from '$app/navigation';

	import { pb } from '$lib/pocketbase';
	import { user } from '$lib/stores';

	let emailOrUsername = $state('');
	let password = $state('');
	let error = $state('');

	const handleLogin = async () => {
		error = '';
		try {
			const authData = await pb.collection('users').authWithPassword(emailOrUsername, password);
			user.set(authData.record);
			goto('/');
		} catch (e) {
			error = `Login failed: ${e}`;
		}
	};
</script>


	<div class="max-w-md w-full space-y-8">
		<div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
				Sign in to your account
			</h2>
		</div>
		<form
			class="mt-8 space-y-6"
			onsubmit={(e) => {
				e.preventDefault();
				handleLogin();
			}}
		>
			{#if error}
				<div class="text-red-600 dark:text-red-400 text-center">{error}</div>
			{/if}

			<div class="rounded-md shadow-sm -space-y-px">
				<div>
					<label for="emailOrUsername" class="sr-only">Email address or username</label>
					<input
						id="emailOrUsername"
						name="emailOrUsername"
						type="text"
						autocomplete="username"
						required
						bind:value={emailOrUsername}
						class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-800"
						placeholder="Email address or username"
					/>
				</div>
				<div>
					<label for="password" class="sr-only">Password</label>
					<input
						id="password"
						name="password"
						type="password"
						autocomplete="current-password"
						required
						bind:value={password}
						class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-800"
						placeholder="Password"
					/>
				</div>
			</div>

			<div>
				<button
					type="submit"
					class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
				>
					Sign in
				</button>
			</div>

			<div class="text-center">
				<a
					href="/register"
					class="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
				>
					Don't have an account? Register here
				</a>
			</div>
		</form>
	</div>
