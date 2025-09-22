<script lang="ts">
	import { goto } from '$app/navigation';

	import { pb } from '$lib/pocketbase';
    import { user } from '$lib/stores';

	let error = $state('Loading...');
	let userData = $state({
		email: '',
		name: '',
		bio: '',
		website: '',
		emailVisibility: false,
	});
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let avatarFile = $state(null);

	$effect(() => {
		if (!$user) {
			goto('/login');
			return;
		}

		async function loadUserData() {
			try {
				const record = await pb.collection('users').getOne($user.id);
				userData = {
					email: record.email,
					name: record.name || '',
					bio: record.bio || '',
					website: record.website || '',
					emailVisibility: record.emailVisibility || false,
				};
				error = '';
			} catch (e) {
				error = `Failed to load user data: ${e}`;
				alert(error);
			}
		}

		loadUserData();
	});

	async function handleSubmit(e) {
		e.preventDefault();

		if (!$user) return;

		try {
			const updateData = {
				email: userData.email,
				name: userData.name,
				bio: userData.bio,
				website: userData.website,
				emailVisibility: userData.emailVisibility,
			};

			// Handle password change
			if (newPassword) {
				if (newPassword !== confirmPassword) {
					alert('New passwords do not match');
					return;
				}
				updateData.password = newPassword;
				updateData.passwordConfirm = confirmPassword;
				updateData.oldPassword = currentPassword;
			}

			// Handle avatar upload
			if (avatarFile) {
				updateData.avatar = avatarFile;
			}

			await pb.collection('users').update($user.id, updateData);

			// Update the user store
			const updatedUser = await pb.collection('users').getOne($user.id);
			user.set(updatedUser);

			alert('Profile updated successfully!');

			// Clear password fields
			currentPassword = '';
			newPassword = '';
			confirmPassword = '';
			avatarFile = null;
		} catch (e) {
			alert(`Failed to update profile: ${e}`);
		}
	}

	function handleAvatarChange(e) {
		const target = e.target;
		if (target.files && target.files[0]) {
			avatarFile = target.files[0];
		}
	}
</script>

<div class="max-w-2xl mx-auto p-6">
	{#if error}
		<div class="text-red-600 text-center py-8">{error}</div>
	{:else}
		<div class="bg-white rounded-lg shadow-md p-6">
			<h1 class="text-2xl font-bold mb-6">Edit Profile</h1>

			<form onsubmit={handleSubmit} class="space-y-6">
				<!-- Avatar -->
				<div>
					<label for="avatar" class="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
					{#if $user?.avatar}
						<div class="mb-2">
							<img
								src={pb.files.getURL($user, $user.avatar, { thumb: '100x100' })}
								alt="Current avatar"
								class="w-16 h-16 rounded-full object-cover"
							/>
						</div>
					{/if}
					<input
						id="avatar"
						type="file"
						accept="image/*"
						onchange={handleAvatarChange}
						class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
					/>
				</div>

				<!-- Email -->
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
					<input
						id="email"
						type="email"
						bind:value={userData.email}
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				<!-- Email Visibility -->
				<div class="flex items-center">
					<input
						id="emailVisibility"
						type="checkbox"
						bind:checked={userData.emailVisibility}
						class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
					/>
					<label for="emailVisibility" class="ml-2 block text-sm text-gray-700">
						Make email publicly visible
					</label>
				</div>

				<!-- Name -->
				<div>
					<label for="name" class="block text-sm font-medium text-gray-700 mb-2">Name</label>
					<input
						id="name"
						type="text"
						bind:value={userData.name}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				<!-- Bio -->
				<div>
					<label for="bio" class="block text-sm font-medium text-gray-700 mb-2">Bio</label>
					<textarea
						id="bio"
						bind:value={userData.bio}
						rows="4"
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					></textarea>
				</div>

				<!-- Website -->
				<div>
					<label for="website" class="block text-sm font-medium text-gray-700 mb-2">Website</label>
					<input
						id="website"
						type="url"
						bind:value={userData.website}
						placeholder="https://"
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				<!-- Password Change Section -->
				<div class="border-t pt-6">
					<h3 class="text-lg font-medium mb-4">Change Password</h3>

					<div class="space-y-4">
						<div>
							<label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-2">
								Current Password
							</label>
							<input
								id="currentPassword"
								type="password"
								bind:value={currentPassword}
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div>
							<label for="newPassword" class="block text-sm font-medium text-gray-700 mb-2">
								New Password
							</label>
							<input
								id="newPassword"
								type="password"
								bind:value={newPassword}
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div>
							<label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
								Confirm New Password
							</label>
							<input
								id="confirmPassword"
								type="password"
								bind:value={confirmPassword}
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					</div>
				</div>

				<!-- Submit Button -->
				<div class="flex justify-end space-x-4">
					<a
						href="/"
						class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
					>
						Cancel
					</a>
					<button
						type="submit"
						class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
					>
						Save Changes
					</button>
				</div>
			</form>
		</div>
	{/if}
</div>
