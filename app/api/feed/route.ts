import { NextRequest } from 'next/server';
import { authMiddleware } from '@/app/lib/middleware/auth.middleware';
import { feedService } from '@/app/lib/services/feed.service';
import { errorResponse } from '@/app/lib/utils/response';

export async function GET(req: NextRequest) {
	try {
		const user = await authMiddleware();

		const searchParams = req.nextUrl.searchParams;
		const limit = parseInt(searchParams.get('limit') || '20');

		const feed = await feedService.getFeed(user.userId, limit);

		return Response.json(feed, { status: 200 });
	} catch (err) {
		const error = err as Error;
		console.error('GET /api/feed error:', error);

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
