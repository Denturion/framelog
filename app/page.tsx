import Link from 'next/link';

export default function LandingPage() {
	return (
		<main className='min-h-screen flex items-center justify-center bg-(--bg-primary) text-(--text-primary)'>
			<div className='max-w-2xl w-full p-8 text-center'>
				<img src='/logo.png' alt='FrameLog' className='mx-auto h-20 mb-6' />
				<p className='text-(--text-muted) mb-6'>
					Keep track of the movies you love and discover what friends are
					watching.
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
						className='rounded-md border border-gray-700 p-3 text-(--text-primary)'
					>
						Register
					</Link>
				</div>
			</div>
		</main>
	);
}
