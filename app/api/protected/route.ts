import { authMiddleware } from '@/app/lib/middleware/auth.middleware';
import { errorResponse } from '@/app/lib/utils/response';

export async function GET() {
	try {
		const user = await authMiddleware();

		return Response.json(
			{
				message: 'You are authorized',
				userId: user.userId,
			},
			{ status: 200 }
		);
	} catch (err) {
		const error = err as Error;
		console.error('GET /api/protected error:', error);

		if (
			error.message === 'No token, authorization denied' ||
			error.message === 'Token is not valid'
		) {
			return errorResponse(error.message, 401);
		}

		return errorResponse('Server error', 500);
	}
}
