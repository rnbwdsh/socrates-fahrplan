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
		const email = value(formData, 'email');
		const password = value(formData, 'password');
		const next = value(formData, 'next', false);

		await pb.collection('users').authWithPassword(email, password);
		await applyAction({ type: 'redirect', status: 303, location: next || '/' });
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
		const email = value(formData, 'email');
		const password = value(formData, 'password');
		const passwordConfirm = value(formData, 'passwordConfirm');
		const secret = value(formData, 'secret');
		const next = value(formData, 'next', false);

		await pb.collection('users').create({ email, password, passwordConfirm, secret });
		await pb.collection('users').authWithPassword(email, password);
		await applyAction({ type: 'redirect', status: 303, location: next || '/' });
	} catch (e) {
		console.log(e);
		if (e instanceof ClientResponseError) {
			await applyAction({ type: 'failure', status: 400, data: { response: e.response } });
		} else {
			throw e;
		}
	}
};

function value(formData: FormData, key: string): string;
function value(formData: FormData, key: string, required: false): string | null;
function value(formData: FormData, key: string, required: boolean = true): string | null {
	const v = formData.get(key);
	if (v instanceof File) {
		throw new Error(`${key} must be a string`);
	}
	if (required && !v) {
		throw new Error(`${key} is required`);
	}
	return v;
}
