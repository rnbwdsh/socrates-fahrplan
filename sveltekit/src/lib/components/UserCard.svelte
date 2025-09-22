<script lang="ts">
	import { pb } from '$lib/pocketbase';

	import type { UsersResponse } from '../pocketbase-types.js';

	interface Props {
		user: UsersResponse;
		size?: 'sm' | 'md' | 'lg';
		showBio?: boolean;
		showWebsite?: boolean;
		linkToProfile?: boolean;
	}

	let {
		user,
		size = 'md',
		showBio = true,
		showWebsite = true,
		linkToProfile = true,
	}: Props = $props();

	const sizeClasses = {
		sm: {
			avatar: 'w-10 h-10',
			text: 'text-sm',
			name: 'text-base font-medium',
		},
		md: {
			avatar: 'w-12 h-12',
			text: 'text-sm',
			name: 'text-lg font-semibold',
		},
		lg: {
			avatar: 'w-16 h-16',
			text: 'text-base',
			name: 'text-xl font-semibold',
		},
	};

	const classes = sizeClasses[size];
	const displayName = user.name || user.username || user.email;
</script>

<div class="flex items-start space-x-3">
	<!-- Avatar -->
	<div class="flex-shrink-0">
		{#if user.avatar}
			<img
				src={pb.files.getURL(user, user.avatar, { thumb: '100x100' })}
				alt={displayName}
				class="{classes.avatar} rounded-full object-cover"
			/>
		{:else}
			<div class="{classes.avatar} rounded-full bg-gray-300 flex items-center justify-center">
				<span class="text-gray-600">👤</span>
			</div>
		{/if}
	</div>

	<!-- User info -->
	<div class="flex-1 min-w-0">
		<div class="{classes.name} text-gray-900">
			{#if linkToProfile}
				<a href="/user/{user.id}" class="hover:text-blue-600 transition-colors">
					{displayName}
				</a>
			{:else}
				{displayName}
			{/if}
		</div>

		{#if showBio && user.bio}
			<p class="{classes.text} text-gray-600 mt-1 line-clamp-2">
				{user.bio}
			</p>
		{/if}

		{#if showWebsite && user.website}
			<a
				href={user.website}
				target="_blank"
				rel="noopener noreferrer"
				class="{classes.text} text-blue-500 hover:text-blue-700 mt-1 inline-block"
			>
				🌐 Website
			</a>
		{/if}

		{#if user.emailVisibility && user.email}
			<div class="{classes.text} text-gray-500 mt-1">
				📧 {user.email}
			</div>
		{/if}
	</div>
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		line-clamp: 2;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
