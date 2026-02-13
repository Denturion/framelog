import { authMiddleware } from '@/app/lib/middleware/auth.middleware';
import { userService } from '@/app/lib/services/user.service';
import { errorResponse } from '@/app/lib/utils/response';

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ identifier: string }> },
) {
	try {
		const user = await authMiddleware();
		const { identifier } = await params;

		const result = await userService.getUserMoviesWithOwner(
			identifier,
			user.userId,
		);

		return Response.json(result, { status: 200 });
	} catch (err) {
		const error = err as Error;
		console.error('GET /api/users/[identifier]/movies error:', error);

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
