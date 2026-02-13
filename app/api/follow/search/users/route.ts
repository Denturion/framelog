import { NextRequest } from 'next/server';
import { authMiddleware } from '@/app/lib/middleware/auth.middleware';
import { followService } from '@/app/lib/services/follow.service';
import { errorResponse } from '@/app/lib/utils/response';

export async function GET(req: NextRequest) {
	try {
		await authMiddleware();

		const searchParams = req.nextUrl.searchParams;
		const q = searchParams.get('q') || '';
		const limit = parseInt(searchParams.get('limit') || '10');

		const users = await followService.searchUsers(q, limit);

		return Response.json(users, { status: 200 });
	} catch (err) {
		const error = err as Error;
		console.error('GET /api/follow/search/users error:', error);

		if (
			error.message === 'No token, authorization denied' ||
			error.message === 'Token is not valid'
		) {
			return errorResponse(error.message, 401);
		}

		return errorResponse('Server error', 500);
	}
}
