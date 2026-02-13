export function successResponse<T>(data: T, status: number = 200) {
	return Response.json(data, { status });
}

export function errorResponse(message: string, status: number = 500) {
	return Response.json({ message }, { status });
}

export function setCookie(
	response: Response,
	name: string,
	value: string,
	options: {
		httpOnly?: boolean;
		sameSite?: 'lax' | 'strict' | 'none';
		secure?: boolean;
		maxAge?: number;
		path?: string;
	} = {}
): Response {
	const isProd = process.env.NODE_ENV === 'production';

	const cookieOptions = {
		httpOnly: options.httpOnly ?? true,
		sameSite: options.sameSite ?? (isProd ? 'none' : 'lax'),
		secure: options.secure ?? isProd,
		maxAge: options.maxAge ?? 7 * 24 * 60 * 60,
		path: options.path ?? '/',
	};

	const cookieString = `${name}=${value}; HttpOnly=${cookieOptions.httpOnly}; SameSite=${cookieOptions.sameSite}; ${cookieOptions.secure ? 'Secure;' : ''} Max-Age=${cookieOptions.maxAge}; Path=${cookieOptions.path}`;

	response.headers.set('Set-Cookie', cookieString);

	return response;
}

export function clearCookie(response: Response, name: string): Response {
	const isProd = process.env.NODE_ENV === 'production';

	const cookieString = `${name}=; HttpOnly=true; SameSite=${isProd ? 'none' : 'lax'}; ${isProd ? 'Secure;' : ''} Max-Age=0; Path=/`;

	response.headers.set('Set-Cookie', cookieString);

	return response;
}
