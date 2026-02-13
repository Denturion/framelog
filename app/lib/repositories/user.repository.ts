import { Types } from 'mongoose';
import { User, IUser } from '../models/User';
import { connectDB } from '../db/mongoose';

export class UserRepository {
	async findById(userId: string): Promise<IUser | null> {
		await connectDB();
		return User.findById(userId);
	}

	async findByEmail(email: string): Promise<IUser | null> {
		await connectDB();
		return User.findOne({ email });
	}

	async findByUsername(username: string): Promise<IUser | null> {
		await connectDB();
		return User.findOne({ username });
	}

	async findByIdOrUsername(identifier: string): Promise<IUser | null> {
		await connectDB();

		if (Types.ObjectId.isValid(identifier)) {
			const user = await User.findById(identifier);
			if (user) return user;
		}

		return User.findOne({ username: identifier });
	}

	async create(userData: {
		username: string;
		email: string;
		password_hash: string;
	}): Promise<IUser> {
		await connectDB();
		const newUser = new User(userData);
		return newUser.save();
	}

	async searchByUsername(
		query: string,
		limit: number = 10
	): Promise<Array<{ _id: Types.ObjectId; username: string }>> {
		await connectDB();

		const regex = new RegExp(
			query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
			'i'
		);

		const users = await User.find({
			username: { $regex: regex },
		})
			.select('username')
			.limit(limit);

		return users.map((u) => ({ _id: u._id, username: u.username }));
	}

	async addFollowing(
		currentUserId: string,
		targetUserId: Types.ObjectId
	): Promise<void> {
		await connectDB();

		const currentUser = await User.findById(currentUserId);
		const targetUser = await User.findById(targetUserId);

		if (!currentUser || !targetUser) {
			throw new Error('User not found');
		}

		if (
			!currentUser.users_followed.some((id) => id.equals(targetUserId))
		) {
			currentUser.users_followed.push(targetUserId);
		}

		if (
			!targetUser.followers.some((id) =>
				id.equals(new Types.ObjectId(currentUserId))
			)
		) {
			targetUser.followers.push(new Types.ObjectId(currentUserId));
		}

		await currentUser.save();
		await targetUser.save();
	}

	async removeFollowing(
		currentUserId: string,
		targetUserId: Types.ObjectId
	): Promise<void> {
		await connectDB();

		const currentUser = await User.findById(currentUserId);
		const targetUser = await User.findById(targetUserId);

		if (!currentUser || !targetUser) {
			throw new Error('User not found');
		}

		currentUser.users_followed = currentUser.users_followed.filter(
			(id) => !id.equals(targetUserId)
		);

		targetUser.followers = targetUser.followers.filter(
			(id) => !id.equals(new Types.ObjectId(currentUserId))
		);

		await currentUser.save();
		await targetUser.save();
	}

	async getFollowedUsers(userId: string): Promise<Types.ObjectId[]> {
		await connectDB();

		const user = await User.findById(userId).select('users_followed');
		return user?.users_followed || [];
	}

	async isFollowing(
		currentUserId: string,
		targetUserId: Types.ObjectId
	): Promise<boolean> {
		await connectDB();

		const currentUser = await User.findById(currentUserId).select(
			'users_followed'
		);

		if (!currentUser) return false;

		return currentUser.users_followed.some((id) => id.equals(targetUserId));
	}
}

export const userRepository = new UserRepository();
