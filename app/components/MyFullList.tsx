'use client';

import { useState, useMemo } from 'react';
import { IMovie } from '../interfaces/IMovieInterface';
import MovieCard from './ui/MovieCard';

type Props = {
	movieList: IMovie[];
	onRemoveRequest?: (movie_id: string) => void;
	onSelect: (movie: IMovie) => void;
};

export default function MyFullList({
	movieList,
	onRemoveRequest,
	onSelect,
}: Props) {
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

	const [sortMode, setSortMode] = useState<
		'date_desc' | 'date_asc' | 'title_asc' | 'title_desc'
	>('date_desc');

	const sortedMovies = useMemo(() => {
		const copy = movieList.slice();
		switch (sortMode) {
			// Date sorting assumes date_added is an ISO string; localeCompare works for that format
			case 'date_desc':
				return copy.sort((a, b) =>
					(b.date_added || '').localeCompare(a.date_added || '')
				);
			case 'date_asc':
				return copy.sort((a, b) =>
					(a.date_added || '').localeCompare(b.date_added || '')
				);
			// Title sorting uses localeCompare for correct alphabetic order
			case 'title_asc':
				return copy.sort((a, b) => a.title.localeCompare(b.title));
			case 'title_desc':
				return copy.sort((a, b) => b.title.localeCompare(a.title));
			default:
				return copy;
		}
	}, [movieList, sortMode]);

	return (
		<div className='flex flex-col h-full text-(--text-primary)'>
			{/* Toolbar */}
			<div
				className='
			sticky top-0 z-10
			bg-(--bg-primary)
			p-4
			shadow-sm
		'
			>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<label className='text-xs text-(--text-muted)'>Sort:</label>
						<select
							value={sortMode}
							onChange={(e) => setSortMode(e.target.value as any)}
							className='bg-(--bg-surface) text-sm p-1 rounded'
						>
							<option value='date_desc'>Date added (newest)</option>
							<option value='date_asc'>Date added (oldest)</option>
							<option value='title_asc'>Title (A → Z)</option>
							<option value='title_desc'>Title (Z → A)</option>
						</select>
					</div>

					<div className='flex items-center gap-2'>
						<button
							onClick={() => setViewMode('grid')}
							className={`px-2 py-1 rounded ${
								viewMode === 'grid' ? 'bg-(--bg-deep)' : 'bg-(--bg-surface)'
							}`}
						>
							Grid
						</button>
						<button
							onClick={() => setViewMode('list')}
							className={`px-2 py-1 rounded ${
								viewMode === 'list' ? 'bg-(--bg-deep)' : 'bg-(--bg-surface)'
							}`}
						>
							List
						</button>
					</div>
				</div>
			</div>

			{/* Scrollable list */}
			<div className='flex-1 overflow-y-auto p-4 no-scrollbar'>
				{sortedMovies.length === 0 ? (
					<p className='text-(--text-muted) text-sm'>Your list is empty.</p>
				) : (
					<ul
						className={
							viewMode === 'grid'
								? 'flex flex-wrap gap-2'
								: 'flex flex-col gap-2'
						}
					>
						{sortedMovies.map((m, index) => (
							<li
								key={`${m.movie_id}-${index}`}
								className={
									viewMode === 'grid' ? 'flex-none min-w-0 w-[200px]' : 'w-full'
								}
							>
								<MovieCard
									movie={m}
									onRemoveRequest={onRemoveRequest}
									onSelect={onSelect}
									variant={viewMode === 'grid' ? 'grid' : 'list'}
								/>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}
