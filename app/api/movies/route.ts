import { NextRequest } from 'next/server';
import { authMiddleware } from '@/app/lib/middleware/auth.middleware';
import { movieService } from '@/app/lib/services/movie.service';
import { errorResponse } from '@/app/lib/utils/response';

export async function GET() {
	try {
		const user = await authMiddleware();
		const movies = await movieService.getUserMovies(user.userId);

		return Response.json(movies, { status: 200 });
	} catch (err) {
		const error = err as Error;
		console.error('GET /api/movies error:', error);

		if (
			error.message === 'No token, authorization denied' ||
			error.message === 'Token is not valid'
		) {
			return errorResponse(error.message, 401);
		}

		if (error.message === 'User not found') {
			return errorResponse(error.message, 404);
		}

		return errorResponse('Server error', 500);
	}
}

export async function POST(req: NextRequest) {
	try {
		const user = await authMiddleware();
		const body = await req.json();
		const { movie_id, title, year, poster_url } = body;

		console.log('\n=== POST /api/movies DEBUG ===');
		console.log('user.userId:', user.userId);

		const movies = await movieService.addMovie(user.userId, {
			movie_id,
			title,
			year,
			poster_url,
		});

		console.log('Movies after add:', movies.length);
		console.log('=== END POST DEBUG ===\n');

		return Response.json(movies, { status: 200 });
	} catch (err) {
		const error = err as Error;
		console.error('POST /api/movies error:', error);

		if (
			error.message === 'No token, authorization denied' ||
			error.message === 'Token is not valid'
		) {
			return errorResponse(error.message, 401);
		}

		if (error.message === 'Missing required fields') {
			return errorResponse(error.message, 400);
		}

		if (error.message === 'User not found') {
			return errorResponse(error.message, 404);
		}

		return errorResponse('Server error', 500);
	}
}
