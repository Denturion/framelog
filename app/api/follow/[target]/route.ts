import { NextRequest } from 'next/server';
import { authMiddleware } from '@/app/lib/middleware/auth.middleware';
import { followService } from '@/app/lib/services/follow.service';
import { errorResponse } from '@/app/lib/utils/response';

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ target: string }> }
) {
	try {
		const user = await authMiddleware();
		const { target } = await params;

		const result = await followService.followUser(user.userId, target);

		return Response.json(result, { status: 200 });
	} catch (err) {
		const error = err as Error;
		console.error('POST /api/follow/:target error:', error);

		if (
			error.message === 'No token, authorization denied' ||
			error.message === 'Token is not valid'
		) {
			return errorResponse(error.message, 401);
		}

		if (error.message === 'User not found') {
			return errorResponse(error.message, 404);
		}

		if (error.message === "You can't follow yourself") {
			return errorResponse(error.message, 400);
		}

		return errorResponse('Server error', 500);
	}
}

export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ target: string }> }
) {
	try {
		const user = await authMiddleware();
		const { target } = await params;

		const result = await followService.unfollowUser(user.userId, target);

		return Response.json(result, { status: 200 });
	} catch (err) {
		const error = err as Error;
		console.error('DELETE /api/follow/:target error:', error);

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
