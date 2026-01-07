'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logOut } from '../services/logout';
import { searchMovies } from '../services/search';
import { addMovie } from '../services/movies';
import { getCurrentUser } from '../services/auth';
import { getCurrentUserProfile } from '../services/users';
import { isAuthenticated } from '../isAuthenticated';
import Toast from './ui/Toast';

type OmdbMovie = {
	Title: string;
	Year: string;
	imdbID: string;
	Poster: string;
};

type PushMovie = {
	pushMovie?: () => void;
};

export default function Header({ pushMovie }: PushMovie) {
	// State
	const router = useRouter();
	const headerRef = useRef<HTMLDivElement | null>(null);

	const [userInitial, setUserInitial] = useState<string>('');
	const [username, setUsername] = useState<string | null>(null);
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<OmdbMovie[]>([]);
	const [isResultsOpen, setIsResultsOpen] = useState(false);
	const [highlightIndex, setHighlightIndex] = useState<number>(-1);
	const [toastMsg, setToastMsg] = useState<string | null>(null);

	// Handlers
	const handleLogout = async () => {
		const res = await logOut();
		if (res.ok) {
			router.replace('/');
		}
	};

	const handleAddMovie = async (r: OmdbMovie) => {
		try {
			const movie = {
				movie_id: r.imdbID,
				title: r.Title,
				year: r.Year,
				poster_url: r.Poster,
			};
			await addMovie(movie);
			if (pushMovie) pushMovie();
			setToastMsg('Movie added to your list');
			setTimeout(() => setToastMsg(null), 3000);
		} catch (err) {
			console.error('Failed to add movie', err);
		}
	};

	const handleKeyboardNavigation = (e: KeyboardEvent) => {
		if (!isResultsOpen) return;
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			setHighlightIndex((i) => Math.min(i + 1, results.length - 1));
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			setHighlightIndex((i) => Math.max(i - 1, 0));
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (highlightIndex >= 0 && highlightIndex < results.length) {
				handleAddMovie(results[highlightIndex]);
			}
		}
	};

	const handleOutsideClick = (e: MouseEvent) => {
		if (!headerRef.current) return;
		const clickedElement = e.target as Node;
		if (!headerRef.current.contains(clickedElement)) {
			setIsResultsOpen(false);
		}
	};

	// Effects
	useEffect(() => {
		async function fetchCurrentUser() {
			try {
				const userData = await getCurrentUser();
				if (!userData?.userId) return;
				const userProfile = await getCurrentUserProfile(userData.userId);
				if (userProfile?.owner?.username) {
					setUsername(userProfile.owner.username);
					setUserInitial(userProfile.owner.username.charAt(0).toUpperCase());
				}
			} catch (e) {
				// ignore
			}
		}
		fetchCurrentUser();
	}, []);

	useEffect(() => {
		if (!query) {
			setResults([]);
			return;
		}

		const controller = new AbortController();
		const timer = setTimeout(() => {
			async function fetchData() {
				try {
					const movies = await searchMovies(query, {
						signal: controller.signal,
					});
					setResults(movies);
					setIsResultsOpen(true);
					setHighlightIndex(-1);
				} catch (err: any) {
					if (err.name === 'AbortError') return;
					console.error('Search error', err);
				}
			}
			fetchData();
		}, 200);

		return () => {
			controller.abort();
			clearTimeout(timer);
		};
	}, [query]);

	useEffect(() => {
		document.addEventListener('keydown', handleKeyboardNavigation);
		return () =>
			document.removeEventListener('keydown', handleKeyboardNavigation);
	}, [isResultsOpen, highlightIndex, results]);

	useEffect(() => {
		document.addEventListener('mousedown', handleOutsideClick);
		return () => document.removeEventListener('mousedown', handleOutsideClick);
	}, []);

	// Render
	return (
		<>
			<header
				ref={headerRef}
				className='sticky top-0 w-full h-16 md:h-24 px-4 md:px-20 flex items-center bg-(--bg-primary) text-(--text-primary) z-100'
			>
				<div className='shrink-0'>
					<img
						src='/logo.png'
						alt='FrameLog'
						className='h-8 md:h-10 cursor-pointer'
						onClick={async () => {
							const loggedIn = await isAuthenticated();
							router.push(loggedIn ? '/dashboard' : '/');
						}}
					/>
				</div>
				<div className='flex-1 flex justify-center px-2'>
					<input
						onFocus={() => {
							if (results.length > 0) {
								setIsResultsOpen(true);
							}
						}}
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						type='text'
						aria-label='Search movies to add'
						placeholder='Search...'
						className='w-full max-w-xs md:max-w-l bg-(--bg-deep) border border-gray-800 focus:border-(--accent-primary) focus:outline-none rounded-xl p-1 pl-4 pr-4'
					/>
				</div>
				<div className='flex items-center gap-3 md:gap-6 ml-2'>
					<button
						onClick={() => router.push('/mylist')}
						className='flex items-center justify-center w-12 h-12 rounded-full bg-(--bg-deep) hover:bg-(--bg-surface) hover:text-(--accent-primary) transition cursor-pointer'
						aria-label='Open profile'
						title={username ? username : 'Profile'}
					>
						<span className='font-semibold '>{userInitial}</span>
					</button>
					<button
						onClick={handleLogout}
						className='flex items-center justify-center w-10 h-10 rounded-full bg-(--text-muted)   text-red-400 hover:text-(--text-muted) hover:bg-red-700 transition cursor-pointer'
						aria-label='Log out'
						title='Log out'
					>
						⎋
					</button>
				</div>

				{results.length > 0 && isResultsOpen && (
					<div className='absolute top-full left-0 w-full bg-(--bg-deep) p-2 shadow-xl z-50'>
						<div className='flex no-scrollbar gap-2 justify-center'>
							{results.map((r, idx) => (
								<button
									key={r.imdbID}
									onClick={() => handleAddMovie(r)}
									className={`shrink-0 transition-transform duration-200 focus:outline-none ${
										highlightIndex === idx
											? 'ring-2 ring-(--accent-primary) scale-105'
											: 'hover:scale-105'
									}`}
									aria-label={`Add ${r.Title} to your list`}
								>
									<img
										src={r.Poster !== 'N/A' ? r.Poster : '/placeholder.png'}
										alt={r.Title}
										className='w-24 h-36 object-cover rounded-lg'
									/>
								</button>
							))}
						</div>
					</div>
				)}

				{toastMsg && <Toast message={toastMsg} />}
			</header>
		</>
	);
}
