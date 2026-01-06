'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Input from '../ui/Input';

export default function LoginForm() {
	const router = useRouter();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	async function handleLogin(e: React.FormEvent) {
		e.preventDefault();
		setError('');

		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					credentials: 'include',
					body: JSON.stringify({ username, password }),
				}
			);

			if (res.ok) {
				router.replace('/dashboard');
			}

			if (!res.ok) {
				setError('Login failed');
				return;
			}
		} catch (err) {
			setError('Server not responding');
		}
	}

	function registerRedirect() {
		router.replace('/register');
	}

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
				<div className=' flex flex-row justify-center gap-4'>
					<button className='w-full rounded-md bg-(--accent-primary) p-3 font-bold text-(--bg-primary)'>
						Log in
					</button>
				</div>

				{error && <p style={{ color: 'red' }}>{error}</p>}
			</form>
			<div>
				<button
					onClick={registerRedirect}
					className='w-full mt-3 rounded-md bg-(--accent-primary) p-3 font-bold text-(--bg-primary)'
				>
					Register
				</button>
			</div>
		</>
	);
}
