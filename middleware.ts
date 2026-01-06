import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
	const token = req.cookies.get('token')?.value;
	const { pathname } = req.nextUrl;

	const isDashboardRoute = pathname.startsWith('/dashboard');
	const isAuthRoute = pathname === '/' || pathname === '/register';

	// ❌ EJ inloggad → får bara vara på auth-sidor
	if (!token && !isAuthRoute) {
		return NextResponse.redirect(new URL('/', req.url));
	}

	// ✅ Inloggad → får ALDRIG vara på auth-sidor
	if (token && isAuthRoute) {
		return NextResponse.redirect(new URL('/dashboard', req.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/((?!api|_next|favicon.ico).*)'],
};
