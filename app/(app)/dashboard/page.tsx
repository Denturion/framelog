'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Feed from '../../components/Feed';
import Header from '../../components/Header';
import MyList from '../../components/MyList';
import { IMovie } from '../../interfaces/IMovieInterface';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { MovieDetailsModal } from '../../components/ui/MovieDetailsModalFixed';
import { requireAuth } from '../../requireAuth';
import { getMyMovies, updateMovie, deleteMovie } from '../../services/movies';
import Footer from '../../components/Footer';

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

	// Handlers
	const handleOpenDetail = (movie: IMovie) => {
		setSelectedMovie(movie);
	};

	const handleCloseDetails = () => {
		setSelectedMovie(null);
	};

	const handleSaveMovieChanges = async (updated: Partial<IMovie>) => {
		try {
			if (!updated.movie_id) return;
			await updateMovie(updated.movie_id, updated);
			notifyListChanged();
			handleCloseDetails();
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

	// Render
	return (
		<>
			<Header pushMovie={notifyListChanged} />
			<main className='flex flex-col md:h-[calc(100vh-6rem)]'>
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
					<section className='hidden md:flex md:w-3/12 min-w-[350px] w-full bg-(--bg-deep) flex-col rounded-tr-lg'>
						<div className='flex p-6 text-center items-center justify-between'>
							<h2 className='text-lg font-semibold text-(--text-primary)'>
								My List
							</h2>
							<span className='text-m text-(--text-muted) '>
								{movies.length === 0
									? `Your list is empty. ${(
											<br />
									  )}You haven’t added any movies yet.
Start by adding a film you’ve watched recently to build your collection.`
									: movies.length}{' '}
								movies
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

					<section className='hidden md:flex flex-1 w-full bg-(--bg-primary) p-6 md:p-10 overflow-hidden'>
						<div className='max-w-xl mx-auto text-center'>
							<h1 className='text-2xl font-semibold text-(--text-primary)'>
								Welcome to your movie log
							</h1>
							<p className='text-(--text-muted) mt-2'>
								This is your personal space to keep track of films you’ve
								watched.
								<br /> Add movies to your list, rate them, and write short
								notes. On the right, you’ll see recent activity from people you
								follow.
							</p>
							<button
								onClick={handleGoToFullList}
								className='mt-4 px-4 py-2 bg-(--accent-primary) text-white rounded cursor-pointer'
							>
								Full list
							</button>
						</div>
					</section>

					<section className='hidden md:flex md:w-3/12 w-full bg-(--bg-deep) overflow-y-auto rounded-tl-lg'>
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
								<span className='text-m text-(--text-muted) '>
									{movies.length === 0 ? 'No movies' : movies.length} movies
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
						<section className='w-full bg-(--bg-primary) p-6 h-full overflow-auto'>
							<div className='max-w-xl mx-auto text-center'>
								<h1 className='text-2xl font-semibold text-(--text-primary)'>
									Welcome to your movie log
								</h1>
								<p className='text-(--text-muted) mt-2'>
									This is your personal space to keep track of films you’ve
									watched. Add movies to your list, rate them, and write short
									notes. On the right, you’ll see recent activity from people
									you follow.
								</p>
								<button
									onClick={handleGoToFullList}
									className='mt-4 px-4 py-2 bg-(--accent-primary) text-white rounded'
								>
									Full list
								</button>
							</div>
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
		</>
	);
}
