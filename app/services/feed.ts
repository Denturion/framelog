/**
 * Feed service
 * Handles feed retrieval for followed users
 */

export interface FeedItem {
	owner: { _id: string; username: string };
	movie: {
		movie_id: string;
		title: string;
		year: string;
		poster_url?: string;
		rating?: number | null;
		note?: string;
		date_added?: string;
	};
}

export async function getFeed(limit: number = 20, signal?: AbortSignal) {
	const res = await fetch(`/api/feed?limit=${limit}`, {
		credentials: 'include',
		signal,
	});
	if (!res.ok) {
		throw new Error(`Failed to fetch feed: ${res.statusText}`);
	}
	return res.json() as Promise<FeedItem[]>;
}
