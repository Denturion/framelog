'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getFeed, FeedItem } from '../services/feed';
import { searchUsers } from '../services/follow';

export default function Feed({ refreshKey }: { refreshKey?: number }) {
	// State
	const router = useRouter();
	const inputRef = useRef<HTMLDivElement | null>(null);

	const [items, setItems] = useState<FeedItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [query, setQuery] = useState('');
	const [suggestions, setSuggestions] = useState<
		{ _id: string; username: string }[]
	>([]);
	const [suggestLoading, setSuggestLoading] = useState(false);
	const [suggestError, setSuggestError] = useState<string | null>(null);
	const [suggestVisible, setSuggestVisible] = useState(false);

	// Handlers
	const handleSuggestionClick = (username: string) => {
		router.push(`/users/${encodeURIComponent(username)}`);
		setSuggestions([]);
		setQuery('');
		setSuggestVisible(false);
	};

	const handleOutsideClick = (e: MouseEvent) => {
		if (!inputRef.current) return;
		const clicked = e.target as Node;
		if (!inputRef.current.contains(clicked)) {
			setSuggestions([]);
			setSuggestLoading(false);
			setSuggestError(null);
			setSuggestVisible(false);
		}
	};

	// Effects
	useEffect(() => {
		if (!query.trim()) {
			setSuggestions([]);
			setSuggestError(null);
			setSuggestVisible(false);
			return;
		}

		const timer = setTimeout(async () => {
			setSuggestLoading(true);
			setSuggestError(null);
			setSuggestVisible(true);
			try {
				const data = await searchUsers(query, 8);
				setSuggestions(data);
				setSuggestError(null);
				setSuggestLoading(false);
			} catch (err) {
				console.error('Search error', err);
				setSuggestions([]);
				setSuggestError(String(err));
				setSuggestLoading(false);
			}
		}, 200);

		return () => clearTimeout(timer);
	}, [query]);

	useEffect(() => {
		let mounted = true;
		let controller: AbortController | null = null;
		let initial = true;

		async function fetchFeed() {
			if (initial) setLoading(true);
			try {
				if (controller) controller.abort();
				controller = new AbortController();
				const data = await getFeed(20, controller.signal);
				if (mounted) setItems(data);
			} catch (err: any) {
				if (err && err.name === 'AbortError') return;
				console.error('Fetch feed error', err);
			} finally {
				if (initial) {
					setLoading(false);
					initial = false;
				}
			}
		}

		fetchFeed();
		const intervalId = window.setInterval(fetchFeed, 60000);

		return () => {
			mounted = false;
			if (controller) controller.abort();
			window.clearInterval(intervalId);
		};
	}, [refreshKey]);

	useEffect(() => {
		document.addEventListener('mousedown', handleOutsideClick);
		return () => document.removeEventListener('mousedown', handleOutsideClick);
	}, []);

	// Render
	if (loading) return <div className='p-4'>Loading feed...</div>;

	return (
		<div className='p-4 flex flex-col h-full min-h-0'>
			{/* Fixed header area (no scroll) */}
			<div className='shrink-0'>
				{/* Search */}
				<div ref={inputRef} className='mb-3 relative'>
					<input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						type='text'
						placeholder='Search users...'
						className='w-full bg-(--bg-deep) border border-gray-800 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--accent-primary) text-(--text-primary)'
						aria-label='Search users'
					/>

					{(suggestions.length > 0 || suggestLoading) && (
						<div className='absolute z-50 left-0 right-0 mt-1 bg-(--bg-surface) rounded shadow overflow-hidden'>
							{suggestLoading ? (
								<div className='p-2 text-sm text-(--text-muted)'>
									Searching...
								</div>
							) : (
								<ul>
									{suggestions.map((s) => (
										<li key={s._id}>
											<button
												onClick={() => handleSuggestionClick(s.username)}
												className='w-full text-left p-2 hover:bg-(--bg-deep) text-(--text-primary)'
											>
												{s.username}
											</button>
										</li>
									))}
								</ul>
							)}
						</div>
					)}
				</div>

				{suggestVisible &&
					query.trim() &&
					!suggestLoading &&
					suggestions.length === 0 &&
					!suggestError && (
						<div className='p-2 text-sm text-(--text-muted)'>
							No users found
						</div>
					)}

				{suggestError && (
					<div className='p-2 text-sm text-red-400'>Error: {suggestError}</div>
				)}

				<h2 className='text-(--text-primary) py-4 font-bold text-center'>
					Your friends have recently watched
				</h2>
			</div>

			{/* Scrollable feed list */}
			<div className='flex-1 min-h-0 overflow-y-auto pb-10 no-scrollbar pr-2'>
				{items.length === 0 ? (
					<div className='p-4 text-(--text-muted)'>
						No recent activity from people you follow.
					</div>
				) : (
					<ul className='flex flex-col gap-3'>
						{items.map((it, index) => (
							<li
								key={`${it.owner._id}-${it.movie.movie_id}-${
									it.movie.date_added ?? index
								}`}
								className='flex items-start gap-3'
							>
								{/* Avatar */}
								<button
									className='w-9 h-9 rounded-full bg-(--accent-primary) text-white flex items-center justify-center font-semibold hover:opacity-90 transition cursor-pointer'
									onClick={() => router.push(`/users/${it.owner.username}`)}
								>
									{it.owner.username.charAt(0).toUpperCase()}
								</button>

								<div className='flex-1 min-w-0'>
									<p className='text-sm font-medium text-(--text-primary) line-clamp-2'>
										{it.movie.title}{' '}
										<span className='text-xs text-(--text-muted)'>
											({it.movie.year})
										</span>
									</p>
									<div className='text-xs text-(--text-muted) mt-1 line-clamp-2'>
										{it.movie.rating
											? `★ ${it.movie.rating}/10`
											: 'Not yet rated'}
										{it.movie.note ? ` • ${it.movie.note}` : ''}
									</div>
								</div>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}
