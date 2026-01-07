'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { register } from '../../services/auth';
import Input from '../ui/Input';
import RegisterModal from '../ui/RegisterModal';

export default function RegisterForm() {
	// State
	const router = useRouter();
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [showModal, setShowModal] = useState(false);
	const [countdown, setCountdown] = useState(3);

	// Handlers
	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		try {
			const res = await register({ username, email, password });

			if (res.ok) {
				setCountdown(3);
				setShowModal(true);
			} else {
				setError('Registration failed');
			}
		} catch (err) {
			setError('Server not responding');
		}
	};

	// Effects
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
	}, [showModal, countdown, router]);

	// Render
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
