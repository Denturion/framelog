'use client';

import { useEffect, useState } from 'react';
import MyFullList from '../components/MyFullList';
import { IMovie } from '../interfaces/IMovieInterface';
import { MovieDetailsModal } from '../components/ui/MovieDetailsModalFixed';
import Feed from '@/app/components/Feed';

type Owner = {
	_id: string;
	username: string;
	is_followed?: boolean;
};

export default function ProfileClient({ username }: { username: string }) {
	const [owner, setOwner] = useState<Owner | null>(null);
	const [movies, setMovies] = useState<IMovie[]>([]);
	const [loading, setLoading] = useState(true);
	const [processingFollow, setProcessingFollow] = useState(false);
	const [selected, setSelected] = useState<IMovie | null>(null);
	const [activeTab, setActiveTab] = useState<'list' | 'home' | 'feed'>('list');
	const [feedRefreshKey, setFeedRefreshKey] = useState(0);

	async function fetchData() {
		setLoading(true);
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/api/users/${encodeURIComponent(
					username
				)}/movies`,
				{
					credentials: 'include',
				}
			);
			if (res.status === 404) {
				setOwner(null);
				setMovies([]);
				return;
			}
			const data = await res.json();
			setOwner(data.owner);
			setMovies(data.movies || []);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		fetchData();
	}, [username]);

	async function toggleFollow() {
		if (!owner) return;
		setProcessingFollow(true);
		try {
			if (owner.is_followed) {
				await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/api/follow/${encodeURIComponent(
						username
					)}`,
					{
						method: 'DELETE',
						credentials: 'include',
					}
				);
			} else {
				await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/api/follow/${encodeURIComponent(
						username
					)}`,
					{
						method: 'POST',
						credentials: 'include',
					}
				);
			}

			// Refresh owner.follow state
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/api/users/${encodeURIComponent(
					username
				)}/movies`,
				{
					credentials: 'include',
				}
			);
			if (res.ok) {
				const data = await res.json();
				setOwner(data.owner);
				setFeedRefreshKey((k) => k + 1);
			}
		} catch (err) {
			console.error('Follow toggle error', err);
		} finally {
			setProcessingFollow(false);
		}
	}

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
						onClick={toggleFollow}
						disabled={processingFollow}
					>
						{owner.is_followed ? 'Unfollow' : 'Follow'}
					</button>
				</div>
			</header>

			{/* Responsive layout: desktop three columns, mobile tabs */}
			<nav className='md:hidden flex bg-(--bg-deep) border-t border-b mb-2'>
				<button
					className={`flex-1 p-3 text-center ${
						activeTab === 'list' ? 'font-semibold' : ''
					}`}
					onClick={() => setActiveTab('list')}
				>
					List
				</button>
				<button
					className={`flex-1 p-3 text-center ${
						activeTab === 'home' ? 'font-semibold' : ''
					}`}
					onClick={() => setActiveTab('home')}
				>
					About
				</button>
				<button
					className={`flex-1 p-3 text-center ${
						activeTab === 'feed' ? 'font-semibold' : ''
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
