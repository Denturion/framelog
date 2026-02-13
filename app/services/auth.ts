/**
 * Authentication service
 * Handles login, register, logout, and current user endpoints
 */

interface LoginCredentials {
	username: string;
	password: string;
}

interface RegisterCredentials {
	username: string;
	email: string;
	password: string;
}

export interface CurrentUser {
	userId: string;
}

export async function login(credentials: LoginCredentials) {
	return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(credentials),
	});
}

export async function register(credentials: RegisterCredentials) {
	return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(credentials),
	});
}

export async function logout() {
	return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
		method: 'POST',
		credentials: 'include',
	});
}

export async function getCurrentUser() {
	const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/protected`, {
		credentials: 'include',
	});
	if (!res.ok) {
		return null;
	}
	return res.json() as Promise<CurrentUser>;
}
