/**
 * Follow service
 * Handles follow/unfollow operations and user search
 */

export async function followUser(username: string) {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/api/follow/${encodeURIComponent(
			username
		)}`,
		{
			method: 'POST',
			credentials: 'include',
		}
	);
	if (!res.ok) {
		throw new Error(`Failed to follow user: ${res.statusText}`);
	}
	return res;
}

export async function unfollowUser(username: string) {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/api/follow/${encodeURIComponent(
			username
		)}`,
		{
			method: 'DELETE',
			credentials: 'include',
		}
	);
	if (!res.ok) {
		throw new Error(`Failed to unfollow user: ${res.statusText}`);
	}
	return res;
}

export async function searchUsers(
	query: string,
	limit: number = 8,
	signal?: AbortSignal
) {
	const res = await fetch(
		`${
			process.env.NEXT_PUBLIC_API_URL
		}/api/follow/search/users?q=${encodeURIComponent(query)}&limit=${limit}`,
		{
			credentials: 'include',
			signal,
		}
	);
	if (!res.ok) {
		throw new Error(`Failed to search users: ${res.statusText}`);
	}
	const data = await res.json();
	if (!Array.isArray(data)) {
		throw new Error('Search returned unexpected data format');
	}
	return data as Array<{ _id: string; username: string }>;
}
