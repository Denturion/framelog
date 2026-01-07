'use client';

import { useEffect, useState } from 'react';
import { IMovie } from '../../interfaces/IMovieInterface';
import Header from '../../components/Header';
import Feed from '../../components/Feed';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { MovieDetailsModal } from '../../components/ui/MovieDetailsModalFixed';
import MyFullList from '../../components/MyFullList';
import { getMyMovies, updateMovie, deleteMovie } from '../../services/movies';

export default function MyListPage() {
	// State
	const [movies, setMovies] = useState<IMovie[]>([]);
	const [activeTab, setActiveTab] = useState<'list' | 'home' | 'feed'>('list');
	const [updateList, setUpdateList] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [movieToRemove, setMovieToRemove] = useState<string | null>(null);
	const [selectedMovie, setSelectedMovie] = useState<IMovie | null>(null);

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

	// Effects
	useEffect(() => {
		async function fetchMovies() {
			try {
				const data = await getMyMovies();
				setMovies(data);
			} catch (err) {
				console.error('Failed to fetch movies', err);
			}
		}
		fetchMovies();
	}, [updateList]);

	// Render
	return (
		<>
			<Header pushMovie={notifyListChanged} />
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
					Overview
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
			<main className='md:flex md:h-[calc(100vh-6rem)] w-full overflow-hidden'>
				<section className='md:flex md:w-3/4 w-full bg-(--bg-primary) flex flex-col'>
					<div className='max-w-xl mx-auto text-center'>
						<h1 className='text-2xl font-semibold text-(--text-primary) pb-3'>
							Your list
						</h1>
					</div>
					<div className='flex-1 overflow-y-auto p-4 no-scrollbar'>
						<MyFullList
							movieList={movies}
							onRemoveRequest={handleRequestRemove}
							onSelect={handleOpenDetail}
						/>
					</div>
				</section>
				<section className='hidden md:flex md:w-1/4 w-full bg-(--bg-deep) overflow-y-auto rounded-tl-lg'>
					<Feed />
				</section>

				{/* Mobile panels */}
				<div className='block md:hidden h-[calc(100vh-6rem)] overflow-hidden w-full'>
					{activeTab === 'list' && (
						<section className='w-full bg-(--bg-primary) flex flex-col h-full min-h-0'>
							<div className='flex-1 overflow-y-auto p-4 no-scrollbar'>
								<MyFullList
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
									Your list
								</h1>
								<p className='text-(--text-muted) mt-2'>
									Manage and sort your collection.
								</p>
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
