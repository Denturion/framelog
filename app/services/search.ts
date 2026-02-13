export async function searchMovies(
	query: string,
	opts?: { signal?: AbortSignal }
) {
	if (!query) return [];

	const apiKey = process.env.NEXT_PUBLIC_OMDB_KEY;
	const fullUrl = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(
		query
	)}`;

	const res = await fetch(fullUrl, { signal: opts?.signal });
	const json = await res.json();

	if (json.Response === 'False') {
		return [];
	}
	return json.Search;
}
