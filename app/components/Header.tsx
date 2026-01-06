'use client';

type OmdbMovie = {
	Title: string;
	Year: string;
	imdbID: string;
	Poster: string;
};

type PushMovie = {
	pushMovie?: () => void;
};

import { useEffect, useRef, useState } from 'react';
import { logOut } from '../services/logout';
import { searchMovies } from '../services/search';
import { useRouter } from 'next/navigation';
import Toast from './ui/Toast';

export default function Header({ pushMovie }: PushMovie) {
	const router = useRouter();
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<OmdbMovie[]>([]);
	const [isResultsOpen, setIsResultsOpen] = useState(false);
	const [highlightIndex, setHighlightIndex] = useState<number>(-1);
	const [toastMsg, setToastMsg] = useState<string | null>(null);

	const headerRef = useRef<HTMLDivElement | null>(null);
	const [userInitial, setUserInitial] = useState<string>('U');
	const [username, setUsername] = useState<string | null>(null);

	useEffect(() => {
		async function fetchCurrentUser() {
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/api/protected`,
					{
						credentials: 'include',
					}
				);
				if (!res.ok) return;
				const data = await res.json();
				const id = data.userId;
				if (!id) return;
				const userRes = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/api/users/${encodeURIComponent(
						id
					)}/movies`,
					{ credentials: 'include' }
				);
				if (!userRes.ok) return;
				const userJson = await userRes.json();
				const uname = userJson?.owner?.username;
				if (uname) {
					setUsername(uname);
					setUserInitial(uname.charAt(0).toUpperCase());
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

	// Keyboard navigation for results
	useEffect(() => {
		function onKey(e: KeyboardEvent) {
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
		}

		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, [isResultsOpen, highlightIndex, results]);

	const handleLogout = async () => {
		const res = await logOut();

		if (res.ok) {
			router.replace('/login');
		}
	};

	async function handleAddMovie(r: OmdbMovie) {
		const movie = {
			movie_id: r.imdbID,
			title: r.Title,
			year: r.Year,
			poster_url: r.Poster,
		};

		const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/movies`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify(movie),
		});

		if (res.ok) {
			if (pushMovie) pushMovie();

			setToastMsg('Movie added to your list');
			setTimeout(() => setToastMsg(null), 3000);
		}
	}
	function GoToDashboard() {
		router.replace('/dashboard');
	}

	useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (!headerRef.current) return;

			const clickedElement = e.target as Node;

			if (!headerRef.current.contains(clickedElement)) {
				setIsResultsOpen(false);
			}
		}

		document.addEventListener('mousedown', handleClick);
		return () => {
			document.removeEventListener('mousedown', handleClick);
		};
	}, []);

	function GoToFullList() {
		router.replace('/mylist');
	}

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
						onClick={() => router.push('/')}
						className='h-8 md:h-10 cursor-pointer'
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
					></input>
				</div>
				<div className='flex items-center gap-3 md:gap-6 ml-2'>
					<button
						onClick={() => router.push('/mylist')}
						className='
      text-sm
      text-(--text-muted)
      hover:text-(--text-primary)
      transition
	  cursor-pointer
    '
					>
						My List
					</button>

					<button
						onClick={handleLogout}
						className='
      flex items-center justify-center
      w-9 h-9
      rounded-full
      bg-(--bg-deep)
      text-(--text-muted)
      hover:text-red-400
      hover:bg-red-500/10
      transition
	  cursor-pointer
    '
						aria-label='Log out'
						title='Log out'
					>
						⎋
					</button>

					{/* Avatar circle */}
					<button
						onClick={GoToFullList}
						className='flex items-center justify-center w-9 h-9 rounded-full bg-(--bg-deep) text-(--text-muted) hover:bg-(--bg-deep)/90 transition cursor-pointer'
						aria-label='Open profile'
						title={username ? username : 'Profile'}
					>
						<span className='font-semibold text-(--text-primary)'>
							{userInitial}
						</span>
					</button>
				</div>

				{results.length > 0 && isResultsOpen && (
					<div
						className='absolute
  top-full
  left-0
  w-full
  bg-(--bg-deep)
  p-2
  shadow-xl
  z-50'
					>
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
