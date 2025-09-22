<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';

	import { LoginAction } from '$lib/auth';
</script>

<form use:enhance={LoginAction} method="POST" class="space-y-6">
	<input type="hidden" name="next" value={$page.url?.searchParams?.get('next') || ''} />

	<div>
		<label for="email" class="block text-sm font-medium text-gray-700">Email</label>
		<input
			name="email"
			type="text"
			required
			class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
		/>
	</div>
	<div>
		<label for="password" class="block text-sm font-medium text-gray-700">Password</label>
		<input
			name="password"
			type="password"
			required
			class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
		/>
	</div>

	{#if $page.form?.response?.message}
		<p class="text-red-500">{$page.form.response.message}</p>
	{/if}

	<button
		type="submit"
		class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
	>
		Login
	</button>

	<a href="/register" class="block text-sm text-center text-blue-600 hover:text-blue-800">
		Create an account
	</a>
</form>
