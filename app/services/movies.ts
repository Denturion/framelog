/**
 * Movies service
 * Handles movie CRUD operations and movie list retrieval
 */

// POST / add
export interface AddMoviePayload {
	movie_id: string;
	title: string;
	year: string;
	poster_url: string;
}

// PUT / update
export interface UpdateMoviePayload {
	rating?: number | null;
	note?: string;
}

export async function getMyMovies() {
	const res = await fetch('/api/movies', {
		credentials: 'include',
	});
	if (!res.ok) {
		throw new Error(`Failed to fetch movies: ${res.statusText}`);
	}
	return res.json();
}

export async function addMovie(movie: AddMoviePayload) {
	const res = await fetch('/api/movies', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(movie),
	});
	if (!res.ok) {
		throw new Error(`Failed to add movie: ${res.statusText}`);
	}
	return res.json();
}

export async function updateMovie(
	_id: string,
	updates: Partial<UpdateMoviePayload>
) {
	const res = await fetch(`/api/movies/${_id}`, {
		method: 'PUT',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(updates),
	});
	if (!res.ok) {
		throw new Error(`Failed to update movie: ${res.statusText}`);
	}
	return res.json();
}

export async function deleteMovie(_id: string) {
	const res = await fetch(`/api/movies/${_id}`, {
		method: 'DELETE',
		credentials: 'include',
	});
	if (!res.ok) {
		throw new Error(`Failed to delete movie: ${res.statusText}`);
	}
	return res;
}
