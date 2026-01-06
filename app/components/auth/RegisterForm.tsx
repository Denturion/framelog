'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Input from '../ui/Input';
import RegisterModal from '../ui/RegisterModal';

export default function RegisterForm() {
	const router = useRouter();
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [showModal, setShowModal] = useState(false);
	const [countdown, setCountdown] = useState(3);

	async function handleRegister(e: React.FormEvent) {
		e.preventDefault();
		setError('');

		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					credentials: 'include',
					body: JSON.stringify({ username, email, password }),
				}
			);

			if (res.ok) {
				setCountdown(3);
				setShowModal(true);
			}

			if (!res.ok) setError('Registration failed');
			return;
		} catch (err) {
			setError('Server not responding');
		}
	}

	useEffect(() => {
		if (!showModal) return;

		if (countdown === 0) {
			router.replace('/dashboard');
			return;
		}

		const timer = setTimeout(() => {
			setCountdown((prev) => prev - 1);
		}, 1000);

		return () => clearTimeout(timer);
	}, [showModal, countdown]);

	return (
		<>
			<form onSubmit={handleRegister} className='flex flex-col gap-4'>
				<h1 className='text-2xl font-bold text-(--text-primary)'>Register</h1>
				<Input
					type='username'
					placeholder='Username'
					value={username}
					onChange={(e) => setUsername(e.target.value)}
				/>
				<Input
					type='email'
					placeholder='Email'
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<Input
					type='password'
					placeholder='Password'
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>

				<button className='rounded-md bg-(--accent-primary) p-3 font-bold text-(--bg-primary)'>
					Register
				</button>
				{error && <p style={{ color: 'red' }}>{error}</p>}
			</form>

			{showModal && (
				<RegisterModal message='Registration complete!' countdown={countdown} />
			)}
		</>
	);
}
