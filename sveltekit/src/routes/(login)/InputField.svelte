<script lang="ts">
	import { page } from '$app/stores';

	const {
		title,
		name,
		type,
	}: { title: string; name: string; type: 'email' | 'password' | 'text' } = $props();
</script>

<div>
	<label for={name} class="block text-sm font-medium text-gray-700">{title}</label>
	<input
		{name}
		{type}
		required
		class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
	/>
	{#if $page.form?.response?.data?.[name]?.message}
		<p class="text-red-500">{$page.form.response.data[name].message}</p>
	{/if}
</div>
