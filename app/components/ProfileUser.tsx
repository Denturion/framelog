'use client';

import { useEffect, useState } from 'react';
import MyFullList from '../components/MyFullList';
import { IMovie } from '../interfaces/IMovieInterface';
import { MovieDetailsModal } from '../components/ui/MovieDetailsModalFixed';
import Feed from '@/app/components/Feed';
import {
	getUserMovies,
	UserProfile,
	UserMoviesResponse,
} from '../services/users';
import { followUser, unfollowUser } from '../services/follow';

export default function ProfileClient({ username }: { username: string }) {
	// State
	const [owner, setOwner] = useState<UserProfile | null>(null);
	const [movies, setMovies] = useState<IMovie[]>([]);
	const [loading, setLoading] = useState(true);
	const [processingFollow, setProcessingFollow] = useState(false);
	const [selected, setSelected] = useState<IMovie | null>(null);
	const [activeTab, setActiveTab] = useState<'list' | 'home' | 'feed'>('list');
	const [feedRefreshKey, setFeedRefreshKey] = useState(0);

	// Handlers
	const handleFetchData = async () => {
		setLoading(true);
		try {
			const data = await getUserMovies(username);
			if (!data) {
				setOwner(null);
				setMovies([]);
			} else {
				setOwner(data.owner);
				setMovies(data.movies || []);
			}
		} catch (err) {
			console.error('Failed to fetch user data', err);
		} finally {
			setLoading(false);
		}
	};

	const handleToggleFollow = async () => {
		if (!owner) return;
		setProcessingFollow(true);
		try {
			if (owner.is_followed) {
				await unfollowUser(username);
			} else {
				await followUser(username);
			}

			// Refresh owner follow state
			const data = await getUserMovies(username);
			if (data) {
				setOwner(data.owner);
				setFeedRefreshKey((k) => k + 1);
			}
		} catch (err) {
			console.error('Follow toggle error', err);
		} finally {
			setProcessingFollow(false);
		}
	};

	// Effects
	useEffect(() => {
		handleFetchData();
	}, [username]);

	// Render
	if (loading) {
		return <p className='text-(--text-muted)'>Loading...</p>;
	}

	if (!owner) {
		return <p className='text-(--text-muted)'>User not found</p>;
	}

	return (
		<div className='space-y-6'>
			<header className='flex items-center gap-4'>
				<div className='w-12 h-12 rounded-full bg-(--accent-primary) flex items-center justify-center text-lg font-semibold'>
					{owner.username?.charAt(0).toUpperCase()}
				</div>
				<div className='flex items-center gap-3'>
					<div>
						<h2 className='text-xl font-semibold text-(--text-primary)'>
							{owner.username}
						</h2>
						<p className='text-(--text-muted) text-sm'>Public profile</p>
					</div>

					<button
						className={`px-4 py-2 rounded text-sm ${
							owner.is_followed
								? 'bg-(--bg-surface) text-(--text-muted)'
								: 'bg-(--accent-primary)'
						}`}
						onClick={handleToggleFollow}
						disabled={processingFollow}
					>
						{owner.is_followed ? 'Unfollow' : 'Follow'}
					</button>
				</div>
			</header>

			{/* Responsive layout: desktop three columns, mobile tabs */}
			<nav className='md:hidden flex bg-(--bg-deep) border-t border-b mb-2'>
				<button
					className={`flex-1 p-3 text-center font-semibold ${
						activeTab === 'list'
							? ' text-(--accent-primary)'
							: 'text-(--text-primary)'
					}`}
					onClick={() => setActiveTab('list')}
				>
					List
				</button>
				<button
					className={`flex-1 p-3 text-center font-semibold ${
						activeTab === 'home'
							? ' text-(--accent-primary)'
							: 'text-(--text-primary)'
					}`}
					onClick={() => setActiveTab('home')}
				>
					About
				</button>
				<button
					className={`flex-1 p-3 text-center font-semibold ${
						activeTab === 'feed'
							? ' text-(--accent-primary)'
							: 'text-(--text-primary)'
					}`}
					onClick={() => setActiveTab('feed')}
				>
					Feed
				</button>
			</nav>

			<div className='md:flex md:h-[calc(100vh-6rem)] flex-1 min-h-0 w-full overflow-hidden  pb-20'>
				{/* Desktop columns */}
				<section className='hidden md:flex md:w-3/4 w-full bg-(--bg-primary) flex-col min-h-0'>
					<div className='flex-1 overflow-y-auto p-4 no-scrollbar'>
						<MyFullList movieList={movies} onSelect={(m) => setSelected(m)} />
					</div>
				</section>

				<section className='hidden md:flex md:w-1/4 w-full bg-(--bg-deep) overflow-y-auto rounded-tl-lg'>
					<Feed refreshKey={feedRefreshKey} />
				</section>

				{/* Mobile panels */}
				<div className='block md:hidden h-[calc(100vh-6rem)] overflow-hidden w-full'>
					{activeTab === 'list' && (
						<section className='w-full bg-(--bg-primary) flex flex-col h-full min-h-0'>
							<div className='flex-1 overflow-y-auto p-4 no-scrollbar'>
								<MyFullList
									movieList={movies}
									onSelect={(m) => setSelected(m)}
								/>
							</div>
						</section>
					)}
					{activeTab === 'home' && (
						<section className='w-full bg-(--bg-primary) p-4 h-full overflow-auto'>
							<div className='max-w-xl mx-auto text-center'>
								<h3 className='text-lg font-semibold text-(--text-primary)'>
									{owner.username}
								</h3>
								<p className='text-(--text-muted)'>Public profile</p>
							</div>
						</section>
					)}
					{activeTab === 'feed' && (
						<section className='w-full bg-(--bg-deep) p-4 h-full overflow-auto'>
							<Feed />
						</section>
					)}
				</div>
			</div>

			{selected && (
				<MovieDetailsModal movie={selected} onClose={() => setSelected(null)} />
			)}
		</div>
	);
}
