import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository';

const JWT_SECRET = process.env.JWT_SECRET || '';

if (!JWT_SECRET) {
	throw new Error('Please define the JWT_SECRET environment variable');
}

export class AuthService {
	async register(data: {
		username: string;
		email: string;
		password: string;
	}): Promise<{ userId: string; token: string }> {
		if (!data.username || !data.email || !data.password) {
			throw new Error('All fields are required');
		}

		const existingUser = await userRepository.findByEmail(data.email);
		if (existingUser) {
			throw new Error('Email already in use.');
		}

		const salt = await bcrypt.genSalt(10);
		const password_hash = await bcrypt.hash(data.password, salt);

		const newUser = await userRepository.create({
			username: data.username,
			email: data.email,
			password_hash,
		});

		const token = jwt.sign({ userId: newUser._id.toString() }, JWT_SECRET, {
			expiresIn: '7d',
		});

		return {
			userId: newUser._id.toString(),
			token,
		};
	}

	async login(data: {
		username: string;
		password: string;
	}): Promise<{ userId: string; username: string; token: string }> {
		if (!data.username || !data.password) {
			throw new Error('All fields are required');
		}

		const user = await userRepository.findByUsername(data.username);
		if (!user) {
			throw new Error('Invalid credentials');
		}

		const isMatch = await bcrypt.compare(data.password, user.password_hash);
		if (!isMatch) {
			throw new Error('Invalid credentials');
		}

		const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, {
			expiresIn: '7d',
		});

		return {
			userId: user._id.toString(),
			username: user.username,
			token,
		};
	}

	verifyToken(token: string): { userId: string } {
		try {
			const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
			return decoded;
		} catch (err) {
			throw new Error('Token is not valid');
		}
	}
}

export const authService = new AuthService();
