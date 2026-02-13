'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isAuthenticated } from '../isAuthenticated';
import Footer from '../components/Footer';

export default function LandingPage() {
	const router = useRouter();
	const [checkingAuth, setCheckingAuth] = useState(true);

	useEffect(() => {
		isAuthenticated().then((ok) => {
			if (ok) {
				router.replace('/dashboard');
			} else {
				setCheckingAuth(false);
			}
		});
	}, []);

	if (checkingAuth) {
		return <div className='min-h-screen bg-(--bg-primary)' />;
	}

	return (
		<div className='min-h-screen flex flex-col bg-(--bg-primary) text-(--text-primary)'>
			{/* CENTER CONTENT */}
			<div className='flex-1 flex items-center justify-center'>
				<div className='max-w-2xl w-full p-8 text-center'>
					<img src='/logo.png' alt='FrameLog' className='mx-auto h-24 mb-6' />
					<h2 className='text-xl font-bold mb-2 text-(--accent-primary)'>
						Track movies. Share taste. Stay curious.
					</h2>
					<p className='mb-10'>
						FrameLog is a personal movie log where you keep track of what you
						watch, rate films, and write short notes. Follow friends to see what
						they’ve been watching — without noisy feeds or algorithms.
					</p>

					<div className='flex gap-4 justify-center'>
						<Link
							href='/login'
							className='rounded-md bg-(--accent-primary) p-3 font-bold text-(--bg-primary)'
						>
							Log in
						</Link>
						<Link
							href='/register'
							className='rounded-md border border-gray-700 p-3'
						>
							Register
						</Link>
					</div>
				</div>
			</div>

			{/* FOOTER */}
			<Footer />
		</div>
	);
}
