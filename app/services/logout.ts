export async function logOut() {
	return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
		method: 'POST',
		credentials: 'include',
	});
}
