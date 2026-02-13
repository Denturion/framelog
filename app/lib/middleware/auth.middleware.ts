import { cookies } from 'next/headers';
import { authService } from '../services/auth.service';

export interface AuthUser {
	userId: string;
}

export async function authMiddleware(): Promise<AuthUser> {
	const cookieStore = await cookies();
	const token = cookieStore.get('token')?.value;

	if (!token) {
		throw new Error('No token, authorization denied');
	}

	try {
		const decoded = authService.verifyToken(token);
		return { userId: decoded.userId };
	} catch (err) {
		throw new Error('Token is not valid');
	}
}

export function createAuthError(message: string, status: number = 401) {
	const error = new Error(message) as Error & { status: number };
	error.status = status;
	return error;
}
