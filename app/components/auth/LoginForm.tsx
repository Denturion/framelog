'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { login } from '../../services/auth';
import Input from '../ui/Input';

export default function LoginForm() {
	// State
	const router = useRouter();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	// Handlers
	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		try {
			const res = await login({ username, password });

			if (res.ok) {
				router.replace('/dashboard');
			} else {
				setError('Login failed');
			}
		} catch (err) {
			setError('Server not responding');
		}
	};

	const handleRegisterRedirect = () => {
		router.replace('/register');
	};

	// Render
	return (
		<>
			<form onSubmit={handleLogin} className='flex flex-col gap-4'>
				<h1 className='text-2xl font-bold text-(--text-primary)'>Login</h1>

				<Input
					type='username'
					placeholder='Username'
					value={username}
					onChange={(e) => setUsername(e.target.value)}
				/>

				<Input
					type='password'
					placeholder='Password'
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<div className='flex flex-row justify-center gap-4'>
					<button className='w-full rounded-md bg-(--accent-primary) p-3 font-bold text-(--bg-primary)'>
						Log in
					</button>
				</div>

				{error && <p style={{ color: 'red' }}>{error}</p>}
			</form>
			<div>
				<button
					onClick={handleRegisterRedirect}
					className='w-full mt-3 rounded-md bg-(--accent-primary) p-3 font-bold text-(--bg-primary)'
				>
					Register
				</button>
			</div>
		</>
	);
}
