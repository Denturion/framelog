'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Feed from '../../components/Feed';
import Header from '../../components/Header';
import MyList from '../../components/MyList';
import { IMovie } from '../../interfaces/IMovieInterface';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { MovieDetailsModal } from '../../components/ui/MovieDetailsModal';
import { FollowListModal } from '../../components/ui/FollowListModal';
import { requireAuth } from '../../requireAuth';
import { getMyMovies, updateMovie, deleteMovie } from '../../services/movies';
import { getCurrentUser } from '../../services/auth';
import { getCurrentUserProfile, UserProfile, FollowUser } from '../../services/users';
import Footer from '../../components/Footer';
import { TutorialOverlay, TutorialStep, useTutorial } from '../../components/ui/TutorialOverlay';

export default function DashboardPage() {
	// State
	const router = useRouter();
	const [movies, setMovies] = useState<IMovie[]>([]);
	const [loadingMovies, setLoadingMovies] = useState(true);
	const [updateList, setUpdateList] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [movieToRemove, setMovieToRemove] = useState<string | null>(null);
	const [selectedMovie, setSelectedMovie] = useState<IMovie | null>(null);
	const [activeTab, setActiveTab] = useState<'list' | 'home' | 'feed'>('list');
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [followModal, setFollowModal] = useState<'followers' | 'following' | null>(null);

	// Tutorial refs
	const myListRef = useRef<HTMLElement>(null);
	const centerRef = useRef<HTMLElement>(null);
	const feedRef = useRef<HTMLElement>(null);
	const searchRef = useRef<HTMLDivElement>(null);
	const { showTutorial, dismissTutorial } = useTutorial();

	const tutorialSteps: TutorialStep[] = [
		{
			targetRef: myListRef,
			title: 'Your Movie List',
			description: 'This is where your watched movies appear. You can click on any movie to rate it or add a note.',
			position: 'right',
		},
		{
			targetRef: centerRef,
			title: 'Your Dashboard',
			description: 'Your personal stats and activity overview. See how many movies you\'ve watched, your average rating, and who follows you.',
		},
		{
			targetRef: feedRef,
			title: 'Friend Activity',
			description: 'See what movies the people you follow have been watching recently. You can also search for other users here.',
			position: 'left',
		},
		{
			targetRef: searchRef,
			title: 'Search for Movies',
			description: 'Use this search bar to find movies and add them to your list. Try searching for your favorite film!',
			position: 'bottom',
		},
	];

	// Handlers
	const handleOpenDetail = (movie: IMovie) => {
		setSelectedMovie(movie);
	};

	const handleCloseDetails = () => {
		setSelectedMovie(null);
	};

	const handleSaveMovieChanges = async (updated: Partial<IMovie>) => {
		try {
			if (!updated._id) return;
			await updateMovie(updated._id, updated);
			notifyListChanged();
			handleCloseDetails();
		} catch (err) {
			console.error('Failed to save movie changes', err);
		}
	};

	const handleRequestRemove = (_Id: string) => {
		setMovieToRemove(_Id);
		setConfirmOpen(true);
	};

	const handleConfirmRemove = async () => {
		if (!movieToRemove) return;

		try {
			await deleteMovie(movieToRemove);
			notifyListChanged();
		} catch (err) {
			console.error('Failed to remove movie', err);
		} finally {
			setConfirmOpen(false);
			setMovieToRemove(null);
		}
	};

	const handleCancelRemove = () => {
		setConfirmOpen(false);
		setMovieToRemove(null);
	};

	const notifyListChanged = () => {
		setUpdateList((prev) => !prev);
	};

	const handleGoToFullList = () => {
		router.replace('/mylist');
	};

	// Effects
	useEffect(() => {
		requireAuth().then((ok) => {
			if (!ok) {
				router.push('/login');
			}
		});
	}, [router]);

	useEffect(() => {
		async function fetchMovies() {
			setLoadingMovies(true);
			try {
				const data = await getMyMovies();
				setMovies(data);
			} catch (err) {
				console.error('Failed to fetch movies', err);
			} finally {
				setLoadingMovies(false);
			}
		}
		fetchMovies();
	}, [updateList]);

	useEffect(() => {
		async function fetchProfile() {
			try {
				const userData = await getCurrentUser();
				if (!userData?.userId) return;
				const data = await getCurrentUserProfile(userData.userId);
				if (data?.owner) setProfile(data.owner);
			} catch {
				// ignore
			}
		}
		fetchProfile();
	}, [updateList]);

	// Render
	return (
		<>
			<Header pushMovie={notifyListChanged} searchRef={searchRef} />
			<main className='flex flex-col md:h-[calc(100vh-6rem)] '>
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
						My List
					</button>
					<button
						className={`flex-1 p-3 text-center font-semibold ${
							activeTab === 'home'
								? ' text-(--accent-primary)'
								: 'text-(--text-primary)'
						}`}
						onClick={() => setActiveTab('home')}
					>
						Dashboard
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
					{/* Desktop: three-column layout */}
					<section ref={myListRef} className='hidden md:flex md:w-3/12 min-w-[350px] w-full bg-(--bg-deep) flex-col rounded-tr-lg'>
						<div className='flex p-6 text-center items-center justify-between'>
							<h2 className='text-lg font-semibold text-(--text-primary)'>
								My List
							</h2>
							<span className='text-sm text-(--text-muted)'>
								{movies.length === 0
									? 'No movies yet'
									: `${movies.length} ${
											movies.length === 1 ? 'movie' : 'movies'
									  }`}
							</span>
						</div>

						<div className='flex-1 overflow-y-auto p-2 no-scrollbar'>
							<MyList
								movieList={movies}
								onRemoveRequest={handleRequestRemove}
								onSelect={handleOpenDetail}
							/>
						</div>
					</section>

					<section ref={centerRef} className='hidden md:flex flex-1 w-full bg-(--bg-primary) p-6 md:p-8 overflow-y-auto no-scrollbar flex-col'>
						<DashboardCenter
							profile={profile}
							movies={movies}
							onGoToFullList={handleGoToFullList}
							onOpenFollowModal={setFollowModal}
						/>
					</section>

					<section ref={feedRef} className='hidden md:flex md:w-3/12 w-full bg-(--bg-deep) overflow-y-auto rounded-tl-lg'>
						<Feed />
					</section>
				</div>

				{/* Mobile content area (shows only the active tab) */}
				<div className='block md:hidden h-[calc(100vh-6rem)] overflow-hidden'>
					{activeTab === 'list' && (
						<section className='w-full bg-(--bg-deep) flex flex-col h-full min-h-0'>
							<div className='flex p-4 text-center items-center justify-between'>
								<h2 className='text-lg font-semibold text-(--text-primary)'>
									My List
								</h2>
								<span className='text-sm text-(--text-muted)'>
									{movies.length === 0
										? 'No movies yet'
										: `${movies.length} ${movies.length === 1 ? 'movie' : 'movies'}`}
								</span>
							</div>
							<div className='flex-1 overflow-y-auto p-4 no-scrollbar'>
								<MyList
									movieList={movies}
									onRemoveRequest={handleRequestRemove}
									onSelect={handleOpenDetail}
								/>
							</div>
						</section>
					)}
					{activeTab === 'home' && (
						<section className='w-full bg-(--bg-primary) p-4 h-full overflow-auto'>
							<DashboardCenter
								profile={profile}
								movies={movies}
								onGoToFullList={handleGoToFullList}
								onOpenFollowModal={setFollowModal}
							/>
						</section>
					)}
					{activeTab === 'feed' && (
						<section className='w-full bg-(--bg-deep) p-4 h-full overflow-auto'>
							<Feed />
						</section>
					)}
				</div>
			</main>
			<Footer />
			<ConfirmModal
				open={confirmOpen}
				title='Remove movie'
				message='Do you really want to remove this movie?'
				onConfirm={handleConfirmRemove}
				onCancel={handleCancelRemove}
			/>
			{selectedMovie && (
				<MovieDetailsModal
					movie={selectedMovie}
					onClose={handleCloseDetails}
					onSave={handleSaveMovieChanges}
				/>
			)}
			{followModal && profile && (
				<FollowListModal
					title={followModal === 'followers' ? 'Followers' : 'Following'}
					users={followModal === 'followers' ? (profile.followers ?? []) : (profile.following ?? [])}
					onClose={() => setFollowModal(null)}
				/>
			)}
			{showTutorial && !loadingMovies && (
				<TutorialOverlay
					steps={tutorialSteps}
					onComplete={dismissTutorial}
				/>
			)}
		</>
	);
}

