'use client';

import { useEffect, useState } from 'react';
import { IMovie } from '../interfaces/IMovieInterface';
import Header from '../components/Header';
import Feed from '../components/Feed';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { MovieDetailsModal } from '../components/ui/MovieDetailsModalFixed';
import MyFullList from '../components/MyFullList';

export default function MyListPage() {
	const [movies, setMovies] = useState<IMovie[]>([]);
	const [activeTab, setActiveTab] = useState<'list' | 'home' | 'feed'>('list');
	const [updateList, setUpdateList] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [movieToRemove, setMovieToRemove] = useState<string | null>(null);

	const [selectedMovie, setSelectedMovie] = useState<IMovie | null>(null);

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
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/movies`, {
				credentials: 'include',
			});
			if (!res.ok) return;
			const data = await res.json();
			setMovies(data);
		}
		fetchMovies();
	}, [updateList]);

	return (
		<>
			<Header pushMovie={notifyListChanged} />
			{/* Mobile tab bar */}
			<nav className='md:hidden flex bg-(--bg-deep) border-t border-b'>
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
					Overview
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
			<main className='md:flex md:h-[calc(100vh-6rem)] w-full overflow-hidden'>
				<section className=' md:flex md:w-3/4 w-full bg-(--bg-primary) flex flex-col'>
					<div className='max-w-xl mx-auto text-center'>
						<h1 className='text-2xl font-semibold text-(--text-primary) pb-3'>
							Your list
						</h1>
					</div>
					<div className='flex-1 overflow-y-auto p-4 no-scrollbar'>
						<MyFullList
							movieList={movies}
							onRemoveRequest={requestRemove}
							onSelect={openDetail}
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
