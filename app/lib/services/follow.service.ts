import { Types } from 'mongoose';
import { userRepository } from '../repositories/user.repository';

export class FollowService {
	async searchUsers(
		query: string,
		limit: number = 10
	): Promise<Array<{ _id: Types.ObjectId; username: string }>> {
		const trimmedQuery = query.trim();
		if (!trimmedQuery) {
			return [];
		}

		return userRepository.searchByUsername(trimmedQuery, limit);
	}

	async followUser(
		currentUserId: string,
		target: string
	): Promise<{ message: string; users_followed: Types.ObjectId[] }> {
		const targetUser = await userRepository.findByIdOrUsername(target);

		if (!targetUser) {
			throw new Error('User not found');
		}

		if (currentUserId === targetUser._id.toString()) {
			throw new Error("You can't follow yourself");
		}

		await userRepository.addFollowing(currentUserId, targetUser._id);

		const followedUsers = await userRepository.getFollowedUsers(
			currentUserId
		);

		return {
			message: 'Followed',
			users_followed: followedUsers,
		};
	}

	async unfollowUser(
		currentUserId: string,
		target: string
	): Promise<{ message: string; users_followed: Types.ObjectId[] }> {
		const targetUser = await userRepository.findByIdOrUsername(target);

		if (!targetUser) {
			throw new Error('User not found');
		}

		await userRepository.removeFollowing(currentUserId, targetUser._id);

		const followedUsers = await userRepository.getFollowedUsers(
			currentUserId
		);

		return {
			message: 'Unfollowed',
			users_followed: followedUsers,
		};
	}
}

export const followService = new FollowService();
