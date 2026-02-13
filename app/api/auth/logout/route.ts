import { cookies } from 'next/headers';

export async function POST() {
	try {
		const cookieStore = await cookies();
		const isProd = process.env.NODE_ENV === 'production';

		cookieStore.set('token', '', {
			httpOnly: true,
			sameSite: isProd ? 'none' : 'lax',
			secure: isProd,
			maxAge: 0,
			path: '/',
		});

		return Response.json({ message: 'Logged out' }, { status: 200 });
	} catch (err) {
		console.error('Logout error:', err);
		return Response.json({ message: 'Server error' }, { status: 500 });
	}
}
