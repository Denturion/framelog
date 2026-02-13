import { Types } from 'mongoose';
import { User, IMovie } from '../models/User';
import { connectDB } from '../db/mongoose';

export class MovieRepository {
	async getMoviesByUserId(userId: string): Promise<IMovie[]> {
		await connectDB();

		const user = await User.findById(userId);
		if (!user) {
			throw new Error('User not found');
		}

		return user.movies;
	}

	async addMovie(
		userId: string,
		movieData: {
			movie_id: string;
			title: string;
			year?: string;
			poster_url?: string;
		}
	): Promise<IMovie[]> {
		await connectDB();

		const user = await User.findById(userId);
		if (!user) {
			throw new Error('User not found');
		}

		user.movies.push({
			movie_id: movieData.movie_id,
			title: movieData.title,
			year: movieData.year,
			poster_url: movieData.poster_url,
			rating: null,
			note: '',
			date_added: new Date(),
		});

		await user.save();
		return user.movies;
	}

	async updateMovie(
		userId: string,
		movieId: string,
		updates: { rating?: number; note?: string }
	): Promise<IMovie> {
		await connectDB();

		const user = await User.findById(userId);
		if (!user) {
			throw new Error('User not found');
		}

		const movie = user.movies.find((m) => m._id?.toString() === movieId);
		if (!movie) {
			throw new Error('Movie not found');
		}

		if (updates.rating !== undefined) {
			movie.rating = updates.rating;
		}
		if (updates.note !== undefined) {
			movie.note = updates.note;
		}

		await user.save();
		return movie;
	}

	async deleteMovie(userId: string, movieId: string): Promise<void> {
		await connectDB();

		const user = await User.findById(userId);
		if (!user) {
			throw new Error('User not found');
		}

		// Filter out the movie instead of using pull
		user.movies = user.movies.filter(
			(movie) => movie._id?.toString() !== movieId
		);
		await user.save();
	}

	async getFeed(
		followedUserIds: Types.ObjectId[],
		limit: number = 20
	): Promise<
		Array<{
			owner: { _id: Types.ObjectId; username: string };
			movie: IMovie;
		}>
	> {
		await connectDB();

		if (followedUserIds.length === 0) {
			return [];
		}

		const pipeline: any[] = [
			{
				$match: {
					_id: { $in: followedUserIds },
				},
			},
			{ $project: { username: 1, movies: 1 } },
			{ $unwind: '$movies' },
			{
				$replaceRoot: {
					newRoot: {
						owner: { _id: '$_id', username: '$username' },
						movie: '$movies',
					},
				},
			},
			{ $sort: { 'movie.date_added': -1 } },
			{ $limit: limit },
		];

		const results = await User.aggregate(pipeline);

		return results.map((r) => ({
			owner: r.owner,
			movie: r.movie,
		}));
	}
}

export const movieRepository = new MovieRepository();
