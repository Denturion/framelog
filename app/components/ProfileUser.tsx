'use client';

import { useEffect, useState } from 'react';
import MyFullList from '../components/MyFullList';
import { IMovie } from '../interfaces/IMovieInterface';
import { MovieDetailsModal } from '../components/ui/MovieDetailsModal';
import { FollowListModal } from '../components/ui/FollowListModal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import Feed from '@/app/components/Feed';
import {
	getUserMovies,
	UserProfile,
} from '../services/users';
import { followUser, unfollowUser } from '../services/follow';
import { updateMovie, deleteMovie } from '../services/movies';

export default function ProfileClient({ username }: { username: string }) {
	const [owner, setOwner] = useState<UserProfile | null>(null);
	const [movies, setMovies] = useState<IMovie[]>([]);
	const [loading, setLoading] = useState(true);
	const [processingFollow, setProcessingFollow] = useState(false);
	const [selected, setSelected] = useState<IMovie | null>(null);
	const [activeTab, setActiveTab] = useState<'list' | 'home' | 'feed'>('list');
	const [feedRefreshKey, setFeedRefreshKey] = useState(0);
	const [followModal, setFollowModal] = useState<'followers' | 'following' | null>(null);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [movieToRemove, setMovieToRemove] = useState<string | null>(null);

	const handleSaveMovieChanges = async (updated: Partial<IMovie>) => {
		if (!updated._id) return;
		try {
			await updateMovie(updated._id, updated);
			await handleFetchData();
			setSelected(null);
		} catch (err) {
			console.error('Failed to save movie changes', err);
		}
	};

	const handleRequestRemove = (movieId: string) => {
		setMovieToRemove(movieId);
		setConfirmOpen(true);
	};

	const handleConfirmRemove = async () => {
		if (!movieToRemove) return;
		try {
			await deleteMovie(movieToRemove);
			await handleFetchData();
		} catch (err) {
			console.error('Failed to remove movie', err);
		} finally {
			setConfirmOpen(false);
			setMovieToRemove(null);
		}
	};

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

	useEffect(() => {
		handleFetchData();
	}, [username]);

	if (loading) {
		return <p className='text-(--text-muted) p-4'>Loading...</p>;
	}

	if (!owner) {
		return <p className='text-(--text-muted) p-4'>User not found</p>;
	}

	const profileHeader = (
		<header className='flex items-center gap-4 p-4 border-b border-gray-800'>
			<div className='w-12 h-12 rounded-full bg-(--accent-primary) flex items-center justify-center text-lg font-semibold shrink-0'>
				{owner.username?.charAt(0).toUpperCase()}
			</div>
			<div className='flex-1 min-w-0'>
				<div className='flex items-center gap-3'>
					<h2 className='text-xl font-semibold text-(--text-primary)'>
						{owner.username}
					</h2>
					{!owner.is_self && (
						<button
							className={`px-3 py-1.5 rounded text-sm cursor-pointer ${
								owner.is_followed
									? 'bg-(--bg-surface) text-(--text-muted)'
									: 'bg-(--accent-primary) text-black'
							}`}
							onClick={handleToggleFollow}
							disabled={processingFollow}
						>
							{owner.is_followed ? 'Unfollow' : 'Follow'}
						</button>
					)}
				</div>
				<div className='flex items-center gap-4 mt-1'>
					<span className='text-sm text-(--text-muted)'>
						{movies.length} {movies.length === 1 ? 'movie' : 'movies'}
					</span>
					<button
						onClick={() => setFollowModal('followers')}
						className='text-sm text-(--text-muted) hover:text-(--accent-primary) transition cursor-pointer'
					>
						<span className='font-semibold text-(--text-primary)'>{owner.followers_count}</span> followers
					</button>
					<button
						onClick={() => setFollowModal('following')}
						className='text-sm text-(--text-muted) hover:text-(--accent-primary) transition cursor-pointer'
					>
						<span className='font-semibold text-(--text-primary)'>{owner.following_count}</span> following
					</button>
				</div>
			</div>
		</header>
	);

	const profileAbout = (
		<div className='max-w-xl mx-auto text-center py-6'>
			<div className='w-16 h-16 rounded-full bg-(--accent-primary) flex items-center justify-center text-2xl font-semibold mx-auto mb-3'>
				{owner.username?.charAt(0).toUpperCase()}
			</div>
			<h3 className='text-lg font-semibold text-(--text-primary)'>
				{owner.username}
			</h3>
			<div className='flex items-center justify-center gap-6 mt-3'>
				<div className='text-center'>
					<p className='text-lg font-semibold text-(--text-primary)'>{movies.length}</p>
					<p className='text-xs text-(--text-muted)'>movies</p>
				</div>
				<button onClick={() => setFollowModal('followers')} className='text-center cursor-pointer hover:opacity-80 transition'>
					<p className='text-lg font-semibold text-(--text-primary)'>{owner.followers_count}</p>
					<p className='text-xs text-(--text-muted)'>followers</p>
				</button>
				<button onClick={() => setFollowModal('following')} className='text-center cursor-pointer hover:opacity-80 transition'>
					<p className='text-lg font-semibold text-(--text-primary)'>{owner.following_count}</p>
					<p className='text-xs text-(--text-muted)'>following</p>
				</button>
			</div>
			{owner.created_at && (
				<p className='text-xs text-(--text-muted) mt-4'>
					Member since {new Date(owner.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
				</p>
			)}
		</div>
	);

	return (
		<div className='flex flex-col md:h-[calc(100vh-6rem)]'>
			{/* Mobile tab bar */}
			<nav className='md:hidden flex bg-(--bg-deep) border-t border-b'>
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

			<div className='md:flex flex-1 min-h-0'>
				{/* Desktop */}
				<section className='hidden md:flex md:w-3/4 w-full bg-(--bg-primary) flex-col min-h-0'>
					{profileHeader}
					<div className='flex-1 overflow-y-auto p-4 no-scrollbar'>
						<MyFullList movieList={movies} onRemoveRequest={owner.is_self ? handleRequestRemove : undefined} onSelect={(m) => setSelected(m)} />
					</div>
				</section>

				<section className='hidden md:flex md:w-1/4 w-full bg-(--bg-deep) overflow-y-auto rounded-tl-lg'>
					<Feed refreshKey={feedRefreshKey} />
				</section>

				{/* Mobile panels */}
				<div className='block md:hidden h-[calc(100vh-6rem)] overflow-hidden w-full'>
					{activeTab === 'list' && (
						<section className='w-full bg-(--bg-deep) flex flex-col h-full min-h-0'>
							<div className='md:hidden'>{profileHeader}</div>
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
							{profileAbout}
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
				<MovieDetailsModal
					movie={selected}
					onClose={() => setSelected(null)}
					onSave={owner.is_self ? handleSaveMovieChanges : undefined}
				/>
			)}

			<ConfirmModal
				open={confirmOpen}
				title='Remove movie'
				message='Do you really want to remove this movie?'
				onConfirm={handleConfirmRemove}
				onCancel={() => { setConfirmOpen(false); setMovieToRemove(null); }}
			/>

			{followModal && (
				<FollowListModal
					title={followModal === 'followers' ? 'Followers' : 'Following'}
					users={followModal === 'followers' ? owner.followers : owner.following}
					onClose={() => setFollowModal(null)}
				/>
			)}
		</div>
	);
}
