import { applyAction } from '$app/forms';
import { invalidateAll } from '$app/navigation';
import { type SubmitFunction } from '@sveltejs/kit';
import { ClientResponseError } from 'pocketbase';

import { pb } from '$lib/pocketbase';
import { user } from '$lib/stores';

pb.authStore.onChange((_, authRecord) => {
	user.set(authRecord);
}, true);

export const LoginAction: SubmitFunction = async ({ formData, cancel }) => {
	cancel();
	try {
		await pb
			.collection('users')
			.authWithPassword(formData.get('email') as string, formData.get('password') as string);
		await applyAction({
			type: 'redirect',
			status: 303,
			location: (formData.get('next') as string) || '/',
		});
	} catch (e) {
		console.log(e);
		if (e instanceof ClientResponseError) {
			await applyAction({ type: 'failure', status: 400, data: { response: e.response } });
		} else {
			throw e;
		}
	}
};

export const Logout = async () => {
	pb.authStore.clear();
	await invalidateAll();
};

export const RegisterAction: SubmitFunction = async ({ formData, cancel }) => {
	cancel();
	try {
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		await pb.collection('users').create({
			email,
			password,
			passwordConfirm: formData.get('passwordConfirm') as string,
			secret: formData.get('secret') as string,
		});
		await pb.collection('users').authWithPassword(email, password);
		await applyAction({
			type: 'redirect',
			status: 303,
			location: (formData.get('next') as string) || '/',
		});
	} catch (e) {
		console.log(e);
		if (e instanceof ClientResponseError) {
			await applyAction({ type: 'failure', status: 400, data: { response: e.response } });
		} else {
			throw e;
		}
	}
};
