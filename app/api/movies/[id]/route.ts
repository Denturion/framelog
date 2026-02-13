import { NextRequest } from 'next/server';
import { authMiddleware } from '@/app/lib/middleware/auth.middleware';
import { movieService } from '@/app/lib/services/movie.service';
import { errorResponse } from '@/app/lib/utils/response';

export async function PUT(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const user = await authMiddleware();
		const { id } = await params;
		const body = await req.json();
		const { rating, note } = body;

		console.log('\n=== PUT /api/movies/:id DEBUG ===');
		console.log('user.userId:', user.userId);
		console.log('params.id:', id);

		const movie = await movieService.updateMovie(user.userId, id, {
			rating,
			note,
		});

		console.log('Movie updated:', movie.title);
		console.log('=== END PUT DEBUG ===\n');

		return Response.json(movie, { status: 200 });
	} catch (err) {
		const error = err as Error;
		console.error('PUT /api/movies/:id error:', error);

		if (
			error.message === 'No token, authorization denied' ||
			error.message === 'Token is not valid'
		) {
			return errorResponse(error.message, 401);
		}

		if (
			error.message === 'User not found' ||
			error.message === 'Movie not found'
		) {
			return errorResponse(error.message, 404);
		}

		return errorResponse('Server error', 500);
	}
}

export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const user = await authMiddleware();
		const { id } = await params;

		console.log('\n=== DELETE /api/movies/:id DEBUG ===');
		console.log('user.userId:', user.userId);
		console.log('params.id:', id);

		await movieService.deleteMovie(user.userId, id);

		console.log('Movie removed successfully');
		console.log('=== END DELETE DEBUG ===\n');

		return new Response(null, { status: 204 });
	} catch (err) {
		const error = err as Error;
		console.error('DELETE /api/movies/:id error:', error);

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
