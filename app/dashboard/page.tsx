'use client';

import { useEffect, useState } from 'react';
import Feed from '../components/Feed';
import Header from '../components/Header';
import MyList from '../components/MyList';
import { IMovie } from '../interfaces/IMovieInterface';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { MovieDetailsModal } from '../components/ui/MovieDetailsModalFixed';
import { useRouter } from 'next/navigation';
import { requireAuth } from '../requireAuth';

export default function DashboardPage() {
	const router = useRouter();
	const [movies, setMovies] = useState<IMovie[]>([]);
	const [loadingMovies, setLoadingMovies] = useState(true);
	const [updateList, setUpdateList] = useState(false);

	const [confirmOpen, setConfirmOpen] = useState(false);
	const [movieToRemove, setMovieToRemove] = useState<string | null>(null);

	const [selectedMovie, setSelectedMovie] = useState<IMovie | null>(null);
	const [activeTab, setActiveTab] = useState<'list' | 'home' | 'feed'>('home');

	useEffect(() => {
		requireAuth().then((ok) => {
			if (!ok) {
				router.push('/login');
			}
		});
	}, []);

	//Open movie details modal
	function openDetail(movie: IMovie) {
		setSelectedMovie(movie);
	}

	function closeDetails() {
		setSelectedMovie(null);
	}

	async function saveMovieChanges(updated: Partial<IMovie>) {
		await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/api/movies/${updated.movie_id}`,
			{
				method: 'PUT',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updated),
			}
		);
		notifyListChanged();
		closeDetails();
	}

	//Removal request
	function requestRemove(movieId: string) {
		setMovieToRemove(movieId);
		setConfirmOpen(true);
	}

	async function confirmRemove() {
		if (!movieToRemove) return;

		await removeMovie(movieToRemove);
		setConfirmOpen(false);
		setMovieToRemove(null);
	}

	function cancelRemove() {
		setConfirmOpen(false);
		setMovieToRemove(null);
	}

	//Remove from list
	async function removeMovie(movie_id: string) {
		const res = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/api/movies/${movie_id}`,
			{
				method: 'DELETE',
				credentials: 'include',
			}
		);

		if (res.ok) {
			notifyListChanged();
		}
		return;
	}

	//Notify that the list needs to be updated
	function notifyListChanged() {
		setUpdateList((prev) => !prev);
	}

	useEffect(() => {
		async function fetchMovies() {
			setLoadingMovies(true);
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/api/movies`,
					{
						credentials: 'include',
					}
				);
				if (!res.ok) return;
				const data = await res.json();
				setMovies(data);
			} finally {
				setLoadingMovies(false);
			}
		}
		fetchMovies();
	}, [updateList]);

	function GoToFullList() {
		router.replace('/mylist');
	}

	return (
		<>
			<Header pushMovie={notifyListChanged} />
			<main className='flex flex-col md:h-[calc(100vh-6rem)] w-full overflow-hidden'>
				{/* Mobile tab bar */}
				<nav className='md:hidden flex bg-(--bg-deep) border-t border-b'>
					<button
						className={`flex-1 p-3 text-center text-(--accent-primary) ${
							activeTab === 'list' ? 'font-semibold' : ''
						}`}
						onClick={() => setActiveTab('list')}
					>
						My List
					</button>
					<button
						className={`flex-1 p-3 text-center text-(--text-primary) ${
							activeTab === 'home' ? 'font-semibold' : ''
						}`}
						onClick={() => setActiveTab('home')}
					>
						Dashboard
					</button>
					<button
						className={`flex-1 p-3 text-center text-(--text-primary) ${
							activeTab === 'feed' ? 'font-semibold' : ''
						}`}
						onClick={() => setActiveTab('feed')}
					>
						Feed
					</button>
				</nav>

				<div className='md:flex flex-1 min-h-0'>
					{/* Desktop: three-column layout */}
					<section className='hidden md:flex md:w-1/4 w-full bg-(--bg-deep) flex-col rounded-tr-lg'>
						<div className='flex p-6 text-center items-center justify-between'>
							<h2 className='text-lg font-semibold text-(--text-primary)'>
								My List
							</h2>
							<span className='text-m text-(--text-muted) '>
								{movies.length === 0 ? 'No movies' : movies.length} movies
							</span>
						</div>

						<div className='flex-1 overflow-y-auto lg:p-8 md:p-6 no-scrollbar'>
							<MyList
								movieList={movies}
								onRemoveRequest={requestRemove}
								onSelect={openDetail}
							/>
						</div>
					</section>

					<section className='hidden md:flex md:w-2/4 w-full bg-(--bg-primary) p-6 md:p-10 overflow-hidden'>
						<div className='max-w-xl mx-auto text-center'>
							<h1 className='text-2xl font-semibold text-(--text-primary)'>
								Welcome to FrameLog
							</h1>
							<p className='text-(--text-muted) mt-2'>
								Select a movie to view details. <br />
								View your full collection or add a new movie.
							</p>
							<button
								onClick={GoToFullList}
								className='mt-4 px-4 py-2 bg-(--accent-primary) text-white rounded cursor-pointer'
							>
								Full list
							</button>
						</div>
					</section>

					<section className='hidden md:flex md:w-1/4 w-full bg-(--bg-deep) overflow-y-auto rounded-tl-lg'>
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
									onRemoveRequest={requestRemove}
									onSelect={openDetail}
								/>
							</div>
						</section>
					)}
					{activeTab === 'home' && (
						<section className='w-full bg-(--bg-primary) p-6 h-full overflow-auto'>
							<div className='max-w-xl mx-auto text-center'>
								<h1 className='text-2xl font-semibold text-(--text-primary)'>
									Welcome to FrameLog
								</h1>
								<p className='text-(--text-muted) mt-2'>
									Select a movie to view details. View your full collection or
									add a new movie.
								</p>
								<button
									onClick={GoToFullList}
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
			<ConfirmModal
				open={confirmOpen}
				title='Remove movie'
				message='Do you really want to remove this movie?'
				onConfirm={confirmRemove}
				onCancel={cancelRemove}
			/>
			{selectedMovie && (
				<MovieDetailsModal
					movie={selectedMovie}
					onClose={closeDetails}
					onSave={saveMovieChanges}
				/>
			)}
		</>
	);
}