function DashboardCenter({
	profile,
	movies,
	onGoToFullList,
	onOpenFollowModal,
}: {
	profile: UserProfile | null;
	movies: IMovie[];
	onGoToFullList: () => void;
	onOpenFollowModal: (type: 'followers' | 'following') => void;
}) {
	const router = useRouter();
	const ratedMovies = movies.filter((m) => m.rating != null);
	const avgRating =
		ratedMovies.length > 0
			? (ratedMovies.reduce((sum, m) => sum + (m.rating ?? 0), 0) / ratedMovies.length).toFixed(1)
			: null;

	return (
		<div className='max-w-md mx-auto w-full'>
			{/* Greeting */}
			{profile && (
				<h1 className='text-xl font-semibold text-(--text-primary) mb-6 text-center'>
					Welcome back, {profile.username}
				</h1>
			)}

			{/* Stats grid */}
			<div className='grid grid-cols-2 gap-3 mb-6'>
				<button
					onClick={onGoToFullList}
					className='bg-(--bg-deep) rounded-xl p-4 text-center hover:bg-(--bg-surface) transition cursor-pointer'
				>
					<p className='text-2xl font-bold text-(--accent-primary)'>{movies.length}</p>
					<p className='text-xs text-(--text-muted) mt-1'>movies watched</p>
				</button>
				<div className='bg-(--bg-deep) rounded-xl p-4 text-center'>
					<p className='text-2xl font-bold text-(--accent-primary)'>
						{avgRating ?? '—'}
					</p>
					<p className='text-xs text-(--text-muted) mt-1'>avg rating</p>
				</div>
				<button
					onClick={() => onOpenFollowModal('followers')}
					className='bg-(--bg-deep) rounded-xl p-4 text-center hover:bg-(--bg-surface) transition cursor-pointer'
				>
					<p className='text-2xl font-bold text-(--text-primary)'>
						{profile?.followers_count ?? 0}
					</p>
					<p className='text-xs text-(--text-muted) mt-1'>followers</p>
				</button>
				<button
					onClick={() => onOpenFollowModal('following')}
					className='bg-(--bg-deep) rounded-xl p-4 text-center hover:bg-(--bg-surface) transition cursor-pointer'
				>
					<p className='text-2xl font-bold text-(--text-primary)'>
						{profile?.following_count ?? 0}
					</p>
					<p className='text-xs text-(--text-muted) mt-1'>following</p>
				</button>
			</div>

			{/* Quick info */}
			<div className='bg-(--bg-deep) rounded-xl p-4 mb-6'>
				<h3 className='text-sm font-semibold text-(--text-primary) mb-3'>Your Activity</h3>
				{movies.length === 0 ? (
					<p className='text-sm text-(--text-muted)'>
						No movies yet. Use the search bar above to find and add movies to your list!
					</p>
				) : (
					<div className='space-y-2'>
						<p className='text-sm text-(--text-muted)'>
							{ratedMovies.length} of {movies.length} movies rated
						</p>
						{movies.length > 0 && (
							<p className='text-sm text-(--text-muted)'>
								Latest: <span className='text-(--text-primary)'>{movies[0]?.title}</span>
								{movies[0]?.rating ? ` — ★ ${movies[0].rating}/10` : ''}
							</p>
						)}
					</div>
				)}
			</div>

			{/* Recent followers */}
			{profile && profile.followers && profile.followers.length > 0 && (
				<div className='bg-(--bg-deep) rounded-xl p-4'>
					<h3 className='text-sm font-semibold text-(--text-primary) mb-3'>Recent Followers</h3>
					<div className='flex flex-wrap gap-2'>
						{profile.followers.slice(0, 6).map((f) => (
							<button
								key={f._id}
								onClick={() => router.push(`/users/${encodeURIComponent(f.username)}`)}
								className='inline-flex items-center gap-1.5 bg-(--bg-surface) rounded-full px-3 py-1 text-sm hover:bg-(--accent-primary) hover:text-black transition cursor-pointer'
							>
								<span className='w-5 h-5 rounded-full bg-(--accent-primary) text-white flex items-center justify-center text-xs font-semibold'>
									{f.username.charAt(0).toUpperCase()}
								</span>
								<span>{f.username}</span>
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
