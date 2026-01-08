'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
	const router = useRouter();
	const [secondsLeft, setSecondsLeft] = useState(3);

	useEffect(() => {
		const interval = setInterval(() => {
			setSecondsLeft((prev) => Math.max(prev - 1, 0));
		}, 1000);

		const timer = setTimeout(() => {
			router.replace('/');
		}, 3000);

		return () => {
			clearInterval(interval);
			clearTimeout(timer);
		};
	}, [router]);

	return (
		<main className='flex flex-1 flex-col bg-(--bg-deep) justify-center items-center'>
			<h1 className='text-4xl text-(--accent-primary)'>404</h1>
			<p className='text-lg text-(--text-primary)'>Sidan kunde inte hittas.</p>
			<p className='text-lg text-(--text-primary)'>
				Du skickas tillbaka till startsidan om {secondsLeft} sekunder.
			</p>
		</main>
	);
}
