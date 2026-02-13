import { movieRepository } from '../repositories/movie.repository';
import { IMovie } from '../models/User';

export class MovieService {
	async getUserMovies(userId: string): Promise<IMovie[]> {
		return movieRepository.getMoviesByUserId(userId);
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
		if (!movieData.movie_id || !movieData.title) {
			throw new Error('Missing required fields');
		}

		return movieRepository.addMovie(userId, movieData);
	}

	async updateMovie(
		userId: string,
		movieId: string,
		updates: { rating?: number; note?: string }
	): Promise<IMovie> {
		return movieRepository.updateMovie(userId, movieId, updates);
	}

	async deleteMovie(userId: string, movieId: string): Promise<void> {
		return movieRepository.deleteMovie(userId, movieId);
	}
}

export const movieService = new MovieService();
