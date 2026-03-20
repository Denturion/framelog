import { Types } from 'mongoose';
import { userRepository } from '../repositories/user.repository';
import { movieRepository } from '../repositories/movie.repository';
import { IMovie } from '../models/User';

interface FollowUser {
	_id: string;
	username: string;
}

interface UserMoviesResponse {
	owner: {
		_id: string;
		username: string;
		is_self: boolean;
		is_followed: boolean;
		followers_count: number;
		following_count: number;
		followers: FollowUser[];
		following: FollowUser[];
		created_at: string;
	};
	movies: IMovie[];
}

export class UserService {
	async getUserMoviesWithOwner(
		identifier: string,
		currentUserId: string,
	): Promise<UserMoviesResponse> {
		const targetUser = await userRepository.findByIdOrUsername(identifier);

		if (!targetUser) {
			throw new Error('User not found');
		}

		const movies = await movieRepository.getMoviesByUserId(
			targetUser._id.toString(),
		);

		const sortedMovies = movies.sort(
			(a, b) =>
				new Date(b.date_added).getTime() - new Date(a.date_added).getTime(),
		);

		const isFollowing = await userRepository.isFollowing(
			currentUserId,
			targetUser._id,
		);

		const followers = await userRepository.getFollowersList(targetUser._id.toString());
		const following = await userRepository.getFollowingList(targetUser._id.toString());

		const isSelf = targetUser._id.toString() === currentUserId;

		return {
			owner: {
				_id: targetUser._id.toString(),
				username: targetUser.username,
				is_self: isSelf,
				is_followed: isFollowing,
				followers_count: targetUser.followers.length,
				following_count: targetUser.users_followed.length,
				followers,
				following,
				created_at: targetUser.created_at.toISOString(),
			},
			movies: sortedMovies,
		};
	}
}

export const userService = new UserService();
