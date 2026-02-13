/**
 * Users service
 * Handles user profile and movies retrieval for a specific user
 */

import { IMovie } from '../interfaces/IMovieInterface';

export interface UserProfile {
	_id: string;
	username: string;
	is_followed?: boolean;
}

export interface UserMoviesResponse {
	owner: UserProfile;
	movies: IMovie[];
}

export async function getUserMovies(username: string) {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/api/users/${encodeURIComponent(
			username
		)}/movies`,
		{
			credentials: 'include',
		}
	);
	if (res.status === 404) {
		return null;
	}
	if (!res.ok) {
		throw new Error(`Failed to fetch user movies: ${res.statusText}`);
	}
	return res.json() as Promise<UserMoviesResponse>;
}

export async function getCurrentUserProfile(userId: string) {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/api/users/${encodeURIComponent(
			userId
		)}/movies`,
		{
			credentials: 'include',
		}
	);
	if (!res.ok) {
		return null;
	}
	return res.json() as Promise<UserMoviesResponse>;
}
