import { Types } from 'mongoose';
import { userRepository } from '../repositories/user.repository';
import { movieRepository } from '../repositories/movie.repository';
import { IMovie } from '../models/User';

interface UserMoviesResponse {
	owner: {
		_id: string;
		username: string;
		is_followed: boolean;
	};
	movies: IMovie[];
}

export class UserService {
	async getUserMoviesWithOwner(
		identifier: string,
		currentUserId: string,
	): Promise<UserMoviesResponse> {
		// Hitta användaren via ID eller username
		const targetUser = await userRepository.findByIdOrUsername(identifier);

		if (!targetUser) {
			throw new Error('User not found');
		}

		// Hämta användarens filmer
		const movies = await movieRepository.getMoviesByUserId(
			targetUser._id.toString(),
		);

		// Sortera filmerna efter date_added (nyaste först)
		const sortedMovies = movies.sort(
			(a, b) =>
				new Date(b.date_added).getTime() - new Date(a.date_added).getTime(),
		);

		// Kolla om current user följer target user
		const isFollowing = await userRepository.isFollowing(
			currentUserId,
			targetUser._id,
		);

		return {
			owner: {
				_id: targetUser._id.toString(),
				username: targetUser.username,
				is_followed: isFollowing,
			},
			movies: sortedMovies,
		};
	}
}

export const userService = new UserService();
