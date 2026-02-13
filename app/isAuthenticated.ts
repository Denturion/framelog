export async function isAuthenticated() {
	const res = await fetch('/api/protected', {
		credentials: 'include',
	});
	return res.ok;
}
