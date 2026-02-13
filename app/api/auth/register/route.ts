import { NextRequest } from 'next/server';
import { authService } from '@/app/lib/services/auth.service';
import { errorResponse } from '@/app/lib/utils/response';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { username, email, password } = body;

		const result = await authService.register({
			username,
			email,
			password,
		});

		const cookieStore = await cookies();
		const isProd = process.env.NODE_ENV === 'production';

		cookieStore.set('token', result.token, {
			httpOnly: true,
			sameSite: isProd ? 'none' : 'lax',
			secure: isProd,
			maxAge: 7 * 24 * 60 * 60,
			path: '/',
		});

		return Response.json(
			{
				message: 'User registered successfully',
				userId: result.userId,
			},
			{ status: 201 }
		);
	} catch (err) {
		const error = err as Error;
		console.error('Register error:', error);

		if (error.message === 'All fields are required') {
			return errorResponse(error.message, 400);
		}
		if (error.message === 'Email already in use.') {
			return errorResponse(error.message, 400);
		}

		return errorResponse('Server error', 500);
	}
}
