import { Types } from 'mongoose';
import { userRepository } from '../repositories/user.repository';
import { movieRepository } from '../repositories/movie.repository';
import { IMovie } from '../models/User';

export class FeedService {
	async getFeed(
		currentUserId: string,
		limit: number = 20
	): Promise<
		Array<{
			owner: { _id: Types.ObjectId; username: string };
			movie: IMovie;
		}>
	> {
		const followedUserIds =
			await userRepository.getFollowedUsers(currentUserId);

		if (followedUserIds.length === 0) {
			return [];
		}

		const maxLimit = Math.min(limit, 100);

		return movieRepository.getFeed(followedUserIds, maxLimit);
	}
}

export const feedService = new FeedService();
