export async function isAuthenticated() {
	const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/protected`, {
		credentials: 'include',
	});
	return res.ok;
}
