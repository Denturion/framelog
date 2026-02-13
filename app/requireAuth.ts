export async function requireAuth() {
	const res = await fetch('/api/protected', {
		credentials: 'include',
	});

	return res.ok;
}
